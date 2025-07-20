import { useState, useEffect } from 'react';
import { useUser } from './useUser';
import { getUserData, setUserData, USER_STORAGE_KEYS } from '@/utils/userStorage';

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

export function useLocalBookmark(): UseLocalBookmarkResult {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  
  // 사용자 정보 가져오기
  const { isLoggedIn, user } = useUser();

  // 로컬스토리지에서 북마크 로드 (회원별)
  const loadBookmarks = () => {
    try {
      if (typeof window !== 'undefined') {
        const storedBookmarks = getUserData<BookmarkItem[]>(USER_STORAGE_KEYS.BOOKMARKS, user?.id);
        console.log('🔍 useLocalBookmark - 회원별 북마크 로드:', {
          userId: user?.id,
          isLoggedIn,
          storedBookmarks
        });
        
        if (storedBookmarks) {
          setBookmarks(Array.isArray(storedBookmarks) ? storedBookmarks : []);
          console.log('✅ useLocalBookmark - 회원별 북마크 로드 완료:', storedBookmarks);
        } else {
          console.log('📝 useLocalBookmark - 저장된 북마크 없음');
          setBookmarks([]);
        }
      }
    } catch (error) {
      console.error('❌ useLocalBookmark - 회원별 북마크 로드 실패:', error);
      setBookmarks([]);
    }
  };

  // 사용자 변경 시 북마크 다시 로드
  useEffect(() => {
    loadBookmarks();
  }, [user?.id, isLoggedIn]);

  // 북마크 데이터 변경 시 이벤트 발생
  useEffect(() => {
    console.log('📢 회원별 북마크 데이터 변경 이벤트 발생', { 
      userId: user?.id,
      count: bookmarks.length 
    });
    window.dispatchEvent(new CustomEvent('bookmarks-updated', { 
      detail: { 
        userId: user?.id,
        count: bookmarks.length 
      } 
    }));
  }, [bookmarks, user?.id]);

  // 북마크 추가 (회원별)
  const addBookmark = async (token_id: number, token_name: string, actor_name: string, category: string, youtube_url?: string) => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);

    console.log('📝 useLocalBookmark - 회원별 북마크 추가 시도:', {
      userId: user?.id,
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
      
      // 회원별 로컬스토리지에 저장
      const success = setUserData(USER_STORAGE_KEYS.BOOKMARKS, updatedBookmarks, user?.id);
      if (success) {
        setBookmarks(updatedBookmarks);
        console.log('✅ useLocalBookmark - 회원별 북마크 추가 완료:', {
          userId: user?.id,
          newBookmark,
          updatedBookmarks
        });
        setIsSuccess(true);
        console.log(`✅ 회원별 북마크 추가 완료 - ${token_name} (ID: ${token_id}, User: ${user?.id || 'guest'})`);
      } else {
        throw new Error('북마크 저장 실패');
      }
    } catch (error) {
      console.error('❌ useLocalBookmark - 회원별 북마크 추가 실패:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 북마크 제거 (회원별)
  const removeBookmark = async (token_id: number): Promise<boolean> => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);

    try {
      const updatedBookmarks = bookmarks.filter(bookmark => bookmark.token_id !== token_id);
      
      // 회원별 로컬스토리지에 저장
      const success = setUserData(USER_STORAGE_KEYS.BOOKMARKS, updatedBookmarks, user?.id);
      if (success) {
        setBookmarks(updatedBookmarks);
        setIsSuccess(true);
        console.log(`🗑️ 회원별 북마크 제거 완료 - (ID: ${token_id}, User: ${user?.id || 'guest'})`);
        return true;
      } else {
        throw new Error('북마크 삭제 실패');
      }
    } catch (error) {
      console.error('회원별 북마크 제거 실패:', error);
      setIsError(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 북마크 목록 가져오기 (회원별)
  const getBookmarks = (): BookmarkItem[] => {
    return bookmarks;
  };

  // 특정 토큰이 북마크되었는지 확인 (회원별)
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