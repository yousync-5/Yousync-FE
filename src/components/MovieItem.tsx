import React, { useRef } from "react";
import YouTube, { YouTubeEvent } from "react-youtube";

interface MovieItemProps {
  video: {
    youtubeId: string;
  };
  onVideoClick: (youtubeId: string) => void;
}

export const MovieItem = ({ video, onVideoClick }: MovieItemProps) => {
  const playerRef = useRef<YT.Player | null>(null);

const handlePlayVideo = () => {
  if (playerRef.current) {
    playerRef.current.seekTo(15, true); 
    playerRef.current.playVideo();
  }
};

const handlePauseVideo = () => {
  if (playerRef.current) {
    playerRef.current.pauseVideo();
    playerRef.current.seekTo(15, true); 
  }
};


  const onPlayerReady = (event: YouTubeEvent) => {
    playerRef.current = event.target;
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
                autoplay: 0,
                mute: 1,
                controls: 0,
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
              },
            }}
            onReady={onPlayerReady}
          />
          <div
            onClick={() => onVideoClick(video.youtubeId)}
            className="absolute top-0 left-0 w-full h-full z-10 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};