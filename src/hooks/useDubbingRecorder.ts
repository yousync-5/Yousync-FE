import { useState } from 'react';
import { useVoiceRecorder } from './useVoiceRecorder';
import { useAudioStore, useJobIdStore } from '@/store/useAudioStore';
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
  const [hasUploaded, setHasUploaded] = useState(false);
  const setJobId = useJobIdStore((state) => state.setJobId);
  const jobId = useJobIdStore((state) => state.jobId);
  const resetJobId = useJobIdStore((state) => state.resetJobId);
  const setMultiJobIds = useJobIdsStore((state) => state.setMultiJobIds);

  const startScriptRecording = (scriptIdx: number) => {
    resetJobId();
    setHasUploaded(false);
    startRecording();
  };

  const stopScriptRecording = async (scriptIdx: number) => {
    try {
      await stopRecording(scriptIdx);
      setRecordedScripts((prev) => {
        const next = [...prev];
        next[scriptIdx] = true;
        return next;
      });
      // --------------- 여기 추가 ---------------
      await uploadAllRecordings();
      console.log(`[DEBUG] 업로드 완료 - 문장 인덱스: ${scriptIdx}`);
      // -----------------------------------------
    } catch (e) {
      console.error('[ERROR] stopRecording in useDubbingRecorder failed', e);
    }
  };

  const allRecorded = recordedScripts.every(Boolean);

  const uploadAllRecordings = async () => {
    if (!audioCtx) return;
    if (uploading) return;
    if (hasUploaded) return;
    if (jobId) return;
    setUploading(true);
    setHasUploaded(true);
    try {
      const blobs = getAllBlobs();
      const jobIdArray: string[] = [];
      if (!scripts) {
        setUploading(false);
        onUploadComplete?.(false, []);
        return;
      }
      for (let idx = 0; idx < blobs.length; idx++) {
        const blob = blobs[idx];
        const scriptId = scripts[idx]?.id;
        if (!blob || !scriptId) continue;
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        const { encodeWav } = await import('@/utils/encodeWav');
        const wavBlob = encodeWav(audioBuffer);
        const formData = new FormData();
        formData.append('file', wavBlob, `dub_${idx + 1}.wav`);
        const res = await axios.post<UploadAudioResponse>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/scripts/${scriptId}/upload-audio`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        if (res.data && res.data.job_id) {
          jobIdArray.push(res.data.job_id);
          console.log(`[DEBUG] job_id 저장됨 [${idx + 1}]:`, res.data.job_id);
        }
      }
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