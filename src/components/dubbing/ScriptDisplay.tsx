"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { VideoPlayerRef } from "./VideoPlayer";

interface ScriptDisplayProps {
  captions: Array<{
    id: number;
    script: string;
    translation: string;
    start_time: number;
    end_time: number;
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
}

export default function ScriptDisplay({ 
  captions, 
  currentScriptIndex, 
  onScriptChange,
  currentVideoTime = 0,
  playbackRange,
  videoPlayerRef,
  currentWords = []
}: ScriptDisplayProps) {

  const [animatedProgress, setAnimatedProgress] = useState(0);

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
      console.log('스크립트 변경으로 영상 이동 및 재생:', {
        newIndex,
        targetTime,
        script: captions[newIndex].script,
        endTime: captions[newIndex].end_time
      });
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

  // 부드러운 애니메이션 함수
  const animateProgress = useCallback((targetProgress: number) => {
    const startProgress = animatedProgress;
    const startTime = performance.now();
    const duration = 300; // 0.3초

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutCubic - 자연스러운 감속
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startProgress + (targetProgress - startProgress) * easeOutCubic;
      setAnimatedProgress(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [animatedProgress]);

  // 진행률이 변경될 때마다 애니메이션 실행
  useEffect(() => {
    const targetProgress = getWeightedProgress();
    animateProgress(targetProgress);
  }, [currentVideoTime, currentScriptIndex, animateProgress]);

  // word 단위로 스크립트 렌더링
  const renderScriptWithWords = () => {
    if (!currentWords || currentWords.length === 0) {
      // word 데이터가 없으면 기존 방식으로 렌더링
      return (
        <div className="text-white text-2xl font-bold text-center leading-tight">
          "{captions[currentScriptIndex]?.script}"
        </div>
      );
    }

    return (
      <div className="text-white text-2xl font-bold text-center leading-tight">
        "{currentWords.map((word, index) => {
          const isCurrent = currentVideoTime >= word.start_time && currentVideoTime <= word.end_time;
          return (
            <span 
              key={word.id}
              className={`transition-all duration-200 ${
                isCurrent 
                  ? 'text-yellow-400 font-bold bg-yellow-400/10 px-1 rounded' 
                  : 'text-white'
              }`}
            >
              {word.word}{index < currentWords.length - 1 ? ' ' : ''}
            </span>
          );
        })}"
      </div>
    );
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 w-[77em] flex flex-col relative">
      <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-2xl p-6 shadow-xl text-white mb-6 border border-gray-700 space-y-6">
        
        {/* 진행 정보 + 시간 정보 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-lg font-semibold text-white">
              🎬 Script <span className="text-teal-300">{currentScriptIndex + 1}</span> / {captions.length}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-yellow-300 font-semibold">
                {String(Math.floor(captions[currentScriptIndex]?.start_time / 60)).padStart(2, "0")}:
                {String(Math.floor(captions[currentScriptIndex]?.start_time % 60)).padStart(2, "0")} -
                {String(Math.floor(captions[currentScriptIndex]?.end_time / 60)).padStart(2, "0")}:
                {String(Math.floor(captions[currentScriptIndex]?.end_time % 60)).padStart(2, "0")}
              </span>
              <span className="text-sm text-blue-300 font-semibold">
                ⏱ {formatTime(currentVideoTime)}
              </span>
              {playbackRange && (
                <span className="text-sm text-gray-300 font-medium">
                  🎧 {formatTime(playbackRange.startTime)} ~ {playbackRange.endTime ? formatTime(playbackRange.endTime) : '끝'}
                </span>
              )}
              <div className="text-sm font-medium text-green-400">
                {Math.round(((currentScriptIndex + 1) / captions.length) * 100)}% 완료
              </div>
            </div>
          </div>

          <div className="relative w-full h-3 bg-gray-800 rounded-full overflow-hidden shadow-inner">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${((currentScriptIndex + 1) / captions.length) * 100}%` }}
            >
              <span className="absolute right-2 text-[10px] font-bold text-white drop-shadow-sm">
                {Math.round(((currentScriptIndex + 1) / captions.length) * 100)}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-3">



          {/* 스크립트 본문 + 내비게이션 */}
          <div className="flex items-center space-x-4 w-full">
            <button
              onClick={() => handleScriptChange(Math.max(0, currentScriptIndex - 1))}
              disabled={currentScriptIndex === 0}
              className={`p-2 rounded-full transition-all duration-200 ${
                currentScriptIndex === 0 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-700 text-green-400 hover:bg-gray-600 hover:text-green-300'
              }`}
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>

            <div 
              className="bg-gray-800 rounded-lg p-4 flex-1 shadow-inner border border-gray-700 flex items-center justify-center min-h-[100px] relative overflow-hidden transition-all duration-500 ease-out"
              style={{
                background: `linear-gradient(to right, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.15) ${animatedProgress * 100}%, rgba(31, 41, 55, 1) ${animatedProgress * 100}%, rgba(31, 41, 55, 1) 100%)`
              }}
            >
              {renderScriptWithWords()}
            </div>

            <button
              onClick={() => handleScriptChange(Math.min(captions.length - 1, currentScriptIndex + 1))}
              disabled={currentScriptIndex === captions.length - 1}
              className={`p-2 rounded-full transition-all duration-200 ${
                currentScriptIndex === captions.length - 1 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-700 text-green-400 hover:bg-gray-600 hover:text-green-300'
              }`}
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>

          {/* 🎵 노래방 악보 스타일 타이밍 가이드 */}
          {currentWords && currentWords.length > 0 && (
            <div className="w-full bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h4 className="text-sm font-semibold text-cyan-400 mb-3 text-center">
                🎵 발음 타이밍 가이드
              </h4>
              <div className="flex items-center justify-center space-x-2 mb-3">
                {currentWords.map((word, index) => {
                  const isCurrent = currentVideoTime >= word.start_time && currentVideoTime <= word.end_time;
                  const isUpcoming = currentVideoTime < word.start_time;
                  const isCompleted = currentVideoTime > word.end_time;
                  
                  return (
                    <div key={word.id} className="flex flex-col items-center">
                      {/* 단어 */}
                      <span className={`text-sm font-medium mb-1 ${
                        isCurrent ? 'text-yellow-400' : 
                        isCompleted ? 'text-green-400' : 
                        isUpcoming ? 'text-gray-400' : 'text-white'
                      }`}>
                        {word.word}
                      </span>
                      
                      {/* 타이밍 바 */}
                      <div className="w-8 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-200 ${
                            isCurrent ? 'bg-yellow-400' : 
                            isCompleted ? 'bg-green-400' : 
                            isUpcoming ? 'bg-gray-500' : 'bg-gray-600'
                          }`}
                          style={{
                            width: isCurrent ? 
                              `${((currentVideoTime - word.start_time) / (word.end_time - word.start_time)) * 100}%` :
                              isCompleted ? '100%' : '0%'
                          }}
                        />
                      </div>
                      
                      {/* 시간 표시 */}
                      <span className="text-xs text-gray-400 mt-1">
                        {word.start_time.toFixed(1)}s
                      </span>
                    </div>
                  );
                })}
              </div>
              
              {/* 현재 진행 상태 */}
              <div className="text-center text-xs text-gray-300">
                현재: {currentVideoTime.toFixed(1)}s / 
                총 길이: {(captions[currentScriptIndex]?.end_time - captions[currentScriptIndex]?.start_time).toFixed(1)}s
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
} 