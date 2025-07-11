import { backendApi } from './api';

export interface LogoutResponse {
  message: string;
}

export const authService = {
  // 로그아웃
  async logout(): Promise<LogoutResponse> {
    try {
      const response = await backendApi.post<LogoutResponse>('/auth/logout/');
      
      // 클라이언트 측에서도 토큰 제거
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('expires_at');
        localStorage.removeItem('google_user');
      }
      
      return response;
    } catch (error) {
      console.error('로그아웃 실패:', error);
      
      // 에러가 발생해도 클라이언트 측 토큰은 제거
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('expires_at');
        localStorage.removeItem('google_user');
      }
      
      throw error;
    }
  },
}; 