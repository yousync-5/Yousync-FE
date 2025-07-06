import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/constants';

// API 클라이언트 설정
const apiClient = axios.create({
  baseURL: API_ENDPOINTS.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
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