"use client";

import ServerPitchGraph from "@/components/graph/ServerPitchGraph";
import { MyPitchGraph } from '@/components/graph/MyPitchGraph';
import type { Caption } from "@/types/caption";
import { VideoPlayerRef } from "./VideoPlayer";
import { useDubbingRecorder } from '@/hooks/useDubbingRecorder';
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useAudioStore } from '@/store/useAudioStore';
import { ScriptItem } from "@/types/pitch";
import { useJobIdsStore } from '@/store/useJobIdsStore';

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
      console.log(`[🔄 PitchComparison] onUploadComplete 콜백 호출됨`);
      console.log(`[📊 결과] success: ${success}, jobIds: ${JSON.stringify(jobIds)}`);
      
      if (success) {
        if (Array.isArray(jobIds)) {
          jobIds.forEach((jobId) => {
            console.log(`[✅ 업로드 성공] 문장 ${currentScriptIndex + 1}번 jobId: ${jobId}`);
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
      URL.revokeObjectURL(audioUrl);
    };
    
    audio.onerror = () => {
      setIsPlayingRecording(false);
      URL.revokeObjectURL(audioUrl);
      console.error('[ERROR] 오디오 재생 실패');
    };

    audio.play().then(() => {
      setIsPlayingRecording(true);
    }).catch((error) => {
      console.error('[ERROR] 오디오 재생 시작 실패:', error);
      setIsPlayingRecording(false);
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
      if (typeof onNextScript === 'function') {
        onNextScript(currentScriptIndex);
      }
      startScriptRecording(currentScriptIndex);
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

  const handleTimeUpdate = (currentTime: number) => {
    // ... (필요시 기존 로직 복구) ...
  };

  // recording 값이 바뀔 때만 로그 출력
  const prevRecordingRef = useRef(recording);
  useEffect(() => {
    if (prevRecordingRef.current !== recording) {
      console.log('[DEBUG][mic button render] recording:', recording);
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

  return (
    <div className="bg-gray-900 rounded-xl p-6 h-[28em]">
      <h3 className="text-lg font-semibold mb-4">Pitch Comparison</h3>
      <div className="space-y-4">
        <div>
          <div className="text-sm text-gray-400 mb-2">Your Pitch</div>
          <div className="w-full h-16 bg-gray-800 rounded">
            <MyPitchGraph currentIdx={currentScriptIndex} />
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-400 mb-2">Original Pitch</div>
          <div className="w-full h-16 bg-gray-800 rounded flex items-center justify-center">
            {/* 녹음된 오디오 재생 버튼 */}
            {recordedScripts[currentScriptIndex] && (
              <button
                onClick={isPlayingRecording ? stopRecordingPlayback : playRecording}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
                  isPlayingRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
                title={isPlayingRecording ? '재생 중지' : '녹음본 재생'}
              >
                {isPlayingRecording ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <rect x="6" y="4" width="8" height="12" rx="1" />
                    </svg>
                    <span className="text-sm">정지</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <polygon points="6,4 14,10 6,16" />
                    </svg>
                    <span className="text-sm">재생</span>
                  </>
                )}
              </button>
            )}
            {!recordedScripts[currentScriptIndex] && (
              <span className="text-gray-500 text-sm">녹음 후 재생 가능</span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-center space-y-2 mt-4">
          <div className="flex flex-row justify-center space-x-4">
            <button
              onClick={() => {
                if (isLooping) stopLooping();
                handlePrevScript();
              }}
              className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-lg border-2 border-white/20"
              title="이전 문장으로 이동"
              disabled={currentScriptIndex === 0 || recording}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 5l-7 5 7 5V5zM17 5h-2v10h2V5z" />
              </svg>
            </button>
            <div className="relative inline-block">
              <button
                onClick={() => {
                  if (isVideoEnded) {
                    const startTime = captions[currentScriptIndex]?.start_time || 0;
                    videoPlayerRef?.current?.seekTo(startTime);
                  }
                  videoPlayerRef?.current?.playVideo();
                }}
                className="w-16 h-16 bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-600 text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-lg border-2 border-white/20"
                title="실행"
                disabled={isVideoPlaying || !videoPlayerRef?.current || recording}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <polygon points="6,4 16,10 6,16" />
                </svg>
              </button>
            </div>
            <button
              onClick={() => {
                if (isLooping) stopLooping();
                handleMicClick();
              }}
              disabled={recording}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-lg border-2 border-white/20 ${recording ? 'bg-green-500 animate-pulse-mic' : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white'}`}
              style={recording ? { boxShadow: '0 0 0 8px rgba(34,197,94,0.4), 0 0 0 16px rgba(34,197,94,0.2)' } : undefined}
            >
              {recording && (
                <span className="absolute w-24 h-24 rounded-full border-4 border-green-400 opacity-60 animate-ping-mic z-0"></span>
              )}
              <svg 
                className="w-6 h-6 relative z-10" 
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
            <button
              onClick={() => {
                if (isLooping) stopLooping();
                handleNextScript();
              }}
              className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-lg border-2 border-white/20"
              title="다음 문장으로 이동"
              disabled={recording}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 5l7 5-7 5V5zM3 5h2v10H3V5z" />
              </svg>
            </button>
          </div>
          <div className="flex flex-row justify-center mt-2 space-x-4">
            <button
              onClick={() => {
                console.log('정지 버튼 클릭', videoPlayerRef?.current);
                videoPlayerRef?.current?.pauseVideo();
                stopScriptRecording(currentScriptIndex);
              }}
              className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-lg border-2 border-white/20"
              title="정지"
              disabled={!isVideoPlaying || !videoPlayerRef?.current || recording}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <rect x="5" y="5" width="10" height="10" rx="2" />
              </svg>
            </button>
            <button
              onClick={handleLoopToggle}
              className={`w-16 h-16 ${isLooping ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-gray-500 to-gray-700'} hover:from-yellow-500 hover:to-orange-600 text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-lg border-2 border-white/20`}
              title={isLooping ? '구간반복 해제' : '구간반복'}
              disabled={recording}
            >
              <svg viewBox="0 0 48 48" fill="none" className={`w-7 h-7 ${isLooping ? 'animate-spin' : ''}`} stroke="currentColor" strokeWidth="4">
                <path d="M8 24c0-8.837 7.163-16 16-16 4.418 0 8.418 1.79 11.314 4.686" strokeLinecap="round"/>
                <path d="M40 8v8h-8" strokeLinecap="round"/>
                <path d="M40 24c0 8.837-7.163 16-16 16-4.418 0-8.418-1.79-11.314-4.686" strokeLinecap="round"/>
                <path d="M8 40v-8h8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
        {/* Video Player */}
        {/* <VideoPlayer
          videoId={tokenId}
          onTimeUpdate={handleTimeUpdate}
          startTime={getCurrentScriptPlaybackRange().startTime}
          endTime={getCurrentScriptPlaybackRange().endTime}
          disableAutoPause={true}
          ref={videoPlayerRef}
          onEndTimeReached={() => stopScriptRecording(currentScriptIndex)}
        /> */}
      </div>
    </div>
  );
});

export default PitchComparison; 