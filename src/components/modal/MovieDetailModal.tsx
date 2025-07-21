"use client";

import React, { MouseEvent, useRef, useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import { FaMicrophone, FaUser, FaTag, FaClock } from "react-icons/fa";
import { useRouter } from "next/navigation";
import type { TokenDetailResponse } from "@/types/pitch";
import { tokenApi } from "@/services/api";

const YouTube = dynamic(() => import('react-youtube'), { ssr: false });

interface VideoModalProps {
  youtubeId: string;
  isOpen: boolean;
  onClose: () => void;
  tokenData: TokenDetailResponse;
}

export default function MovieDetailModal({
  youtubeId,
  isOpen,
  onClose,
  tokenData,
}: VideoModalProps) {
  const router = useRouter();
  const playerRef = useRef<any>(null);
  const [isDubbingLoading, setIsDubbingLoading] = useState(false);
  
  // 마우스 호버 관련 상태 추가
  const [isHovering, setIsHovering] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // tokenData가 있을 때만 접근
  const startTime = Number(tokenData?.start_time) || 0;
  const endTime = Number(tokenData?.end_time) || undefined;

  // 반복 재생: 영상이 끝나면 startTime으로 이동 후 재생
  const handlePlayerReady = (event: any) => {
    try {
      if (event && event.target) {
        playerRef.current = event.target;
        
        if (startTime > 0) {
          try {
            if (typeof event.target.seekTo === 'function') {
              event.target.seekTo(startTime);
            }
          } catch (error) {
            console.error('Error seeking to start time:', error);
          }
        }
        
        // 자동 재생하지 않고 대기
        try {
          if (typeof event.target.pauseVideo === 'function') {
            event.target.pauseVideo();
          }
        } catch (error) {
          console.error('Error pausing video:', error);
        }
      }
    } catch (error) {
      console.error('Error in handlePlayerReady:', error);
    }
  };

  const handlePlayerEnd = () => {
    if (!shouldPlay) return;
    
    try {
      const player = playerRef.current;
      if (player) {
        // 시간 이동 시도
        try {
          if (typeof player.seekTo === 'function') {
            player.seekTo(startTime);
          }
        } catch (error) {
          console.error('Error seeking video:', error);
        }
        
        // 재생 시도
        try {
          if (typeof player.playVideo === 'function') {
            player.playVideo();
          }
        } catch (error) {
          console.error('Error playing video:', error);
        }
      }
    } catch (error) {
      console.error('Error accessing player:', error);
    }
  };

  // 마우스가 영상 위에 1.5초 이상 머물면 재생
  useEffect(() => {
    if (isHovering) {
      hoverTimerRef.current = setTimeout(() => {
        setShouldPlay(true);
        
        try {
          const player = playerRef.current;
          if (player) {
            // 시간 이동 시도
            try {
              if (typeof player.seekTo === 'function') {
                player.seekTo(startTime);
              }
            } catch (error) {
              console.error('Error seeking video:', error);
            }
            
            // 재생 시도
            try {
              if (typeof player.playVideo === 'function') {
                player.playVideo();
              }
            } catch (error) {
              console.error('Error playing video:', error);
            }
          }
        } catch (error) {
          console.error('Error accessing player:', error);
        }
      }, 1500); // 1.5초 후 재생
    } else {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
      setShouldPlay(false);
      
      try {
        // 안전하게 메서드 호출
        const player = playerRef.current;
        if (player) {
          // 일시 정지 시도
          try {
            if (typeof player.pauseVideo === 'function') {
              player.pauseVideo();
            }
          } catch (error) {
            console.error('Error pausing video:', error);
          }
          
          // 시간 이동 시도
          try {
            if (typeof player.seekTo === 'function') {
              player.seekTo(startTime);
            }
          } catch (error) {
            console.error('Error seeking video:', error);
          }
        }
      } catch (error) {
        console.error('Error accessing player:', error);
      }
    }

    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, [isHovering, startTime]);

  // endTime이 지정된 경우, 100ms마다 체크해서 endTime 도달 시 반복
  useEffect(() => {
    if (!endTime || !shouldPlay) return;
    
    const interval = setInterval(() => {
      try {
        const player = playerRef.current;
        if (!player) {
          clearInterval(interval);
          return;
        }
        
        // 현재 시간 가져오기 시도
        let current;
        try {
          if (typeof player.getCurrentTime === 'function') {
            current = player.getCurrentTime();
          } else {
            clearInterval(interval);
            return;
          }
        } catch (error) {
          console.error('Error getting current time:', error);
          clearInterval(interval);
          return;
        }
        
        // endTime 도달 시 처리
        if (typeof current === 'number' && current >= endTime) {
          try {
            // 시간 이동 시도
            if (typeof player.seekTo === 'function') {
              player.seekTo(startTime);
            }
            
            // 재생 시도
            if (typeof player.playVideo === 'function') {
              player.playVideo();
            }
          } catch (error) {
            console.error('Error handling end time reached:', error);
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error('Error in interval:', error);
        clearInterval(interval);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [endTime, startTime, shouldPlay, isOpen]);

  if (!isOpen || !youtubeId || !tokenData) return null;

  const handleDubbingClick = async () => {
    setIsDubbingLoading(true);
    try {
      await tokenApi.incrementView(tokenData.id);
    } catch (error) {
      console.error("Failed to increment view count:", error);
    } finally {
      router.push(`/dubbing/${tokenData.id}?modalId=${youtubeId}`);
    }
  };

  // 마우스 이벤트 핸들러
  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <div className="fixed inset-0 z-51 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className="relative z-50 w-full max-w-[90vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-[#181818] p-4 sm:p-6 shadow-2xl"
        onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        {/* 닫기 버튼은 주석 처리됨. 바깥(배경) 클릭 시 모달이 닫힙니다. */}
        {/* <button
          className="absolute top-4 right-4 text-2xl text-white hover:text-gray-300"
          onClick={onClose}
        >
          &times;
        </button> */}
        {/* 메인 영상 */}
        <div 
          ref={videoContainerRef}
          className="mx-auto aspect-video w-full overflow-hidden rounded-xl relative shadow-lg"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <YouTube
            key={youtubeId}
            videoId={youtubeId}
            className="h-full w-full"
            onReady={handlePlayerReady}
            onEnd={handlePlayerEnd}
            opts={{
              width: "100%",
              height: "100%",
              playerVars: {
                controls: 0, // 재생바 숨김
                autoplay: 0, // 자동 재생 비활성화
                start: startTime,
                showinfo: 0, // 제목 숨김
                modestbranding: 1, // 유튜브 로고 최소화
                rel: 0, // 관련 영상 숨김
                iv_load_policy: 3, // 인포카드 숨김
                fs: 0, // 전체화면 버튼 숨김
                disablekb: 1, // 키보드 제어 비활성화
              }
            }}
          />
          {/* 상단 오버레이 */}
          <div
            className="absolute top-0 left-0 w-full z-20 pointer-events-none"
            style={{ height: 64, background: '#000', opacity: 1 }}
          />
          
          {/* 재생 상태 표시 오버레이 */}
          {!shouldPlay && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <div className="text-white text-center">
                
                <p className="text-lg">마우스를 1.5초간 올려두면 재생됩니다</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-6 bg-[#20232a] rounded-2xl shadow-lg p-6 border border-[#23272f]">
          <div className="flex-1 flex flex-col gap-2">
            <div
              className="flex items-center gap-2 text-2xl text-emerald-400 font-bold cursor-pointer"
              onClick={() => router.push(`/actor/${encodeURIComponent(tokenData.actor_name.replace(/\s/g, ''))}`)}
            >
              <FaUser />
              {tokenData.actor_name}
            </div>
            <div className="flex items-center gap-2 text-base text-gray-300">
              <FaTag />
              {tokenData.category}
            </div>
            <div className="flex items-center gap-2 text-base text-gray-400">
              <FaClock />
              재생 시간: {(Number(tokenData.end_time) - Number(tokenData.start_time)).toFixed(2)}초
            </div>
          </div>
          <button
            onClick={handleDubbingClick}
            disabled={isDubbingLoading}
            className={`flex items-center gap-3 px-8 py-3 rounded-full text-white text-lg font-bold shadow-lg transition-all duration-200 focus:outline-none ${isDubbingLoading ? 'bg-emerald-500 animate-pulse cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600'}`}
          >
            <FaMicrophone className="text-2xl" />
            더빙하기
          </button>
        </div>
      </div>
    </div>
  );
}