// components/MovieDetailModal.tsx
"use client";

import React, { useState, MouseEvent } from "react";
import YouTube from "react-youtube";

interface Video {
  id: string;
}

export default function MovieDetailModal(): JSX.Element {
  // 모달 열림/닫힘 상태
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // 메인 영상 ID
  const mainVideoId = "7AI-Su1yiR4";

  // 테스트용 관련 영상 ID 목록
  const relatedVideos: Video[] = [
    { id: "M7lc1UVf-VE" },
    { id: "ScMzIvxBSi4" },
    { id: "E7wJTI-1dvQ" },
  ];

  return (
    // 루트는 항상 bg-gray-100
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* 모달 열기 버튼 */}
      <button
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        onClick={() => setIsOpen(true)}
      >
        모달 열기
      </button>

      {isOpen && (
        <>
          {/* ① 반투명 오버레이 */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* ② 모달 컨텐츠 */}
          <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-4xl bg-[#181818] rounded-lg shadow-2xl p-6">
              {/* 닫기 버튼 */}
              <button
                className="absolute top-4 right-4 text-2xl text-white hover:text-gray-300"
                onClick={() => setIsOpen(false)}
              >
                &times;
              </button>

              {/* 메인 YouTube 영상 */}
              <div className="mx-auto w-full max-w-3xl aspect-video rounded-lg overflow-hidden">
                <YouTube
                  videoId={mainVideoId}
                  className="w-full h-full"
                  opts={{
                    width: "100%",
                    height: "100%",
                    playerVars: { controls: 1 },
                  }}
                />
              </div>

              {/* 상세 정보 */}
              <div className="mt-6 text-white">
                <div className="flex justify-between bg-[#181818] p-4 rounded-t-lg">
                  <span>
                    <span className="font-semibold">재생 시간:</span> 24s
                  </span>
                  <span>
                    <span className="font-semibold">카테고리:</span> 영화
                  </span>
                </div>
                <div className="bg-[#181818] p-4 rounded-b-lg shadow-inner">
                  <p className="mb-2">
                    <span className="font-semibold">오늘의 순위:</span> 8위
                  </p>
                  <p>
                    <span className="font-semibold">배우 이름:</span> 권닝닝
                  </p>
                </div>
              </div>

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
                          playerVars: { controls: 1 },
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}