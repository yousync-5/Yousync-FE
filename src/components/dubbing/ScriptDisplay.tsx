"use client";

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
}

export default function ScriptDisplay({ 
  captions, 
  currentScriptIndex, 
  onScriptChange,
  currentVideoTime = 0,
  playbackRange,
  videoPlayerRef
}: ScriptDisplayProps) {

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

  return (
    <div className="bg-gray-900 rounded-xl p-6 w-[77em] flex flex-col relative">
      <h3 className="text-lg font-semibold mb-4">Current Script</h3>
      
      {/* Progress */}
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">
            Script {currentScriptIndex + 1} of {captions.length}
          </span>
          <div className="w-16 bg-gray-600 rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${((currentScriptIndex + 1) / captions.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-green-400 font-medium">
            {Math.round(((currentScriptIndex + 1) / captions.length) * 100)}%
          </span>
        </div>
      </div>

      {/* Current Video Time */}
      <div className="text-center mb-4">
        <span className="text-sm text-blue-400 font-medium">
          현재 시간: {formatTime(currentVideoTime)}
        </span>
        {playbackRange && (
          <div className="text-xs text-gray-400 mt-1">
            전체 더빙 구간: {formatTime(playbackRange.startTime)} ~ {playbackRange.endTime ? formatTime(playbackRange.endTime) : '끝'}
          </div>
        )}
      </div>
      
      {/* Current Script Content with Navigation */}
      <div className="flex items-center space-x-4">
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
        
        <div className="bg-gray-800 rounded-lg p-4 flex-1">
          <div className="text-sm text-gray-400 mb-2">
            {String(Math.floor(captions[currentScriptIndex]?.start_time / 60)).padStart(2, "0")}:
            {String(Math.floor(captions[currentScriptIndex]?.start_time % 60)).padStart(2, "0")} - 
            {String(Math.floor(captions[currentScriptIndex]?.end_time / 60)).padStart(2, "0")}:
            {String(Math.floor(captions[currentScriptIndex]?.end_time % 60)).padStart(2, "0")}
          </div>
          <div className="text-white text-lg mb-2">
            &ldquo;{captions[currentScriptIndex]?.script}&rdquo;
          </div>
          <div className="text-sm text-gray-400">
            {captions[currentScriptIndex]?.translation}
          </div>
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
    </div>
  );
} 