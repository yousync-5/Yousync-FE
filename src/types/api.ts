// API 응답 타입들
// 에러 타입
export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// API 요청 타입들
export interface CreateTokenRequest {
  token_name: string;
  actor_name: string;
  category: string;
  youtube_url: string;
  start_time: number;
  end_time: number;
}

export interface UpdateTokenRequest extends Partial<CreateTokenRequest> {
  id: number;
} 