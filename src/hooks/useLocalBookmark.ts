import { useState, useEffect } from 'react';

interface BookmarkItem {
  id: number;
  token_id: number;
  token_name: string;
  actor_name: string;
  category: string;
  youtube_url?: string;
  created_at: string;
}

interface UseLocalBookmarkResult {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  bookmarks: BookmarkItem[];
  addBookmark: (token_id: number, token_name: string, actor_name: string, category: string, youtube_url?: string) => Promise<void>;
  removeBookmark: (token_id: number) => Promise<boolean>;
  getBookmarks: () => BookmarkItem[];
  isBookmarked: (token_id: number) => boolean;
}

const BOOKMARK_STORAGE_KEY = 'yousync_bookmarks';

export function useLocalBookmark(): UseLocalBookmarkResult {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  // 로컬스토리지에서 북마크 로드
  const loadBookmarks = () => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(BOOKMARK_STORAGE_KEY);
        console.log('🔍 useLocalBookmark - 로컬스토리지에서 로드:', {
          stored: stored,
          parsed: stored ? JSON.parse(stored) : null
        });
        
        if (stored) {
          const parsed = JSON.parse(stored);
          setBookmarks(Array.isArray(parsed) ? parsed : []);
          console.log('✅ useLocalBookmark - 북마크 로드 완료:', Array.isArray(parsed) ? parsed : []);
        } else {
          console.log('📝 useLocalBookmark - 저장된 북마크 없음');
        }
      }
    } catch (error) {
      console.error('❌ useLocalBookmark - 북마크 로드 실패:', error);
      setBookmarks([]);
    }
  };

  // 컴포넌트 마운트 시 북마크 로드
  useEffect(() => {
    loadBookmarks();
  }, []);

  // 북마크 데이터 변경 시 이벤트 발생
  useEffect(() => {
    console.log('📢 북마크 데이터 변경 이벤트 발생', { count: bookmarks.length });
    window.dispatchEvent(new CustomEvent('bookmarks-updated', { 
      detail: { count: bookmarks.length } 
    }));
  }, [bookmarks]);

  // 북마크 추가
  const addBookmark = async (token_id: number, token_name: string, actor_name: string, category: string, youtube_url?: string) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);

    console.log('📝 useLocalBookmark - 북마크 추가 시도:', {
      token_id,
      token_name,
      actor_name,
      category,
      currentBookmarks: bookmarks
    });

    try {
      const newBookmark: BookmarkItem = {
        id: Date.now(), // 고유 ID 생성
        token_id,
        token_name,
        actor_name,
        category,
        youtube_url,
        created_at: new Date().toISOString()
      };

      const updatedBookmarks = [...bookmarks, newBookmark];
      
      // 로컬스토리지에 저장
      localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(updatedBookmarks));
      setBookmarks(updatedBookmarks);
      
      console.log('✅ useLocalBookmark - 북마크 추가 완료:', {
        newBookmark,
        updatedBookmarks,
        localStorageData: localStorage.getItem(BOOKMARK_STORAGE_KEY)
      });
      
      setIsSuccess(true);
      console.log(`✅ 북마크 추가 완료 - ${token_name} (ID: ${token_id})`);
    } catch (error) {
      console.error('❌ useLocalBookmark - 북마크 추가 실패:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 북마크 제거
  const removeBookmark = async (token_id: number): Promise<boolean> => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);

    try {
      const updatedBookmarks = bookmarks.filter(bookmark => bookmark.token_id !== token_id);
      
      // 로컬스토리지에 저장
      localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(updatedBookmarks));
      setBookmarks(updatedBookmarks);
      
      setIsSuccess(true);
      console.log(`🗑️ 북마크 제거 완료 - (ID: ${token_id})`);
      return true;
    } catch (error) {
      console.error('북마크 제거 실패:', error);
      setIsError(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 북마크 목록 가져오기
  const getBookmarks = (): BookmarkItem[] => {
    return bookmarks;
  };

  // 특정 토큰이 북마크되었는지 확인
  const isBookmarked = (token_id: number): boolean => {
    return bookmarks.some(bookmark => bookmark.token_id === token_id);
  };

  return { 
    isLoading, 
    isSuccess, 
    isError, 
    bookmarks, 
    addBookmark, 
    removeBookmark, 
    getBookmarks, 
    isBookmarked 
  };
} 