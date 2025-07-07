import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { getAccessToken } from '@/utils/tokenUtils';
import { useQueryClient } from 'react-query';
import { useRecentVideosQuery } from '@/hooks/useRecentVideosQuery';
import RecentWatchedVideos from "@/components/RecentWatchedVideos";
import MyRecentVideos from "@/components/MyRecentVideos";

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: string;
  duration: string;
  categoryId: string;
}

interface UseRecentVideosReturn {
  videos: YouTubeVideo[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => void;
}

const CATEGORY_ID_TO_TITLE: Record<string, string> = {
  "1": "영화",
  "18": "드라마",
  "23": "코미디",
  "24": "영화",
  "30": "영화",
  "32": "액션/어드벤처",
  "34": "코미디",
  "36": "영화",
  "44": "트레일러",
  "10": "음악",
  "22": "인물/블로그",
  // ...필요한 만큼 추가
};

export function useRecentVideos(maxResults: number = 10): UseRecentVideosReturn {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchVideos = useCallback(async (pageToken?: string, append: boolean = false) => {
    const accessToken = getAccessToken();
    
    if (!accessToken) {
      setError('로그인이 필요합니다. 구글 계정으로 로그인해주세요.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        maxResults: maxResults.toString(),
      });

      if (pageToken) {
        params.append('pageToken', pageToken);
      }

      // API 클라이언트 사용 (자동으로 Authorization 헤더 추가)
      const data = await api.get<{
        videos: YouTubeVideo[];
        nextPageToken?: string;
      }>(`/api/youtube/recent-videos?${params}`);
      
      if (append) {
        setVideos(prev => [...prev, ...data.videos]);
      } else {
        setVideos(data.videos);
      }
      
      setNextPageToken(data.nextPageToken || null);
      setHasMore(!!data.nextPageToken);

    } catch (err) {
      console.error('Recent videos fetch error:', err);
      
      // 401 에러인 경우 토큰 갱신 시도
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response: { status: number } };
        if (axiosError.response?.status === 401) {
          setError('인증이 만료되었습니다. 다시 로그인해주세요.');
        } else {
          setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        }
      } else {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [maxResults]);

  const loadMore = useCallback(() => {
    if (nextPageToken && !isLoading) {
      fetchVideos(nextPageToken, true);
    }
  }, [nextPageToken, isLoading, fetchVideos]);

  const refetch = useCallback(() => {
    fetchVideos();
  }, [fetchVideos]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return {
    videos,
    isLoading,
    error,
    hasMore,
    loadMore,
    refetch,
  };
}

export function useRecentVideosLocal(): SimpleVideo[] {
  const [videos, setVideos] = useState<SimpleVideo[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = "recentVideos";
    const saved = localStorage.getItem(key);
    if (saved) {
      setVideos(JSON.parse(saved));
    }
  }, []);

  return videos;
}

export function addRecentVideoToLocalStorage(video: SimpleVideo) {
  if (typeof window === "undefined") return; // Next.js SSR 방지
  const key = "recentVideos";
  const prev = JSON.parse(localStorage.getItem(key) || "[]");
  // 중복 제거
  const filtered = prev.filter((v: SimpleVideo) => v.id !== video.id);
  const updated = [...filtered, video].slice(-4); // 최근 4개만
  localStorage.setItem(key, JSON.stringify(updated));
}

// 2. React Query 저장 함수
function addRecentVideoToQuery(video) {
  const prev = queryClient.getQueryData(['recentVideos']) || [];
  const filtered = prev.filter(v => v.id !== video.id);
  const updated = [...filtered, video].slice(-4);
  queryClient.setQueryData(['recentVideos'], updated);
}

// 3. 영상 시청 시 두 곳 모두 저장
// addRecentVideoToLocalStorage(video);
// addRecentVideoToQuery(video);
// 4. 앱 시작 시 localStorage → React Query로 동기화
// useEffect(() => {
//   const saved = JSON.parse(localStorage.getItem('recent') || '[]');
//   queryClient.setQueryData(['recentVideos'], saved);
// }, []);
// export default function MyComponent() {
//   const { data } = useQuery(['key'], fetcher);
//   // ...
// }
// {isLoggedIn && (
//   <div className="mb-8">
//     <RecentWatchedVideos 
//       onVideoClick={openModal}
//     />
//   </div>
// )}
// <MyRecentVideos /> 

export interface SimpleVideo {
  id: string;
  title: string;
  thumbnail: string;
}

function onWatch(video: SimpleVideo) {
  addRecentVideoToLocalStorage(video);
} 