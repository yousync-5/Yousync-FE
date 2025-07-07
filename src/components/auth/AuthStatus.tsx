"use client";

import { useAuth } from '@/hooks/useAuth';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { API_ENDPOINTS } from '@/lib/constants';
import { api } from '@/services/api';

export default function AuthStatus() {
  const { isAuthenticated, user, isLoading, error, logout, refreshToken } = useAuth();
  const { accessToken, isLoggedIn, isExpired } = useGoogleAuth();

  if (isLoading) {
    return (
      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
          <span className="text-blue-400 text-sm">인증 상태 확인 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-red-400 text-sm">{error}</span>
          <button
            onClick={logout}
            className="text-red-300 hover:text-red-200 text-xs underline"
          >
            로그아웃
          </button>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-green-400 text-sm font-medium">
              인증됨: {user.name}
            </div>
            <div className="text-green-300 text-xs">
              {user.email}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={refreshToken}
              className="text-green-300 hover:text-green-200 text-xs underline"
            >
              토큰 갱신
            </button>
            <button
              onClick={logout}
              className="text-green-300 hover:text-green-200 text-xs underline"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
      <div className="space-y-2">
        <div className="text-yellow-400 text-sm">
          인증되지 않음
        </div>
        <div className="text-yellow-300 text-xs space-y-1">
          <div>Google 로그인: {isLoggedIn ? '✅' : '❌'}</div>
          <div>토큰 상태: {isExpired ? '❌ 만료됨' : '✅ 유효함'}</div>
          {accessToken && (
            <div>토큰 길이: {accessToken.length}자</div>
          )}
        </div>
      </div>
    </div>
  );
} 