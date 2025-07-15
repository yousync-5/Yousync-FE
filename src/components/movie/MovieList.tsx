// src/components/movie/MovieList.tsx
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import MovieItem from "./MovieItem";

interface MovieListProps {
  sectionId: string;
  videos: Array<{ videoId: string; youtubeId: string; actor_name: string }>;
  isPlayable?: boolean;
  isShorts?: boolean;
  playingVideo?: string | null;
  onPlay?: (youtubeId: string) => void;
  onOpenModal?: (youtubeId: string) => void;
  onStop?: () => void;
}

export default function MovieList({
  sectionId,
  videos,
  isPlayable,
  isShorts,
  playingVideo,
  onPlay,
  onOpenModal,
  onStop,
}: MovieListProps) {
  // 가로 스크롤 함수들
  const scrollLeft = () => {
    const container = document.getElementById(sectionId);
    if (container) {
      container.scrollBy({ left: -400, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    const container = document.getElementById(sectionId);
    if (container) {
      container.scrollBy({ left: 400, behavior: "smooth" });
    }
  };

  return (
    <div className="relative group">
      {/* Left Arrow */}
      <button
        onClick={scrollLeft}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/90 backdrop-blur-sm border border-gray-700 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-900 shadow-2xl"
      >
        <ChevronLeftIcon className="w-6 h-6 text-green-400" />
      </button>

      {/* Right Arrow */}
      <button
        onClick={scrollRight}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/90 backdrop-blur-sm border border-gray-700 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-900 shadow-2xl"
      >
        <ChevronRightIcon className="w-6 h-6 text-green-400" />
      </button>

      {/* Videos Row */}
      <div
        id={sectionId}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {videos.map((video) => (
          <MovieItem
            key={`${sectionId}-${video.videoId}`}
            video={video}
            isPlayable={isPlayable}
            isShorts={isShorts}
            playingVideo={playingVideo}
            onPlay={onPlay}
            onOpenModal={onOpenModal ? () => onOpenModal(video.videoId) : undefined}
            onStop={onStop}
          />
        ))}
      </div>
    </div>
  );
}