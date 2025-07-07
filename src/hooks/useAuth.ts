import { useState, useEffect, useCallback } from 'react';
import { backendApi } from '@/services/api';
import { API_ENDPOINTS } from '@/lib/constants';

interface AuthUser {
  id: number;
  email: string;
  name: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null,
  });

  // 토큰 유효성 확인
  const verifyToken = useCallback(async () => {
    const accessToken = localStorage.getItem('access_token');
    
    if (!accessToken) {
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
      });
      return;
    }

    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // 토큰 검증 API 호출
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAuthState({
          isAuthenticated: true,
          user: data.user,
          isLoading: false,
          error: null,
        });
      } else {
        // 토큰이 유효하지 않으면 로컬스토리지에서 제거
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('expires_at');
        localStorage.removeItem('google_user');
        
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: '토큰이 만료되었습니다.',
        });
      }
    } catch (error) {
      console.error('Token verification error:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: '인증 확인 중 오류가 발생했습니다.',
      });
    }
  }, []);

  // 로그아웃
  const logout = useCallback(async () => {
    try {
      // 백엔드 로그아웃 API 호출
      await backendApi.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout API error:', error);
      // API 호출 실패해도 클라이언트 측 토큰은 삭제
    } finally {
      // 클라이언트 측 토큰 삭제
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('expires_at');
      localStorage.removeItem('google_user');
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  // 컴포넌트 마운트 시 토큰 검증
  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  // localStorage 변경 감지
  useEffect(() => {
    const handleStorageChange = () => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken && authState.isAuthenticated) {
        logout();
      } else if (accessToken && !authState.isAuthenticated) {
        verifyToken();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [authState.isAuthenticated, logout, verifyToken]);

  // 토큰 갱신
  const refreshToken = useCallback(async () => {
    try {
      const response = await backendApi.post<{ access_token: string; token_type: string }>(
        API_ENDPOINTS.AUTH.REFRESH
      );
      
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
        // 토큰 갱신 후 다시 검증
        await verifyToken();
      }
      
      return response.access_token;
    } catch (error) {
      console.error('Token refresh error:', error);
      // 토큰 갱신 실패 시 로그아웃
      await logout();
      throw error;
    }
  }, [logout, verifyToken]);

  return {
    ...authState,
    verifyToken,
    logout,
    refreshToken,
  };
} 