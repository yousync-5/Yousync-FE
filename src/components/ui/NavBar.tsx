"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import axios from "axios";
import { authService } from "@/services/auth";
import { extractYoutubeVideoId } from "@/utils/extractYoutubeVideoId";
import { useUser } from "@/hooks/useUser";

interface Actor {
  name: string;
  id: number;
}

interface NavBarProps {
  // animateOnMount prop 제거
}

export const NavBar: React.FC<NavBarProps> = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isLoggedIn } = useUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [serachedMovies, setSearchedMovies] = useState<Actor[]>([]);
  const [isSearching, setIsSearcching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentYoutubeUrl, setCurrentYoutubeUrl] = useState<string>("");
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // 현재 페이지에서 유튜브 URL 가져오기
  useEffect(() => {
    const getCurrentYoutubeUrl = () => {
      // /movie/[id] 페이지인 경우
      if (pathname.startsWith('/movie/')) {
        const videoId = pathname.split('/')[2];
        if (videoId) {
          return `https://www.youtube.com/watch?v=${videoId}`;
        }
      }
      
      // /dubbing/[id] 페이지인 경우 - localStorage에서 가져오기
      if (pathname.startsWith('/dubbing/')) {
        const storedUrl = localStorage.getItem('currentYoutubeUrl');
        if (storedUrl) {
          return storedUrl;
        }
        // URL 파라미터에서도 확인
        const youtubeUrl = searchParams.get('youtubeUrl');
        if (youtubeUrl) {
          return youtubeUrl;
        }
        return "";
      }
      
      // /duetdubbing/[id] 페이지인 경우 - localStorage에서 가져오기
      if (pathname.startsWith('/duetdubbing/')) {
        const storedUrl = localStorage.getItem('currentYoutubeUrl');
        if (storedUrl) {
          return storedUrl;
        }
        // URL 파라미터에서도 확인
        const youtubeUrl = searchParams.get('youtubeUrl');
        if (youtubeUrl) {
          return youtubeUrl;
        }
        return "";
      }
      
      // /urlsearch 페이지인 경우
      if (pathname.startsWith('/urlsearch')) {
        const videoId = searchParams.get('videoId');
        if (videoId) {
          return `https://www.youtube.com/watch?v=${videoId}`;
        }
      }
      
      return "";
    };

    const url = getCurrentYoutubeUrl();
    setCurrentYoutubeUrl(url);
    
    // URL이 있으면 검색창에 표시 (사용자가 직접 입력한 경우가 아닐 때만)
    if (url && !searchQuery) {
      setSearchQuery(url);
    }

    // 더빙이나 듀엣 더빙 페이지가 아닐 때 localStorage에서 유튜브 URL 정리
    if (!pathname.startsWith('/dubbing/') && !pathname.startsWith('/duetdubbing/')) {
      localStorage.removeItem('currentYoutubeUrl');
    }
  }, [pathname, searchParams, searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.scrollLeft = inputRef.current.scrollWidth;
      }
    });
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await authService.logout();
      router.push('/');
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
      router.push('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const fetchActorsData = useCallback(async () => {
    setIsSearcching(true);
    try {
      const res = await axios.get<Actor[]>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/actors/search/${searchQuery}`);
      setSearchedMovies(res.data);
      setShowDropdown(true);
    } catch (error) {
      console.error("검색 실패:", error);
    } finally {
      setIsSearcching(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery.startsWith("http")) {
      setSearchedMovies([]);
      setShowDropdown(false);
      return;
    }
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchActorsData();
      } else {
        setSearchedMovies([]);
        setShowDropdown(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchActorsData]);

  const clickActor = (actor: string) => router.push(`/actor/${actor}`);

  const handleSearchClick = async () => {
    if (searchQuery.startsWith('http')) {
      const videoId = extractYoutubeVideoId(searchQuery);
      if (videoId) {
        router.push(`/movie/${videoId}`);
      } else {
        alert('유효한 유튜브 URL이 아닙니다.');
      }
      setSearchQuery("");
    } else if (searchQuery.trim()) {
      clickActor(searchQuery);
      setSearchQuery("");
      setShowDropdown(false);
      setHighlightIndex(-1);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (searchQuery.startsWith("http")) {
      if (e.key === "Enter") handleSearchClick();
      return;
    }
    if (!showDropdown || serachedMovies.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % serachedMovies.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev - 1 + serachedMovies.length) % serachedMovies.length);
    } else if (e.key === "Enter") {
      if (highlightIndex >= 0 && highlightIndex < serachedMovies.length) {
        const selected = serachedMovies[highlightIndex];
        clickActor(selected.name);
        setSearchQuery("");
        setShowDropdown(false);
        setHighlightIndex(-1);
      } else {
        clickActor(searchQuery);
      }
    }
  };

  useEffect(() => setHighlightIndex(-1), [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToMain = () => router.push('/');

  // URL 복사 함수
  const handleCopyUrl = async () => {
    if (currentYoutubeUrl) {
      try {
        await navigator.clipboard.writeText(currentYoutubeUrl);
        setShowCopySuccess(true);
        setTimeout(() => setShowCopySuccess(false), 2000);
      } catch (err) {
        console.error('URL 복사 실패:', err);
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-gray-800 shadow-2xl">
      <div className="max-w-7xl mx-auto px-2 py-4">
        <div className="flex items-center w-full">
          {/* 왼쪽: 로고 */}
          <div className="flex-shrink-0">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent animate-pulse cursor-pointer" onClick={handleToMain}>
              YouSync
            </h1>
          </div>
          {/* 중앙: input */}
          <div className="flex-1 flex justify-center">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                placeholder={currentYoutubeUrl ? "현재 페이지의 유튜브 URL" : "배우 검색"}
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                className="w-full max-w-[36rem] pl-4 pr-20 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 overflow-x-auto whitespace-nowrap"
              />
              
              {/* 복사 버튼 - URL이 있을 때만 표시 */}
              {currentYoutubeUrl && (
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="absolute right-12 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-emerald-700/30 focus:bg-emerald-700/40 transition cursor-pointer"
                  tabIndex={0}
                  aria-label="URL 복사"
                  title="URL 복사"
                >
                  <svg className="h-5 w-5 text-emerald-400 hover:text-emerald-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              )}
              
              {/* 복사 성공 메시지 */}
              {showCopySuccess && (
                <div className="absolute right-12 top-full mt-1 px-2 py-1 bg-emerald-500 text-white text-xs rounded shadow-lg">
                  복사됨!
                </div>
              )}
              
              <button
                type="button"
                onClick={handleSearchClick}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-emerald-700/30 focus:bg-emerald-700/40 transition cursor-pointer"
                tabIndex={0}
                aria-label="검색"
              >
                <MagnifyingGlassIcon className="h-6 w-6 text-emerald-400 hover:text-emerald-500 transition" />
              </button>
              
              {showDropdown && (
                <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-400">검색 중...</div>
                  ) : (
                    serachedMovies.map((movie, idx) => (
                      <div
                        key={movie.id}
                        className={`p-3 hover:bg-gray-800 cursor-pointer ${highlightIndex === idx ? 'bg-emerald-700 text-white' : ''}`}
                        onClick={() => clickActor(movie.name)}
                        onMouseEnter={() => setHighlightIndex(idx)}
                      >
                        {movie.name}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
          {/* 오른쪽: 버튼들 */}
          <div className="flex-shrink-0 flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                {user && (
                  <div className="flex items-center space-x-3">
                    {user.picture && (
                      <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border-2 border-emerald-400/50 hover:border-emerald-400 transition-colors" />
                    )}
                    <span className="text-emerald-300 font-medium hidden sm:block">{user.name}</span>
                  </div>
                )}
                <button
                  onClick={() => router.push('/mypage')}
                  className="px-4 py-2 text-emerald-400 hover:text-white border border-emerald-400 hover:bg-emerald-500/80 rounded-full font-semibold transition-colors duration-150"
                >
                  마이페이지
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="px-6 py-2 bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white rounded-full transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push('/login')}
                  className="px-4 py-2 text-emerald-400 hover:text-white border border-emerald-400 hover:bg-emerald-500/80 rounded-full font-semibold transition-colors duration-150"
                >
                  로그인
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};