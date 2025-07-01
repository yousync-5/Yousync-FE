"use client";
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
      className="flex-shrink-0 w-[250px] cursor-pointer rounded overflow-hidden hover:scale-110 transition-transform duration-300"
      onClick={() => onVideoClick(video.youtubeId)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ position: 'relative', height: '140px' }}
    >
      {isHovered ? (
        <YouTube
          videoId={video.youtubeId}
          className="w-full h-full"
          opts={{
            width: "100%",
            height: "140",
            playerVars: { autoplay: 1, controls: 0, mute: 1, rel: 0 },
          }}
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
