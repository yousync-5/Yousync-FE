import { useState, useEffect } from 'react';
import { backendApi } from '@/services/api';
import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/constants';

interface UseBookmarkResult {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  bookmarks: any[];
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
    return !!accessToken;
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

    // 액세스 토큰 확인
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.warn('액세스 토큰이 없습니다. 북마크 추가를 건너뜁니다.');
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
      // axios를 사용하여 POST 요청 보내기
      const headers = { Authorization: `Bearer ${accessToken}` };
      
      console.log('📤 북마크 추가 API 요청:', { token_id, endpoint: '/mypage/bookmarks' });
      await axios.post(`${API_ENDPOINTS.BASE_URL}/mypage/bookmarks`, { token_id }, {
        headers,
        timeout: 30000
      });
      console.log('✅ 북마크 추가 API 성공');
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

    // 액세스 토큰 확인
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.warn('액세스 토큰이 없습니다. 북마크 삭제를 건너뜁니다.');
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
      // 직접 axios를 사용하여 DELETE 요청 보내기
      const headers = { Authorization: `Bearer ${accessToken}` };
      
      await axios.delete(`${API_ENDPOINTS.BASE_URL}/mypage/bookmarks/${token_id}`, { 
        headers,
        timeout: 10000
      });
      
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
    
    // 액세스 토큰 확인
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.warn('액세스 토큰이 없습니다. 북마크 조회를 건너뜁니다.');
      return [];
    }
    
    const now = Date.now();
    if (cachedBookmarks.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
      return cachedBookmarks;
    }
    
    try {
      const headers = { Authorization: `Bearer ${accessToken}` };
      
      const response = await axios.get(`${API_ENDPOINTS.BASE_URL}/mypage/bookmarks`, {
        headers,
        timeout: 30000
      });
      
      const bookmarks = Array.isArray(response.data) ? response.data : [];
      
      // 캐시 및 로컬 스토리지 업데이트
      cachedBookmarks = bookmarks;
      lastFetchTime = now;
      setBookmarks(bookmarks);
      
      return bookmarks;
    } catch (e) {
      console.error('북마크 목록 가져오기 실패:', e);
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
    const accessToken = localStorage.getItem('access_token');
    if (isLoggedIn() && accessToken && cachedBookmarks.length === 0) {
      getBookmarks().catch(err => {
        // 에러 발생 시 조용히 실패 (UI는 계속 작동)
        console.error('초기 북마크 로드 실패:', err);
      });
    }
  }, []);

  return { 
    isLoading, 
    isSuccess, 
    isError, 
    bookmarks,
    addBookmark, 
    removeBookmark, 
    getBookmarks, 
    isBookmarked,
    isLoggedIn 
  };
}
