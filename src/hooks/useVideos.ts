import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { extractYoutubeVideoId } from "@/utils/extractYoutubeVideoId";
import type { TokenDetailResponse, PitchItem, ServerPitch, ScriptItem } from "@/types/pitch";
import type { VideoType } from "@/types/video";
import type { Caption, CaptionState } from "@/types/caption";

const fetchVideos = async () => {
  const res = await axios.get<Omit<TokenDetailResponse, "youtubeId">[]>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/tokens/`
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
  });
}
