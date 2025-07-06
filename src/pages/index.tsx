// src/pages/index.tsx
"use client";

import { useState, useEffect } from "react";
import MovieDetailModal from "@/components/modal/MovieDetailModal";
import { useVideos } from "@/hooks/useVideos";
import Movie from "@/components/movie/Movie";
import type { TokenDetailResponse } from "@/type/PitchdataType";
import { useRouter } from "next/router";

export default function Home() {
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // useVideos: TokenDetailResponse[]
  const { data: tokens = [], isLoading, error } = useVideos();
  const router = useRouter();

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

  // Hydration 에러 방지
  useEffect(() => {
    setMounted(true);
  }, []);

  // 쿼리스트링에 modalId가 있으면 자동으로 모달 오픈
  useEffect(() => {
    if (mounted && router.query.modalId) {
      const modalId = router.query.modalId as string;
      openModal(modalId);
      // URL에서 modalId 쿼리스트링 제거 (뒤로가기 시 모달이 다시 열리지 않도록)
      router.replace('/', undefined, { shallow: true });
    }
  }, [mounted, router.query.modalId]);

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

  // Hydration 에러 방지를 위해 클라이언트에서만 렌더링
  if (!mounted) {
    return (
      <div className="bg-neutral-950 text-white px-6 py-4 font-sans overflow-x-hidden min-h-full flex flex-col">
        <div>로딩중...</div>
      </div>
    );
  }

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