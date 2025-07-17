import { useState } from 'react';
import { backendApi } from '@/services/api';

interface UseBookmarkResult {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  addBookmark: (token_id: number) => Promise<void>;
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

  return { isLoading, isSuccess, isError, addBookmark };
} 