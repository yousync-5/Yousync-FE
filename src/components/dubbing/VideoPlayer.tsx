"use client";

import YouTube from "react-youtube";
import { useVideoStore } from "@/store/useVideoStore";
import { useRef, useEffect, useState } from "react";

interface VideoPlayerProps {
  videoId?: string;    // YouTube용
  videoUrl?: string;   // 로컬용
  startTime?: number;
}

export default function VideoPlayer({ videoId, videoUrl, startTime }: VideoPlayerProps) {
  const { setVideoRef, showThumbnail, isLoading } = useVideoStore();
  const playerRef = useRef<YT.Player | null>(null);
  const videoTagRef = useRef<HTMLVideoElement | null>(null);

  // YouTube 영상 분기
  if (videoId) {
    return (
      <div className="bg-black rounded-xl overflow-hidden">
        <div className="relative w-full pt-[56.25%]">
          {/* 썸네일 (초기 상태) */}
          {showThumbnail && (
            <div className="absolute inset-0 z-20">
              <img 
                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* 로딩 스피너 */}
          {isLoading && !showThumbnail && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black">
              <div className="animate-spin size-5 rounded-full h-16 w-16 border-b-2 border-white"></div>
            </div>
          )}
          
          {/* YouTube Player */}
          <YouTube
            videoId={videoId}
            className="absolute top-0 left-0 w-full h-full"
            onReady={(event: any) => {
              playerRef.current = event.target;
              setVideoRef(playerRef);
              if (startTime) {
                event.target.seekTo(startTime, true);
              }
            }}
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
                cc_load_policy: 0,
                color: "white",
                playsinline: 1,
              },
            }}
          />
          {/* YouTube UI를 가리는 오버레이 */}
          <div className="absolute inset-0 pointer-events-none z-10">
            {/* 하단 컨트롤 영역 가리기 */}
            {/* <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/50 to-transparent"></div> */}
            {/* 상단 제목 영역 가리기 */}
            {/* <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/50 to-transparent"></div> */}
          </div>
          
          {/* 로딩 중일 때 YouTube 로고 완전 가리기 */}
          {isLoading && !showThumbnail && (
            <div className="absolute inset-0 bg-black z-15"></div>
          )}
        </div>
      </div>
    );
  }

  // 로컬 영상 분기
  if (videoUrl) {
    useEffect(() => {
      setVideoRef(videoTagRef);
    }, [videoUrl, setVideoRef]);

    useEffect(() => {
      if (videoTagRef.current && startTime) {
        videoTagRef.current.currentTime = startTime;
      }
    }, [startTime, videoUrl]);

    return (
      <div className="bg-black rounded-xl overflow-hidden relative w-full" style={{ aspectRatio: "16/9" }}>
        <video
          ref={videoTagRef}
          src={videoUrl}
          controls
          className="w-full h-full"
        />
      </div>
    );
  }

  // 아무것도 없을 때
  return <div>영상 정보가 없습니다.</div>;
} 