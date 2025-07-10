import type { ShortsGridProps } from "@/types/MypageType";
const FALLBACK_IMG = "https://images.unsplash.com/photo-1506744038136-46273834b3fb";

export interface Short {
  id: number;
  title: string;
  thumb: string;
  date: string;
  views?: number;
}

export default function ShortsGrid({ shorts }: ShortsGridProps) {
  return (
    <div className="bg-neutral-900 text-white rounded-3xl p-8 border border-neutral-800 shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">북마크</h2>
        <button className="text-blue-400 hover:text-blue-300 text-sm font-semibold">전체보기</button>
      </div>
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 justify-items-center">
        {shorts.slice(0, 4).map((short) => (
          <div
            key={short.id}
            className="bg-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center min-w-[220px] max-w-[340px] hover:scale-105 transition duration-200 border border-neutral-700"
          >
            <div className="relative w-full aspect-[16/9] bg-neutral-700">
              <img
                src={short.thumb}
                alt={short.title}
                className="w-full h-full object-cover"
                onError={e => {
                  if (e.currentTarget.src !== FALLBACK_IMG) {
                    e.currentTarget.src = FALLBACK_IMG;
                  }
                }}
                loading="lazy"
              />
              <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-lg font-bold drop-shadow-[0_1px_6px_rgba(0,255,128,0.25)]">
                {short.views?.toLocaleString()}회
              </div>
            </div>
            {/* 텍스트/정보(아래) */}
            <div className="flex-1 flex flex-col justify-between p-4 w-full">
              <h3 className="font-bold mb-2 text-white text-lg truncate drop-shadow-[0_1px_6px_rgba(0,255,128,0.15)]">{short.title}</h3>
              <p className="text-neutral-400 text-sm">{short.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}