"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import { useRouter } from "next/navigation";
import axios from "axios";
import { authService } from "@/services/auth";
import { extractYoutubeVideoId } from "@/utils/extractYoutubeVideoId";

interface Actor {
  name: string;
  id: number;
}


interface Actor {
  "name": string;
  "id": number;
}
export const NavBar: React.FC = () => {

  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [serachedMovies, setSearchedMovies] = useState<Actor[]>([]);
  const [isSearching, setIsSearcching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [highlightIndex, setHighlightIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoggedIn(!!localStorage.getItem('access_token'));
    }
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
      setIsLoggedIn(false);
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


  const handleUrlSearch = async () => {
    if (searchQuery.startsWith('http')) {
      try {
        const res = await axios.post<{ exists: boolean }>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/urls/check`, { youtube_url: searchQuery });
        if (res.data.exists === true) {
          const videoId = extractYoutubeVideoId(searchQuery);
          router.push(`/urlsearch?videoId=${videoId}`);
        } else {
          console.log("DB에 존재하지 않는 URL입니다.");
        }
      } catch (error) {
        console.log("URL 검색 중 오류 발생");

  
      }
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (searchQuery.startsWith("http")) {
      if (e.key === "Enter") {
        handleUrlSearch();
      }
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
        setSearchQuery(selected.name);
        setShowDropdown(false);
        setHighlightIndex(-1);
        clickActor(selected.name);
      } else if (searchQuery.trim()) {
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

  const clickActor = (actor: string) => router.push(`/actor/${actor}`);


  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-gray-800 shadow-2xl">
      <div className="max-w-7xl mx-auto px-2 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent animate-pulse">YouSync</h1>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors font-medium">홈</a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors font-medium">영화</a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors font-medium">배우</a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors font-medium">결과</a>
            </div>
          </div>
          <div className="flex items-center space-x-4">

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="배우, url 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                onKeyDown={handleInputKeyDown}
              />
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700 transition"
                onClick={handleUrlSearch}
              >
                검색
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
            {isLoggedIn ? (
              <>
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
                <button className="px-6 py-2 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white rounded-full transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-105">
                  시작하기
                </button>
              </>
            )}

          
          </div>
        </div>
      </div>
    </nav>
  );
};
