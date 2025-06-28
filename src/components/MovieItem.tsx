import React, { useRef, useState } from "react";
import YouTube, { YouTubeEvent } from "react-youtube";

interface MovieItemProps {
  video: {
    youtubeId: string;
  };
  onVideoClick: (youtubeId: string) => void;
}

export const MovieItem = ({ video, onVideoClick }: MovieItemProps) => {
  const playerRef = useRef<YT.Player | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const handlePlayVideo = () => {
    setIsHovered(true);
    if (playerRef.current) {
      playerRef.current.seekTo(15);
      playerRef.current.playVideo();
    }
  };

  const handlePauseVideo = () => {
    setIsHovered(false);
    if (playerRef.current) {
      playerRef.current.pauseVideo();
      playerRef.current.seekTo(15);
    }
  };

  const onPlayerReady = (event: YouTubeEvent) => {
    playerRef.current = event.target;
    setPlayerReady(true);
  };

  return (
    <div>
      <div
        key={video.youtubeId}
        onClick={() => onVideoClick(video.youtubeId)}
        className="relative rounded-xl overflow-hidden"
        onMouseEnter={handlePlayVideo}
        onMouseLeave={handlePauseVideo}
      >
        <div className="relative w-full max-w-[400px] h-[180px] mx-auto">
          <YouTube
            videoId={video.youtubeId}
            className="w-full h-full block"
            opts={{
              width: "400",
              height: "180",
              playerVars: {
                autoplay: 0, //초기 자동재생 막기
                mute: 1, //  // 음소거 (autoplay를 브라우저가 허용하게 함)
                controls: 0, // 컨트롤 숨기기
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
              },
            }}
            onReady={onPlayerReady}
          />
          {/* 클릭 막는 투명 레이어 */}
          <div
            onClick={() => onVideoClick(video.youtubeId)}
            className="absolute top-0 left-0 w-full h-full z-10 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};