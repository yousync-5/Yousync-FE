'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { useVisitCheck } from "@/hooks/useSessionStorage";
import HomeClient from "@/app/home/HomeClient";

export default function HomePage() {
  const router = useRouter();
  const { hasVisited, isInitialized } = useVisitCheck();

  // 최초 방문인 경우 랜딩페이지로 리디렉트
  React.useEffect(() => {
    if (isInitialized && !hasVisited) {
      router.push('/landing');
    }
  }, [hasVisited, isInitialized, router]);

  // 로딩 중이거나 최초 방문인 경우 로딩 표시
  if (!isInitialized || !hasVisited) {
    return (
      <div className="bg-neutral-950 text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 홈페이지 표시
  return <HomeClient />;
} 