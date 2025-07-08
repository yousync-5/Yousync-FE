<<<<<<< HEAD
"use client";

import YouTube from "react-youtube";

interface VideoPlayerProps {
  videoId: string;
}

export default function VideoPlayer({ videoId }: VideoPlayerProps) {
  return (
    <div className="bg-black rounded-xl overflow-hidden">
      <div className="relative w-full pt-[56.25%]">
        <YouTube
          videoId={videoId}
          className="absolute top-0 left-0 w-full h-full"
          opts={{
            width: "100%",
            height: "100%",
            playerVars: {
              autoplay: 0,
              controls: 1,
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
            },
          }}
        />
      </div>
    </div>
  );
} 
=======
//이해완료
"use client";

import YouTube from "react-youtube";
import { useRef, useEffect, useImperativeHandle, forwardRef } from "react";


interface VideoPlayerProps {
  videoId: string;
  onTimeUpdate?: (currentTime: number) => void;
  startTime?: number;
  endTime?: number;
  disableAutoPause?: boolean;
  onEndTimeReached?: () => void;
  onPause?: () => void;
}

export interface VideoPlayerRef {
  seekTo: (time: number) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  getCurrentTime: () => number;
}

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  ({ videoId, onTimeUpdate, startTime = 0, endTime, disableAutoPause = false, onEndTimeReached, onPause }, ref) => {
    const playerRef = useRef<any>(null);
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



    // disableAutoPause prop 변경 시 처리
    // useEffect(() => {
    //   console.log('VideoPlayer disableAutoPause 변경:', disableAutoPause);
      
    //   // disableAutoPause가 false로 변경되고, 현재 시간이 endTime을 초과했다면 비디오 정지
    //   if (!disableAutoPause && playerRef.current && endTime) {
    //     const currentTime = playerRef.current.getCurrentTime();
    //     if (currentTime >= endTime) {
    //       playerRef.current.pauseVideo();
    //       console.log('disableAutoPause 변경으로 인한 비디오 정지:', {
    //         currentTime,
    //         endTime,
    //         disableAutoPause
    //       });
    //     }
    //   }
    // }, [disableAutoPause, endTime]);

    // 컴포넌트 언마운트 시 인터벌 정리
    useEffect(() => {
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, []);

    const onReady = (event: any) => {
      playerRef.current = event.target;
      
      // 시작 시간이 설정되어 있으면 해당 시간부터 재생
      if (startTime > 0) {
        event.target.seekTo(startTime);
        console.log('플레이어 시작 시간 설정:', startTime);
      }
      
      console.log('VideoPlayer onReady - disableAutoPause:', disableAutoPause);
    };

    const onStateChange = (event: any) => {
      // 기존 인터벌 정리
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // 재생 중일 때만 시간 업데이트
      if (event.data === 1) { // 1 = 재생 중
        console.log('영상 재생 시작 - 시간 업데이트 인터벌 시작');
        intervalRef.current = setInterval(() => {
          if (playerRef.current && onTimeUpdate) {
            const currentTime = playerRef.current.getCurrentTime();
            onTimeUpdate(currentTime);
            // endTime 체크 후 자동 정지 (주석 복구)
            if (endTime !== undefined && currentTime >= endTime) {
              playerRef.current.pauseVideo();
              if (onEndTimeReached) onEndTimeReached();
              console.log('endTime 도달 - 영상 자동 정지', { currentTime, endTime });
            }
          }
        }, 100); // 100ms마다 시간 체크
      } else if (event.data === 2) { // 2 = 일시정지
        console.log('영상 일시정지 - 시간 업데이트 인터벌 정지');
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (onPause) onPause();
      }
    };



    return (
      <div className="bg-black rounded-xl overflow-hidden">
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
                controls: 1,
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
                start: initialStartTimeRef.current, // 시작 시간 설정
              },
            }}
          />
        </div>
      </div>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer; 
>>>>>>> 6afcd6bd82b7ca9849a17388d634aa46fe195272
