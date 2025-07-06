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
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) return resolve(null);// 녹음기가 없는 상태면 null 반환, 종료
      
      mediaRecorderRef.current.onstop = () => {
        // 오디오 데이터 조각들(chunks)를 하나로 합쳐 .wav 형식의 Blob로 만듦
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' }); 
        console.log('🎧 Blob 생성 완료:', blob);

        // allBlobsRef.current.push(blob);// 각 녹음 저장
        allBlobsRef.current[idx] = blob; //덮어쓰기
        resolve(blob); // Promise 성공적으로 종료, Blob반환
        setRecording(false);
      };
      mediaRecorderRef.current.stop();// 녹음 중지 , 그 결과 onstop이벤트 실행
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