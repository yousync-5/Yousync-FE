"use client";

interface Short {
  id: number;
  title: string;
  thumb: string;
  date: string;
  views: number;
}

interface ShortsGridProps {
  shorts: Short[];
}

export default function ShortsGrid({ shorts }: ShortsGridProps) {
  return (
    <div className="lg:col-span-2 bg-neutral-900 rounded-2xl p-8 border border-neutral-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">내가 만든 숏츠</h2>
        <button className="text-blue-400 hover:text-blue-300 text-sm">전체보기</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {shorts.map((short) => (
          <div
            key={short.id}
            className="group bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-neutral-700 transition-all duration-300 cursor-pointer"
          >
            {/* 썸네일 세로 비율(숏츠) */}
            <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl">
              <img
                src={short.thumb}
                alt={short.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button className="bg-white/20 backdrop-blur-sm rounded-full p-3 text-white">
                  ▶
                </button>
              </div>
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {short.views.toLocaleString()}회
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-1 truncate">{short.title}</h3>
              <p className="text-gray-400 text-sm">{short.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 