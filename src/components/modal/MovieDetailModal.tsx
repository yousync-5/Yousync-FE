"use client";

import React, { MouseEvent } from "react";
import YouTube from "react-youtube";
import { FaMicrophone } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { TokenDetailResponse } from "@/types/pitch";

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

  if (!isOpen) return null;

  const relatedVideos = [
    { id: "M7lc1UVf-VE" },
    { id: "ScMzIvxBSi4" },
    { id: "E7wJTI-1dvQ" },
  ];

  const handleDubbingClick = () => {
    // Next.js의 replace로 히스토리에 남기지 않고 이동
    router.replace(`/detail/${tokenData.id}?modalId=${youtubeId}`);
  };

  return (
    <div className="fixed inset-0 z-51 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative z-50 w-full max-w-[90vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-[#181818] p-4 sm:p-6 shadow-2xl"
        onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-2xl text-white hover:text-gray-300"
          onClick={onClose}
        >
          &times;
        </button>

        {/* 메인 영상 */}
        <div className="mx-auto aspect-video w-full overflow-hidden rounded-lg">
          <YouTube
            videoId={youtubeId}
            className="h-full w-full"
              opts={{
      width: "100%",
      height: "100%",
      playerVars: {
        controls: 1,
        autoplay: 1, // 자동재생!
        start: 15,   // 15초부터 시작!
      }
    }}
  />
        </div>

        {/* 텍스트/버튼: 50%씩, 평행 정렬 */}
        <div className="flex w-full mt-6 mb-2 bg-[#181818] p-4 rounded-lg">
          <div className="w-1/2">
            <div className="font-semibold mb-1 text-2xl">
              재생 시간: {(Number(tokenData.end_time) - Number(tokenData.start_time)).toFixed(2)}초
            </div>
            <div className="mb-1 text-2xl">
              <span className="font-semibold">배우 이름:</span> {tokenData.actor_name}
            </div>
            <div className="text-2xl">
              <span className="font-semibold">카테고리:</span> {tokenData.category}
            </div>
          </div>
          <div className="w-1/2 flex justify-end items-start">
            <button
              onClick={handleDubbingClick}
              className="
                flex items-center gap-2
                px-6 py-2 rounded-full
                bg-red-600 hover:bg-red-700
                text-white font-semibold
                shadow
                transition
                focus:outline-none
                text-base
              "
            >
              <FaMicrophone className="text-xl" />
              더빙하기
            </button>
          </div>
        </div>

        {/* 관련 영상 */}
        <div className="mt-6">
          <p className="text-white font-semibold mb-2">배우의 다른 영상</p>
          <div className="flex space-x-4 overflow-x-auto px-4">
            {relatedVideos.map(({ id }) => (
              <div key={id} className="flex-shrink-0 w-70 rounded-lg overflow-hidden">
                <YouTube
                  videoId={id}
                  className="w-full h-full"
                  opts={{
                    width: "250",
                    height: "110",
                    playerVars: { controls: 1, rel: 0 },
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
