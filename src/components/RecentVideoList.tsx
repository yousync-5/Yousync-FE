import { useRecentVideosLocal } from '@/hooks/useRecentVideos';

export default function RecentVideoList() {
  const recentVideos = useRecentVideosLocal();

  return (
    <div>
      {recentVideos.length === 0
        ? <div>최근 시청한 영상이 없습니다.</div>
        : recentVideos.map(video => (
            <div key={video.id}>{video.title}</div>
          ))
      }
    </div>
  );
} 