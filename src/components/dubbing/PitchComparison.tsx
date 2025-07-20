"use client";

// import ServerPitchGraph from "@/components/graph/ServerPitchGraph";
// import { MyPitchGraph } from '@/components/graph/MyPitchGraph';
import type { Caption } from "@/types/caption";
import { VideoPlayerRef } from "./VideoPlayer";
import { useDubbingRecorder } from '@/hooks/useDubbingRecorder';
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useAudioStore } from '@/store/useAudioStore';
import { ScriptItem } from "@/types/pitch";
import { useJobIdsStore } from '@/store/useJobIdsStore';
import LiquidGauge from '@/components/result/LiquidGauge';

interface PitchComparisonProps {
  currentScriptIndex: number;
  captions: Caption[];
  tokenId: string;
  serverPitchData: Array<{ time: number; hz: number | null }>;
  videoPlayerRef?: React.RefObject<VideoPlayerRef | null>;
  onNextScript?: (nextIndex: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  isVideoPlaying: boolean;
  scripts?: ScriptItem[];
  onUploadComplete?: (success: boolean, jobIds?: string[]) => void;
  onRecordingChange?: (recording: boolean) => void;
  handleRecordingComplete?: () => void;
  showAnalysisResult?: boolean;
  recordingCompleted?: boolean;
  onRecordingPlaybackChange?: (isPlaying: boolean) => void;
  onOpenSidebar?: () => void;
  onShowResults?: () => void;
  onOpenDubbingListenModal?: () => void;
  latestResultByScript?: { [key: string]: { overall_score: number } };
}

const PitchComparison = forwardRef<{ handleExternalStop: () => void }, PitchComparisonProps>(function PitchComparison({ 
  currentScriptIndex, 
  captions, 
  tokenId, 
  serverPitchData,
  videoPlayerRef,
  onNextScript,
  onPlay,
  onPause,
  isVideoPlaying,
  scripts,
  onUploadComplete,
  onRecordingChange,
  handleRecordingComplete,
  showAnalysisResult = false,
  recordingCompleted = false,
  onRecordingPlaybackChange,
  onOpenSidebar,
  onShowResults,
  onOpenDubbingListenModal,
  latestResultByScript,
}: PitchComparisonProps, ref) {

  const {
    recording,
    recordedScripts,
    uploading,
    startScriptRecording,
    stopScriptRecording,
    getAllBlobs,
  } = useDubbingRecorder({
    captions,
    tokenId,
    scripts,
    onUploadComplete: (success: boolean, jobIds: string[]) => {
      if (success) {
        if (Array.isArray(jobIds)) {
          jobIds.forEach((jobId) => {
          });
        } else {
          console.warn(`[⚠️ 경고] jobIds가 배열이 아님: ${typeof jobIds}`);
        }
      } else {
        console.error(`[❌ 업로드 실패] 문장 ${currentScriptIndex + 1}번 업로드 실패`);
      }
      
      // 상위 컴포넌트로 콜백 전달
      onUploadComplete?.(success, jobIds);
    },
  });

  // zustand 전역 상태 사용
  const setMultiJobIds = useJobIdsStore((state) => state.setMultiJobIds);

  const [volume, setVolume] = useState(0);
  const rafRef = useRef<number | null>(null);
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const loopIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // 녹음된 오디오 재생 관련 상태
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 녹음된 오디오 재생 함수
  const playRecording = () => {
    const blobs = getAllBlobs();
    const currentBlob = blobs[currentScriptIndex];
    
    if (!currentBlob) {
      console.warn('[WARN] 현재 문장의 녹음 파일이 없습니다.');
      return;
    }

    // 기존 오디오 정지
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // 새 오디오 생성 및 재생
    const audioUrl = URL.createObjectURL(currentBlob);
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    audio.onended = () => {
      setIsPlayingRecording(false);
      onRecordingPlaybackChange?.(false);
      URL.revokeObjectURL(audioUrl);
    };
    
    audio.onerror = () => {
      setIsPlayingRecording(false);
      onRecordingPlaybackChange?.(false);
      URL.revokeObjectURL(audioUrl);
      console.error('[ERROR] 오디오 재생 실패');
    };

    audio.play().then(() => {
      setIsPlayingRecording(true);
      onRecordingPlaybackChange?.(true);
    }).catch((error) => {
      console.error('[ERROR] 오디오 재생 시작 실패:', error);
      setIsPlayingRecording(false);
      onRecordingPlaybackChange?.(false);
      URL.revokeObjectURL(audioUrl);
    });
  };

  // 오디오 정지 함수
  const stopRecordingPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlayingRecording(false);
    onRecordingPlaybackChange?.(false);
  };

  // 컴포넌트 언마운트 시 오디오 정리
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!recording) {
      setVolume(0);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    const analyser = useAudioStore.getState().analyser;
    if (!analyser) return;
    const dataArray = new Uint8Array(analyser.fftSize);
    const update = () => {
      analyser.getByteTimeDomainData(dataArray);
      const avg = dataArray.reduce((a, b) => a + Math.abs(b - 128), 0) / dataArray.length;
      setVolume(Math.min(1, (avg / 128) * 2));
      rafRef.current = requestAnimationFrame(update);
    };
    update();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [recording]);

  useEffect(() => {
    if (typeof onRecordingChange === 'function') {
      onRecordingChange(recording);
    }
  }, [recording, onRecordingChange]);

  const handleMicClick = () => {
    if (videoPlayerRef?.current && captions[currentScriptIndex]) {
      const currentScript = captions[currentScriptIndex];
      
      videoPlayerRef.current.seekTo(currentScript.start_time);
      videoPlayerRef.current.playVideo();
      
      // 영상이 실제로 재생되기 시작할 때까지 대기
      const checkVideoPlaying = () => {
        if (!videoPlayerRef?.current) return;
        
        const currentTime = videoPlayerRef.current.getCurrentTime();
        const targetTime = currentScript.start_time;
        
        // 영상이 목표 시간에 도달했는지 확인 (0.1초 허용 오차)
        if (Math.abs(currentTime - targetTime) < 0.1) {
          startScriptRecording(currentScriptIndex);
          
          if (typeof onNextScript === 'function') {
            onNextScript(currentScriptIndex);
          }
        } else {
          // 아직 재생되지 않았으면 다시 체크
          setTimeout(checkVideoPlaying, 50);
        }
      };
      
      // 100ms 후부터 체크 시작 (브라우저 렉 고려)
      setTimeout(checkVideoPlaying, 100);
    }
  };

  // useImperativeHandle remains for external stop
  useImperativeHandle(ref, () => ({
    handleExternalStop: () => {
      console.log('[DEBUG][handleExternalStop] 외부에서 녹음 중지 요청');
      stopScriptRecording(currentScriptIndex);
    },
    stopLooping,
  }));

  // 녹음 상태 변경 감지하여 완료 시 handleRecordingComplete 호출
  useEffect(() => {
    // 녹음이 true에서 false로 변경되었을 때만 (녹음 완료)
    if (prevRecordingRef.current === true && recording === false && handleRecordingComplete) {
      console.log('[DEBUG][PitchComparison] 녹음 완료 감지, handleRecordingComplete 호출');
      handleRecordingComplete();
    }
  }, [recording, handleRecordingComplete]);

  // allRecorded, uploadAllRecordings 관련 useEffect 완전 제거

  const handleNextScript = () => {
    if (!captions || captions.length === 0) return;
    const nextIndex = Math.min(currentScriptIndex + 1, captions.length - 1);
    if (nextIndex !== currentScriptIndex && onNextScript) {
      onNextScript(nextIndex);
      // 영상도 다음 문장 시작으로 이동 및 재생
      if (videoPlayerRef?.current) {
        videoPlayerRef.current.seekTo(captions[nextIndex].start_time);
        videoPlayerRef.current.playVideo();
      }
    }
  };

  const handlePrevScript = () => {
    if (!captions || captions.length === 0) return;
    const prevIndex = Math.max(currentScriptIndex - 1, 0);
    if (prevIndex !== currentScriptIndex && onNextScript) {
      onNextScript(prevIndex);
      // 영상도 이전 문장 시작으로 이동 및 재생
      if (videoPlayerRef?.current) {
        videoPlayerRef.current.seekTo(captions[prevIndex].start_time);
        videoPlayerRef.current.playVideo();
      }
    }
  };

  const getCurrentScriptPlaybackRange = () => {
    if (!captions || captions.length === 0) {
      return { startTime: 0, endTime: undefined };
    }
    const currentScript = captions[currentScriptIndex];
    return {
      startTime: currentScript?.start_time || 0,
      endTime: currentScript?.end_time || undefined,
    };
  };

  // recording 값이 바뀔 때만 로그 출력
  const prevRecordingRef = useRef(recording);
  useEffect(() => {
    if (prevRecordingRef.current !== recording) {
      prevRecordingRef.current = recording;
    }
  }, [recording]);

  // 영상 상태 추적
  useEffect(() => {
    if (!videoPlayerRef?.current) return;
    let interval: ReturnType<typeof setInterval> | null = null;
    const checkState = () => {
      if (!videoPlayerRef.current) return;
      const currentTime = videoPlayerRef.current.getCurrentTime();
      const endTime = captions[currentScriptIndex]?.end_time;
      // 영상이 끝났는지 체크
      if (endTime !== undefined && currentTime >= endTime - 0.1) {
        setIsVideoEnded(true);
      } else {
        setIsVideoEnded(false);
      }
    };
    interval = setInterval(() => {
      if (!videoPlayerRef.current) return;
      // YouTube API의 getPlayerState가 있으면 더 정확하게 체크 가능
      if (videoPlayerRef.current.getCurrentTime) {
        const currentTime = videoPlayerRef.current.getCurrentTime();
        const endTime = captions[currentScriptIndex]?.end_time;
        if (endTime !== undefined && currentTime >= endTime - 0.1) {
          setIsVideoEnded(true);
        } else {
          setIsVideoEnded(false);
        }
      }
    }, 200);
    return () => { if (interval) clearInterval(interval); };
  }, [videoPlayerRef, currentScriptIndex, captions]);

  // 영상 play/pause 이벤트 핸들러 필요시 추가
  const handlePlay = () => {
    if (onPlay) onPlay();
  };
  const handlePause = () => {
    if (onPause) onPause();
  };

  const handleLoopToggle = () => {
    if (isLooping) {
      setIsLooping(false);
      if (loopIntervalRef.current) {
        clearInterval(loopIntervalRef.current);
        loopIntervalRef.current = null;
      }
    } else {
      setIsLooping(true);
      // 구간 반복 감시 시작
      loopIntervalRef.current = setInterval(() => {
        if (!videoPlayerRef?.current) return;
        const currentTime = videoPlayerRef.current.getCurrentTime();
        const startTime = captions[currentScriptIndex]?.start_time || 0;
        const endTime = captions[currentScriptIndex]?.end_time;
        if (endTime !== undefined && currentTime >= endTime - 0.1) {
          videoPlayerRef.current.seekTo(startTime);
          videoPlayerRef.current.playVideo();
        }
      }, 200);
    }
  };

  useEffect(() => {
    // 문장 인덱스가 바뀌면 반복 해제
    setIsLooping(false);
    if (loopIntervalRef.current) {
      clearInterval(loopIntervalRef.current);
      loopIntervalRef.current = null;
    }
  }, [currentScriptIndex]);

  useEffect(() => {
    // 컴포넌트 언마운트 시 반복 해제
    return () => {
      if (loopIntervalRef.current) {
        clearInterval(loopIntervalRef.current);
      }
    };
  }, []);

  const stopLooping = () => {
    setIsLooping(false);
    if (loopIntervalRef.current) {
      clearInterval(loopIntervalRef.current);
      loopIntervalRef.current = null;
    }
  };

  // 게이지에 분석 점수 반영 (진행률 × 평균 점수)
  const total = captions.length;
  const analyzedScores = Object.entries(latestResultByScript ?? {})
    .map(([_, v]) => v?.overall_score ?? 0)
    .filter((v) => typeof v === 'number' && !isNaN(v));
  const analyzedCount = analyzedScores.length;
  const avgScore = analyzedCount > 0 ? analyzedScores.reduce((a, b) => a + b, 0) / analyzedCount : 0;
  const percent = total > 0 ? Math.round((analyzedCount / total) * avgScore * 100) : 0;
  


  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl p-2 h-auto relative border border-gray-800 shadow-lg">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-xs font-semibold text-white">Pitch Comparison</h3>
        {onOpenSidebar && (
          <button
            onClick={onOpenSidebar}
            className="flex items-center justify-center w-6 h-6 bg-gray-800 text-gray-400 rounded-md hover:bg-gray-700 hover:text-white transition-all duration-200"
            title="스크립트 목록"
            style={{ padding: 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 28 28" fill="none">
              <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="5,8 8,11 13,6" />
                <line x1="16" y1="8" x2="23" y2="8" />
                <polyline points="5,16 8,19 13,14" />
                <line x1="16" y1="16" x2="23" y2="16" />
                <polyline points="5,24 8,27 13,22" />
                <line x1="16" y1="24" x2="23" y2="24" />
              </g>
            </svg>
          </button>
        )}
      </div>
      <div className="space-y-1">
        <div className="w-full h-16 flex justify-start items-center">
          <LiquidGauge value={percent} size={50} />
        </div>
        <div>
          {/* 모든 문장 분석 완료 시 버튼 표시 */}
          {(() => {
            const total = captions.length;
            const analyzed = Object.values(recordedScripts).filter(Boolean).length;
            if (analyzed === total && total > 0) {
              return (
                <div className="w-full flex flex-row justify-center gap-1 my-1 z-10">
                  <button 
                    className="px-2 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white text-xs font-semibold shadow-md shadow-emerald-700/20 transition-all duration-200"
                    onClick={onOpenDubbingListenModal}
                  >
                    더빙본 들어보기
                  </button>
                  <button
                    className="px-2 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-xs font-semibold shadow-md shadow-blue-700/20 transition-all duration-200"
                    onClick={onShowResults}
                  >
                    결과보기
                  </button>
                </div>
              );
            }
            return null;
          })()}
        </div>
        
        <div className="w-full flex flex-col items-center space-y-1 mt-1">
          {/* 상단: 이전, 재생/정지, 마이크, 다음 버튼 한 줄 */}
          <div className="flex flex-row justify-center space-x-1">
            {/* 이전 버튼 */}
            <button
              onClick={() => {
                if (isLooping) stopLooping();
                handlePrevScript();
              }}
              className={`w-10 h-10 ${recording ? 'bg-gradient-to-r from-gray-600 to-gray-700' : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'} text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg shadow-blue-900/30 border border-white/10 disabled:opacity-60 disabled:cursor-not-allowed`}
              title="이전 문장으로 이동"
              disabled={currentScriptIndex === 0 || recording || recordingCompleted}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 5l-7 5 7 5V5zM17 5h-2v10h2V5z" />
              </svg>
            </button>
            {/* 재생/정지 토글 버튼 */}
            <button
              onClick={() => {
                if (isVideoPlaying || recording) {
                  videoPlayerRef?.current?.pauseVideo();
                  stopScriptRecording(currentScriptIndex);
                } else {
                  if (isVideoEnded) {
                    const startTime = captions[currentScriptIndex]?.start_time || 0;
                    videoPlayerRef?.current?.seekTo(startTime);
                  }
                  videoPlayerRef?.current?.playVideo();
                }
              }}
              className={`w-10 h-10 ${recording ? 'bg-gradient-to-r from-gray-600 to-gray-700' : 'bg-gradient-to-r from-green-600 to-lime-500 hover:from-green-700 hover:to-lime-600'} text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg shadow-green-900/30 border border-white/10 play-btn disabled:opacity-60 disabled:cursor-not-allowed`}
              title={isVideoPlaying || recording ? '정지' : '실행'}
              disabled={!videoPlayerRef?.current}
            >
              {isVideoPlaying || recording ? (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <rect x="5" y="5" width="10" height="10" rx="2" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <polygon points="6,4 16,10 6,16" />
                </svg>
              )}
            </button>
            {/* 마이크(녹음) 버튼 */}
            <button
              onClick={() => {
                if (isLooping) stopLooping();
                handleMicClick();
              }}
              disabled={recording || recordingCompleted}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg border border-white/10 ${recording ? 'bg-green-500 animate-pulse-mic' : 'bg-gradient-to-r from-red-600 to-pink-500 hover:from-red-700 hover:to-pink-600 text-white shadow-red-900/30'}`}
              style={recording ? { boxShadow: '0 0 0 3px rgba(34,197,94,0.4), 0 0 0 6px rgba(34,197,94,0.2)' } : undefined}
            >
              {recording && (
                <span className="absolute w-12 h-12 rounded-full border-2 border-green-400 opacity-60 animate-ping-mic z-0"></span>
              )}
              <svg 
                className="w-3 h-3 relative z-10" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" 
                  clipRule="evenodd" 
                />
              </svg>
            </button>
            {/* 다음 버튼 */}
            <button
              onClick={() => {
                if (isLooping) stopLooping();
                handleNextScript();
              }}
              className={`w-10 h-10 ${recording ? 'bg-gradient-to-r from-gray-600 to-gray-700' : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'} text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg shadow-blue-900/30 border border-white/10 disabled:opacity-60 disabled:cursor-not-allowed`}
              title="다음 문장으로 이동"
              disabled={recording || recordingCompleted}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 5l7 5-7 5V5zM3 5h2v10H3V5z" />
              </svg>
            </button>
          </div>
          {/* 하단: 구간반복 버튼만 단독 배치 */}
          <div className="flex flex-row justify-center">
            <button
              onClick={() => {
                handleLoopToggle();
              }}
              className={`w-10 h-10 ${isLooping ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-gray-600 to-gray-700'} hover:from-yellow-600 hover:to-orange-600 text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg shadow-orange-900/20 border border-white/10 disabled:opacity-60 disabled:cursor-not-allowed`}
              title={isLooping ? '구간반복 해제' : '구간반복'}
              disabled={recording || recordingCompleted}
            >
              <svg viewBox="0 0 48 48" fill="none" className={`w-4 h-4 ${isLooping ? 'animate-spin' : ''}`} stroke="currentColor" strokeWidth="4">
                <path d="M8 24c0-8.837 7.163-16 16-16 4.418 0 8.418 1.79 11.314 4.686" strokeLinecap="round"/>
                <path d="M40 8v8h-8" strokeLinecap="round"/>
                <path d="M40 24c0 8.837-7.163 16-16 16-4.418 0-8.418-1.79-11.314-4.686" strokeLinecap="round"/>
                <path d="M8 40v-8h8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PitchComparison; 