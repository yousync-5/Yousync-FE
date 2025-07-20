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
  isBookmarked: (token_id: number) => boolean;
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
      // 이미 북마크된 토큰인지 확인
      const bookmarks = await getBookmarks();
      const alreadyBookmarked = bookmarks.some(bookmark => bookmark.token_id === token_id);
      
      if (alreadyBookmarked) {
        console.log('이미 북마크된 토큰입니다:', token_id);
        setIsSuccess(true); // 이미 북마크된 경우 성공으로 처리
        return;
      }
      
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

  // 북마크 여부 확인 함수
  const isBookmarked = (token_id: number): boolean => {
    // 현재는 간단하게 구현 (실제로는 캐시된 데이터를 사용해야 함)
    // JeonghwanY님의 원본 로직을 유지하기 위해 기본값 false 반환
    // 실제 확인은 MovieItem에서 getBookmarks로 처리
    return false;
  };

  return { isLoading, isSuccess, isError, addBookmark, removeBookmark, getBookmarks, isBookmarked };
} 