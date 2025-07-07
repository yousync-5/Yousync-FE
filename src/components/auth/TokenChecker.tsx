"use client";

import { useState } from 'react';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

export default function TokenChecker() {
  const { accessToken, refreshToken, expiresAt, user, isLoggedIn, isExpired } = useGoogleAuth();
  const [showFullToken, setShowFullToken] = useState(false);

  const formatToken = (token: string | null) => {
    if (!token) return '없음';
    if (showFullToken) return token;
    return `${token.substring(0, 20)}...`;
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return '없음';
    return new Date(timestamp).toLocaleString('ko-KR');
  };

  const isTokenExpired = () => {
    if (!expiresAt) return true;
    return Date.now() > expiresAt;
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
      <h2 className="text-xl font-semibold text-white mb-4">구글 토큰 정보</h2>
      
      <div className="space-y-4">
        {/* 로그인 상태 */}
        <div className="flex items-center gap-2">
          <span className="text-gray-300">로그인 상태:</span>
          <span className={`px-2 py-1 rounded text-sm font-medium ${
            isLoggedIn ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {isLoggedIn ? '로그인됨' : '로그인 안됨'}
          </span>
        </div>

        {/* 토큰 만료 상태 */}
        <div className="flex items-center gap-2">
          <span className="text-gray-300">토큰 상태:</span>
          <span className={`px-2 py-1 rounded text-sm font-medium ${
            isTokenExpired() ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
          }`}>
            {isTokenExpired() ? '만료됨' : '유효함'}
          </span>
        </div>

        {/* Access Token */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300">Access Token:</span>
            <button
              onClick={() => setShowFullToken(!showFullToken)}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              {showFullToken ? '축소' : '전체보기'}
            </button>
          </div>
          <div className="bg-gray-800/50 p-3 rounded text-sm font-mono break-all">
            {formatToken(accessToken)}
          </div>
          {accessToken && (
            <div className="text-xs text-gray-400 mt-1">
              길이: {accessToken.length}자
            </div>
          )}
        </div>

        {/* Refresh Token */}
        <div>
          <span className="text-gray-300 block mb-2">Refresh Token:</span>
          <div className="bg-gray-800/50 p-3 rounded text-sm font-mono break-all">
            {formatToken(refreshToken)}
          </div>
          {refreshToken && (
            <div className="text-xs text-gray-400 mt-1">
              길이: {refreshToken.length}자
            </div>
          )}
        </div>

        {/* 만료 시간 */}
        <div>
          <span className="text-gray-300 block mb-2">만료 시간:</span>
          <div className="bg-gray-800/50 p-3 rounded text-sm">
            {formatDate(expiresAt)}
          </div>
        </div>

        {/* 사용자 정보 */}
        {user && (
          <div>
            <span className="text-gray-300 block mb-2">사용자 정보:</span>
            <div className="bg-gray-800/50 p-3 rounded text-sm">
              <div>이름: {user.name}</div>
              <div>이메일: {user.email}</div>
              {user.picture && (
                <div className="mt-2">
                  <img 
                    src={user.picture} 
                    alt="프로필" 
                    className="w-8 h-8 rounded-full"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* 토큰 복사 버튼 */}
        {accessToken && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(accessToken);
              alert('Access Token이 클립보드에 복사되었습니다.');
            }}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            Access Token 복사
          </button>
        )}
      </div>
    </div>
  );
} 