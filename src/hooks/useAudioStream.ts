import { useEffect } from "react";
import { useAudioStore } from "@/store/useAudioStore";

// 스트림 초기화 훅
export function useAudioStream(){
    useEffect(() => {
        const init = async () => {
            try {
                console.log('마이크 권한 요청 중...');
                
                // 기존 스트림이 있다면 정리
                const currentState = useAudioStore.getState();
                if (currentState.stream) {
                    currentState.stream.getTracks().forEach(track => track.stop());
                }
                if (currentState.audioCtx) {
                    currentState.audioCtx.close();
                }
                useAudioStore.getState().reset();
                
                // 권한 상태 확인
                const permission = await navigator.permissions.query({name: 'microphone'});
                console.log('현재 마이크 권한 상태:', permission.state);
                
                if (permission.state === 'denied') {
                    alert('마이크 권한이 완전히 차단되어 있습니다.\n\n브라우저 설정에서 마이크 권한을 허용해주세요:\n1. 주소창 왼쪽 마이크 아이콘 클릭\n2. "허용" 선택\n3. 페이지 새로고침');
                    return;
                }
                
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                        sampleRate: 44100,
                        channelCount: 1
                    } 
                });
                const audioCtx = new AudioContext();
                const analyser = audioCtx.createAnalyser();
                analyser.fftSize = 2048;
                const source = audioCtx.createMediaStreamSource(stream);
                source.connect(analyser);
          
                useAudioStore.getState().setAudioCtx({ stream, audioCtx, analyser, source });
                alert('마이크 초기화 성공! 이제 음성을 내면 실시간 피치 그래프가 표시됩니다.');
            } catch (error) {
                console.error('마이크 권한이 거부되었습니다:', error);
                alert('마이크 권한이 거부되었습니다.\n\n브라우저 주소창 왼쪽의 마이크 아이콘을 클릭하여 권한을 허용해주세요.');
                // 권한 거부 시에도 에러를 throw하지 않고 조용히 처리
            }
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