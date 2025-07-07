import { useState, useCallback } from 'react';

// Google API 타입 선언 보강 (기존 Window 타입 완전 대체)
declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token: string }) => void;
          }) => { requestAccessToken: () => void };
          initCodeClient: (config: {
            client_id: string;
            scope: string;
            ux_mode: string;
            prompt?: string;
            callback: (response: { code: string }) => void;
          }) => { requestCode: () => void };
        };
      };
    };
  }
}

interface GoogleAuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null; // UNIX timestamp (ms)
  user: {
    email: string;
    name: string;
    picture: string;
  } | null;
}

export function useGoogleAuth() {
  const [auth, setAuth] = useState<GoogleAuthState>(() => {
    if (typeof window === 'undefined') return {
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      user: null,
    };
    return {
      accessToken: localStorage.getItem('access_token'),
      refreshToken: localStorage.getItem('refresh_token'),
      expiresAt: localStorage.getItem('expires_at') ? Number(localStorage.getItem('expires_at')) : null,
      user: localStorage.getItem('google_user') ? JSON.parse(localStorage.getItem('google_user')!) : null,
    };
  });

  // 구글 로그인 (Google Identity Services 사용)
  const login = useCallback(() => {
    if (typeof window === 'undefined') return;
    // Google API 스크립트 로드
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      script.onload = () => login();
      return;
    }
    // 실제 로그인
    const client = window.google.accounts.oauth2.initCodeClient({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      scope: 'openid email profile https://www.googleapis.com/auth/youtube.readonly',
      ux_mode: 'popup',
      prompt: 'consent',
      callback: async (response: { code: string }) => {
        if (response.code) {
          // code로 토큰 교환
          const params = new URLSearchParams({
            code: response.code,
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
            client_secret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET || '',
            redirect_uri: window.location.origin,
            grant_type: 'authorization_code',
          });
          const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
          });
          const tokenData = await tokenRes.json();
          if (tokenData.access_token) {
            // 유저 정보 가져오기
            const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
              headers: { Authorization: `Bearer ${tokenData.access_token}` },
            });
            const userData = await userRes.json();
            // 상태/스토리지 저장
            setAuth({
              accessToken: tokenData.access_token,
              refreshToken: tokenData.refresh_token,
              expiresAt: Date.now() + (tokenData.expires_in * 1000),
              user: userData,
            });
            localStorage.setItem('access_token', tokenData.access_token);
            if (tokenData.refresh_token) localStorage.setItem('refresh_token', tokenData.refresh_token);
            localStorage.setItem('expires_at', String(Date.now() + (tokenData.expires_in * 1000)));
            localStorage.setItem('google_user', JSON.stringify(userData));
          }
        }
      },
    });
    client.requestCode();
  }, []);

  // 토큰 갱신
  const refresh = useCallback(async () => {
    if (!auth.refreshToken) return;
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      client_secret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET || '',
      refresh_token: auth.refreshToken,
      grant_type: 'refresh_token',
    });
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data = await res.json();
    if (data.access_token) {
      setAuth((prev) => ({
        ...prev,
        accessToken: data.access_token,
        expiresAt: Date.now() + (data.expires_in * 1000),
      }));
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('expires_at', String(Date.now() + (data.expires_in * 1000)));
    }
  }, [auth.refreshToken]);

  // 로그아웃
  const logout = useCallback(() => {
    setAuth({ accessToken: null, refreshToken: null, expiresAt: null, user: null });
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('google_user');
  }, []);

  return {
    ...auth,
    login,
    refresh,
    logout,
    isLoggedIn: !!auth.accessToken,
    isExpired: auth.expiresAt ? Date.now() > auth.expiresAt : true,
  };
} 