import { useState } from 'react';

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
      const res = await fetch('/mypage/bookmarks/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token_id }),
      });
      if (!res.ok) throw new Error('북마크 추가 실패');
      setIsSuccess(true);
    } catch (e) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, isSuccess, isError, addBookmark };
} 