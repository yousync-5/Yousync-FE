import { useRef, useState } from 'react';

export function useVoiceRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const allBlobsRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);

  // 🔁 요약 흐름
	// 1.	🎤 마이크 권한 요청 → 오디오 스트림 수신
	// 2.	📼 MediaRecorder로 녹음기 생성
	// 3.	🧱 오디오 조각들이 이벤트로 들어올 때마다 배열에 저장
	// 4.	▶️ start() 호출로 녹음 시작
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); // 마이크 접근 권한 요청
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

  // 1.	사용자가 마이크로 말을 함 → 오디오는 MediaRecorder가 수집 (ondataavailable로 쪼개서 쌓음)
	// 2.	stop()을 호출하면 →
	// •	MediaRecorder는 녹음 중단을 준비하고
	// •	남아 있는 오디오 데이터를 마무리 처리한 후
	// 3.	모든 데이터 수집이 끝나면 →
  // ✅ onstop 이벤트가 호출됨 (→ 여기서 Blob으로 만들기 적절)

  // Blob(녹음된 오디오)를 Promise로 반환, 녹음이 안된 경우에는 null 반환
  const stopRecording = async (playingIdx: number): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) return resolve(null);// 녹음기가 없는 상태면 null 반환, 종료
      
      mediaRecorderRef.current.onstop = () => {
        // 오디오 데이터 조각들(chunks)를 하나로 합쳐 .wav 형식의 Blob로 만듦
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' }); 
        console.log('🎧 Blob 생성 완료:', blob);

        allBlobsRef.current.push(blob);// 각 녹음 저장
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
    getAllBlobs: () => allBlobsRef.current,
  };
}