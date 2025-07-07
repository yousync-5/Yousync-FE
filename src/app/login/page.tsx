"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GoogleLogin from '@/components/auth/GoogleLogin';
import { FaYoutube, FaSync } from 'react-icons/fa';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // 이미 로그인된 경우 홈으로 리다이렉트
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      router.push('/');
    }
  }, [router]);

  const handleLoginSuccess = (token: string) => {
    console.log('로그인 성공! 토큰:', token.substring(0, 20) + '...');
    console.log('저장된 토큰 확인:', localStorage.getItem('access_token') ? '있음' : '없음');
    
    setIsLoading(true);
    // 로그인 성공 후 홈페이지로 이동
    setTimeout(() => {
      router.push('/');
    }, 1000);
  };

  const handleLoginError = (error: string) => {
    console.error('로그인 에러:', error);
    alert(`로그인 실패: ${error}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* 로고 및 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaYoutube className="text-6xl text-red-500" />
            <FaSync className="text-4xl text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">YouSync</h1>
          <p className="text-gray-300 text-lg">YouTube 동기화 서비스</p>
        </div>

        {/* 로그인 카드 */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-white mb-2">
              로그인
            </h2>
            <p className="text-gray-300">
              최근 시청한 YouTube 영상을 확인하려면<br />
              Google 계정으로 로그인해주세요.
            </p>
          </div>

          {/* 구글 로그인 버튼 */}
          <div className="mb-6">
            <GoogleLogin 
              onSuccess={handleLoginSuccess}
              onError={handleLoginError}
            />
          </div>

          {/* 로딩 상태 */}
          {isLoading && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-blue-400 text-sm">로그인 중...</p>
            </div>
          )}

          {/* 정보 */}
          <div className="text-center text-sm text-gray-400 mt-6">
            <p>로그인하면 다음 기능을 사용할 수 있습니다:</p>
            <ul className="mt-2 space-y-1">
              <li>• 최근 시청한 YouTube 영상 확인</li>
              <li>• 개인화된 영상 추천</li>
              <li>• 시청 기록 관리</li>
            </ul>
          </div>
        </div>

        {/* 푸터 */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            로그인하지 않고도 기본 기능을 사용할 수 있습니다.
          </p>
          <button
            onClick={() => router.push('/')}
            className="text-blue-400 hover:text-blue-300 text-sm mt-2 underline"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
} 