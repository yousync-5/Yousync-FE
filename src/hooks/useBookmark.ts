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
  isLoggedIn: () => boolean;
}

export function useBookmark(): UseBookmarkResult {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  // 로그인 상태 확인 함수
  const isLoggedIn = (): boolean => {
    if (typeof window === 'undefined') return false;
    const accessToken = localStorage.getItem('access_token');
    return !!accessToken;
  };

  const addBookmark = async (token_id: number) => {
    // 로그인 상태 확인
    if (!isLoggedIn()) {
      console.warn('로그인이 필요한 기능입니다.');
      return;
    }

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
    // 로그인 상태 확인
    if (!isLoggedIn()) {
      console.warn('로그인이 필요한 기능입니다.');
      return false;
    }

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
    // 로그인 상태 확인
    if (!isLoggedIn()) {
      console.warn('로그인이 필요한 기능입니다.');
      return [];
    }

    try {
      // 타임아웃 설정을 더 짧게 조정하여 빠른 실패 처리
      const accessToken = localStorage.getItem('access_token');
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
      
      const response = await axios.get(`${API_ENDPOINTS.BASE_URL}/mypage/bookmarks`, {
        headers,
        timeout: 5000 // 타임아웃 5초로 단축
      });
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (e) {
      console.error('북마크 목록 가져오기 실패:', e);
      return [];
    }
  };

  return { isLoading, isSuccess, isError, addBookmark, removeBookmark, getBookmarks, isLoggedIn };
} 