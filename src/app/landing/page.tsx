'use client';

import { useState } from "react";
import MainStartButton from "@/components/lending/MainStartButton";
import { useRouter } from "next/navigation";
import React from "react";
import MovieDetailModal from "@/components/modal/MovieDetailModal";
import { useVideos } from "@/hooks/useVideos";
import { useVisitCheck } from "@/hooks/useSessionStorage";
import type { TokenDetailResponse } from "@/types/pitch";

export default function LandingPage() {
  const [step, setStep] = useState<'intro'|'video'|'main'>('main');
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedTokenData, setSelectedTokenData] = useState<TokenDetailResponse | null>(null);
  const router = useRouter();
  
  // React Query로 비디오 데이터 미리 로드 (캐싱 활용)
  const { data: tokens = [], isLoading } = useVideos();

  // 방문 체크 커스텀 훅 사용
  const { hasVisited, setVisited, isInitialized } = useVisitCheck();

  // 이미 방문한 경우 홈으로 리디렉트
  React.useEffect(() => {
    if (isInitialized && hasVisited) {
      router.push('/');
    }
  }, [hasVisited, isInitialized, router]);

  const closeModal = () => {
    setSelectedVideoId(null);
    setSelectedTokenData(null);
  };

  const handleStart = () => {
    setVisited();
    router.push('/');
  };
  
  return (
    <div className="bg-neutral-950 text-white min-h-screen">
      {isInitialized && !hasVisited && (
        <MainStartButton onPlay={handleStart} />
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