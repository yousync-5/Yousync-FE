import { useQueryClient } from '@tanstack/react-query';

/**
 * React Query를 사용한 최근 시청 영상 임시 캐싱 훅
 * - addRecentVideo: 영상 추가 (중복 제거)
 * - getRecentVideos: 최근 영상 배열 반환
 *
 * 사용 예시:
 * const { getRecentVideos, addRecentVideo } = useRecentVideosQuery();
 * const recentVideos = getRecentVideos();
 * addRecentVideo(videoObj);
 */
export function useRecentVideosQuery() {
  const queryClient = useQueryClient();

  // 최근 시청 영상 가져오기
  const getRecentVideos = () => {
    return queryClient.getQueryData<any[]>(['recentVideos']) || [];
  };

  // 최근 시청 영상 추가
  const addRecentVideo = (video: any) => {
    const prev = getRecentVideos();
    // 중복 제거
    const filtered = prev.filter(v => v.id !== video.id);
    const updated = [...filtered, video];
    queryClient.setQueryData(['recentVideos'], updated);
    console.log('[ReactQuery] 저장된 배열:', updated);
  };

  return { getRecentVideos, addRecentVideo };
} 