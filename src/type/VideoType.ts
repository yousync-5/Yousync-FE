export interface VideoType {
  videoId: number;
  youtubeId: string;
  actor_name?: string;
  category?: string;
  start_time?: number;
  end_time?: number;
  thumbnail_url?: string;
  // 필요한 만큼 필드를 더 추가!
}
