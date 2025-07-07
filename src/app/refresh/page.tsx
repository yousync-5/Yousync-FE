"use client";

import { useState } from "react";
import { useAuth } from '@/hooks/useAuth';

export default function RefreshTokenPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user, logout, refreshToken } = useAuth();

  const handleRefresh = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      await refreshToken();
      setResult("토큰이 성공적으로 갱신되었습니다!");
    } catch (e) {
      setError("알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-4">JWT 액세스 토큰 갱신</h1>
        <p className="text-gray-300 mb-6">기존 토큰이 유효한 상태에서 새로운 토큰을 발급받을 수 있습니다.<br/>토큰 만료 전에 미리 갱신하는 용도로 사용하세요.</p>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors mb-4 disabled:opacity-50"
        >
          {loading ? "갱신 중..." : "토큰 갱신하기"}
        </button>
        {result && <div className="text-green-400 text-center mb-2">{result}</div>}
        {error && <div className="text-red-400 text-center mb-2">{error}</div>}
      </div>
    </div>
  );
} 