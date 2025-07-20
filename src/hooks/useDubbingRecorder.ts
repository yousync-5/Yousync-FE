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
    // 스크립트 정보 가져오기
    const caption = captions[scriptIdx];
    if (caption) {
      startRecording(scriptIdx, caption.start_time, caption.end_time);
    } else {
      console.warn(`[WARN] 스크립트 ${scriptIdx} 정보를 찾을 수 없습니다.`);
      startRecording(scriptIdx, 0, 0);
    }
  };

  // 단일 문장 업로드 함수
  const uploadScript = async (idx: number) => {
    console.log(`[DEBUG][uploadScript] 업로드 시작 idx=${idx}`);
    console.log(`[DEBUG][uploadScript] API_BASE_URL: ${process.env.NEXT_PUBLIC_API_BASE_URL}`);
    
    if (!audioCtx) {
      console.error('[ERROR][uploadScript] audioCtx is undefined');
      return;
    }
    if (!scripts || !scripts[idx]) {
      console.error(`[ERROR][uploadScript] scripts or scripts[${idx}] is undefined`);
      return;
    }
    
    const blobs = getAllBlobs();
    console.log(`[DEBUG][uploadScript] blobs:`, blobs);
    console.log(`[DEBUG][uploadScript] idx: ${idx}`);
    
    const blob = blobs[idx];
    if (!blob) {
      console.error(`[ERROR][uploadScript] blob is undefined for idx=${idx}`);
      console.error(`[ERROR][uploadScript] available keys:`, Object.keys(blobs));
      return;
    }
    
    const scriptId = scripts[idx].id;
    console.log(`[DEBUG][uploadScript] scriptId: ${scriptId}`);

    try {
      console.log(`[🔄 변환 중] 문장 ${idx + 1}번 오디오 변환 시작`);
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const { encodeWav } = await import('@/utils/encodeWav');
      const wavBlob = encodeWav(audioBuffer);
      console.log(`[✅ 변환 완료] 문장 ${idx + 1}번 WAV 변환 완료, 크기: ${wavBlob.size} bytes`);

      const formData = new FormData();
      // 백엔드 파일명 형식에 맞게 수정 (확장자 포함)
      formData.append('file', wavBlob, `script_${scriptId}.wav`);

      console.log(`[DEBUG][uploadScript] axios.post 시작 idx=${idx}, scriptId=${scriptId}`);
      
      // Authorization 헤더 가져오기
      const accessToken = localStorage.getItem('access_token');
      console.log(`[DEBUG] accessToken 존재:`, !!accessToken);
      
      const headers: Record<string, string> = {};
      
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
        console.log(`[DEBUG] Authorization 헤더 추가됨`);
      } else {
        console.log(`[DEBUG] 비로그인 상태로 요청 전송 (user_id는 NULL로 저장됨)`);
      }
      
      console.log(`[DEBUG] 전송할 헤더:`, headers);

      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/scripts/${scriptId}/upload-audio`;
      console.log(`[DEBUG] 요청 URL:`, url);
      
      const res = await axios.post<UploadAudioResponse>(
        url,
        formData,
        { headers }
      );
      
      console.log(`[📥 서버 응답] 문장 ${idx + 1}번 서버 응답:`, res.data);
      console.log(`[🆔 Job ID 수신] 문장 ${idx + 1}번 job_id: ${res.data?.job_id}`);

      if (res.data && res.data.job_id) {
        addJobId(res.data.job_id);
        setJobIds(prev => [...prev, res.data.job_id!]);
        console.log(`[✅ 업로드 성공] 문장 ${idx + 1}번 업로드 완료!`);
        console.log(`[📊 Job ID 추가] 총 ${jobIds.length + 1}개의 Job ID 수집됨`);
        

        
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
      
      // Axios 에러인 경우 더 자세한 정보 출력
      if (e && typeof e === 'object' && 'response' in e) {
        const axiosError = e as any;
        console.error(`[❌ Axios 에러] 상태 코드: ${axiosError.response?.status}`);
        console.error(`[❌ Axios 에러] 응답 데이터:`, axiosError.response?.data);
        console.error(`[❌ Axios 에러] 요청 URL:`, axiosError.config?.url);
        console.error(`[❌ Axios 에러] 요청 헤더:`, axiosError.config?.headers);
      }
      
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
      await uploadScript(scriptIdx); // 각 문장별로 업로드
      console.log(`[DEBUG][stopScriptRecording] 업로드 완료 idx=${scriptIdx}`);
    } catch (e) {
      console.error('[ERROR][stopScriptRecording] in useDubbingRecorder failed', e);
    }
  };

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