import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { extractYoutubeVideoId } from "@/utils/extractYoutubeVideoId";
import type { TokenDetailResponse } from "@/type/PitchdataType";

const fetchVideos = async () => {
  const res = await axios.get<Omit<TokenDetailResponse, "youtubeId">[]>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/tokens/`
  );
  return res.data
    .map((item) => {
      const youtubeId = extractYoutubeVideoId(item.youtube_url);
      return youtubeId ? { ...item, youtubeId } : null;
    })
    .filter(Boolean) as (TokenDetailResponse & { youtubeId: string })[];
};

export function useVideos() {
  return useQuery({
    queryKey: ["videos"],
    queryFn: fetchVideos,
  });
}
