export interface ApiError {
  code: string;
  message: string;
  status?: number;
  details?: any;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  success: boolean;
} 