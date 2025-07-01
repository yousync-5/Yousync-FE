"use client";

import React, { MouseEvent } from "react";
import YouTube from "react-youtube";

interface Video {
  id: string;
}

interface TokenData {
  youtubeId: string;
  actor_name: string;
  category: string;
  start_time: number;
  end_time: number;
  scripts: string[];
  s3_pitch_url: string;
  s3_bgvoice_url: string;
  s3_textgrid_url: string;
}

interface VideoModalProps {
  youtubeId: string;
  isOpen: boolean;
  onClose: () => void;
  tokenData?: TokenData; // 옵셔널 처리로 안전성 확보
}

export default function MovieDetailModal({
  youtubeId,
  isOpen,
  onClose,
  tokenData,
}: VideoModalProps) {
  if (!isOpen || !tokenData) return null; // ✅ 안전하게 조건 처리

  const relatedVideos: Video[] = [
    { id: "M7lc1UVf-VE" },
    { id: "ScMzIvxBSi4" },
    { id: "E7wJTI-1dvQ" },
  ];

  return (
    <div className="fixed inset-0 z-51 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      {/* 오버레이 클릭 시 닫기 */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative z-50 w-full max-w-[90vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-[#181818] p-4 sm:p-6 shadow-2xl"
        onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
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
            opts={{ width: "100%", height: "100%", playerVars: { controls: 1 } }}
          />
        </div>

        {/* 상세 정보 */}
        <div className="mt-6 text-white">
          <div className="flex justify-between bg-[#181818] p-4 rounded-t-lg">
            <span>
              <span className="font-semibold">재생 시간:</span>{" "}
              {(Number(tokenData.end_time) - Number(tokenData.start_time)).toFixed(2)}초
            </span>
            <span>
              <span className="font-semibold">카테고리:</span> {tokenData.category}
            </span>
          </div>
          <div className="bg-[#181818] p-4 rounded-b-lg shadow-inner">
            <p>
              <span className="font-semibold">배우 이름:</span> {tokenData.actor_name}
            </p>
          </div>
        </div>

        {/* 관련 영상 */}
        <div className="mt-6">
          <p className="text-white font-semibold mb-2">배우의 다른 영상</p>
          <div className="flex space-x-4 overflow-x-auto px-4">
            {relatedVideos.map(({ id }) => (
              <div
                key={id}
                className="flex-shrink-0 w-70 rounded-lg overflow-hidden"
              >
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
