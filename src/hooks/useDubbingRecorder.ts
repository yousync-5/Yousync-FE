import { useState } from 'react';
import { useVoiceRecorder } from './useVoiceRecorder';
import { useAudioStore } from '@/store/useAudioStore';
import { useJobIdsStore } from '@/store/useJobIdsStore';
import axios from 'axios';
import { ScriptItem } from '@/types/pitch';

interface UseDubbingRecorderProps {
  captions?: { start_time: number; end_time: number }[];
  tokenId: string;
  scripts?: ScriptItem[];
  onUploadComplete?: (success: boolean, jobIds: string[]) => void;
}

interface UploadAudioResponse {
  job_id?: string;
  [key: string]: string | number | boolean | undefined;
}

export function useDubbingRecorder({
  captions = [],
  tokenId,
  scripts,
  onUploadComplete,
}: UseDubbingRecorderProps) {
  const { audioCtx } = useAudioStore();
  const { startRecording, stopRecording, recording, getAllBlobs } = useVoiceRecorder();

  const [recordedScripts, setRecordedScripts] = useState<boolean[]>(
    () => Array(Array.isArray(captions) ? captions.length : 0).fill(false)
  );
  const [uploading, setUploading] = useState(false);
  const [jobIds, setJobIds] = useState<string[]>([]);
  
  const addJobId = useJobIdsStore((state) => state.addJobId);

  const startScriptRecording = (scriptIdx: number) => {
    startRecording();
  };

  // 단일 문장 업로드 함수
  const uploadScript = async (idx: number) => {
    console.log(`[📤 업로드 시작] 문장 ${idx + 1}번 업로드 시작`);
    if (!audioCtx) {
      console.error(`[❌ 업로드 실패] audioCtx가 없습니다.`);
      return;
    }
    if (!scripts || !scripts[idx]) {
      console.error(`[❌ 업로드 실패] scripts[${idx}]가 없습니다.`);
      return;
    }
    
    const blobs = getAllBlobs();
    const blob = blobs[idx];
    if (!blob) {
      console.error(`[❌ 업로드 실패] 문장 ${idx + 1}번의 녹음 파일이 없습니다.`);
      return;
    }
    
    const scriptId = scripts[idx].id;
    console.log(`[📋 업로드 정보] 문장 ${idx + 1}번, scriptId: ${scriptId}, blob 크기: ${blob.size} bytes`);

    try {
      console.log(`[🔄 변환 중] 문장 ${idx + 1}번 오디오 변환 시작`);
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const { encodeWav } = await import('@/utils/encodeWav');
      const wavBlob = encodeWav(audioBuffer);
      console.log(`[✅ 변환 완료] 문장 ${idx + 1}번 WAV 변환 완료, 크기: ${wavBlob.size} bytes`);

      const formData = new FormData();
      formData.append('file', wavBlob, `dub_${idx + 1}.wav`);

      console.log(`[🚀 서버 전송] 문장 ${idx + 1}번 서버로 전송 시작`);
      console.log(`[🔗 API URL] ${process.env.NEXT_PUBLIC_API_BASE_URL}/scripts/${scriptId}/upload-audio`);
      
      const res = await axios.post<UploadAudioResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/scripts/${scriptId}/upload-audio`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      console.log(`[📥 서버 응답] 문장 ${idx + 1}번 서버 응답:`, res.data);
      console.log(`[🆔 Job ID 수신] 문장 ${idx + 1}번 job_id: ${res.data?.job_id}`);

      if (res.data && res.data.job_id) {
        addJobId(res.data.job_id);
        setJobIds(prev => [...prev, res.data.job_id!]);
        console.log(`[✅ 업로드 성공] 문장 ${idx + 1}번 업로드 완료!`);
        console.log(`[📊 Job ID 추가] 총 ${jobIds.length + 1}개의 Job ID 수집됨`);
        
        // 🆕 분석 조회 API 호출
        try {
          console.log(`[🔍 분석 조회] 문장 ${idx + 1}번 분석 결과 조회 시작`);
          const analysisResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/tokens/analysis-result/${res.data.job_id}`
          );
          console.log(`[✅ 분석 조회 성공] 문장 ${idx + 1}번 분석 결과:`, analysisResponse.data);
        } catch (analysisError) {
          console.error(`[❌ 분석 조회 실패] 문장 ${idx + 1}번 분석 조회 실패:`, analysisError);
          // 분석 조회 실패해도 업로드는 성공했으므로 계속 진행
        }
        
        // 문장별 업로드 성공 시 onUploadComplete 콜백 호출
        if (onUploadComplete) {
          console.log(`[🔄 콜백 호출] 문장 ${idx + 1}번 onUploadComplete 호출`);
          onUploadComplete(true, [res.data.job_id]);
        }
      } else {
        console.error(`[❌ 업로드 실패] 문장 ${idx + 1}번 job_id가 응답에 없습니다.`);
        if (onUploadComplete) onUploadComplete(false, []);
      }
    } catch (e) {
      console.error(`[❌ 업로드 실패] 문장 ${idx + 1}번 업로드 중 에러:`, e);
      if (onUploadComplete) onUploadComplete(false, []);
    }
  };

  const stopScriptRecording = async (scriptIdx: number) => {
    if (!recording) {
      console.warn(`[⚠️ 녹음 중지] 문장 ${scriptIdx + 1}번 - 녹음 중이 아니므로 건너뜀`);
      return;
    }
    console.log(`[🛑 녹음 중지] 문장 ${scriptIdx + 1}번 녹음 중지 시작`);
    try {
      console.log(`[🎤 녹음 종료] 문장 ${scriptIdx + 1}번 녹음 종료 처리`);
      await stopRecording(scriptIdx);
      
      console.log(`[📝 상태 업데이트] 문장 ${scriptIdx + 1}번 녹음 완료 상태로 변경`);
      setRecordedScripts((prev) => {
        const next = [...prev];
        next[scriptIdx] = true;
        return next;
      });
      
      console.log(`[📤 업로드 시작] 문장 ${scriptIdx + 1}번 업로드 호출`);
      await uploadScript(scriptIdx); // 각 문장별로 업로드
      console.log(`[✅ 완료] 문장 ${scriptIdx + 1}번 녹음 및 업로드 완료`);
    } catch (e) {
      console.error(`[❌ 에러] 문장 ${scriptIdx + 1}번 처리 중 에러:`, e);
    }
  };

  // 일괄 업로드 관련 코드 제거

  return {
    recording,
    recordedScripts,
    uploading,
    startScriptRecording,
    stopScriptRecording,
    getAllBlobs, // 녹음된 Blob들에 접근할 수 있도록 추가
    // allRecorded, // 제거
    // uploadAllRecordings, // 제거
  };
}
