"use client";

import React, { MouseEvent, useRef, useEffect, useState } from "react";
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
  duetPair: Array<{ actor_name: string; actor_id: number }>;
}

export default function DuetDetailModal({
  youtubeId,
  isOpen,
  onClose,
  tokenData,
  duetPair,
}: VideoModalProps) {
  const router = useRouter();
  const playerRef = useRef<any>(null);
  const [selectedActorId, setSelectedActorId] = useState<number | null>(null);
  const [isDubbingLoading, setIsDubbingLoading] = useState(false);

  useEffect(() => {
    setSelectedActorId(null); // 모달 열릴 때마다 초기화
    setIsDubbingLoading(false); // 모달 열릴 때마다 로딩 상태 초기화
  }, [isOpen]);

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
    if (selectedActorId) {
      setIsDubbingLoading(true); // 더빙하기 버튼 클릭 시 로딩 상태 활성화
      router.push(`/duetdubbing/${youtubeId}?actor1=${duetPair[0].actor_id}&actor2=${duetPair[1].actor_id}&selected=${selectedActorId}`);
    }
  };

  return (
    <div className="fixed inset-0 z-51 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className="relative z-50 w-full max-w-[90vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-[#181818] p-4 sm:p-6 shadow-2xl"
        onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        {/* 닫기(X) 버튼 */}
        <button
          className="absolute top-4 right-4 text-2xl text-white font-bold rounded-full w-11 h-11 flex items-center justify-center bg-black/40 hover:bg-gray-700 hover:text-emerald-400 transition-all"
          onClick={onClose}
          aria-label="닫기"
          type="button"
        >
          &times;
        </button>
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
                cc_load_policy: 0, // 자막 비활성화
                cc_lang_pref: 'ko', // 자막 언어 한국어
                hl: 'ko', // 인터페이스 언어 한국어
                origin: window.location.origin, // 도메인 제한
              }
            }}
          />
          {/* 상단 오버레이 - 유튜브 헤더만 가리기 */}
          <div
            className="absolute top-0 left-0 w-full z-20 pointer-events-none"
            style={{ 
              height: 48, 
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.3) 80%, transparent 100%)',
              backdropFilter: 'blur(2px)'
            }}
          />
          {/* 우측 하단 오버레이 - 더보기 버튼 가리기 */}
          <div
            className="absolute bottom-4 right-4 z-20 pointer-events-none"
            style={{ 
              width: 120,
              height: 40,
              background: 'linear-gradient(to left, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.3) 80%, transparent 100%)',
              backdropFilter: 'blur(2px)',
              borderRadius: '8px'
            }}
          />
          {/* 전체 영역 클릭 방지 오버레이 */}
          <div
            className="absolute inset-0 z-30 pointer-events-auto"
            style={{ 
              background: 'transparent',
              cursor: 'not-allowed'
            }}
            onClick={(e) => e.preventDefault()}
            onMouseDown={(e) => e.preventDefault()}
            onDoubleClick={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
        {/* 정보 카드 */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-6 bg-[#20232a] rounded-2xl shadow-lg p-6 border border-[#23272f]">
          <div className="flex-1 flex flex-col gap-2">
            {/* 안내문구 */}
            <div className="mb-2 text-base text-emerald-300 font-semibold">배우를 선택하세요</div>
            <div className="flex items-center gap-4">
              {duetPair && duetPair.length === 2 ? (
                <>
                  <label
                    key={duetPair[0].actor_id}
                    className={`flex flex-col items-center px-6 py-4 rounded-2xl cursor-pointer border-2 transition-all duration-200 shadow-md
                      ${selectedActorId === duetPair[0].actor_id ? 'border-emerald-400 bg-emerald-50/10 shadow-emerald-400/30 scale-105' : 'border-gray-700 bg-[#23272f] hover:border-emerald-300 hover:bg-emerald-900/10'}`}
                    style={{ minWidth: 120 }}
                  >
                    <input
                      type="radio"
                      name="duet-actor"
                      value={duetPair[0].actor_id}
                      checked={selectedActorId === duetPair[0].actor_id}
                      onChange={() => setSelectedActorId(duetPair[0].actor_id)}
                      className="hidden"
                    />
                    <FaUser className={`mb-2 text-2xl ${selectedActorId === duetPair[0].actor_id ? 'text-emerald-400' : 'text-gray-400'}`} />
                    <span className={`font-bold ${selectedActorId === duetPair[0].actor_id ? 'text-emerald-300' : 'text-white'}`}>{duetPair[0].actor_name}</span>
                  </label>
                  <span className="mx-2 text-gray-400 font-bold text-lg">VS</span>
                  <label
                    key={duetPair[1].actor_id}
                    className={`flex flex-col items-center px-6 py-4 rounded-2xl cursor-pointer border-2 transition-all duration-200 shadow-md
                      ${selectedActorId === duetPair[1].actor_id ? 'border-emerald-400 bg-emerald-50/10 shadow-emerald-400/30 scale-105' : 'border-gray-700 bg-[#23272f] hover:border-emerald-300 hover:bg-emerald-900/10'}`}
                    style={{ minWidth: 120 }}
                  >
                    <input
                      type="radio"
                      name="duet-actor"
                      value={duetPair[1].actor_id}
                      checked={selectedActorId === duetPair[1].actor_id}
                      onChange={() => setSelectedActorId(duetPair[1].actor_id)}
                      className="hidden"
                    />
                    <FaUser className={`mb-2 text-2xl ${selectedActorId === duetPair[1].actor_id ? 'text-emerald-400' : 'text-gray-400'}`} />
                    <span className={`font-bold ${selectedActorId === duetPair[1].actor_id ? 'text-emerald-300' : 'text-white'}`}>{duetPair[1].actor_name}</span>
                  </label>
                </>
              ) : (
                <span className="text-white">{tokenData.actor_name}</span>
              )}
            </div>
            {/* 기존 정보 */}
            <div className="flex items-center gap-2 text-base text-gray-300 mt-4">
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
            disabled={!selectedActorId || isDubbingLoading}
            className={`flex items-center gap-3 px-8 py-3 rounded-full text-white text-lg font-bold shadow-lg transition-all duration-200 focus:outline-none ${isDubbingLoading ? 'bg-emerald-500 animate-pulse cursor-not-allowed' : selectedActorId ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-gray-500 cursor-not-allowed'}`}
          >
            <FaMicrophone className="text-2xl" />
            더빙하기
          </button>
        </div>
      </div>
    </div>
  );
}