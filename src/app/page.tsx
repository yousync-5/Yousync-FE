//이해완료
'use client';

import { useState } from "react";
import MainStartButton from "@/components/lending/MainStartButton";
import { useRouter } from "next/navigation";
import React from "react";
import MovieDetailModal from "@/components/modal/MovieDetailModal";
import { useVideos } from "@/hooks/useVideos";
import { useVisitCheck } from "@/hooks/useSessionStorage";
import type { TokenDetailResponse } from "@/types/pitch";
import HomeClient from "@/app/home/HomeClient";

export default function LandingPage() {
  const [step, setStep] = useState<'intro'|'video'|'main'|'home'>('main');
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedTokenData, setSelectedTokenData] = useState<TokenDetailResponse | null>(null);
  const router = useRouter();
  
  // React Query로 비디오 데이터 미리 로드 (캐싱 활용)
  const { data: tokens = [], isLoading } = useVideos();

  // 방문 체크 커스텀 훅 사용
  const { hasVisited, setVisited, isInitialized } = useVisitCheck();

  // 방문 상태에 따라 단계 설정
  React.useEffect(() => {
    if (isInitialized) {
      if (hasVisited) {
        // 이미 방문한 경우 바로 홈으로
        setStep('home');
      } else {
        // 최초 방문인 경우 Let's run 화면 표시
        setStep('main');
      }
    }
  }, [hasVisited, isInitialized]);

  const closeModal = () => {
    setSelectedVideoId(null);
    setSelectedTokenData(null);
  };
  
  return (
    <div className="bg-neutral-950 text-white min-h-screen">
      {/* {step === 'intro' && <IntroPlayButton onPlay={handleIntroPlay} />}
      {step === 'video' && (
        <VideoAutoPlayer onComplete={handleVideoComplete} />
      )} */}
      {isInitialized && step === 'main' && !hasVisited && (
        <MainStartButton onPlay={() => {
          setVisited();
          setStep('home');
        }} />
      )}
      {isInitialized && step === 'home' && (
        <HomeClient />
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