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

export default function LandingPage() {
  const [step, setStep] = useState<'intro'|'video'|'main'>('intro');
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

  // 인트로 → 재생버튼 클릭 시
  const handleIntroPlay = () => setStep('video');
  
  // 영상 끝나면
  const handleVideoComplete = () => {
    setShowFinalMessage(true);
    setTimeout(() => setStep('main'), 3000);
  };

  // "Let's Run!" 버튼 클릭 시 홈으로 이동 (모달과 함께)
  const handleLetsRun = () => {
    // 데이터가 로드되었고 첫 번째 비디오가 있으면 모달과 함께 홈으로 이동
    if (tokens.length > 0) {
      const firstVideo = tokens[0];
      router.push(`/home?modalId=${firstVideo.youtubeId}`);
    } else {
      // 데이터가 아직 로드되지 않았으면 일반 홈으로 이동
      router.push('/home');
    }
  };

  return (
    <div className="bg-neutral-950 text-white px-6 py-4 font-sans overflow-x-hidden min-h-full flex flex-col">
      {step === 'intro' && <IntroPlayButton onPlay={handleIntroPlay} />}
      {step === 'video' && (
        <VideoAutoPlayer onComplete={handleVideoComplete} />
      )}
      {step === 'main' && (
        <MainStartButton onPlay={handleLetsRun} />
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