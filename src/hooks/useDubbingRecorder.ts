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
}

interface UploadAudioResponse {
  job_id?: string;
  [key: string]: string | number | boolean | undefined;
}

export function useDubbingRecorder({
  captions = [],
  tokenId,
  scripts,
}: UseDubbingRecorderProps) {
  const { audioCtx } = useAudioStore();
  const { startRecording, stopRecording, recording, getAllBlobs } = useVoiceRecorder();

  const [recordedScripts, setRecordedScripts] = useState<boolean[]>(
    () => Array(Array.isArray(captions) ? captions.length : 0).fill(false)
  );
  const setJobId = useJobIdStore((state) => state.setJobId);
  const resetJobId = useJobIdStore((state) => state.resetJobId);
  const addJobId = useJobIdsStore((state) => state.addJobId);

  const startScriptRecording = (scriptIdx: number) => {
    resetJobId();
    startRecording();
  };

  // 단일 문장 업로드 함수
  const uploadScript = async (idx: number) => {
    console.log(`[DEBUG][uploadScript] 업로드 시작 idx=${idx}`);
    if (!audioCtx) return;
    if (!scripts || !scripts[idx]) return;
    const blobs = getAllBlobs();
    const blob = blobs[idx];
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
        setJobId(res.data.job_id);
        addJobId(res.data.job_id); // 기존 배열에 추가
        // onUploadComplete 호출 제거 - detail/[id]/page.tsx에서 처리
      }
    } catch (e) {
      console.error('[ERROR][uploadScript] 업로드 실패', e);
    }
  };

  const stopScriptRecording = async (scriptIdx: number) => {
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

  const allRecorded = recordedScripts.every(Boolean);

  return {
    recording,
    recordedScripts,
    startScriptRecording,
    stopScriptRecording,
    allRecorded,
  };
}