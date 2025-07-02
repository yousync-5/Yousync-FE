import React, { useState, useEffect } from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { VideoType } from "@/type/VideoType";

const CARD_WIDTH = 220;
const CARDS_PER_PAGE = 6;

interface MovieListProps {
  videos?: VideoType[];
  onVideoClick: (youtubeId: string) => void;
}

export default function MovieList({
  videos,
  onVideoClick,
}: MovieListProps) {
  const items = videos || [];
  const totalPages = Math.ceil(items.length / CARDS_PER_PAGE);
  const [page, setPage] = useState(0);

  // 페이지 리셋(넘치거나, 아이템 수 줄었을 때)
  useEffect(() => {
    if (page >= totalPages) setPage(0);
  }, [items.length, totalPages, page]);

  // 페이지 이동
  const goPrev = () =>
    setPage((prev) => (prev <= 0 ? totalPages - 1 : prev - 1));
  const goNext = () =>
    setPage((prev) => (prev >= totalPages - 1 ? 0 : prev + 1));

  // 페이지별 카드 슬라이스 (빈칸 없음)
  const start = page * CARDS_PER_PAGE;
  const end = start + CARDS_PER_PAGE;
  const visibleItems = items.slice(start, end);

  return (
    <section className="w-full bg-black py-6 px-0 select-none">
      {/* 페이지 인디케이터 */}
      <div className="flex items-center justify-end w-full px-6 mb-3">
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }).map((_, i) => (
            <span
              key={i}
              className={`w-4 h-1 rounded transition-all duration-200 mr-1 ${
                i === page ? "bg-white" : "bg-gray-500"
              }`}
            />
          ))}
        </div>
      </div>
      {/* 카드 리스트 */}
      <div className="relative flex items-center px-4">
        {/* 왼쪽 화살표 */}
        <button
          onClick={goPrev}
          className="z-20 absolute left-0 bg-black/40 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center text-2xl text-white"
        >
          <FaAngleLeft />
        </button>
        <div className="w-full flex gap-6 justify-center overflow-hidden items-stretch">
          {visibleItems.map((video, idx) => (
            <div
              key={`${video.youtubeId}-${video.start_time}-${idx}`}
              className="
                group relative bg-black rounded-lg overflow-hidden cursor-pointer
                aspect-[16/9] w-[220px] min-w-[220px] max-w-[220px] flex-shrink-0 flex-grow-0
                transition-all duration-300 hover:scale-105 hover:z-20
              "
              style={{
                width: `${CARD_WIDTH}px`,
                minWidth: `${CARD_WIDTH}px`,
                maxWidth: `${CARD_WIDTH}px`,
              }}
              onClick={() => onVideoClick(video.youtubeId)}
            >
              <img
                src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                className="w-full h-full object-cover block"
                style={{ aspectRatio: "16/9" }}
                draggable={false}
                alt=""
              />
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end">
                <div className="p-4"></div>
              </div>
            </div>
          ))}
        </div>
        {/* 오른쪽 화살표 */}
        <button
          onClick={goNext}
          className="z-20 absolute right-0 bg-black/40 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center text-2xl text-white"
        >
          <FaAngleRight />
        </button>
      </div>
    </section>
  );
}
