'use client';

import { useState } from "react";
import MovieDetailModal from "@/components/modal/MovieDetailModal";
import { useVideos } from "@/hooks/useVideos";
import Movie from "@/components/movie/Movie";
import type { TokenDetailResponse } from "@/types/pitch";
import { useRouter, useSearchParams } from "next/navigation";
import { useSessionStorage } from "@/hooks/useSessionStorage";
import React from "react";

export default function HomePage() {
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [modalId, setModalId, removeModalId] = useSessionStorage<string | null>('modalId', null);
  const { data: tokens = [], isLoading, error } = useVideos();
  const router = useRouter();
  const searchParams = useSearchParams();

  // openModal 함수
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

  // sessionStorage에서 modalId 확인 및 쿼리스트링에서 modalId 확인
  React.useEffect(() => {
    if (modalId) {
      openModal(modalId);
      removeModalId();
      return;
    }
    if (searchParams.get('modalId')) {
      const modalId = searchParams.get('modalId') as string;
      openModal(modalId);
      router.replace('/home');
    }
  }, [searchParams, router, modalId, removeModalId]);

  return (
    <div className="bg-neutral-950 text-white px-6 py-4 font-sans overflow-x-hidden min-h-full flex flex-col">
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
      {selectedVideoId && tokens.length && (() => {
        const tokenData = tokens.find((v) => v.youtubeId === selectedVideoId);
        return tokenData ? (
          <MovieDetailModal
            youtubeId={selectedVideoId}
            isOpen={!!selectedVideoId}
            onClose={closeModal}
            tokenData={tokenData}
          />
        ) : null;
      })()}
    </div>
  );
} 