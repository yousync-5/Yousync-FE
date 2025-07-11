//이해완료
'use client';

import { useState } from "react";
import IntroPlayButton from "@/components/lending/IntroPlayButton";
import VideoAutoPlayer from "@/components/lending/VideoAutoPlayer";
import MainStartButton from "@/components/lending/MainStartButton";
import { useRouter } from "next/navigation";
import React from "react";
import MovieDetailModal from "@/components/modal/MovieDetailModal";
import { useVideos } from "@/hooks/useVideos";
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
      {step === 'main' && (
        <MainStartButton onPlay={() => setStep('home')} />
      )}
      {step === 'home' && (
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