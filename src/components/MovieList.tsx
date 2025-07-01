import React, { useState } from "react";
import MovieDetailModal from "./MovieDetailModal";
import MovieItem from "./MovieItem";

interface Video {
  id: string;
  youtubeId: string;
  title: string;
}

interface MovieListProps {
  title: string;
  videos: Video[];
}

export const MovieList = ({ title, videos }: MovieListProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="my-8" style={{ marginTop: "10vh" }}>
      <h2 className="text-lg font-semibold text-white mb-3 text-center">{title}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-center justify-items-center">
        {videos.map((video) => (
          <div
            key={video.id}
            className="relative"
            onMouseEnter={() => setHoveredId(video.youtubeId)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <MovieItem
              video={video}
              onVideoClick={() => {}} // 클릭 사용 안 함
            />

            {/* Hover 시 모달 유사 컴포넌트 표시 */}
            {hoveredId === video.youtubeId && (
              <div className="absolute top-0 left-0 w-full h-full z-50">
                <MovieDetailModal
                  youtubeId={video.youtubeId}
                  isOpen={true}
                  onClose={() => setHoveredId(null)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
