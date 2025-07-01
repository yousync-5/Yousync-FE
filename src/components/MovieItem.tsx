import React from "react";

interface MovieItemProps {
  video: {
    id: string;
    youtubeId: string;
    title: string;
  };
  onVideoClick: (youtubeId: string) => void;
  onVideoHover: (youtubeId: string | null) => void;
}

const MovieItem = ({ video, onVideoClick, onVideoHover }: MovieItemProps) => {
  return (
    <div
      className="flex-shrink-0 w-full aspect-[220/320] rounded-lg overflow-hidden bg-neutral-900 cursor-pointer hover:scale-105 transition-transform"
      onMouseEnter={() => onVideoHover(video.youtubeId)}
      onMouseLeave={() => onVideoHover(null)}
      onClick={() => onVideoClick(video.youtubeId)}
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
