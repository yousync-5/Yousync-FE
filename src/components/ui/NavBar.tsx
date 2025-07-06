"use client";
import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export const NavBar: React.FC = () => {
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
              <span className="text-xl walking-cat">🐱</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-green-400 transition-colors">
              <MagnifyingGlassIcon className="w-6 h-6" />
            </button>
            <button className="px-4 py-2 text-gray-400 hover:text-emerald-400 transition-colors font-medium">
              로그인
            </button>
            <button className="px-6 py-2 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white rounded-full transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-105">
              시작하기
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};