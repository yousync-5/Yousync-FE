"use client";

import useMainVideo from "@/hooks/useMainVedio";
import YouTube from "react-youtube";
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress } from "react-icons/fa";
import { useState } from "react";

interface YouTubeVideoInfo {
  id: string;
  title: string;
  categoryId: string;
  categoryTitle: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: string;
  duration: string;
}

interface MainVideoPlayerProps {
  className?: string;
  onVideoLoad?: (videoInfo: YouTubeVideoInfo) => void;
}

export default function MainVideoPlayer({ className = "", onVideoLoad }: MainVideoPlayerProps) {
  const { videoId, videoInfo, isLoading, error, refetch } = useMainVideo();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">영상 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-red-400 mb-2">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!videoId || !videoInfo) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="text-gray-500 text-4xl mb-4">📺</div>
          <p className="text-gray-400">메인 영상이 없습니다.</p>
          <p className="text-gray-500 text-sm mt-2">
            URL에 ?video=VIDEO_ID를 추가하거나<br />
            YouTube에서 이 페이지로 이동해주세요.
          </p>
        </div>
      </div>
    );
  }

  const handleReady = (event: { target: { playVideo: () => void; pauseVideo: () => void; mute: () => void; unMute: () => void; } }) => {
    setIsPlaying(false);
    onVideoLoad?.(videoInfo);
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  const toggleMute = () => setIsMuted(!isMuted);
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* YouTube 플레이어 */}
      <div className="relative aspect-video">
        <YouTube
          videoId={videoId}
          className="w-full h-full"
          opts={{
            width: "100%",
            height: "100%",
            playerVars: {
              controls: 0, // 커스텀 컨트롤 사용
              autoplay: 0,
              modestbranding: 1,
              rel: 0,
            },
          }}
          onReady={handleReady}
          onPlay={handlePlay}
          onPause={handlePause}
        />

        {/* 커스텀 컨트롤 오버레이 */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            {/* 영상 정보 */}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold truncate">
                {videoInfo.title}
              </h3>
              <p className="text-gray-300 text-sm truncate">
                {videoInfo.channelTitle} • 조회수 {parseInt(videoInfo.viewCount).toLocaleString()}회
              </p>
            </div>

            {/* 컨트롤 버튼들 */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                title={isMuted ? "음소거 해제" : "음소거"}
              >
                {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                title={isFullscreen ? "전체화면 해제" : "전체화면"}
              >
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 영상 상세 정보 */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white mb-2">
              {videoInfo.title}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{videoInfo.channelTitle}</span>
              <span>•</span>
              <span>{new Date(videoInfo.publishedAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>조회수 {parseInt(videoInfo.viewCount).toLocaleString()}회</span>
            </div>
          </div>
          
          {/* 카테고리 태그 */}
          <div className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full">
            {videoInfo.categoryTitle}
          </div>
        </div>
      </div>
    </div>
  );
} 