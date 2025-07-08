import React, { useState } from 'react'
import { useVideoStore } from '@/store/useVideoStore'

export const VideoControls = () => {
  const { isPlaying, togglePlay, showThumbnail, setShowThumbnail, setIsLoading } = useVideoStore();

  const handlePlayPauseToggle = () => {
    if (showThumbnail) {
      // 썸네일이 보이는 상태에서 첫 번째 클릭
      setIsLoading(true);
      setShowThumbnail(false);
      // 로딩 완료 후 재생
      setTimeout(() => {
        togglePlay();
        setIsLoading(false);
      }, 500);
    } else {
      togglePlay();
    }
  };

  return (
    <div className="flex items-center justify-center space-x-6">
      {/* 재생/일시정지 토글 버튼 */}
      <button 
        onClick={handlePlayPauseToggle}
        className={`flex items-center justify-center w-16 h-16 rounded-full transition-colors duration-200 ${
          isPlaying 
            ? 'bg-red-600 hover:bg-red-500' 
            : 'bg-green-600 hover:bg-green-500'
        }`}
      >
        {isPlaying ? (
          // 일시정지 아이콘
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          // 재생 아이콘
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      
      {/* 녹음 토글 버튼 */}
      <button className="flex items-center justify-center w-16 h-16 bg-gray-600 hover:bg-gray-500 rounded-full transition-colors duration-200">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
      </button>
    </div>
  )
}
