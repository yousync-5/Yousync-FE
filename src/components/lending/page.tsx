"use client";

import { useState } from "react";
import IntroPlayButton from "@/components/lending/IntroPlayButton";
import LanderSequence from "@/components/graph/LanderSequence"; // 영상/스크립트 재생
import MainStartButton from "@/components/lending/MainStartButton"; // "재생" 버튼

export default function HomePage() {
  const [step, setStep] = useState<"intro" | "video" | "main">("intro");

  return (
    <>
      {step === "intro" && (
        <IntroPlayButton onPlay={() => setStep("video")} />
      )}
      {step === "video" && (
        <LanderSequence onEnd={() => setStep("main")} />
      )}
      {step === "main" && (
        <MainStartButton onPlay={() => setStep("intro")} />
      )}
    </>
  );
}
