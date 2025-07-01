import React, { useState, useEffect } from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
// import { MovieList } from "@/components/MovieList";

interface SliderItem {
  id: number | string;
  youtubeId: string;
  date?: string;
  rating?: number;
}

interface SliderProps {
  items: SliderItem[];
  onCardClick?: (id: number | string) => void;
}

export default function Slider({items, onCardClick }: SliderProps) {
  // 반응형: 카드 개수 자동 조절 (모바일2, 태블릿4, 데스크탑6)
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

  useEffect(() => {
    const handleResize = () => setCardsPerPage(getCardsPerPage());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalPages = Math.ceil(items.length / cardsPerPage);

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
      <div className="flex items-center justify-between px-6 mb-3">
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
        <div className="w-full flex gap-6 justify-center overflow-hidden">
          {visibleItems.map((item) => (
            <div
              key={item.id}
              className="
                group relative bg-black rounded-lg overflow-hidden cursor-pointer 
                aspect-[16/9] min-w-[180px] max-w-[280px] w-full transition-all duration-200 
                hover:scale-105 z-0 hover:z-50
              "
              onClick={() => onCardClick?.(item.id)}
            >
              <img
                src={`https://img.youtube.com/vi/${item.youtubeId}/mqdefault.jpg`}
                className="object-cover w-full h-full pointer-events-none"
                draggable={false}
              />
              {/* hover시 오버레이+정보 */}
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end">
                <div className="p-4">
                  {item.date && (
                    <div className="text-xs text-green-400">{item.date}</div>
                  )}
                  {item.rating !== undefined && (
                    <div className="text-xs text-yellow-300">{item.rating}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
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
