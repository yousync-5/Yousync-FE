"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { VideoPlayerRef } from "./VideoPlayer";
import PronunciationTimingGuide from "./PronunciationTimingGuide";
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
  isDuet?: boolean;
  isMyLine?: boolean;
  showCompletedButtons?: boolean;
  onOpenDubbingListenModal?: () => void;
  onShowResults?: () => void;
  id?: string | number;
}

const ScriptDisplay = ({
  captions,
  currentScriptIndex,
  onScriptChange,
  currentVideoTime,
  playbackRange,
  videoPlayerRef,
  currentWords = [],
  recording = false,
  recordingCompleted = false,
  isAnalyzing = false,
  showAnalysisResult = false,
  analysisResult,
  isVideoPlaying = false,
  onPlay,
  onPause,
  onMicClick,
  isLooping = false,
  onLoopToggle,
  isDuet = false,
  isMyLine = true,
  showCompletedButtons = false,
  onOpenDubbingListenModal,
  onShowResults,
  id,
}: ScriptDisplayProps) => {
  // 시간 포맷 함수
  function formatTime(sec?: number) {
    if (typeof sec !== 'number' || isNaN(sec)) return '--:--.--';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}`;
  }

  // HTML 엔티티 디코딩 함수
  const decodeHtmlEntities = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  // 스크립트 렌더링 함수
  const renderScriptWithWords = () => {
    if (!currentWords || currentWords.length === 0) {
      return (
        <div className="text-white font-bold text-center leading-tight tracking-wide" style={{ fontSize: 'clamp(14px, 2vw, 32px)' }}>
          <span className="text-gray-400 opacity-70">"</span>
          <span className="bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent">
            {decodeHtmlEntities(captions[currentScriptIndex]?.script || "")}
          </span>
          <span className="text-gray-400 opacity-70">"</span>
        </div>
      );
    }

    return (
      <div className="text-white font-bold text-center leading-tight tracking-wide" style={{ fontSize: 'clamp(14px, 2vw, 32px)' }}>
        <span className="text-gray-400 opacity-70">"</span>
        {currentWords.map((word, index) => {
          const isCurrentWord = currentVideoTime && 
            currentVideoTime >= word.start_time && 
            currentVideoTime <= word.end_time;
          
          return (
            <span
              key={index}
              className={`transition-all duration-200 ${
                isCurrentWord 
                  ? 'bg-gradient-to-br from-yellow-300 to-orange-400 bg-clip-text text-transparent font-extrabold scale-110 inline-block' 
                  : 'bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent'
              }`}
              style={{
                textShadow: isCurrentWord 
                  ? '0 0 20px rgba(255, 193, 7, 0.8), 0 0 40px rgba(255, 193, 7, 0.4)' 
                  : 'transparent'
              }}
            >
              {decodeHtmlEntities(word.word)}{index < currentWords.length - 1 ? ' ' : ''}
            </span>
          );
        })}
        <span className="text-gray-400 opacity-70">"</span>
      </div>
    );
  };

  return (
    <div className={`bg-gray-900/80 backdrop-blur-sm rounded-xl w-full  flex flex-col relative border ${isDuet && !isMyLine ? 'border-blue-800' : 'border-gray-800'} shadow-lg`}>
      <div className={`bg-gradient-to-br ${isDuet &&  !isMyLine ? 'from-[#0f1a2a] to-[#1e2b3b]' : 'from-[#0f172a] to-[#1e293b]'} rounded-xl p-[0.8vw] shadow-xl text-white border ${isDuet && !isMyLine ? 'border-blue-700/50' : 'border-gray-700/50'} h-full flex flex-col justify-between`}>
        
        {/* 상단 통합 영역: 스크립트 번호(좌) + 버튼들(중) + 시간 정보(우) */}
        <div className="flex items-center justify-between w-full  py-[0.3vh]">
          {/* 왼쪽: 스크립트 번호 */}
          <div className="flex items-center flex-1" style={{ fontSize: 'clamp(12px, 1.2vw, 20px)' }}>
            <span className="text-teal-300 font-mono">{currentScriptIndex + 1}</span>&nbsp;/ <span className="font-mono">{captions.length}</span>
            {isDuet && (
              <span className={`ml-2 px-2 py-0.5 rounded-lg text-xs ${
                isMyLine 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium'
              }`}>
                {isMyLine ? '나' : '상대방'}
              </span>
            )}
          </div>

          {/* 중앙: 버튼들 */}
          <div className="flex items-center justify-center gap-[1vw] flex-1">
            {/* 재생/정지 버튼 */}
            <button
              onClick={() => {
                if (isVideoPlaying) {
                  videoPlayerRef?.current?.pauseVideo();
                  if (onPause) onPause();
                } else {
                  if (videoPlayerRef?.current) {
                    const currentScript = captions[currentScriptIndex];
                    const startTime = currentScript?.start_time || 0;
                    const endTime = currentScript?.end_time || 0;
                    const currentTime = videoPlayerRef.current.getCurrentTime();
                    if (currentTime < startTime || currentTime >= endTime) {
                      videoPlayerRef.current.seekTo(startTime);
                    }
                    videoPlayerRef.current.playVideo();
                    if (onPlay) onPlay();
                  }
                }
              }}
              className={`w-[3.5vw] h-[3.5vw] min-w-[35px] min-h-[35px] max-w-[55px] max-h-[55px] ${
                recording 
                  ? 'bg-gray-700/70 backdrop-blur-sm cursor-not-allowed' 
                  : isVideoPlaying
                    ? 'bg-gradient-to-br from-red-700/70 to-rose-800/70 backdrop-blur-sm hover:from-red-600/80 hover:to-rose-700/80'
                    : 'bg-gradient-to-br from-emerald-700/70 to-green-800/70 backdrop-blur-sm hover:from-emerald-600/80 hover:to-green-700/80'
              } rounded-3xl flex items-center justify-center transition-all duration-300 shadow-lg border border-white/20 transform hover:scale-105 active:scale-95`}
              disabled={recording}
            >
              {isVideoPlaying || recording ? (
                <svg className="w-[1.2vw] h-[1.2vw] min-w-[14px] min-h-[14px] max-w-[20px] max-h-[20px]" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="2" />
                  <rect x="14" y="4" width="4" height="16" rx="2" />
                </svg>
              ) : (
                <svg className="w-[1.6vw] h-[1.6vw] min-w-[18px] min-h-[18px] max-w-[24px] max-h-[24px] ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5.14v14l11-7-11-7z" />
                </svg>
              )}
            </button>

            {/* 마이크 버튼 */}
            <button
              onClick={onMicClick}
              disabled={recording || recordingCompleted || (isDuet && !isMyLine)}
              className={` w-[3.5vw] h-[3.5vw] min-w-[35px] min-h-[35px] max-w-[55px] max-h-[55px] rounded-3xl flex items-center justify-center transition-all duration-300 shadow-lg border border-white/20 transform hover:scale-105 active:scale-95 ${
                recording 
                  ? 'bg-gradient-to-br from-red-700/70 to-rose-800/70 backdrop-blur-sm animate-pulse-mic' 
                  : recordingCompleted
                    ? 'bg-gradient-to-br from-green-700/70 to-emerald-800/70 backdrop-blur-sm'
                    : (isDuet && !isMyLine)
                      ? 'bg-gray-700/50 backdrop-blur-sm cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-br from-gray-700/70 to-gray-800/70 backdrop-blur-sm hover:from-gray-600/80 hover:to-gray-700/80'
              }`}
            >
              <svg 
                className="w-[1.6vw] h-[1.6vw] min-w-[18px] min-h-[18px] max-w-[24px] max-h-[24px] relative z-10" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
              </svg>
            </button>

            {/* 구간반복 버튼 */}
            <button
              onClick={onLoopToggle}
              disabled={recording || recordingCompleted || !videoPlayerRef?.current}
              className={`w-[3.5vw] h-[3.5vw] min-w-[35px] min-h-[35px] max-w-[55px] max-h-[55px] rounded-3xl flex items-center justify-center transition-all duration-300 shadow-lg border border-white/20 transform hover:scale-105 active:scale-95 ${
                isLooping 
                  ? 'bg-gradient-to-br from-amber-700/70 to-orange-800/70 backdrop-blur-sm' 
                  : 'bg-gradient-to-br from-gray-700/70 to-gray-800/70 backdrop-blur-sm hover:from-gray-600/80 hover:to-gray-700/80'
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" className={`w-[1.6vw] h-[1.6vw] min-w-[18px] min-h-[18px] max-w-[24px] max-h-[24px] ${isLooping ? 'animate-spin' : ''}`} stroke="currentColor" strokeWidth="2">
                <path d="M4 12c0-4.4 3.6-8 8-8 2.2 0 4.2 0.9 5.7 2.3" strokeLinecap="round"/>
                <path d="M20 4v4h-4" strokeLinecap="round"/>
                <path d="M20 12c0 4.4-3.6 8-8 8-2.2 0-4.2-0.9-5.7-2.3" strokeLinecap="round"/>
                <path d="M4 20v-4h4" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* 오른쪽: 시간 정보 */}
          <div className="flex items-center justify-end flex-1" style={{ fontSize: 'clamp(10px, 1vw, 16px)' }}>
            {playbackRange && (
              <span className="text-gray-300 font-medium">
                🎧 {formatTime(playbackRange.startTime)} ~ {playbackRange.endTime ? formatTime(playbackRange.endTime) : '끝'}
              </span>
            )}
            {(recordingCompleted || isAnalyzing) && !analysisResult && (
              <div className="flex items-center space-x-1 font-medium text-blue-400 ml-2">
                <div className="animate-spin w-2 h-2 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                <span>분석 중</span>
              </div>
            )}
          </div>
        </div>

        {/* 스크립트 본문 영역 */}
        <div className="flex flex-col items-center flex-1 justify-center gap-[1vh]">
          {/* 스크립트 본문 + 내비게이션 */}
          <div className="flex items-center gap-[1vw] w-full h-full">
            {/* 왼쪽 네비게이션 버튼 */}
            <button
              onClick={() => {
                if (currentScriptIndex > 0) {
                  onScriptChange(currentScriptIndex - 1);
                }
              }}
              disabled={currentScriptIndex === 0 || recording || recordingCompleted}
              className={`p-[0.8vw] rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${
                currentScriptIndex === 0 
                  ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed' 
                  : isDuet && !isMyLine
                    ? 'bg-indigo-900/50 backdrop-blur-sm text-blue-400 hover:bg-indigo-800/70 hover:text-blue-300 shadow-lg border border-blue-700/30'
                    : 'bg-emerald-900/50 backdrop-blur-sm text-green-400 hover:bg-emerald-800/70 hover:text-green-300 shadow-lg border border-emerald-700/30'
              }`}
            >
              <ChevronLeftIcon className="w-[1.5vw] h-[1.5vw] min-w-[16px] min-h-[16px] max-w-[24px] max-h-[24px]" />
            </button>

            {/* 중앙 스크립트 박스 */}
            <div 
              className="bg-gray-800/80 rounded-xl p-[0.2vw] flex-1 shadow-inner border border-gray-700/50 flex items-center justify-center relative overflow-hidden h-full min-h-[6vh]"
              style={{
                background: isAnalyzing 
                  ? 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))' 
                  : undefined
              }}
            >
              {isAnalyzing ? (
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <div className="text-blue-400 font-medium">음성 분석 중...</div>
                </div>
              ) : (
                <div className="text-white font-bold text-center leading-tight" style={{ fontSize: 'clamp(14px, 2vw, 32px)' }}>
                  {renderScriptWithWords()}
                </div>
              )}
            </div>

            {/* 오른쪽 네비게이션 버튼 */}
            <button
              onClick={() => {
                if (currentScriptIndex < captions.length - 1) {
                  onScriptChange(currentScriptIndex + 1);
                }
              }}
              disabled={currentScriptIndex === captions.length - 1 || recording || recordingCompleted}
              className={`p-[0.8vw] rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${
                currentScriptIndex === captions.length - 1 
                  ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed' 
                  : isDuet && !isMyLine
                    ? 'bg-indigo-900/50 backdrop-blur-sm text-blue-400 hover:bg-indigo-800/70 hover:text-blue-300 shadow-lg border border-blue-700/30'
                    : 'bg-emerald-900/50 backdrop-blur-sm text-green-400 hover:bg-emerald-800/70 hover:text-green-300 shadow-lg border border-emerald-700/30'
              }`}
            >
              <ChevronRightIcon className="w-[1.5vw] h-[1.5vw] min-w-[16px] min-h-[16px] max-w-[24px] max-h-[24px]" />
            </button>
          </div>

          {/* 완료 버튼들 */}
          {showCompletedButtons && (
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={onOpenDubbingListenModal}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg transform hover:scale-105 active:scale-95 font-medium text-sm"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                  <span>더빙본 들어보기</span>
                </div>
              </button>

              <button
                onClick={onShowResults}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg transform hover:scale-105 active:scale-95 font-medium text-sm"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2.5-9H19v2h-1.5v17.5c0 .83-.67 1.5-1.5 1.5H8c-.83 0-1.5-.67-1.5-1.5V4H5V2h4.5c0-.83.67-1.5 1.5-1.5h3c.83 0 1.5.67 1.5 1.5H20v2zm-3 2H8v15.5h10.5V4z"/>
                  </svg>
                  <span>결과보기</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScriptDisplay;
