import { useRef, useState } from 'react';
import { useAudioStore } from '@/store/useAudioStore';

export function useVoiceRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const allBlobsRef = useRef<Record<number, Blob>>({});
  const [recording, setRecording] = useState(false);
  const {stream} = useAudioStore();

  const startRecording = async () => {
    // const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); // 마이크 접근 권한 요청
    if(!stream){
      console.warn("Stream not initialized");
      return;
    }
    const recorder = new MediaRecorder(stream); // MediaRecorder 인스턴스 생성(stream은 마이크에서 실시간 오디오 스트림)
    mediaRecorderRef.current = recorder;  // 이후에 중지 같은 작업에 쓸 수 있음.
    chunksRef.current = []; // 녹음된 데이터 담을 배열(chunks)을 초기화

    recorder.ondataavailable = (e) => {// 녹음 중 일정 주기마다 오디오 데이터를 e.data 형태로 전달
      chunksRef.current.push(e.data); //chunkRef.current 배열에 순서대로 저장
    };

    recorder.start(); // 녹음 시작
    console.log('녹음 시작');
    setRecording(true); // 현재 녹음 중이라는 상태를 true로
  };

  // Blob(녹음된 오디오)를 Promise로 반환, 녹음이 안된 경우에는 null 반환
  const stopRecording = async (idx: number): Promise<Blob | null> => {
    console.log('[DEBUG] stopRecording called', idx);
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        console.warn('[WARN] stopRecording: mediaRecorderRef.current is null');
        setRecording(false);
        return resolve(null);
      }
      mediaRecorderRef.current.onstop = () => {
        console.log('[DEBUG] mediaRecorderRef.current.onstop fired');
        try {
          const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
          allBlobsRef.current[idx] = blob;
          resolve(blob);
          setRecording(false);
          // 여기서 wav파일로 변환해야
          console.log('[DEBUG] setRecording(false) called in onstop');
        } catch (e) {
          console.error('[ERROR] onstop handler failed', e);
          setRecording(false);
          resolve(null);
        }
      };
      try {
        mediaRecorderRef.current.stop();
        console.log('[DEBUG] mediaRecorderRef.current.stop() called');
      } catch (e) {
        console.error('[ERROR] mediaRecorderRef.current.stop() threw', e);
        setRecording(false);
        resolve(null);
      }
      setTimeout(() => {
        if (recording) {
          console.warn('[WARN] stopRecording: onstop not called in 1s, forcing setRecording(false)');
          setRecording(false);
          resolve(null);
        }
      }, 1000);
    });
  };

  return {
    startRecording,
    stopRecording,
    recording,
    // getAllBlobs: () => allBlobsRef.current,  // 외부에서 전체 가져오기
    getAllBlobs:()=>Object.entries(allBlobsRef.current)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([, blob]) => blob),
  };
}