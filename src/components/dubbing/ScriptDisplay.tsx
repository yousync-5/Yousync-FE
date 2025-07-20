"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { VideoPlayerRef } from "./VideoPlayer";
import PronunciationTimingGuide from "./PronunciationTimingGuide";
import "@/styles/analysis-animations.css";

interface ScriptDisplayProps {
  captions: Array<any>;
  currentScriptIndex: number;
  onScriptChange: (index: number) => void;
  currentVideoTime?: number;
  playbackRange?: {
    startTime: number;
    endTime?: number;
  };
  videoPlayerRef?: React.RefObject<any>;
  currentWords?: Array<any>;
  recording?: boolean;
  recordingCompleted?: boolean;
  isAnalyzing?: boolean;
  onStopLooping?: () => void;
  showAnalysisResult?: boolean;
  analysisResult?: any;
  isVideoPlaying?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onMicClick?: () => void;
  isLooping?: boolean;
  onLoopToggle?: () => void;
  showCompletedButtons?: boolean;
  onOpenDubbingListenModal?: () => void;
  onShowResults?: () => void;
  id?: string | number; // 추가
}

export default function ScriptDisplay({ 
  captions, 
  currentScriptIndex, 
  onScriptChange,
  currentVideoTime = 0,
  playbackRange,
  videoPlayerRef,
  currentWords = [],
  recording = false,
  recordingCompleted = false,
  isAnalyzing = false,
  onStopLooping,
  showAnalysisResult = false,
  analysisResult = null,
  isVideoPlaying = false,
  onPlay,
  onPause,
  onMicClick,
  isLooping = false,
  onLoopToggle,
  showCompletedButtons = false,
  onOpenDubbingListenModal,
  onShowResults,
  id, // 추가
}: ScriptDisplayProps) {

  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [sentenceProgress, setSentenceProgress] = useState(0);
  const [sentenceAnimatedProgress, setSentenceAnimatedProgress] = useState(0);
  const [disableTransition, setDisableTransition] = useState(false);
  
  // useRef로 실시간 값 참조 (state 업데이트 지연 해결)
  const animatedProgressRef = useRef(0);
  const sentenceAnimatedProgressRef = useRef(0);
  
  // 분석 결과 애니메이션을 위한 상태
  const [animatedScores, setAnimatedScores] = useState<Record<string, number>>({});

  // 현재 시간을 분:초 형식으로 변환
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 스크립트 변경 시 영상도 해당 지점으로 이동
  const handleScriptChange = (newIndex: number) => {
    onScriptChange(newIndex);
    // 영상이 해당 문장의 시작 지점으로 이동하고, 항상 재생
    if (videoPlayerRef?.current && captions[newIndex]) {
      const targetTime = captions[newIndex].start_time;
      videoPlayerRef.current.seekTo(targetTime);
      videoPlayerRef.current.playVideo(); // 항상 재생
    }
  };

  // 현재 시간에 해당하는 word 찾기
  const getCurrentWord = () => {
    return currentWords.find(word => 
      currentVideoTime >= word.start_time && currentVideoTime <= word.end_time
    );
  };

  // 기존 문장 진행률 계산 (단어 데이터가 없을 때 사용)
  const getSentenceProgress = () => {
    const currentScript = captions[currentScriptIndex];
    if (!currentScript) return 0;
    
    const sentenceDuration = currentScript.end_time - currentScript.start_time;
    const elapsedInSentence = currentVideoTime - currentScript.start_time;
    
    return Math.min(Math.max(elapsedInSentence / sentenceDuration, 0), 1);
  };

  // 단어별 가중치를 적용한 진행률 계산
  const getWeightedProgress = () => {
    if (!currentWords || currentWords.length === 0) {
      return getSentenceProgress(); // 기존 방식
    }
    
    const totalDuration = currentWords.reduce((sum, word) => 
      sum + (word.end_time - word.start_time), 0
    );
    
    let accumulatedProgress = 0;
    for (const word of currentWords) {
      const wordDuration = word.end_time - word.start_time;
      const wordWeight = wordDuration / totalDuration;
      if (currentVideoTime >= word.start_time && currentVideoTime <= word.end_time) {
        // 현재 단어 내에서의 진행률
        const wordProgress = (currentVideoTime - word.start_time) / wordDuration;
        return accumulatedProgress + (wordProgress * wordWeight);
      }
      if (currentVideoTime > word.end_time) {
        accumulatedProgress += wordWeight;
      }
    }
    return accumulatedProgress;
  };

  // 전체 문장 길이 기준 진행률 계산 (word 무시)
  const getSentenceOnlyProgress = () => {
    const currentScript = captions[currentScriptIndex];
    if (!currentScript) return 0;
    
    const sentenceDuration = currentScript.end_time - currentScript.start_time;
    const elapsedInSentence = currentVideoTime - currentScript.start_time;
    
    return Math.min(Math.max(elapsedInSentence / sentenceDuration, 0), 1);
  };

  // 부드러운 애니메이션 함수
  const animateProgress = useCallback((targetProgress: number, fromZero = false) => {
    const startProgress = fromZero ? 0 : animatedProgressRef.current;
    const startTime = performance.now();
    const duration = 300; // 0.3초

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutCubic - 자연스러운 감속
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startProgress + (targetProgress - startProgress) * easeOutCubic;
      setAnimatedProgress(currentValue);
      animatedProgressRef.current = currentValue; // ref 업데이트
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, []);

  // 진행률이 변경될 때마다 애니메이션 실행
  useEffect(() => {
    const targetProgress = getWeightedProgress(); // word 기준
    animateProgress(targetProgress);
  }, [currentVideoTime, currentScriptIndex, animateProgress]);

  // 문장 단위 부드러운 애니메이션 함수
  const animateSentenceProgress = useCallback((targetProgress: number, fromZero = false) => {
    const startProgress = fromZero ? 0 : sentenceAnimatedProgressRef.current;
    const startTime = performance.now();
    const duration = 300; // 0.3초

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = startProgress + (targetProgress - startProgress) * easeOutCubic;
      setSentenceAnimatedProgress(currentValue);
      sentenceAnimatedProgressRef.current = currentValue; // ref 업데이트
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, []);

  // 문장 단위 진행률 애니메이션 (아래 박스용)
  useEffect(() => {
    const targetSentenceProgress = getSentenceOnlyProgress();
    animateSentenceProgress(targetSentenceProgress);
  }, [currentVideoTime, animateSentenceProgress]);

  // 분석 결과 애니메이션 (PronunciationTimingGuide에서 복사)
  useEffect(() => {
    if (analysisResult?.word_analysis) {
      const targetScores: Record<string, number> = {};
      analysisResult.word_analysis.forEach((word: any) => {
        targetScores[word.word] = word.word_score;
      });

      // 애니메이션 시작
      const startTime = performance.now();
      const duration = 2000; // 2초

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // easeOutCubic - 자연스러운 감속
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        
        const newScores: Record<string, number> = {};
        Object.keys(targetScores).forEach(word => {
          newScores[word] = targetScores[word] * easeOutCubic;
        });
        
        setAnimatedScores(newScores);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    } else {
      // 분석 결과가 없으면 애니메이션 상태 초기화
      setAnimatedScores({});
    }
  }, [analysisResult]);

  // 스크립트 인덱스가 바뀔 때 트랜지션을 비활성화하고 진행률을 0으로 리셋
  useEffect(() => {
    console.log('[DEBUG] 스크립트 변경:', currentScriptIndex, '현재 시간:', currentVideoTime);
    setDisableTransition(true); // 트랜지션 비활성화
    setAnimatedProgress(0);
    setSentenceAnimatedProgress(0);
    animatedProgressRef.current = 0; // ref도 초기화
    sentenceAnimatedProgressRef.current = 0; // ref도 초기화
    
    // 50ms 후 트랜지션 활성화하고 애니메이션 재개 (영상과 동기화 유지)
    setTimeout(() => {
      // currentWords 준비 상태 확인 (currentWords 반영 지연 해결)
      if (currentWords && currentWords.length > 0) {
        console.log('[DEBUG] currentWords 준비됨:', currentWords.length, '개');
        setDisableTransition(false); // 트랜지션 활성화
        const targetProgress = getWeightedProgress();
        const targetSentenceProgress = getSentenceOnlyProgress();
        console.log('[DEBUG] 목표 진행률:', targetProgress, '문장 진행률:', targetSentenceProgress);
        animateProgress(targetProgress, true); // fromZero = true로 0에서 시작
        animateSentenceProgress(targetSentenceProgress, true); // fromZero = true로 0에서 시작
      } else {
        console.log('[DEBUG] currentWords 아직 준비 안됨, 추가 대기');
        // currentWords가 아직 준비되지 않았으면 추가 대기
        setTimeout(() => {
          setDisableTransition(false);
          const targetProgress = getWeightedProgress();
          const targetSentenceProgress = getSentenceOnlyProgress();
          console.log('[DEBUG] 추가 대기 후 진행률:', targetProgress, '문장 진행률:', targetSentenceProgress);
          animateProgress(targetProgress, true);
          animateSentenceProgress(targetSentenceProgress, true);
        }, 50);
      }
    }, 50); // 200ms → 50ms로 단축
  }, [currentScriptIndex]);

  // 녹음(recording)이 시작될 때 showAnalysisResult를 false로, isAnalyzing을 true로, animatedScores를 초기화하는 useEffect를 추가합니다.
  useEffect(() => {
    if (recording) {
      // setShowAnalysisResultState(false); // 기존 코드에서 제거됨
      // setIsAnalyzingState(true); // 기존 코드에서 제거됨
      setAnimatedScores({});
    }
  }, [recording]);

  // analysisResult가 오면 분석 결과 표시, 분석 중 해제
  useEffect(() => {
    if (showAnalysisResult && analysisResult) {
      // setShowAnalysisResultState(true); // 기존 코드에서 제거됨
      // setIsAnalyzingState(false); // 기존 코드에서 제거됨
    }
  }, [showAnalysisResult, analysisResult]);

  // RGB 그라데이션 색상 계산 (PronunciationTimingGuide에서 복사)
  const getGradientColor = (score: number) => {
    // 0% = 빨간색 (255, 0, 0)
    // 50% = 노란색 (255, 255, 0) 
    // 100% = 초록색 (0, 255, 0)
    
    let r, g, b;
    
    if (score <= 0.5) {
      // 0% ~ 50%: 빨간색 → 노란색
      const t = score * 2; // 0 ~ 1
      r = 255;
      g = Math.round(255 * t);
      b = 0;
    } else {
      // 50% ~ 100%: 노란색 → 초록색
      const t = (score - 0.5) * 2; // 0 ~ 1
      r = Math.round(255 * (1 - t));
      g = 255;
      b = 0;
    }
    
    return `rgb(${r}, ${g}, ${b})`;
  }

  // HTML 엔티티를 디코딩하는 함수 (SSR 호환)
  const decodeHtmlEntities = (text: string) => {
    if (typeof window === 'undefined') {
      // 서버 사이드에서는 기본적인 HTML 엔티티만 처리
      return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ');
    }
    
    // 클라이언트 사이드에서는 textarea를 사용
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  // word 단위로 스크립트 렌더링
  const renderScriptWithWords = () => {
    if (!currentWords || currentWords.length === 0) {
      // word 데이터가 없으면 기존 방식으로 렌더링
      return (
        <div className="text-white text-lg sm:text-2xl md:text-3xl font-bold text-center leading-tight">
          &quot;{decodeHtmlEntities(captions[currentScriptIndex]?.script || '')}&quot;
        </div>
      );
    }

    return (
      <div className="text-white text-lg sm:text-2xl md:text-3xl font-bold text-center leading-tight">
        &quot;{currentWords.map((word, index) => {
          const isCurrent = currentVideoTime >= word.start_time && currentVideoTime <= word.end_time;
          const animatedScore = animatedScores[word.word] || 0;
          let textColor = 'text-white'; // 기본 색상
          if (isCurrent) {
            textColor = 'text-yellow-400';
          } else if (animatedScore > 0) {
            textColor = '';
          }
          return (
            <span 
              key={word.id}
              className={`transition-all duration-200 ${
                isCurrent ? 'font-bold bg-green-400/10 px-1 rounded' : ''
              }`}
              style={{
                color: animatedScore > 0
                  ? getGradientColor(animatedScore)
                  : (isCurrent ? '#22c55e' : undefined)
              }}
            >
              {decodeHtmlEntities(word.word)}{index < currentWords.length - 1 ? ' ' : ''}
            </span>
          );
        })}&quot;
      </div>
    );
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-1 w-full flex flex-col relative border border-gray-800 shadow-lg ">
      <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-xl p-1 shadow-xl text-white border border-gray-700/50 space-y-1 ">
        {/* 진행 정보 + 시간 정보 */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1 gap-1 py-2">
            {/* 왼쪽에 스크립트 번호 표시 */}
            <div className="text-base sm:text-2xl font-semibold text-white">
              &nbsp;&nbsp;Script&nbsp; <span className="text-teal-300">{currentScriptIndex + 1}</span> / {captions.length}
            </div>
            
            {/* 중앙에 버튼들 배치 */}
            <div className="flex items-center justify-center mx-auto">
              {/* 재생/정지 버튼 */}
              <button
                onClick={() => {
                  if (isVideoPlaying) {
                    // 재생 중이면 일시정지
                    videoPlayerRef?.current?.pauseVideo();
                    if (onPause) onPause();
                  } else {
                    // 일시정지 중이면 재생
                    if (videoPlayerRef?.current) {
                      // 현재 문장의 시작 시간과 끝 시간 가져오기
                      const currentScript = captions[currentScriptIndex];
                      const startTime = currentScript?.start_time || 0;
                      const endTime = currentScript?.end_time || 0;
                      
                      // 현재 시간이 문장 범위를 벗어났으면 시작 시간으로 이동
                      const currentTime = videoPlayerRef.current.getCurrentTime();
                      if (currentTime < startTime || currentTime >= endTime) {
                        videoPlayerRef.current.seekTo(startTime);
                      }
                      
                      // 재생 시작
                      videoPlayerRef.current.playVideo();
                      if (onPlay) onPlay();
                    }
                  }
                }}
                className={`w-13 h-13 ${recording ? 'bg-gradient-to-r from-gray-600 to-gray-700' : 'bg-gradient-to-r from-green-600 to-lime-500 hover:from-green-700 hover:to-lime-600'} text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-sm border border-white/10 disabled:opacity-60 disabled:cursor-not-allowed`}
                title={isVideoPlaying ? '정지' : '실행'}
                disabled={!videoPlayerRef?.current}
              >
                {isVideoPlaying || recording ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <rect x="5" y="5" width="10" height="10" rx="2" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <polygon points="6,4 16,10 6,16" />
                  </svg>
                )}
              </button>
              
              {/* 마이크(녹음) 버튼 */}
              <button
                onClick={onMicClick}
                disabled={recording || recordingCompleted}
                className={`ml-3 w-13 h-13 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm border border-white/10 ${recording ? 'bg-green-500 animate-pulse-mic' : 'bg-gradient-to-r from-red-600 to-pink-500 hover:from-red-700 hover:to-pink-600 text-white'}`}
                style={recording ? { boxShadow: '0 0 0 3px rgba(34,197,94,0.4)' } : undefined}
              >
                {recording && (
                  <span className="absolute w-12 h-12 rounded-full border-2 border-green-400 opacity-60 animate-ping-mic z-0"></span>
                )}
                <svg 
                  className="w-4 h-4 relative z-10" 
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
              
              {/* 구간반복 버튼 */}
              <button
                onClick={onLoopToggle}
                className={`ml-3 w-13 h-13 ${isLooping ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-gray-600 to-gray-700'} hover:from-yellow-600 hover:to-orange-600 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-sm border border-white/10 disabled:opacity-60 disabled:cursor-not-allowed`}
                title={isLooping ? '구간반복 해제' : '구간반복'}
                disabled={recording || recordingCompleted || !videoPlayerRef?.current}
              >
                <svg viewBox="0 0 48 48" fill="none" className={`w-4 h-4 ${isLooping ? 'animate-spin' : ''}`} stroke="currentColor" strokeWidth="4">
                  <path d="M8 24c0-8.837 7.163-16 16-16 4.418 0 8.418 1.79 11.314 4.686" strokeLinecap="round"/>
                  <path d="M40 8v8h-8" strokeLinecap="round"/>
                  <path d="M40 24c0 8.837-7.163 16-16 16-4.418 0-8.418-1.79-11.314-4.686" strokeLinecap="round"/>
                  <path d="M8 40v-8h8" strokeLinecap="round"/>
                </svg>
              </button>
              
              {/* 더빙본 들어보기와 결과보기 버튼 */}
              {showCompletedButtons && (
                <>
                  <button 
                    className="ml-10 px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white text-m font-semibold shadow-md shadow-emerald-700/20 transition-all duration-200"
                    onClick={onOpenDubbingListenModal}
                  >
                    더빙본 들어보기
                  </button>
                  <button
                    className="ml-3 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-m font-semibold shadow-md shadow-blue-700/20 transition-all duration-200"
                    onClick={onShowResults}
                  >
                    결과보기
                  </button>
                </>
              )}
            </div>
            
            {/* 오른쪽에 시간 정보 */}
            <div className="flex flex-wrap items-center gap-1 text-m">
              {playbackRange && (
                <span className="text-gray-300 font-medium hidden sm:inline">
                  🎧 {formatTime(playbackRange.startTime)} ~ {playbackRange.endTime ? formatTime(playbackRange.endTime) : '끝'}
                </span>
              )}
              {recordingCompleted && !analysisResult ? (
                <div className="flex items-center space-x-1 font-medium text-blue-400">
                  <div className="animate-spin w-2 h-2 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                  <span>분석 중</span>
                </div>
              ) : (
                <div>
                </div>
              )}
            </div>
          </div>

          <div className="relative w-full h-4 bg-gray-800/80 rounded-full overflow-hidden shadow-inner">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500 ease-out"
              style={{ width: `${((currentScriptIndex + 1) / captions.length) * 100}%` }}
            >
              <span className="absolute right-1 text-[12px] font-bold text-white drop-shadow-sm">
                {Math.round(((currentScriptIndex + 1) / captions.length) * 100)}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-2">
          {/* 스크립트 본문 + 내비게이션 */}
          <div className="flex items-center space-x-1 w-full">
            <button
              onClick={() => {
                if (onStopLooping) onStopLooping();
                handleScriptChange(Math.max(0, currentScriptIndex - 1));
              }}
              disabled={currentScriptIndex === 0 || recording || recordingCompleted}
              className={`p-2 rounded-full transition-all duration-200  ${
                currentScriptIndex === 0 
                  ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-800 text-green-400 hover:bg-gray-700 hover:text-green-300'
              }`}
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>

            <div 
              className="bg-gray-800/80 rounded-lg p-2 flex-1 shadow-inner border border-gray-700/50 flex items-center justify-center min-h-[100px] relative overflow-hidden"
              style={{
                background: isAnalyzing 
                  ? 'rgba(31, 41, 55, 0.8)' // 분석 중일 때는 회색
                  : `linear-gradient(to right, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.15) ${animatedProgress * 100}%, rgba(31, 41, 55, 0.8) ${animatedProgress * 100}%, rgba(31, 41, 55, 0.8) 100%)`, // 그 외에는 초록색 그라데이션
                transition: disableTransition ? 'none' : 'background 0.3s ease-out'
              }}
            >
              {showAnalysisResult && analysisResult ? (
                <PronunciationTimingGuide
                  captions={captions}
                  currentScriptIndex={currentScriptIndex}
                  currentVideoTime={currentVideoTime}
                  currentWords={currentWords}
                  showAnalysisResult={showAnalysisResult}
                  analysisResult={analysisResult}
                  recording={recording}
                  id={id} // 추가
                />
              ) : isAnalyzing ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  {renderScriptWithWords()}
                  {/* 분석 중 로딩 오버레이 (사이드바 스타일 적용) */}
                  <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-[1px] flex items-center justify-center z-20 rounded pointer-events-none">
                    <div className="flex flex-col items-center space-y-1">
                      {/* 빙빙 도는 아이콘 */}
                      <svg className="w-10 h-10 text-emerald-300 animate-spin" viewBox="0 0 20 20" fill="none" aria-label="분석 중">
                        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="3" strokeDasharray="20 10" />
                      </svg>
                      {/* 분석 중 텍스트 */}
                      <span className="text-emerald-300 text-[20px] font-medium">분석 중...</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-white text-xs sm:text-sm font-bold text-center leading-tight px-1">
                  {renderScriptWithWords()}
                </div>
              )}
            </div>
            
            <button
              onClick={() => {
                if (onStopLooping) onStopLooping();
                handleScriptChange(Math.min(captions.length - 1, currentScriptIndex + 1));
              }}
              disabled={currentScriptIndex === captions.length - 1 || recording || recordingCompleted}
              className={`p-2 rounded-full transition-all duration-200 ${
                currentScriptIndex === captions.length - 1 
                  ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-800 text-green-400 hover:bg-gray-700 hover:text-green-300'
              }`}
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );}
        