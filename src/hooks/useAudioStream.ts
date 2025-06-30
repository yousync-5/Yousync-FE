import { useEffect } from "react";
import { useAudioStore } from "@/store/useAudioStore";

// 스트림 초기화 훅
export function useAudioStream(){
    useEffect(() => {
        const init = async () => {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioCtx = new AudioContext();
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 2048;
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
      
            useAudioStore.getState().setAudioCtx({ stream, audioCtx, analyser, source });
        }
        init();

        return () => {// 언마운트 시 클린업
            const {audioCtx, stream} = useAudioStore.getState();
            audioCtx?.close();  // AudioContext 닫기
            stream?.getTracks().forEach((track) => track.stop()); // 스트림 정지
            useAudioStore.getState().reset();   // 상태 초기화
        }
    }, [])
}