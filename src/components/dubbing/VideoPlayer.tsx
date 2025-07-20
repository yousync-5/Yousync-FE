//이해완료
"use client";

import YouTube from "react-youtube";
import { useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { useState } from "react";


interface VideoPlayerProps {
  videoId: string;
  onTimeUpdate?: (currentTime: number) => void;
  startTime?: number;
  endTime?: number;
  disableAutoPause?: boolean;
  onEndTimeReached?: () => void;
  onPause?: () => void;
  onPlay?: () => void;
  overlayType?: 'full' | 'header'; // 오버레이 타입
  overlayHeight?: number; // header 오버레이 높이(px)
  // 스크립트 목록 버튼 관련 props
  onOpenSidebar?: () => void;
}

export interface VideoPlayerRef {
  seekTo: (time: number) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  getCurrentTime: () => number;
}

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  ({ videoId, onTimeUpdate, startTime = 0, endTime, disableAutoPause = false, onEndTimeReached, onPause, onPlay, overlayType = 'header', overlayHeight = 48, onOpenSidebar }, ref) => {
    const playerRef = useRef<{ seekTo: (time: number) => void; playVideo: () => void; pauseVideo: () => void; getCurrentTime: () => number } | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const initialStartTimeRef = useRef(startTime);

    // 외부에서 호출할 수 있는 메서드들
    useImperativeHandle(ref, () => ({
      seekTo: (time: number) => {
        if (playerRef.current) {
          playerRef.current.seekTo(time);
          console.log('영상 시간 이동:', time);
        }
      },
      playVideo: () => {
        if (playerRef.current) {
          playerRef.current.playVideo();
          console.log('영상 재생 시작');
        }
      },
      pauseVideo: () => {
        if (playerRef.current) {
          playerRef.current.pauseVideo();
          console.log('영상 일시정지');
        }
      },
      getCurrentTime: () => {
        if (playerRef.current) {
          return playerRef.current.getCurrentTime();
        }
        return 0;
      }
    }));

    // 컴포넌트 언마운트 시 인터벌 정리
    useEffect(() => {
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, []);

    // 오버레이 상태
    const [showOverlay, setShowOverlay] = useState(true);
    const [playerReady, setPlayerReady] = useState(false);
    // 4초 후 오버레이 해제
    useEffect(() => {
      const timer = setTimeout(() => setShowOverlay(false), 4000);
      return () => clearTimeout(timer);
    }, []);
    // 오버레이가 사라지고, 플레이어가 준비된 경우 자동재생
    useEffect(() => {
      if (!showOverlay && playerReady && playerRef.current) {
        playerRef.current.playVideo();
      }
    }, [showOverlay, playerReady]);

    const onReady = (event: { target: { seekTo: (time: number) => void; playVideo: () => void; pauseVideo: () => void; getCurrentTime: () => number } }) => {
      playerRef.current = event.target;
      setPlayerReady(true);
      
      // 시작 시간이 설정되어 있으면 해당 시간부터 재생
      if (startTime > 0) {
        event.target.seekTo(startTime);
        console.log('플레이어 시작 시간 설정:', startTime);
      }
      
      console.log('VideoPlayer onReady - disableAutoPause:', disableAutoPause);
    };

    const onStateChange = (event: { data: number }) => {
      // 기존 인터벌 정리
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // 재생 중일 때만 시간 업데이트
      if (event.data === 1) { // 1 = 재생 중
        console.log('영상 재생 시작 - 시간 업데이트 인터벌 시작');
        if (typeof onPlay === 'function') onPlay();
        intervalRef.current = setInterval(() => {
          if (playerRef.current && onTimeUpdate) {
            const currentTime = playerRef.current.getCurrentTime();
            onTimeUpdate(currentTime);
            // endTime 체크 후 자동 정지 (주석 복구)
            if (endTime !== undefined && currentTime >= endTime) {
              playerRef.current.pauseVideo();
              if (onEndTimeReached) onEndTimeReached();
            }
          }
        }, 100); // 100ms마다 시간 체크
      } else if (event.data === 2) { // 2 = 일시정지
        console.log('영상 일시정지 - 시간 업데이트 인터벌 정지');
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (typeof onPause === 'function') onPause();
      }
    };



    return (
      <div className="bg-black rounded-xl overflow-hidden w-full border border-gray-800 shadow-lg shadow-black/50 relative">
        <div className="relative w-full pt-[56.25%]">
          <YouTube
            videoId={videoId}
            className="absolute top-0 left-0 w-full h-full"
            onReady={onReady}
            onStateChange={onStateChange}
            opts={{
              width: "100%",
              height: "100%",
              playerVars: {
                autoplay: 0,
                controls: 0,
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
                iv_load_policy: 3,
                disablekb: 1,
                fs: 0,
                start: initialStartTimeRef.current, // 시작 시간 설정
              },
            }}
          />
          {/* 상단 오버레이 (텍스트/공유/타이틀 등 가림) */}
          <div
            className="absolute top-0 left-0 w-full z-20 pointer-events-none"
            style={{ height: 80, background: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0) 100%)' }}
          />
        </div>
        
        {/* 전체 스크립트 보기 버튼 - 오른쪽 상단에 위치 */}
        {onOpenSidebar && (
          <button
            onClick={onOpenSidebar}
            className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 bg-gray-800/80 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-all duration-200 z-30"
            title="전체 스크립트 보기"
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
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer; 