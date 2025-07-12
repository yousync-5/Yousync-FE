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
    console.log(`[DEBUG][uploadScript] 업로드 시작 idx=${idx}`);
    if (!audioCtx) return;
    if (!scripts || !scripts[idx]) return;
    const blobs = getAllBlobs();
    const blob = blobs[idx];
    if (!blob) {
      console.error(`[ERROR][uploadScript] blob is undefined for idx=${idx}`);
      return;
    }
    const scriptId = scripts[idx].id;

    try {
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const { encodeWav } = await import('@/utils/encodeWav');
      const wavBlob = encodeWav(audioBuffer);

      const formData = new FormData();
      formData.append('file', wavBlob, `dub_${idx + 1}.wav`);

      console.log(`[DEBUG][uploadScript] axios.post 시작 idx=${idx}, scriptId=${scriptId}`);
      const res = await axios.post<UploadAudioResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/scripts/${scriptId}/upload-audio`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      console.log(`[DEBUG][uploadScript] axios.post 응답 idx=${idx}, job_id=${res.data?.job_id}`);

      if (res.data && res.data.job_id) {
        addJobId(res.data.job_id);
        setJobIds(prev => [...prev, res.data.job_id!]);
        console.log(`[DEBUG][uploadScript] jobId 추가됨: ${res.data.job_id}`);
      }
    } catch (e) {
      console.error('[ERROR][uploadScript] 업로드 실패', e);
    }
  };

  const stopScriptRecording = async (scriptIdx: number) => {
    if (!recording) {
      console.warn('[WARN][stopScriptRecording] called but not recording, skip');
      return;
    }
    console.log(`[DEBUG][stopScriptRecording] called idx=${scriptIdx}`);
    try {
      await stopRecording(scriptIdx);
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

  const uploadAllRecordings = async () => {
    if (uploading) return;
    setUploading(true);
    
    try {
      const allJobIds = [...jobIds];
      console.log('[DEBUG][uploadAllRecordings] 모든 업로드 완료, jobIds:', allJobIds);
      
      if (onUploadComplete) {
        onUploadComplete(true, allJobIds);
      }
    } catch (error) {
      console.error('[ERROR][uploadAllRecordings] 실패:', error);
      if (onUploadComplete) {
        onUploadComplete(false, []);
      }
    } finally {
      setUploading(false);
    }
  };

  const allRecorded = recordedScripts.every(Boolean);

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
