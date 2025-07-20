"use client";

import { useEffect, useRef } from 'react';
import { useUser } from './useUser';

interface UseAutoLogoutOptions {
  enabled?: boolean;
  timeout?: number; // 자동 로그아웃 시간 (분)
  onLogout?: () => void;
}

export function useAutoLogout({ 
  enabled = true, 
  timeout = 30, // 30분 후 자동 로그아웃
  onLogout 
}: UseAutoLogoutOptions = {}) {
  const { logout, isLoggedIn } = useUser();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!enabled || !isLoggedIn) return;

    let isLoggingOut = false;

    // 활동 감지 함수 - useEffect 내부에서 정의
    const resetTimer = () => {
      lastActivityRef.current = Date.now();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      if (enabled && isLoggedIn && timeout > 0) {
        timeoutRef.current = setTimeout(() => {
          // 타임아웃 시 자동 로그아웃
          console.log('🔍 useAutoLogout - 30분 비활성으로 인한 자동 로그아웃');
          localStorage.removeItem('access_token');
          localStorage.removeItem('google_user');
          sessionStorage.setItem('auto_logout', 'true');
          window.dispatchEvent(new Event('auth-change'));
          if (onLogout) onLogout();
        }, timeout * 60 * 1000); // 분을 밀리초로 변환
      }
    };

    // 사용자 활동 감지
    const handleUserActivity = () => {
      resetTimer();
    };

    const handleBeforeUnload = () => {
      if (!isLoggingOut) {
        isLoggingOut = true;
        console.log('🔍 useAutoLogout - 브라우저 탭 닫기: 자동 로그아웃 실행');
        localStorage.removeItem('access_token');
        localStorage.removeItem('google_user');
        sessionStorage.setItem('auto_logout', 'true');
      }
    };

    // 초기 타이머 설정
    resetTimer();

    // 이벤트 리스너 등록
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // 사용자 활동 감지 이벤트 (30분 타이머용)
    window.addEventListener('mousedown', handleUserActivity);
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keypress', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('mousedown', handleUserActivity);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keypress', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, isLoggedIn, timeout, onLogout]);
} 