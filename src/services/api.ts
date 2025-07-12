import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/constants';

// 타입 정의 (순환 참조 방지를 위해 여기서 직접 정의)
interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
}

// ✅ Next.js API 라우트용 클라이언트 (상대 경로)
const apiClient = axios.create({
  baseURL: '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ 백엔드 API용 클라이언트 (절대 경로)
const backendClient = axios.create({
  baseURL: API_ENDPOINTS.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ 요청 인터셉터 - 토큰 자동 추가
const attachAuthToken = (config: any) => {
  if (typeof window !== 'undefined') {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }
  return config;
};

apiClient.interceptors.request.use(attachAuthToken, Promise.reject);
backendClient.interceptors.request.use(attachAuthToken, Promise.reject);

// ✅ 응답 인터셉터 - 에러 로깅 및 401 처리
const handleResponseError = async (error: any) => {
  console.error('API Error:', error);
  
  if (error.response?.status === 401) {
    console.warn('인증 실패 - 토큰 갱신 시도');
    
    // 토큰 갱신 시도
    try {
      const accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      
      if (accessToken) {
        // 백엔드의 refresh 엔드포인트 호출
        const refreshResponse = await backendClient.post<RefreshTokenResponse>('/auth/refresh');
        
        // 새로운 토큰으로 업데이트
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', refreshResponse.data.access_token);
        }
        
        // 원래 요청에 새 토큰을 추가하여 재시도
        if (error.config && error.config.headers) {
          error.config.headers.Authorization = `Bearer ${refreshResponse.data.access_token}`;
          return backendClient.request(error.config);
        }
      }
    } catch (refreshError) {
      console.error('토큰 갱신 실패:', refreshError);
      
      // 토큰 갱신 실패 시 모든 토큰 제거
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('google_user');
        
        // 로그인 페이지로 리다이렉트 (선택사항)
        // window.location.href = '/login';
      }
    }
  }
  
  return Promise.reject(error);
};

// ✅ Next.js API 라우트용 응답 인터셉터
const handleApiClientResponseError = async (error: any) => {
  console.error('API Client Error:', error);
  
  if (error.response?.status === 401) {
    console.warn('인증 실패 - 토큰 갱신 시도');
    
    // 토큰 갱신 시도
    try {
      const accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      
      if (accessToken) {
        // 백엔드에서 토큰 갱신
        const refreshResponse = await backendClient.post<RefreshTokenResponse>('/auth/refresh');
        
        // 새로운 토큰으로 업데이트
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', refreshResponse.data.access_token);
        }
        
        // 원래 요청에 새 토큰을 추가하여 재시도
        if (error.config && error.config.headers) {
          error.config.headers.Authorization = `Bearer ${refreshResponse.data.access_token}`;
          return apiClient.request(error.config);
        }
      }
    } catch (refreshError) {
      console.error('토큰 갱신 실패:', refreshError);
      
      // 토큰 갱신 실패 시 모든 토큰 제거
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('google_user');
      }
    }
  }
  
  return Promise.reject(error);
};

apiClient.interceptors.response.use((res) => res, handleApiClientResponseError);
backendClient.interceptors.response.use((res) => res, handleResponseError);

// ✅ API 메서드 (Next.js API 라우트용)
export const api = {
  get: async <T>(url: string) => (await apiClient.get<T>(url)).data,
  post: async <T>(url: string, data?: unknown) => (await apiClient.post<T>(url, data)).data,
  put: async <T>(url: string, data?: unknown) => (await apiClient.put<T>(url, data)).data,
  delete: async <T>(url: string) => (await apiClient.delete<T>(url)).data,
  patch: async <T>(url: string, data?: unknown) => (await apiClient.patch<T>(url, data)).data,
};

// ✅ 백엔드 API 메서드
export const backendApi = {
  get: async <T>(url: string) => (await backendClient.get<T>(url)).data,
  post: async <T>(url: string, data?: unknown) => (await backendClient.post<T>(url, data)).data,
  put: async <T>(url: string, data?: unknown) => (await backendClient.put<T>(url, data)).data,
  delete: async <T>(url: string) => (await backendClient.delete<T>(url)).data,
  patch: async <T>(url: string, data?: unknown) => (await backendClient.patch<T>(url, data)).data,
};
