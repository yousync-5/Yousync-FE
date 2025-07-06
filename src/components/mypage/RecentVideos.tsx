"use client";

interface RecentVideo {
  id: number;
  title: string;
  actor: string;
  thumb: string;
  date: string;
  score: number;
}

interface RecentVideosProps {
  videos: RecentVideo[];
}

export default function RecentVideos({ videos }: RecentVideosProps) {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">최근 플레이한 영상</h2>
        <button className="text-blue-400 hover:text-blue-300 text-sm">전체보기</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {videos.map((video) => (
          <div
            key={video.id}
            className="group bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-neutral-700 transition-all duration-300 cursor-pointer"
          >
            <div className="relative aspect-video w-full overflow-hidden rounded-xl">
              <img
                src={video.thumb}
                alt={video.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button className="bg-white/20 backdrop-blur-sm rounded-full p-3 text-white">
                  ▶
                </button>
              </div>
              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded font-bold">
                {video.score}점
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-1 truncate">{video.title}</h3>
              <p className="text-gray-400 text-sm mb-2">{video.actor}</p>
              <p className="text-gray-500 text-xs">{video.date}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
} 