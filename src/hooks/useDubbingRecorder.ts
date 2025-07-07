import { useState, useRef } from 'react';
import { useVoiceRecorder } from './useVoiceRecorder';
import { useAudioStore } from '@/store/useAudioStore';
import { mergeWavBlobs } from '@/utils/mergeWavBlobs';
import axios from 'axios';

interface UseDubbingRecorderProps {
  captions: { start_time: number; end_time: number }[];
  tokenId: string;
  onUploadComplete?: (success: boolean) => void;
}

export function useDubbingRecorder({ captions, tokenId, onUploadComplete }: UseDubbingRecorderProps) {
  const { audioCtx } = useAudioStore();
  const { startRecording, stopRecording, recording, getAllBlobs } = useVoiceRecorder();
  const [recordedScripts, setRecordedScripts] = useState<boolean[]>(() => Array(captions.length).fill(false));
  const [uploading, setUploading] = useState(false);

  // 녹음 시작: 해당 문장 인덱스
  const startScriptRecording = (scriptIdx: number) => {
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
    setUploading(true);
    try {
      const blobs = getAllBlobs();
      const audioBlob = await mergeWavBlobs(blobs, audioCtx);
      const formData = new FormData();
      formData.append('file', audioBlob, 'dub.wav');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/tokens/${tokenId}/upload-audio`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
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