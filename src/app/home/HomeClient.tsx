'use client';

import { useState, useEffect, useCallback } from "react";
import MovieDetailModal from "@/components/modal/MovieDetailModal";
import { useVideos, usePopularVideos, useLatestVideos, useRomanticVideos, useDuetScenes } from "@/hooks/useVideos";
import Movie from "@/components/movie/Movie";
import type { TokenDetailResponse } from "@/types/pitch";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function HomeClient() {
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const { data: tokens = [], isLoading, error } = useVideos();
  const { data: popularTokens = [] } = usePopularVideos();
  const { data: latestTokens = [] } = useLatestVideos();
  const { data: romanticTokens = [] } = useRomanticVideos();
  const { data: duetScenes = [], isLoading: duetScenesLoading, error: duetScenesError } = useDuetScenes();
  const router = useRouter();
  const searchParams = useSearchParams();

  const openModal = useCallback((youtubeId: string) => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setSelectedVideoId(youtubeId);
  }, [hoverTimeout]);

  const closeModal = () => {
    const timeout = setTimeout(() => {
      setSelectedVideoId(null);
    }, 200);
    setHoverTimeout(timeout);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (tokens.length === 0) return;
    
    // searchParams가 있을 때만 실행
    if (typeof window !== 'undefined' && searchParams) {
      const modalId = searchParams.get('modalId');
      if (modalId) {
        setTimeout(() => {
          openModal(modalId);
          router.replace('/home');
        }, 500);
      }
    }
  }, [searchParams, router, tokens.length, openModal]);

  const videos = tokens.map(({ id, youtubeId, actor_name }) => ({
    videoId: id,
    youtubeId,
    actor_name,
  }));

  const selectedTokenData: TokenDetailResponse | undefined =
    selectedVideoId && tokens.length
      ? tokens.find((v) => v.youtubeId === selectedVideoId)
      : undefined;

  return (
    <div className="bg-neutral-950 text-white px-6 py-4 font-sans min-h-full flex flex-col">
      {isLoading && tokens.length === 0 && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin w-8 h-8 border-3 border-green-400 border-t-transparent rounded-full" />
            <span className="text-white text-lg">영화 목록을 불러오는 중...</span>
          </div>
        </div>
      )}
      {error && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-red-500 text-lg">에러 발생: {error.toString()}</div>
        </div>
      )}
      {!isLoading && !error && (
        <Movie
          tokens={tokens}
          popularTokens={popularTokens}
          latestTokens={latestTokens}
          romanticTokens={romanticTokens}
          isLoading={isLoading}
          error={error}
          duetScenes={duetScenes}
          duetScenesLoading={duetScenesLoading}
          duetScenesError={duetScenesError}
          onOpenModal={openModal}
        />
      )}
      {selectedVideoId && selectedTokenData && (
        <MovieDetailModal
          youtubeId={selectedVideoId}
          isOpen={!!selectedVideoId}
          onClose={closeModal}
          tokenData={selectedTokenData}
        />
      )}

      {/* 우측 하단 + 버튼 */}
      <div 
        className="fixed z-50"
        style={{ bottom: '2rem', right: '2rem' }}
      >
        <Link
          href="/uploadrequest"
          className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400 text-black font-bold shadow-lg flex items-center justify-center text-3xl hover:scale-110 transition-transform duration-200"
          aria-label="게시판 열기"
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="14" y="6" width="4" height="20" rx="2" fill="currentColor" />
            <rect x="6" y="14" width="20" height="4" rx="2" fill="currentColor" />
          </svg>
        </Link>
      </div>
    </div>
  );
} 