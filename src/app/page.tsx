'use client';

import { useState, useEffect } from "react";
import MovieDetailModal from "@/components/modal/MovieDetailModal";
import { useVideos } from "@/hooks/useVideos";
import Movie from "@/components/movie/Movie";
import type { TokenDetailResponse } from "@/types/pitch";
import { useRouter, useSearchParams } from "next/navigation";
import { useSessionStorage } from "@/hooks/useSessionStorage";

export default function Home() {
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [modalId, setModalId, removeModalId] = useSessionStorage<string | null>('modalId', null);
  
  // useVideos: TokenDetailResponse[]
  const { data: tokens = [], isLoading, error } = useVideos();
  const router = useRouter();
  const searchParams = useSearchParams();

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

  // sessionStorage에서 modalId 확인 및 쿼리스트링에서 modalId 확인
  useEffect(() => {
    if (modalId) {
      openModal(modalId);
      removeModalId(); // 사용 후 제거
      return;
    }
    
    // 쿼리스트링에서 modalId 확인 (기존 방식 유지)
    if (searchParams.get('modalId')) {
      const modalId = searchParams.get('modalId') as string;
      openModal(modalId);
      // URL에서 modalId 쿼리스트링 제거
      router.replace('/');
    }
  }, [searchParams, router, modalId, removeModalId]);

  // 카드구성
  const videos = tokens.map(({ id, youtubeId, actor_name }) => ({
    videoId: id,
    youtubeId,
    actor_name,
  }));

  // 모달 tokenData는 전체 TokenDetailResponse에서 찾음
  const selectedTokenData: TokenDetailResponse | undefined =
    selectedVideoId && tokens.length
      ? tokens.find((v) => v.youtubeId === selectedVideoId)
      : undefined;

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