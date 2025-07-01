"use client";

import React, { MouseEvent, useState, useEffect } from "react";
import YouTube from "react-youtube";
import axios from "axios";

interface TokenResponse {
  token_name: string;
  actor_name: string;
  category: string;
  start_time: number;
  end_time: number;
  s3_textgrid_url: string;
  s3_pitch_url: string;
  s3_bgvoice_url: string;
  youtube_url: number;
  id: number;
  scripts: unknown[];
}

interface Video { id: string }

interface VideoModalProps {
  youtubeId: string;
  isOpen: boolean;
  onClose: () => void;
}

const fetchToken = async (tokenId: number): Promise<TokenResponse | null> => {
  try {
    const { data: movieDetailModalInfo } = await axios.get<TokenResponse>(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/tokens/${tokenId}`
    );
    return movieDetailModalInfo;
  } catch (error) {
    console.error('서버 에러, 관리자에게 문의해주세요.', error);
    return null;
  }
};

const relatedVideos: Video[] = [
  { id: "M7lc1UVf-VE" },
  { id: "ScMzIvxBSi4" },
  { id: "E7wJTI-1dvQ" },
];

export default function MovieDetailModal({ youtubeId, isOpen, onClose }: VideoModalProps) {
  const [tokenInfo, setTokenInfo] = useState<TokenResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && youtubeId) {
      setLoading(true);
      fetchToken(Number(youtubeId)).then((data) => {
        setTokenInfo(data);
        setLoading(false);
      });
    }
  }, [isOpen, youtubeId]);

  if (!isOpen) return null;

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
            opts={{ width: "100%", height: "100%", playerVars: { controls: 1 } }}
          />
        </div>

        {/* 상세 정보 */}
        {loading && <div className="mt-4 text-white text-center">로딩 중...</div>}

        {tokenInfo && (
          <div className="mt-6 text-white">
            <div className="flex justify-between bg-[#181818] p-4 rounded-t-lg">
              <span>
                <span className="font-semibold">재생 시간:</span>{" "}
                {(tokenInfo.end_time - tokenInfo.start_time).toFixed(1)}초
              </span>
              <span>
                <span className="font-semibold">카테고리:</span> {tokenInfo.category}
              </span>
            </div>
            <div className="bg-[#181818] p-4 rounded-b-lg shadow-inner">
              <p>
                <span className="font-semibold">배우 이름:</span> {tokenInfo.actor_name}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6">
          <p className="text-white font-semibold mb-2">배우의 다른 영상</p>
          <div className="flex space-x-4 overflow-x-auto px-4">
            {relatedVideos.map(({ id }) => (
              <div key={id} className="flex-shrink-0 w-70 rounded-lg overflow-hidden">
                <YouTube
                  videoId={id}
                  className="w-full h-full"
                  opts={{ width: "250", height: "110", playerVars: { controls: 1, rel: 0 } }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}