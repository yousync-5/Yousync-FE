// src/components/MovieItem.tsx
import React from "react";

interface MovieItemProps {
  video: {
    id: string | number;
    youtubeId: string;
    title: string;
  };
  onVideoClick: (youtubeId: string) => void;
}

const MovieItem = ({ video, onVideoClick }: MovieItemProps) => {
  return (
    <div
      className="
        relative w-full aspect-[16/9] bg-black rounded-[10px]
        overflow-hidden cursor-pointer
        transition-all duration-200
        hover:scale-105 z-0 hover:z-50
      "
      onClick={() => onVideoClick(video.youtubeId)}
      style={{ minWidth: "240px", maxWidth: "320px" }}
    >
      <img
        src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
        alt={video.title}
        className="w-full h-full object-cover"
        draggable={false}
      />
    </div>
  );
};

export default MovieItem;
