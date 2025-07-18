import { useState } from 'react';
import { backendApi } from '@/services/api';
import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/constants';

interface UseBookmarkResult {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  addBookmark: (token_id: number) => Promise<void>;
  removeBookmark: (token_id: number) => Promise<boolean>;
  getBookmarks: () => Promise<any[]>;
}

export function useBookmark(): UseBookmarkResult {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const addBookmark = async (token_id: number) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    try {
      // 백엔드 API 직접 호출 (API 문서에 맞게 엔드포인트 수정)
      await backendApi.post('/mypage/bookmarks', { token_id });
      setIsSuccess(true);
    } catch (e) {
      console.error('북마크 추가 실패:', e);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 북마크 삭제 함수
  const removeBookmark = async (token_id: number): Promise<boolean> => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    try {
      // 직접 axios를 사용하여 DELETE 요청 보내기
      const accessToken = localStorage.getItem('access_token');
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
      
      await axios.delete(`${API_ENDPOINTS.BASE_URL}/mypage/bookmarks/${token_id}`, { 
        headers,
        timeout: 10000
      });
      
      setIsSuccess(true);
      return true;
    } catch (e) {
      console.error('북마크 삭제 실패:', e);
      setIsError(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 북마크 목록 가져오기
  const getBookmarks = async (): Promise<any[]> => {
    try {
      const bookmarks = await backendApi.get('/mypage/bookmarks');
      return Array.isArray(bookmarks) ? bookmarks : [];
    } catch (e) {
      console.error('북마크 목록 가져오기 실패:', e);
      return [];
    }
  };

  return { isLoading, isSuccess, isError, addBookmark, removeBookmark, getBookmarks };
} 