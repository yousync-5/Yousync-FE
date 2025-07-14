
import axios from "axios";
import type { TokenDetailResponse } from "@/types/pitch";

export async function getDuetTokenDetail(tokenId: string) {
  const numericId = Number(tokenId);
  const response = await axios.get<TokenDetailResponse>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/tokens/${numericId}`
  );
  console.log("데이터 수집2")
  console.log(response.data.actor_name);
  console.log(response.data.token_name);

  const token = response.data;

  // 서버에서 바로 사용할 데이터 가공
  const captions = token.scripts?.map((script, index) => {
    const isEven = index % 2 === 0;
    return {
      id: script.id,
      movie_name: token.token_name,
      movie_id: token.id,
      actor_id: isEven ? 1 : 2,
      script: script.script,
      translation: script.translation || "",
      start_time: script.start_time,
      end_time: script.end_time,
      url: null,
      actor_pitch_values: [],
      background_audio_url: token.bgvoice_url || "",
      actor: {
        name: isEven ? token.actor_name : "Second Speaker",
        id: isEven ? 1 : 2,
      },
    };
    }) || [];
    
    const front_data = {
        id: token.id,
        user_id: 1, // 임시
        movie_id: token.id,
        score: 85, // 임시 점수
        accuracy: 88,
        fluency: 82,
        pronunciation: 90,
        created_at: new Date().toISOString(),
        user_pitch_data: Array.from({ length: 50 }, () => Math.random() * 100), // 임시 pitch
        server_pitch_data: token.pitch?.map(p => p.hz || 0) || [],
        audio_url: token.bgvoice_url || "",
        movie: {
        title: token.token_name,
        youtube_url: token.youtube_url,
        category: token.category,
        },
        captions,
    };

  return {tokenData: token, front_data};
}
