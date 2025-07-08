"use client";
import React, { useEffect, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth";

export const NavBar: React.FC = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoggedIn(!!localStorage.getItem('access_token'));
    }
    // 로그인/로그아웃 시 localStorage 변경 감지
    const onStorage = () => setIsLoggedIn(!!localStorage.getItem('access_token'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      await authService.logout();
      setIsLoggedIn(false);
      router.push('/');
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
      // 에러가 발생해도 로컬 상태는 업데이트
      setIsLoggedIn(false);
      router.push('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-gray-800 shadow-2xl">
      <div className="max-w-7xl mx-auto px-2 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent animate-pulse">
              YouSync
            </h1>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors font-medium">홈</a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors font-medium">영화</a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors font-medium">배우</a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors font-medium">결과</a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-green-400 transition-colors">
              <MagnifyingGlassIcon className="w-6 h-6" />
            </button>
            {isLoggedIn ? (
              <button
                onClick={() => router.push('/mypage')}
                className="px-4 py-2 text-emerald-400 hover:text-white border border-emerald-400 hover:bg-emerald-500/80 rounded-full font-semibold transition-colors duration-150"
              >
                마이페이지
              </button>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 text-emerald-400 hover:text-white border border-emerald-400 hover:bg-emerald-500/80 rounded-full font-semibold transition-colors duration-150"
              >
                로그인
              </button>
            )}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-6 py-2 bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white rounded-full transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
              </button>
            ) : (
              <button className="px-6 py-2 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white rounded-full transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-105">
                시작하기
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};