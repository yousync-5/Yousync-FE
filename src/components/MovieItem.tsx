import React, { useState } from "react";
import YouTube from "react-youtube";

interface MovieItemProps {
  video: {
    id: string;
    youtubeId: string;
    title: string;
  };
  onVideoClick: (youtubeId: string) => void;
}

const MovieItem = ({ video, onVideoClick }: MovieItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="flex-shrink-0 w-[220px] h-[320px] rounded-lg overflow-hidden bg-neutral-900 cursor-pointer hover:scale-105 transition-transform"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onVideoClick(video.youtubeId)}
    >
      {isHovered ? (
        <YouTube
          videoId={video.youtubeId}
          opts={{
            width: "100%",
            height: "100%",
            playerVars: {
              autoplay: 1,
              mute: 1,
              controls: 0,
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
              disablekb: 1,
            },
          }}
          className="w-full h-full"
        />
      ) : (
        <img
          src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
          alt={video.title}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};

export default MovieItem;