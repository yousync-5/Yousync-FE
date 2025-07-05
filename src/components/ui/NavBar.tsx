"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { FiSearch } from "react-icons/fi";

export const NavBar: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("인기 영상");
  const [search, setSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleProfileClick = () => router.push("/mypage");
  const handleLogoClick = () => router.push("/");

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
     <header className="fixed top-0 left-0 w-full bg-neutral-950 z-50 py-3 shadow-2xl shadow-black/60">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div onClick={handleLogoClick} className="cursor-pointer text-left">
            <h1 className="text-red-600 text-xl font-extrabold">YOUSYNC</h1>
            <p className="text-xs text-white tracking-wider">SLOGAN HERE</p>
          </div>

          <div className="mx-10 w-full max-w-xl">
            <div className="flex items-center px-4 py-2 rounded-full border border-white bg-transparent">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Actor검색 또는 YoutubeURL을 입력해 주세요"
                className="flex-1 bg-transparent text-white placeholder-gray-400 text-sm focus:outline-none"
              />
              <FiSearch className="text-white text-lg" />
            </div>
          </div>

          <div className="flex items-center space-x-6 relative">
            <nav className="flex items-center space-x-4 text-sm text-white">
              <button
                onClick={() => setActiveTab("인기 배우")}
                className={`${activeTab === "인기 배우" ? "text-red-500" : ""} hover:underline`}
              >
                인기 배우
              </button>
              <button
                onClick={() => setActiveTab("인기 영상")}
                className={`${activeTab === "인기 영상" ? "text-red-500" : ""} hover:underline`}
              >
                인기 영상
              </button>
              <div
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <button
                  className={`${activeTab === "더보기" ? "text-red-500" : ""} hover:underline`}
                >
                  더보기 ▾
                </button>
              </div>
            </nav>

            <div
              onClick={handleProfileClick}
              className="cursor-pointer transition-transform duration-200 hover:scale-110 hover:opacity-90"
            >
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white">
                <Image
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSH2OhGS1FmftYMFPrLoBs4tYq_RudCwMjFJul37rVJsE-apHzj50DWZVrDZmOBGgtwAew&usqp=CAU"
                  alt="프로필 이미지"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div
        ref={dropdownRef}
        onMouseEnter={() => setIsDropdownOpen(true)}
        onMouseLeave={() => setIsDropdownOpen(false)}
        className={`fixed top-16 left-0 w-full z-40 transform transition-all duration-500 ease-in-out ${
          isDropdownOpen
            ? "opacity-100 scale-100 visible"
            : "opacity-0 scale-95 invisible pointer-events-none"
        }`}
      >
        <div className="bg-neutral-900 border border-neutral-700 shadow-2xl w-full px-10 py-8">
          <div className="grid grid-cols-3 gap-8 text-sm text-white max-w-7xl mx-auto">
            <div>
              <h3 className="font-bold text-white mb-2">국적</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="cursor-pointer hover:text-red-500">한국 배우</li>
                <li className="cursor-pointer hover:text-red-500">미국 배우</li>
                <li className="cursor-pointer hover:text-red-500">일본 배우</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">성별</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="cursor-pointer hover:text-red-500">남자 배우</li>
                <li className="cursor-pointer hover:text-red-500">여자 배우</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">카테고리</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="cursor-pointer hover:text-red-500">코미디</li>
                <li className="cursor-pointer hover:text-red-500">액션</li>
                <li className="cursor-pointer hover:text-red-500">로맨스</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};