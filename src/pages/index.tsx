"use client";

import { useState } from "react";
import MovieDetailModal from "@/components/MovieDetailModal";
import { useVideos } from "@/hooks/useVideos";
import Movie from "@/components/Movie";
import type { TokenDetailResponse } from "@/type/PitchdataType";

export default function Home() {
  const [selectedTab, setSelectedTab] = useState("인기 영상");
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const tabs = [
    "인기 배우",
    "인기 영상",
    "미국 배우",
    "영국 배우",
    "남자 배우",
    "여자 배우",
  ];

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
    <div className="bg-neutral-950 min-h-screen text-white px-6 py-4 font-sans overflow-x-hidden">
      {/* Search */}
      <div className="flex justify-center mb-6 mt-24">
        <div className="flex items-center border-2 border-white rounded-full px-4 py-2 w-full max-w-xl">
          <input
            type="text"
            placeholder="Actor검색 또는 YoutubeURL을 입력해 주세요"
            className="bg-transparent text-white outline-none w-full placeholder:text-white"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-4 text-sm font-medium mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`transition-colors ${selectedTab === tab ? "text-red-500" : "text-white"}`}
            onClick={() => setSelectedTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

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