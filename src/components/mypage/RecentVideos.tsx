import { RecentVideosProps } from "@/types/MypageType";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1506744038136-46273834b3fb";


export interface RecentVideo {
  id: number;
  title: string;
  thumb: string;
  date: string;
  actor: string;
  score: number;
}

export default function RecentVideos({ videos }: RecentVideosProps) {
  return (
    <section className="bg-neutral-900 text-white rounded-2xl p-8 border border-neutral-800 shadow-xl mt-8 px-4 md:px-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">최근 플레이한 영상</h2>
        <button className="text-blue-400 hover:text-blue-300 text-sm font-semibold">전체보기</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {videos.map((video) => (
          <div
            key={video.id}
            className="bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700 shadow"
          >
            <div className="relative aspect-video w-full overflow-hidden">
              <img
                src={video.thumb}
                alt={video.title}
                className="w-full h-full object-cover"
                onError={e => { e.currentTarget.src = FALLBACK_IMG; }}
              />
              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-lg font-bold">
                {video.score}점
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-1 text-white">{video.title}</h3>
              <p className="text-gray-400 text-sm mb-1">{video.actor}</p>
              <p className="text-gray-500 text-xs">{video.date}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
} 