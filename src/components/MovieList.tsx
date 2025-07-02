import React, { useState, useEffect } from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { VideoType } from "@/type/VideoType";

interface MovieListProps {
  videos?: VideoType[];
  onVideoClick: (youtubeId: string) => void;
  onAllPagesVisited?: () => void; 
}

export default function MovieList({
  videos,
  onVideoClick,
  onAllPagesVisited,        
}: MovieListProps) {
  const items = videos || [];

  const getCardsPerPage = () =>
    typeof window !== "undefined"
      ? window.innerWidth < 480
        ? 2
        : window.innerWidth < 1024
        ? 4
        : 6
      : 6;

  const [page, setPage] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(getCardsPerPage());
  const [visitedPages, setVisitedPages] = useState<Set<number>>(new Set());

  const totalPages = Math.ceil(items.length / cardsPerPage);

  useEffect(() => {
    const handleResize = () => setCardsPerPage(getCardsPerPage());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setVisitedPages(prev => {
      const newSet = new Set(prev);
      newSet.add(page);
      return newSet;
    });
  }, [page]);

  useEffect(() => {
    if (visitedPages.size === totalPages && totalPages > 0) {
      onAllPagesVisited?.();
    }
    // eslint-disable-next-line
  }, [visitedPages, totalPages]);

  const goPrev = () =>
    setPage((prev) => (prev <= 0 ? totalPages - 1 : prev - 1));
  const goNext = () =>
    setPage((prev) => (prev >= totalPages - 1 ? 0 : prev + 1));

  const visibleItems = items.slice(
    page * cardsPerPage,
    page * cardsPerPage + cardsPerPage
  );

  return (
    <section className="w-full bg-black py-6 px-0 select-none">
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
      <div className="relative flex items-center px-4">
        <button
          onClick={goPrev}
          className="z-10 absolute left-0 bg-black/40 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center text-2xl text-white"
        >
          <FaAngleLeft />
        </button>
        <div className="w-full flex gap-6 justify-center overflow-visible">
          {visibleItems.map((video) => {
            return (
              <div
                key={video.youtubeId}
                className={`
                  group relative bg-black rounded-lg overflow-visible cursor-pointer 
                  aspect-[16/9] min-w-[180px] max-w-[280px] w-full transition-all duration-300 
                  hover:scale-105 hover:z-20
                `}
                style={{
                  minWidth: "180px",
                  maxWidth: "280px"
                }}
                onClick={() => onVideoClick(video.youtubeId)}
              >
                <img
                  src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                  className="object-cover w-full h-full pointer-events-none"
                  draggable={false}
                  alt=""
                />
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end">
                  <div className="p-4"></div>
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={goNext}
          className="z-10 absolute right-0 bg-black/40 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center text-2xl text-white"
        >
          <FaAngleRight />
        </button>
      </div>
    </section>
  );
}
