"use client";

import TokenChecker from '@/components/auth/TokenChecker';
import AuthStatus from '@/components/auth/AuthStatus';

export default function TokenCheckPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">구글 토큰 확인</h1>
          <p className="text-gray-300">
            현재 저장된 구글 인증 토큰 정보를 확인할 수 있습니다.
          </p>
        </div>
        
        {/* 인증 상태 */}
        <AuthStatus />
        
        {/* 토큰 상세 정보 */}
        <TokenChecker />
        
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            토큰은 브라우저의 LocalStorage에 저장됩니다.
          </p>
        </div>
      </div>
    </div>
  );
} 