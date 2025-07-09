import { useState, useRef } from 'react';
import { useVoiceRecorder } from './useVoiceRecorder';
import { useAudioStore, useJobIdStore } from '@/store/useAudioStore';
import { useJobIdsStore } from '@/store/useJobIdsStore';
import { mergeWavBlobs } from '@/utils/mergeWavBlobs';
import axios from 'axios';
import { ScriptItem } from '@/types/pitch';
interface UseDubbingRecorderProps {
  captions: { start_time: number; end_time: number }[];
  tokenId: string;
  scripts?: ScriptItem[];
  onUploadComplete?: (success: boolean, jobIds: string[]) => void;
}

// 응답 타입 정의
interface UploadAudioResponse {
  job_id?: string;
  [key: string]: any;
}

export function useDubbingRecorder({ captions, tokenId, scripts, onUploadComplete }: UseDubbingRecorderProps) {
  const { audioCtx } = useAudioStore();
  const { startRecording, stopRecording, recording, getAllBlobs } = useVoiceRecorder();
  const [recordedScripts, setRecordedScripts] = useState<boolean[]>(() => Array(captions.length).fill(false));
  const [uploading, setUploading] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(false);
  const setJobId = useJobIdStore((state) => state.setJobId);
  const jobId = useJobIdStore((state) => state.jobId);
  const resetJobId = useJobIdStore((state) => state.resetJobId);
  // zustand 전역 상태 사용
  const setMultiJobIds = useJobIdsStore((state) => state.setMultiJobIds);

  // 녹음 시작: 해당 문장 인덱스
  const startScriptRecording = (scriptIdx: number) => {
    // 새로운 녹음 시 jobId 초기화
    resetJobId();
    // 새로운 녹음 시 hasUploaded 상태도 리셋
    setHasUploaded(false);
    startRecording();
  };

  // 녹음 종료: 해당 문장 인덱스
  const stopScriptRecording = async (scriptIdx: number) => {
    console.log('[DEBUG] stopScriptRecording called', scriptIdx);
    try {
      await stopRecording(scriptIdx);
      setRecordedScripts((prev) => {
        const next = [...prev];
        next[scriptIdx] = true;
        return next;
      });
      console.log('[DEBUG] stopScriptRecording completed', scriptIdx);
    } catch (e) {
      console.error('[ERROR] stopRecording in useDubbingRecorder failed', e);
    }
  };

  // 모든 문장 녹음이 끝났는지 체크
  const allRecorded = recordedScripts.every(Boolean);

  // 업로드
  const uploadAllRecordings = async () => {
    if (!audioCtx) return;
    if (uploading) {
      console.log('[DEBUG] 이미 업로드 중입니다.');
      return;
    }
    if (hasUploaded) {
      console.log('[DEBUG] 이미 업로드가 한 번 실행되었습니다.');
      return;
    }
    if (jobId) {
      console.log('[DEBUG] 이미 jobId가 설정되어 있습니다:', jobId);
      return;
    }
    setUploading(true);
    setHasUploaded(true);
    try {
      const blobs = getAllBlobs();
      // 로그로 blobs와 scripts의 길이/순서 확인
      console.log('[DEBUG] blobs.length:', blobs.length);
      if (scripts) {
        console.log('[DEBUG] scripts.length:', scripts.length);
        scripts.forEach((script, idx) => {
          console.log(`[DEBUG] scripts[${idx}].id:`, script.id);
        });
      } else {
        console.log('[DEBUG] scripts가 없습니다.');
      }
      blobs.forEach((blob, idx) => {
        console.log(`[DEBUG] blobs[${idx}]:`, blob);
      });
      // 각각의 blob을 wav로 변환 후 업로드
      const uploadPromises = blobs.map(async (blob, idx) => {
        if (!scripts || !scripts[idx]) return;
        const scriptId = scripts[idx].id;
        // 1. AudioBuffer로 변환
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        // 2. wav로 변환
        // encodeWav는 src/utils/encodeWav.ts에 있음
        // @ts-ignore
        const { encodeWav } = await import('@/utils/encodeWav');
        const wavBlob = encodeWav(audioBuffer);
        // 3. 업로드
        const formData = new FormData();
        formData.append('file', wavBlob, `dub_${idx + 1}.wav`);
        const res = await axios.post<UploadAudioResponse>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/scripts/${scriptId}/upload-audio`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        if (res.data && res.data.job_id) {
          console.log(`job_id 저장됨 [${idx + 1}]:`, res.data.job_id);
        }
        return res.data;
      });
      const jobIdResults = await Promise.all(uploadPromises);
      // job_id만 추출해서 string[]로 변환
      const jobIdArray = jobIdResults
        .map(res => res && res.job_id ? res.job_id : undefined)
        .filter((id): id is string => Boolean(id));
      setMultiJobIds(jobIdArray);
      setUploading(false);
      onUploadComplete?.(true, jobIdArray);
    } catch (e) {
      setUploading(false);
      onUploadComplete?.(false, []);
    }
  };

  return {
    recording,
    recordedScripts,
    uploading,
    startScriptRecording,
    stopScriptRecording,
    allRecorded,
    uploadAllRecordings,
  };
} 