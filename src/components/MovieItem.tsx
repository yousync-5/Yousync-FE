import React from "react";

interface MovieItemProps {
  video: {
    id: string;
    youtubeId: string;
    title: string;
  };
  onVideoClick: (youtubeId: string) => void;
}

const MovieItem = ({ video, onVideoClick }: MovieItemProps) => {
  return (
    <div
      className="flex-shrink-0 w-[220px] h-[320px] rounded-lg overflow-hidden bg-neutral-900 cursor-pointer hover:scale-105 transition-transform"
      onMouseEnter={() => onVideoClick(video.youtubeId)}
      onMouseLeave={() => onVideoClick("")}
    >
      <img
        src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
        alt={video.title}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default MovieItem;
