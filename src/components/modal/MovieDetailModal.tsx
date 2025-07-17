"use client";

import React, { MouseEvent, useRef, useEffect } from "react";
import dynamic from 'next/dynamic';
import { FaMicrophone, FaUser, FaTag, FaClock } from "react-icons/fa";
import { useRouter } from "next/navigation";
import type { TokenDetailResponse } from "@/types/pitch";

const YouTube = dynamic(() => import('react-youtube'), { ssr: false });

interface VideoModalProps {
  youtubeId: string;
  isOpen: boolean;
  onClose: () => void;
  tokenData: TokenDetailResponse;
}

export default function MovieDetailModal({
  youtubeId,
  isOpen,
  onClose,
  tokenData,
}: VideoModalProps) {
  const router = useRouter();
  const playerRef = useRef<any>(null);

  // tokenData가 있을 때만 접근
  const startTime = Number(tokenData?.start_time) || 0;
  const endTime = Number(tokenData?.end_time) || undefined;

  // 반복 재생: 영상이 끝나면 startTime으로 이동 후 재생
  const handlePlayerReady = (event: any) => {
    playerRef.current = event.target;
    if (startTime > 0) {
      event.target.seekTo(startTime);
    }
    event.target.playVideo();
  };

  const handlePlayerEnd = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(startTime);
      playerRef.current.playVideo();
    }
  };

  // endTime이 지정된 경우, 100ms마다 체크해서 endTime 도달 시 반복
  useEffect(() => {
    if (!playerRef.current || !endTime) return;
    const interval = setInterval(() => {
      const current = playerRef.current.getCurrentTime?.();
      if (typeof current === 'number' && current >= endTime) {
        playerRef.current.seekTo(startTime);
        playerRef.current.playVideo();
      }
    }, 100);
    return () => clearInterval(interval);
  }, [endTime, startTime, isOpen]);

  if (!isOpen || !youtubeId || !tokenData) return null;

  const handleDubbingClick = () => {
    console.log(">> ", tokenData.id, youtubeId)
    router.push(`/dubbing/${tokenData.id}?modalId=${youtubeId}`);
  };

  return (
    <div className="fixed inset-0 z-51 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className="relative z-50 w-full max-w-[90vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-[#181818] p-4 sm:p-6 shadow-2xl"
        onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        {/* 닫기 버튼은 주석 처리됨. 바깥(배경) 클릭 시 모달이 닫힙니다. */}
        {/* <button
          className="absolute top-4 right-4 text-2xl text-white hover:text-gray-300"
          onClick={onClose}
        >
          &times;
        </button> */}
        {/* 메인 영상 */}
        <div className="mx-auto aspect-video w-full overflow-hidden rounded-xl relative shadow-lg">
          <YouTube
            key={youtubeId}
            videoId={youtubeId}
            className="h-full w-full"
            onReady={handlePlayerReady}
            onEnd={handlePlayerEnd}
            opts={{
              width: "100%",
              height: "100%",
              playerVars: {
                controls: 0, // 재생바 숨김
                autoplay: 1,
                start: startTime,
                showinfo: 0, // 제목 숨김
                modestbranding: 1, // 유튜브 로고 최소화
                rel: 0, // 관련 영상 숨김
                iv_load_policy: 3, // 인포카드 숨김
                fs: 0, // 전체화면 버튼 숨김
                disablekb: 1, // 키보드 제어 비활성화
              }
            }}
          />
          {/* 상단 오버레이 */}
          <div
            className="absolute top-0 left-0 w-full z-20 pointer-events-none"
            style={{ height: 64, background: '#000', opacity: 1 }}
          />
          {/* 하단 오버레이 */}
          <div
            className="absolute bottom-0 z-20 pointer-events-none"
            style={{ right: 15, width: 400, height: 48, background: '#000', opacity: 1 }}
          />
          {/* 기존 상/하단 완전 불투명 오버레이는 제거 */}
        </div>
        {/* 정보 카드 */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-6 bg-[#20232a] rounded-2xl shadow-lg p-6 border border-[#23272f]">
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-lg text-emerald-400 font-bold">
              <FaUser />
              {tokenData.actor_name}
            </div>
            <div className="flex items-center gap-2 text-base text-gray-300">
              <FaTag />
              {tokenData.category}
            </div>
            <div className="flex items-center gap-2 text-base text-gray-400">
              <FaClock />
              재생 시간: {(Number(tokenData.end_time) - Number(tokenData.start_time)).toFixed(2)}초
            </div>
          </div>
          <button
            onClick={handleDubbingClick}
            className="flex items-center gap-3 px-8 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-lg font-bold shadow-lg transition-all duration-200 focus:outline-none"
          >
            <FaMicrophone className="text-2xl" />
            더빙하기
          </button>
        </div>
      </div>
    </div>
  );
}
