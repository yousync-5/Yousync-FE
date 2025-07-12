//이해완료
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { extractYoutubeVideoId } from "@/utils/extractYoutubeVideoId";
import type { TokenDetailResponse, PitchItem, ServerPitch, ScriptItem } from "@/types/pitch";
import type { VideoType } from "@/types/video";
import type { Caption, CaptionState } from "@/types/caption";

const fetchVideos = async () => {
  const res = await axios.get<Omit<TokenDetailResponse, "youtubeId">[]>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/tokens/`,
    {
      timeout: 10000, // 10초 타임아웃
    }
  );
  
  console.log('API 응답 데이터:', res.data);
  
  return res.data
    .map((item) => {
      const youtubeId = extractYoutubeVideoId(item.youtube_url);
      console.log(`URL: ${item.youtube_url}, 추출된 ID: ${youtubeId}`);
      return youtubeId ? { ...item, youtubeId } : null;
    })
    .filter(Boolean) as (TokenDetailResponse & { youtubeId: string })[];
};
/**
 * 
 * @returns 비디오 객체 반환
 */
export function useVideos() {
  return useQuery({
    queryKey: ["videos"],
    queryFn: fetchVideos,
    staleTime: 5 * 60 * 1000, // 5분간 데이터를 fresh로 유지
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
    refetchOnWindowFocus: false, // 윈도우 포커스 시 재요청 비활성화
    refetchOnMount: false, // 마운트 시 재요청 비활성화 (캐시 우선)
  });
}

const fetchPopularVideos = async () => {
  const res = await axios.get<Omit<TokenDetailResponse, "youtubeId">[]>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/tokens/popular/`,
    {
      timeout: 10000, // 10초 타임아웃
    }
  );
  
  console.log('API 응답 데이터 (Popular):', res.data);
  
  return res.data
    .map((item) => {
      const youtubeId = extractYoutubeVideoId(item.youtube_url);
      console.log(`URL: ${item.youtube_url}, 추출된 ID: ${youtubeId}`);
      return youtubeId ? { ...item, youtubeId } : null;
    })
    .filter(Boolean) as (TokenDetailResponse & { youtubeId: string })[];
};

/**
 * 
 * @returns "베스트 더빙" 비디오 객체 반환
 */
export function usePopularVideos() {
  return useQuery({
    queryKey: ["videos", "popular"],
    queryFn: fetchPopularVideos,
    staleTime: 5 * 60 * 1000, // 5분간 데이터를 fresh로 유지
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
    refetchOnWindowFocus: false, // 윈도우 포커스 시 재요청 비활성화
    refetchOnMount: false, // 마운트 시 재요청 비활성화 (캐시 우선)
  });
}

const fetchLatestVideos = async () => {
  const res = await axios.get<Omit<TokenDetailResponse, "youtubeId">[]>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/tokens/latest/`,
    {
      timeout: 10000, // 10초 타임아웃
    }
  );
  
  console.log('API 응답 데이터 (Latest):', res.data);
  
  return res.data
    .map((item) => {
      const youtubeId = extractYoutubeVideoId(item.youtube_url);
      console.log(`URL: ${item.youtube_url}, 추출된 ID: ${youtubeId}`);
      return youtubeId ? { ...item, youtubeId } : null;
    })
    .filter(Boolean) as (TokenDetailResponse & { youtubeId: string })[];
};

/**
 * 
 * @returns "신상 더빙" 비디오 객체 반환
 */
export function useLatestVideos() {
  return useQuery({
    queryKey: ["videos", "latest"],
    queryFn: fetchLatestVideos,
    staleTime: 5 * 60 * 1000, // 5분간 데이터를 fresh로 유지
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
    refetchOnWindowFocus: false, // 윈도우 포커스 시 재요청 비활성화
    refetchOnMount: false, // 마운트 시 재요청 비활성화 (캐시 우선)
  });
}

const fetchRomanticVideos = async () => {
  const res = await axios.get<Omit<TokenDetailResponse, "youtubeId">[]>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/tokens/category/로맨스/`,
    {
      timeout: 10000, // 10초 타임아웃
    }
  );
  
  console.log('API 응답 데이터 (Romantic):', res.data);
  
  return res.data
    .map((item) => {
      const youtubeId = extractYoutubeVideoId(item.youtube_url);
      console.log(`URL: ${item.youtube_url}, 추출된 ID: ${youtubeId}`);
      return youtubeId ? { ...item, youtubeId } : null;
    })
    .filter(Boolean) as (TokenDetailResponse & { youtubeId: string })[];
};

/**
 * 
 * @returns "로맨틱 더빙" 비디오 객체 반환
 */
export function useRomanticVideos() {
  return useQuery({
    queryKey: ["videos", "romantic"],
    queryFn: fetchRomanticVideos,
    staleTime: 5 * 60 * 1000, // 5분간 데이터를 fresh로 유지
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
    refetchOnWindowFocus: false, // 윈도우 포커스 시 재요청 비활성화
    refetchOnMount: false, // 마운트 시 재요청 비활성화 (캐시 우선)
  });
}
