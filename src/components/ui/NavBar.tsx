"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import axios from "axios";
import { authService } from "@/services/auth";
import { extractYoutubeVideoId } from "@/utils/extractYoutubeVideoId";
import { useUser } from "@/hooks/useUser";

interface Actor {
  name: string;
  id: number;
}

interface NavBarProps {
  animateOnMount?: boolean;
}

export const NavBar: React.FC<NavBarProps> = ({ animateOnMount }) => {
  const router = useRouter();
  const { user, isLoggedIn } = useUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [serachedMovies, setSearchedMovies] = useState<Actor[]>([]);
  const [isSearching, setIsSearcching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-gray-800 shadow-2xl">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-4">
        <div className="flex items-center justify-between w-full">
          {/* 왼쪽: 로고 */}
          <div className="flex-shrink-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent animate-pulse cursor-pointer" onClick={handleToMain}>
              YouSync
            </h1>
          </div>
          
          {/* 중앙: 검색창 */}
          <div className="flex-1 max-w-xs sm:max-w-sm lg:max-w-md mx-4 sm:mx-6 lg:mx-8">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="배우 검색"
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                className="w-full pl-8 sm:pl-10 pr-10 sm:pr-12 py-1.5 sm:py-2 text-sm sm:text-base bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-left placeholder:text-center"
              />
              <button
                type="button"
                onClick={handleSearchClick}
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-emerald-700/30 focus:bg-emerald-700/40 transition cursor-pointer"
                tabIndex={0}
                aria-label="검색"
              >
                <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-emerald-400 hover:text-emerald-500 transition" />
              </button>
              {showDropdown && (
                <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
                  {isSearching ? (
                    <div className="p-3 sm:p-4 text-center text-gray-400 text-sm sm:text-base">검색 중...</div>
                  ) : (
                    serachedMovies.map((movie, idx) => (
                      <div
                        key={movie.id}
                        className={`p-2 sm:p-3 hover:bg-gray-800 cursor-pointer text-sm sm:text-base text-white ${highlightIndex === idx ? 'bg-emerald-700 text-white' : ''}`}
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
          <div className="flex-shrink-0 flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
            {isLoggedIn ? (
              <>
                {user && (
                  <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
                    {user.picture && (
                      <img 
                        src={user.picture} 
                        alt={user.name} 
                        className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full border-2 border-emerald-400/50 hover:border-emerald-400 transition-colors" 
                      />
                    )}
                    <span className="text-emerald-300 font-medium text-xs sm:text-sm lg:text-base hidden md:block truncate max-w-20 lg:max-w-none">
                      {user.name}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => router.push('/mypage')}
                  className="px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 text-xs sm:text-sm lg:text-base text-emerald-400 hover:text-white border border-emerald-400 hover:bg-emerald-500/80 rounded-full font-semibold transition-colors duration-150"
                >
                  <span className="hidden sm:inline">마이페이지</span>
                  <span className="sm:hidden">마이</span>
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="px-2 py-1 sm:px-4 sm:py-1.5 lg:px-6 lg:py-2 text-xs sm:text-sm lg:text-base bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white rounded-full transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <>
                      <span className="hidden sm:inline">로그아웃 중...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">로그아웃</span>
                      <span className="sm:hidden">OUT</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 text-xs sm:text-sm lg:text-base text-emerald-400 hover:text-white border border-emerald-400 hover:bg-emerald-500/80 rounded-full font-semibold transition-colors duration-150"
              >
                로그인
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};