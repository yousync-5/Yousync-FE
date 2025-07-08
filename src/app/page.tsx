'use client';

import { useState } from "react";
import IntroPlayButton from "@/components/lending/IntroPlayButton";
import VideoAutoPlayer from "@/components/lending/VideoAutoPlayer";
import MainStartButton from "@/components/lending/MainStartButton";
import { useRouter } from "next/navigation";
import React from "react";

export default function LandingPage() {
  const [step, setStep] = useState<'intro'|'video'|'main'>('intro');
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const router = useRouter();

  // 인트로 → 재생버튼 클릭 시
  const handleIntroPlay = () => setStep('video');
  
  // 영상 끝나면
  const handleVideoComplete = () => {
    setShowFinalMessage(true);
    setTimeout(() => setStep('main'), 3000);
  };

  // "Let's Run!" 버튼 클릭 시 홈으로 이동
  const handleLetsRun = () => {
    router.push('/home');
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
    </div>
  );
} 