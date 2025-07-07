"use client";

import { useState } from 'react';
import { FaGoogle } from 'react-icons/fa';
import { setAccessToken, diagnoseToken } from '@/utils/tokenUtils';

// Google API 타입 정의
declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token: string }) => void;
            prompt?: string;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

interface GoogleLoginProps {
  onSuccess?: (token: string) => void;
  onError?: (error: string) => void;
}

export default function GoogleLogin({ onSuccess, onError }: GoogleLoginProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    try {
      // Google API 스크립트 로드
      if (typeof window !== 'undefined' && !window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Google 로그인 실행
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        scope: 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        prompt: 'consent', // 항상 동의 화면 표시
        callback: async (response: { access_token: string }) => {
          if (response.access_token) {
            try {
              console.log('구글에서 받은 토큰:', response.access_token.substring(0, 20) + '...');
              
              // 토큰 저장 (1시간 만료)
              setAccessToken(response.access_token, 3600);
              
              // 토큰 진단
              const diagnosis = await diagnoseToken(response.access_token);
              
              if (diagnosis.isValid) {
                console.log('토큰이 유효합니다!');
                console.log('사용자 정보:', diagnosis.userInfo);
                onSuccess?.(response.access_token);
              } else {
                console.error('토큰 진단 실패:', diagnosis);
                throw new Error(diagnosis.error || '토큰이 유효하지 않습니다.');
              }
            } catch (error) {
              console.error('로그인 처리 중 오류:', error);
              onError?.(error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.');
            }
          }
          setIsLoading(false);
        },
      });

      client.requestAccessToken();
    } catch (error) {
      setIsLoading(false);
      console.error('Google 로그인 초기화 오류:', error);
      onError?.(error instanceof Error ? error.message : 'Google 로그인 초기화 실패');
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="flex items-center justify-center gap-3 w-full px-6 py-3 bg-white text-gray-800 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-800"></div>
      ) : (
        <FaGoogle className="text-xl text-red-500" />
      )}
      <span className="font-medium">
        {isLoading ? '로그인 중...' : 'Google로 로그인'}
      </span>
    </button>
  );
} 