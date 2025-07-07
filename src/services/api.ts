import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/constants';

// Next.js API 라우트용 클라이언트
const apiClient = axios.create({
  baseURL: '', // Next.js API 라우트는 상대 경로 사용
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 백엔드 API용 클라이언트
const backendClient = axios.create({
  baseURL: API_ENDPOINTS.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 인증 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    // 클라이언트 사이드에서만 토큰 추가
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 백엔드 클라이언트 요청 인터셉터
backendClient.interceptors.request.use(
  (config) => {
    // 클라이언트 사이드에서만 토큰 추가
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // 401 에러 처리 (토큰 만료 등)
    if (error.response?.status === 401) {
      console.log('인증 실패 - 토큰을 확인해주세요');
      // 필요시 로그인 페이지로 리다이렉트
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('expires_at');
        localStorage.removeItem('google_user');
      }
    }
    
    return Promise.reject(error);
  }
);

// 백엔드 클라이언트 응답 인터셉터
backendClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Backend API Error:', error);
    
    // 401 에러 처리 (토큰 만료 등)
    if (error.response?.status === 401) {
      console.log('백엔드 인증 실패 - 토큰을 확인해주세요');
      // 필요시 로그인 페이지로 리다이렉트
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('expires_at');
        localStorage.removeItem('google_user');
      }
    }
    
    return Promise.reject(error);
  }
);

// API 메서드들
export const api = {
  // GET 요청
  async get<T>(url: string) {
    const response = await apiClient.get<T>(url);
    return response.data;
  },

  // POST 요청
  async post<T>(url: string, data?: unknown) {
    const response = await apiClient.post<T>(url, data);
    return response.data;
  },

  // PUT 요청
  async put<T>(url: string, data?: unknown) {
    const response = await apiClient.put<T>(url, data);
    return response.data;
  },

  // DELETE 요청
  async delete<T>(url: string) {
    const response = await apiClient.delete<T>(url);
    return response.data;
  },

  // PATCH 요청
  async patch<T>(url: string, data?: unknown) {
    const response = await apiClient.patch<T>(url, data);
    return response.data;
  },
};

// 백엔드 API 메서드들
export const backendApi = {
  // GET 요청
  async get<T>(url: string) {
    const response = await backendClient.get<T>(url);
    return response.data;
  },

  // POST 요청
  async post<T>(url: string, data?: unknown) {
    const response = await backendClient.post<T>(url, data);
    return response.data;
  },

  // PUT 요청
  async put<T>(url: string, data?: unknown) {
    const response = await backendClient.put<T>(url, data);
    return response.data;
  },

  // DELETE 요청
  async delete<T>(url: string) {
    const response = await backendClient.delete<T>(url);
    return response.data;
  },

  // PATCH 요청
  async patch<T>(url: string, data?: unknown) {
    const response = await backendClient.patch<T>(url, data);
    return response.data;
  },
}; 