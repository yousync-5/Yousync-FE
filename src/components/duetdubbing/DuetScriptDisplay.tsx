"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { VideoPlayerRef } from "../dubbing/VideoPlayer";
import PronunciationTimingGuide from "../dubbing/PronunciationTimingGuide";
import "@/styles/analysis-animations.css";

interface ScriptDisplayProps {
  captions: Array<{
    id: number;
    script: string;
    translation: string;
    start_time: number;
    end_time: number;
    actor?: {
      name: string;
      id: number;
    };
  }>;
  currentScriptIndex: number;
  onScriptChange: (index: number) => void;
  currentVideoTime?: number;
  playbackRange?: {
    startTime: number;
    endTime?: number;
  };
  videoPlayerRef?: React.RefObject<VideoPlayerRef | null>;
  currentWords?: Array<{
    script_id: number;
    start_time: number;
    end_time: number;
    word: string;
    probability: number;
    id: number;
  }>;
  recording?: boolean;
  recordingCompleted?: boolean;
  isAnalyzing?: boolean;
  onStopLooping?: () => void;
  showAnalysisResult?: boolean;
  analysisResult?: any;
  videoStartTime?: number; // 영상 전체 시작 시간
  videoEndTime?: number; // 영상 전체 종료 시간
  isAllAnalyzed?: boolean; // 전체 분석 완료 여부
  isOpen?: boolean; // 토스트 열림 상태
}

export default function ScriptDisplay({ 
  captions, 
  currentScriptIndex, 
  onScriptChange,
  currentVideoTime = 0,
  videoPlayerRef,
  currentWords = [],
  recording = false,
  recordingCompleted = false,
  isAnalyzing = false,
  onStopLooping,
  showAnalysisResult = false,
  analysisResult = null,
  videoStartTime = 0,
  videoEndTime = 0,
  isAllAnalyzed = false,
  isOpen = false,
}: ScriptDisplayProps) {

  // 디버깅 로그: captions 배열 순서, currentScriptIndex, currentScript
  // 이 부분들 제거

  // 화자 구분 로직 - Second Speaker가 내 대사
  const currentScript = captions[currentScriptIndex];
  const isMyLine = currentScript?.actor?.name === "나";

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
  const getSentenceProgress = useCallback(() => {
    const currentScript = captions[currentScriptIndex];
    if (!currentScript) return 0;
    
    const sentenceDuration = currentScript.end_time - currentScript.start_time;
    const elapsedInSentence = currentVideoTime - currentScript.start_time;
    
    return Math.min(Math.max(elapsedInSentence / sentenceDuration, 0), 1);
  }, [currentVideoTime, currentScriptIndex, captions]);

  // 단어별 가중치를 적용한 진행률 계산
  const getWeightedProgress = useCallback(() => {
    if (!currentWords || currentWords.length === 0) {
      return getSentenceProgress(); // 기존 방식
    }
    const wordsTotalDuration = currentWords.reduce((sum, word) => 
      sum + (word.end_time - word.start_time), 0
    );
    let accumulatedProgress = 0;
    for (const word of currentWords) {
      const wordDuration = word.end_time - word.start_time;
      const wordWeight = wordDuration / wordsTotalDuration;
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
  }, [currentVideoTime, currentWords, currentScriptIndex]);

  // 전체 문장 길이 기준 진행률 계산 (word 무시)
  const getSentenceOnlyProgress = useCallback(() => {
    const currentScript = captions[currentScriptIndex];
    if (!currentScript) return 0;
    
    const sentenceDuration = currentScript.end_time - currentScript.start_time;
    const elapsedInSentence = currentVideoTime - currentScript.start_time;
    
    return Math.min(Math.max(elapsedInSentence / sentenceDuration, 0), 1);
  }, [currentVideoTime, currentScriptIndex, captions]);

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
  }, [currentVideoTime, currentScriptIndex, animateProgress, getWeightedProgress]);

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
  }, [currentVideoTime, animateSentenceProgress, getSentenceOnlyProgress]);

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
        <div className="text-white text-2xl font-bold text-center leading-tight">
          &quot;{decodeHtmlEntities(captions[currentScriptIndex]?.script || '')}&quot;
        </div>
      );
    }

    // 단어 클릭 시 영상 이동 함수(싱글과 동일)
    const handleWordClick = (word: { start_time: number; end_time: number; word: string }) => {
      if (videoPlayerRef?.current) {
        videoPlayerRef.current.seekTo(word.start_time);
        videoPlayerRef.current.playVideo();
      }
    };

    return (
      <div className="text-white text-2xl font-bold text-center leading-tight">
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
              onClick={() => handleWordClick(word)}
              className={`transition-all duration-200 ${isCurrent ? 'font-bold bg-green-400/10 px-1 rounded' : ''}`}
              style={{
                color: animatedScore > 0
                  ? getGradientColor(animatedScore)
                  : (isCurrent ? '#22c55e' : undefined),
                transform: isCurrent ? 'scale(1.25)' : 'scale(1)',
                display: 'inline-block',
                paddingLeft: isCurrent ? '0.5em' : '0',
                paddingRight: isCurrent ? '0.5em' : '0',
              }}
            >
              {decodeHtmlEntities(word.word)}
              {index < currentWords.length - 1 ? '\u00A0' : ''}
            </span>
          );
        })}&quot;
      </div>
    );
  };

  const memoizedRenderScriptWithWords = useCallback(() => {
    return renderScriptWithWords();
  }, [currentWords, currentVideoTime, animatedScores, captions, currentScriptIndex]);
  
  function getMinutesAndSeconds(time: number) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return {
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
    };
  }
  const timeBoxClass = "inline-block font-mono text-lg bg-gray-800 rounded px-1 w-[36px] text-center align-middle";
  const current = getMinutesAndSeconds(currentVideoTime);
  
  // 영상 전체 시간을 기준으로 계산
  const videoTotalDuration = videoEndTime - videoStartTime;
  const total = getMinutesAndSeconds(videoEndTime);

  return (
    <div className="bg-gray-900 rounded-xl p-6 w-[77em] flex flex-col relative">
      <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-2xl p-6 shadow-xl text-white mb-6 border border-gray-700 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span>
              🎬 현재시간:
              <span className={timeBoxClass}>{current.minutes}</span>
              <span className="mx-1 text-lg font-bold text-gray-400">:</span>
              <span className={timeBoxClass}>{current.seconds}</span>
              {"\u00A0\u00A0~\u00A0\u00A0"}
              🕐 종료시간:
              <span className={timeBoxClass}>{total.minutes}</span>
              <span className="mx-1 text-lg font-bold text-gray-400">:</span>
              <span className={timeBoxClass}>{total.seconds}</span>
            </span>
          </div>
        </div>
        <div className="relative w-full h-3 bg-gray-800 rounded-full overflow-hidden shadow-inner">
          {/* 구간별 세로선 */}
          {captions.map((caption, idx) => {
            const position = videoTotalDuration
              ? ((caption.start_time - videoStartTime) / videoTotalDuration) * 100
              : 0;
            return (
              <div
                key={`line-${idx}`}
                className="absolute top-0 h-full w-0.5 bg-gray-600 z-5"
                style={{ left: `${position}%` }}
              />
            );
          })}
          
          {/* 진행도 바 */}
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500 ease-out z-10"
            style={{
              width: videoTotalDuration
                ? `${Math.min(((currentVideoTime - videoStartTime) / videoTotalDuration) * 100, 100)}%`
                : "0%",
            }}
          >
            <span className="absolute right-2 text-[10px] font-bold text-white drop-shadow-sm z-20">
              {videoTotalDuration
                ? Math.round(((currentVideoTime - videoStartTime) / videoTotalDuration) * 100)
                : 0}
              %
            </span>
          </div>
        </div>
        <div className="flex flex-col items-center space-y-3">
          {/* 스크립트 본문 + 내비게이션 */}
          <div className="flex items-center space-x-4 w-full">
            <div 
              className={`rounded-lg p-4 flex-1 shadow-inner border flex items-center justify-center min-h-[100px] relative overflow-hidden transition-all duration-500 ease-out ${
                isMyLine 
                  ? 'bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border-emerald-500 shadow-lg shadow-emerald-500/20' 
                  : 'bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500 shadow-lg shadow-blue-500/20'
              }`}
              style={{
                background: isAnalyzing 
                  ? 'rgba(31, 41, 55, 1)'
                  : isMyLine
                    ? `linear-gradient(to right, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.15) ${animatedProgress * 100}%, rgba(31, 41, 55, 1) ${animatedProgress * 100}%, rgba(31, 41, 55, 1) 100%)`
                    : `linear-gradient(to right, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) ${animatedProgress * 100}%, rgba(31, 41, 55, 1) ${animatedProgress * 100}%, rgba(31, 41, 55, 1) 100%)`,
                transition: disableTransition ? 'none' : 'background 0.3s ease-out'
              }}
            >
              {showAnalysisResult && analysisResult ? (
                // 발음분석가이드 표시
                <div className="relative w-full h-full flex items-center justify-center">
                  <PronunciationTimingGuide
                    captions={captions}
                    currentScriptIndex={currentScriptIndex}
                    currentVideoTime={currentVideoTime}
                    currentWords={currentWords}
                    showAnalysisResult={showAnalysisResult}
                    analysisResult={analysisResult}
                    recording={recording}
                  />
                </div>
              ) : isAnalyzing ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  {renderScriptWithWords()}
                  {/* 분석 중 로딩 오버레이 (사이드바 스타일 적용) */}
                  <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-[1px] flex items-center justify-center z-20 rounded pointer-events-none">
                    <div className="flex flex-col items-center space-y-3">
                      <svg className="w-12 h-12 text-emerald-300 animate-spin" viewBox="0 0 20 20" fill="none" aria-label="분석 중">
                        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="3" strokeDasharray="20 10" />
                      </svg>
                      <span className="text-emerald-300 text-sm font-medium">분석 중...</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className={`absolute top-1/2 -translate-y-1/2 left-3 flex items-center gap-2 px-3 py-1 rounded-full text-xl font-semibold ${
                    isMyLine 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-blue-600 text-white'
                  }`}>
                    {isMyLine ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                      </svg>
                    )}
                    {isMyLine ? '내 대사' : currentScript?.actor?.name}
                  </div>
                  <div className="text-center w-full">
                    <div className={`text-2xl font-bold leading-tight ${
                      isMyLine ? 'text-emerald-100' : 'text-blue-100'
                    }`}>
                      {renderScriptWithWords()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* 토스트 스타일 전체 녹음 들어보기 버튼 */}
      {isAllAnalyzed && (
        <div
          className={`
            fixed bottom-8 z-[9999]
            w-[220px] max-w-[90vw]
            bg-gradient-to-r from-emerald-400 via-blue-400 to-pink-400
            text-white font-bold rounded-2xl shadow-2xl
            flex items-center gap-3 px-4 py-3 animate-pulse
            transition-all duration-500
            ${isOpen ? 'right-4 translate-x-0' : 'right-[-240px] translate-x-full'}
          `}
          style={{ boxShadow: "0 8px 32px rgba(34,197,94,0.25)" }}
        >
          <button
            className="flex-1 flex items-center gap-2 focus:outline-none"
            onClick={() => onStopLooping && onStopLooping()}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
              <polygon points="10,8 16,12 10,16" fill="white" />
            </svg>
            전체 녹음 들어보기
          </button>
        </div>
      )}
    </div>
  );
}