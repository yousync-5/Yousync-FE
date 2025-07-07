import { useState, useEffect, useCallback } from "react";
import { extractYoutubeVideoId } from "@/utils/extractYoutubeVideoId";

// YouTube 카테고리 ID 정의
const MOVIE_CATEGORIES = new Set([
  "30", // 영화
  "18", // 드라마  
  "36", // 영화
  "1",  // 영화
  "24", // 영화
  "10", // 음악
  "22", // 인물/블로그
  "23", // 코미디
  "32", // 액션/어드벤처
  "34", // 코미디
  "44"  // 트레일러
]);

interface YouTubeVideoInfo {
  id: string;
  title: string;
  categoryId: string;
  categoryTitle: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: string;
  duration: string;
}

interface UseMainVideoReturn {
  videoId: string | null;
  videoInfo: YouTubeVideoInfo | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// 캐시를 위한 Map
const videoCache = new Map<string, YouTubeVideoInfo>();

async function fetchVideoInfo(id: string): Promise<YouTubeVideoInfo | null> {
  const apiKey = process.env.NEXT_PUBLIC_YT_API_KEY;
  if (!apiKey) {
    console.error("YouTube API 키가 설정되지 않았습니다.");
    throw new Error("YouTube API 키가 설정되지 않았습니다.");
  }

  try {
    // 캐시 확인
    if (videoCache.has(id)) {
      console.log(`캐시된 비디오 정보 사용: ${id}`);
      return videoCache.get(id) || null;
    }

    console.log(`YouTube API 요청 시작: ${id}`);
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${id}&key=${apiKey}`;
    
    const res = await fetch(url);
    console.log(`YouTube API 응답 상태: ${res.status}`);
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: '응답 파싱 실패' }));
      console.error('YouTube API Error:', errorData);
      
      if (res.status === 403) {
        throw new Error("YouTube API 접근 권한이 없습니다. YouTube Data API v3가 활성화되어 있는지 확인해주세요.");
      }
      
      if (res.status === 400) {
        throw new Error("잘못된 요청입니다. 비디오 ID를 확인해주세요.");
      }
      
      throw new Error(`YouTube API 요청 실패: ${res.status} - ${errorData.error?.message || '알 수 없는 오류'}`);
    }
    
    const data = await res.json();
    console.log('YouTube API 응답 데이터:', data);
    
    if (!data.items || data.items.length === 0) {
      throw new Error("영상을 찾을 수 없습니다.");
    }

    const item = data.items[0];
    const videoInfo: YouTubeVideoInfo = {
      id: item.id,
      title: item.snippet.title,
      categoryId: item.snippet.categoryId,
      categoryTitle: item.snippet.categoryId, // 실제로는 카테고리 이름을 가져와야 함
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || "",
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      viewCount: item.statistics?.viewCount || "0",
      duration: item.contentDetails?.duration || ""
    };

    // 캐시에 저장
    videoCache.set(id, videoInfo);
    console.log(`비디오 정보 캐시에 저장: ${id}`);
    
    return videoInfo;
  } catch (error) {
    console.error("YouTube API 에러:", error);
    throw error;
  }
}

async function isMovieCategory(id: string): Promise<boolean> {
  const videoInfo = await fetchVideoInfo(id);
  if (!videoInfo) return false;
  
  return MOVIE_CATEGORIES.has(videoInfo.categoryId);
}

export default function useMainVideo(): UseMainVideoReturn {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<YouTubeVideoInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAndValidateVideo = useCallback(async (candidateId: string) => {
    if (!candidateId) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log(`비디오 검증 시작: ${candidateId}`);
      
      // 1. 영상 정보 가져오기
      const info = await fetchVideoInfo(candidateId);
      if (!info) {
        setError("영상 정보를 가져올 수 없습니다.");
        return;
      }

      // 2. 카테고리 확인
      const isValidCategory = MOVIE_CATEGORIES.has(info.categoryId);
      console.log(`카테고리 확인: ${info.categoryId} - ${isValidCategory ? '유효' : '무효'}`);
      
      if (!isValidCategory) {
        setError("지원하지 않는 카테고리의 영상입니다.");
        return;
      }

      // 3. 성공 시 상태 업데이트
      setVideoId(candidateId);
      setVideoInfo(info);
      console.log(`비디오 검증 완료: ${candidateId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      console.error('비디오 검증 실패:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    if (typeof window === "undefined") return;

    // 1. 쿼리 파라미터에서 video ID 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const queryVideoId = urlParams.get("video");
    
    // 2. referrer에서 video ID 추출
    const referrerVideoId = extractYoutubeVideoId(document.referrer);
    
    // 3. 우선순위: 쿼리 파라미터 > referrer
    const candidateId = queryVideoId || referrerVideoId;
    
    console.log('비디오 ID 후보:', { queryVideoId, referrerVideoId, candidateId });
    
    if (candidateId) {
      fetchAndValidateVideo(candidateId);
    }
  }, [fetchAndValidateVideo]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    videoId,
    videoInfo,
    isLoading,
    error,
    refetch
  };
}