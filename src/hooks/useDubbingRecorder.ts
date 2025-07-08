import { useState, useRef } from 'react';
import { useVoiceRecorder } from './useVoiceRecorder';
import { useAudioStore, useJobIdStore } from '@/store/useAudioStore';
import { mergeWavBlobs } from '@/utils/mergeWavBlobs';
import axios from 'axios';

interface UseDubbingRecorderProps {
  captions: { start_time: number; end_time: number }[];
  tokenId: string;
  onUploadComplete?: (success: boolean) => void;
}

// 응답 타입 정의
interface UploadAudioResponse {
  job_id?: string;
  [key: string]: any;
}

export function useDubbingRecorder({ captions, tokenId, onUploadComplete }: UseDubbingRecorderProps) {
  const { audioCtx } = useAudioStore();
  const { startRecording, stopRecording, recording, getAllBlobs } = useVoiceRecorder();
  const [recordedScripts, setRecordedScripts] = useState<boolean[]>(() => Array(captions.length).fill(false));
  const [uploading, setUploading] = useState(false);
  const setJobId = useJobIdStore((state) => state.setJobId);
  const jobId = useJobIdStore((state) => state.jobId);
  const resetJobId = useJobIdStore((state) => state.resetJobId);

  // 녹음 시작: 해당 문장 인덱스
  const startScriptRecording = (scriptIdx: number) => {
    // 새로운 녹음 시작 시 jobId 초기화
    resetJobId();
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
    if (jobId) {
      console.log('[DEBUG] 이미 jobId가 설정되어 있습니다:', jobId);
      return;
    }
    setUploading(true);
    try {
      const blobs = getAllBlobs();
      const audioBlob = await mergeWavBlobs(blobs, audioCtx);
      const formData = new FormData();
      formData.append('file', audioBlob, 'dub.wav');
      const res = await axios.post<UploadAudioResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/tokens/${tokenId}/upload-audio`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      // job_id가 응답에 있으면 저장
      if (res.data && res.data.job_id) {
        setJobId(res.data.job_id);
        console.log('job_id 저장됨:', res.data.job_id);
      }
      setUploading(false);
      onUploadComplete?.(true);
    } catch (e) {
      setUploading(false);
      onUploadComplete?.(false);
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