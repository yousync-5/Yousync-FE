'use client';

import { useState, useEffect, useCallback } from "react";
import MovieDetailModal from "@/components/modal/MovieDetailModal";
import { useVideos, usePopularVideos, useLatestVideos, useRomanticVideos, useDuetScenes } from "@/hooks/useVideos";
import Movie from "@/components/movie/Movie";
import type { TokenDetailResponse } from "@/types/pitch";
import { useRouter, useSearchParams } from "next/navigation";

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
    if (searchParams.get('modalId')) {
      const modalId = searchParams.get('modalId') as string;
      setTimeout(() => {
        openModal(modalId);
        router.replace('/home');
      }, 500);
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
    <div className="bg-neutral-950 text-white px-6 py-4 font-sans min-h-full flex flex-col pt-2">
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
    </div>
  );
} 