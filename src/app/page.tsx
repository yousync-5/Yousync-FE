'use client';

import { useState, useEffect } from "react";
import MovieDetailModal from "@/components/modal/MovieDetailModal";
import { useVideos } from "@/hooks/useVideos";
import { useRecentVideos } from "@/hooks/useRecentVideos";
import Movie from "@/components/movie/Movie";
import type { TokenDetailResponse } from "@/types/pitch";
import { useRouter, useSearchParams } from "next/navigation";

export default function Home() {
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // useVideos: TokenDetailResponse[]
  const { data: tokens = [], isLoading, error } = useVideos();
  const router = useRouter();
  const searchParams = useSearchParams();

  // 로그인 상태 확인
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    setIsLoggedIn(!!accessToken);
    
    // 디버깅 정보
    console.log('홈페이지 로드 - 토큰 상태:', accessToken ? '있음' : '없음');
    if (accessToken) {
      console.log('토큰 길이:', accessToken.length);
      console.log('토큰 (처음 20자):', accessToken.substring(0, 20) + '...');
    }
  }, []);

  // openModal 함수를 먼저 정의
  const openModal = (youtubeId: string) => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setSelectedVideoId(youtubeId);
  };

  const closeModal = () => {
    const timeout = setTimeout(() => {
      setSelectedVideoId(null);
    }, 200);
    setHoverTimeout(timeout);
  };

  // sessionStorage에서 modalId 확인
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const modalId = sessionStorage.getItem('modalId');
      if (modalId) {
        openModal(modalId);
        sessionStorage.removeItem('modalId'); // 사용 후 제거
      }
    }
  }, []);

  // 모달 tokenData는 전체 TokenDetailResponse에서 찾음
  const selectedTokenData: TokenDetailResponse | undefined =
    selectedVideoId && tokens.length
      ? tokens.find((v) => v.youtubeId === selectedVideoId)
      : undefined;

  return (
    <div className="bg-neutral-950 text-white px-6 py-4 font-sans overflow-x-hidden min-h-full flex flex-col">
      {/* 헤더 */}
        <h1 className="text-2xl font-bold">YouSync</h1>

      {/* Videos */}
      {isLoading && <div>로딩중...</div>}
      {error && <div>에러 발생!</div>}

      {!isLoading && !error && (
        <Movie
          tokens={tokens}
          isLoading={isLoading}
          error={error}
          onOpenModal={openModal}
        />
      )}

      {/* Modal */}
      {selectedVideoId && selectedTokenData && (
        <MovieDetailModal
          youtubeId={selectedVideoId}
          isOpen={!!selectedVideoId}
          onClose={closeModal}
          tokenData={selectedTokenData}
        />
      )}
    </div>
  );
} 