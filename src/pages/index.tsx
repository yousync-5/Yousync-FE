"use client";

import { useState } from "react";
import MovieDetailModal from "@/components/modal/MovieDetailModal";
import { useVideos } from "@/hooks/useVideos";
import Movie from "@/components/movie/Movie";
import type { TokenDetailResponse } from "@/type/PitchdataType";

export default function Home() {
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  // useVideos: TokenDetailResponse[]
  const { data: tokens = [], isLoading, error } = useVideos();

  // 카드(리스트)에는 최소 정보만 뽑아 사용 (필요하면)
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

  return (
  <div className="bg-neutral-950 text-white px-6 py-4 font-sans overflow-x-hidden min-h-full flex flex-col">

      {/* Videos */}
      {isLoading && <div>로딩중...</div>}
      {error && <div>에러 발생!</div>}

      {!isLoading && !error && (
        <Movie
          bestVideos={videos}
          latestVideos={videos}
          nowPlayingVideos={videos}
          onVideoClick={openModal}
          selectedVideoId={selectedVideoId}     
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