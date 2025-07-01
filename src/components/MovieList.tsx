// src/components/MovieList.tsx
"use client";

import MovieItem from "./MovieItem";
import { VideoType } from "@/type/VideoType";
import { useState } from "react";

interface MovieListProps {
  videos: VideoType[];
  onVideoClick: (youtubeId: string) => void;
}

// n개씩 끊어서 2차원 배열로 분할
const chunkArray = <T,>(array: T[], chunkSize: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
};

export default function MovieList({ videos, onVideoClick }: MovieListProps) {
  const rows = chunkArray<VideoType>(videos, 6);
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(rows.length / 3);

  const handlePrev = () => {
    setPage((prev) => Math.max(0, prev - 1));
  };
  const handleNext = () => {
    setPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const visibleRows = rows.slice(page * 3, page * 3 + 3);

  return (
    <div className="w-full px-0 py-6">
      {/* 페이지 인디케이터 - 상단 우측 */}
      <div className="flex justify-end items-center px-6 mb-4">
        <div className="flex space-x-2">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <div
              key={idx}
              className={`w-4 h-1 rounded-full transition-all duration-200 ${
                idx === page ? "bg-white" : "bg-gray-600"
              }`}
            ></div>
          ))}
        </div>
      </div>

      <div className="space-y-12 px-6">
        {visibleRows.map((row, rowIdx) => (
          <div key={rowIdx} className="space-y-3">
            {/* 한 줄 인디케이터 */}
            <div className="flex justify-center space-x-1 mb-2">
              {Array.from({ length: Math.ceil(row.length / 2) }).map((_, dotIdx) => (
                <div
                  key={dotIdx}
                  
                ></div>
              ))}
            </div>
            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-10 justify-items-center"
            >
              {row.map((video) => (
                <div key={video.youtubeId} className="aspect-video w-full max-w-[250px]">
                  <MovieItem video={video} onVideoClick={onVideoClick} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 슬라이드 버튼 */}
      <div className="flex justify-between items-center mt-6 px-6">
        <button
          onClick={handlePrev}
          disabled={page === 0}
          className="text-white disabled:opacity-30"
        >
          ◀ 이전
        </button>
        <button
          onClick={handleNext}
          disabled={page === totalPages - 1}
          className="text-white disabled:opacity-30"
        >
          다음 ▶
        </button>
      </div>
    </div>
  );
}
