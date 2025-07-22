import { useState, useEffect } from 'react';
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
  isLoggedIn: () => boolean;
}

// 전역 캐시 변수 (컴포넌트 간 공유)
let cachedBookmarks: any[] = [];
// 북마크 데이터 로딩 중인지 여부를 추적하는 플래그
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5분 (밀리초 단위)


export function useBookmark(): UseBookmarkResult {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [bookmarks, setBookmarks] = useState<any[]>(cachedBookmarks);

  // 로그인 상태 확인 함수
  const isLoggedIn = (): boolean => {
    if (typeof window === 'undefined') return false;
    
    const accessToken = localStorage.getItem('access_token');
    const user = localStorage.getItem('google_user');
    
    // 토큰과 사용자 정보가 모두 있어야 로그인 상태로 간주
    return !!accessToken && !!user;
  };

  // 컴포넌트 마운트 시 북마크 데이터 로드 (앱 전체에서 한 번만 실행)
  useEffect(() => {
    if (cachedBookmarks.length > 0) {
      setBookmarks(cachedBookmarks);
    }
    else if (isLoggedIn() && (Date.now() - lastFetchTime > CACHE_DURATION || cachedBookmarks.length === 0)) {
      getBookmarks();
    }
    
  }, []);

  // 북마크 추가 함수 (Optimistic UI 적용)
  const addBookmark = async (token_id: number) => {
    // 로그인 상태 확인
    if (!isLoggedIn()) {
      console.warn('로그인이 필요한 기능입니다.');
      return;
    }

    // 이미 북마크된 경우 중복 요청 방지
    if (isBookmarked(token_id)) {
      return;
    }

    // 원본 상태 백업 (롤백용)
    const originalBookmarks = [...cachedBookmarks];
    
    // Optimistic UI: 즉시 로컬 상태 업데이트
    const newBookmark = { token_id };
    cachedBookmarks = [...cachedBookmarks, newBookmark];
    
    setBookmarks(cachedBookmarks);

    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    
    try {
      // 백엔드 API 직접 호출 (API 문서에 맞게 엔드포인트 수정)
      await backendApi.post('/mypage/bookmarks', { token_id });
      setIsSuccess(true);
    } catch (e) {
      console.error('북마크 추가 실패:', e);
      // 실패 시 원래 상태로 롤백
      cachedBookmarks = originalBookmarks;
      
      setBookmarks(cachedBookmarks);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 북마크 삭제 함수 (Optimistic UI 적용)
  const removeBookmark = async (token_id: number): Promise<boolean> => {
    // 로그인 상태 확인
    if (!isLoggedIn()) {
      console.warn('로그인이 필요한 기능입니다.');
      return false;
    }

    // 북마크되지 않은 경우 중복 요청 방지
    if (!isBookmarked(token_id)) {
      return true;
    }

    // 원본 상태 백업 (롤백용)
    const originalBookmarks = [...cachedBookmarks];
    
    // Optimistic UI: 즉시 로컬 상태 업데이트
    cachedBookmarks = cachedBookmarks.filter(bookmark => bookmark.token_id !== token_id);
    
    setBookmarks(cachedBookmarks);

    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    
    try {
      // backendApi 사용 (인터셉터를 통한 토큰 갱신 메커니즘 활용)
      await backendApi.delete(`/mypage/bookmarks/${token_id}`);
      
      setIsSuccess(true);
      return true;
    } catch (e) {
      console.error('북마크 삭제 실패:', e);
      // 실패 시 원래 상태로 롤백
      cachedBookmarks = originalBookmarks;
      
      setBookmarks(cachedBookmarks);
      setIsError(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 북마크 목록 가져오기 (캐싱 적용)
  const getBookmarks = async (): Promise<any[]> => {
    // 로그인 상태 확인
    if (!isLoggedIn()) {
      console.warn('로그인이 필요한 기능입니다.');
      return [];
    }
    
    const now = Date.now();
    if (cachedBookmarks.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
      return cachedBookmarks;
    }
    
    try {
      // backendApi 사용 (인터셉터를 통한 토큰 갱신 메커니즘 활용)
      const response = await backendApi.get('/mypage/bookmarks');
      
      const bookmarks = Array.isArray(response) ? response : [];
      
      // 캐시 및 로컬 스토리지 업데이트
      cachedBookmarks = bookmarks;
      lastFetchTime = now;
      setBookmarks(bookmarks);
      
      return bookmarks;
    } catch (e) {
      // 401 에러인 경우 조용히 처리
      if (axios.isAxiosError(e) && e.response?.status === 401) {
        console.warn('인증이 필요합니다. 다시 로그인해주세요.');
        // 로그인 페이지로 리다이렉트하는 로직을 추가할 수도 있음
        // 예: window.location.href = '/login';
      } else {
        console.error('북마크 목록 가져오기 실패:', e);
      }
      
      // 에러 발생 시 기존 캐시된 데이터 반환
      return cachedBookmarks;
    }
  };

  // 북마크 여부 확인 함수 (캐시된 데이터 사용)
  const isBookmarked = (token_id: number): boolean => {
    return cachedBookmarks.some(bookmark => bookmark.token_id === token_id);
  };
  // 북마크 상태 변경 감지를 위한 useEffect
  useEffect(() => {
    // 컴포넌트 마운트 시 초기 북마크 데이터 로드
    if (isLoggedIn() && cachedBookmarks.length === 0) {
      // 비동기 함수 실행
      const loadBookmarks = async () => {
        try {
          await getBookmarks();
        } catch (err) {
          // 에러 발생 시 조용히 실패 (UI는 계속 작동)
          console.warn('초기 북마크 로드 실패:', err);
        }
      };
      
      loadBookmarks();
    }
    
    // 인증 상태 변경 이벤트 리스너 추가
    const handleAuthChange = () => {
      if (!isLoggedIn()) {
        // 로그아웃 시 캐시 초기화
        cachedBookmarks = [];
        setBookmarks([]);
      } else if (cachedBookmarks.length === 0) {
        // 로그인 시 북마크 다시 로드
        getBookmarks().catch(console.warn);
      }
    };
    
    window.addEventListener('auth-change', handleAuthChange);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  return { 
    isLoading, 
    isSuccess, 
    isError, 
    addBookmark, 
    removeBookmark, 
    getBookmarks, 
    isBookmarked,
    isLoggedIn 
  };
}
