"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import DubbingHeader from "@/components/dubbing/DubbingHeader";
import VideoPlayer, { VideoPlayerRef } from "@/components/dubbing/VideoPlayer";
import ScriptDisplay from "@/components/dubbing/ScriptDisplay";
import PitchComparison from "@/components/dubbing/PitchComparison";
import TestResultAnalysisSection from "@/components/result/TestResultAnalysisSection";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useAudioStream } from "@/hooks/useAudioStream";
import { useJobIdsStore } from '@/store/useJobIdsStore';
import Sidebar from "../ui/Sidebar";

const SIDEBAR_WIDTH = 320;

function useIsWideScreen() {
  const [isWide, setIsWide] = useState(true);
  useEffect(() => {
    const check = () => setIsWide(window.innerWidth > SIDEBAR_WIDTH * 2);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isWide;
}

export default function DubbingContainer({
  tokenData,
  front_data,
  serverPitchData,
  id,
  modalId,
}: {
  tokenData: any;
  front_data: any;
  serverPitchData: any;
  id: string;
  modalId?: string;
}) {
  // 데이터 준비 여부 체크
  const isReady = !!(front_data && tokenData && serverPitchData);

  // 사이드바 상태
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentScriptIndex, setCurrentScriptIndex] = useState(0);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const [showResults, setShowResults] = useState(false);

  const [finalResults, setFinalResults] = useState<any[]>([]); // SSE 결과 상태

  const videoPlayerRef = useRef<VideoPlayerRef | null>(null);
  const pitchRef = useRef<{ handleExternalStop: () => void } | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useAudioStream();

  // zustand에서 multiJobIds 읽기
  const multiJobIds = useJobIdsStore((state) => state.multiJobIds);
  const setMultiJobIds = useJobIdsStore((state) => state.setMultiJobIds);

  // background_audio_url 변수로 추출
  // const backgroundAudioUrl = front_data?.captions?.[0]?.background_audio_url;

  // // 첫 문장 start_time, 마지막 문장 end_time 추출 및 콘솔 출력
  // useEffect(() => {
  //   if (front_data?.captions && front_data.captions.length > 0) {
  //     const firstStart = front_data.captions[0].start_time;
  //     const lastEnd = front_data.captions[front_data.captions.length - 1].end_time;
  //     console.log('첫 문장 start_time:', firstStart);
  //     console.log('마지막 문장 end_time:', lastEnd);
  //   }
  // }, [front_data?.captions]);

  // console.log(backgroundAudioUrl);

  // 기존 SSE 연결 방식 복구
  // useEffect(() => {
  //   if (!multiJobIds || multiJobIds.length === 0) return;
  //   const sseList: EventSource[] = [];
  //   multiJobIds.forEach((jobId) => {
  //     const sse = new EventSource(`${process.env.NEXT_PUBLIC_API_BASE_URL}/scripts/analysis-progress/${jobId}`);
  //     sseList.push(sse);
  //     sse.onopen = () => {
  //       console.log(`[SSE] 연결 성공: jobId=${jobId}`);
  //     };
  //     sse.onmessage = (e) => {
  //       console.log(`[SSE] 메시지 수신: jobId=${jobId}`, e.data);
  //       const data = JSON.parse(e.data);
  //       if (data.status === 'completed' && data.result?.result) {
  //         console.log('[SSE 결과]', data.result.result);
  //         setFinalResults(prev => [...prev, data.result.result]);
  //       }
  //       if (["completed", "failed", "error"].includes(data.status)) {
  //         sse.close();
  //       }
  //     };
  //     sse.onerror = (e) => {
  //       console.error(`[SSE] 연결 에러: jobId=${jobId}`, e);
  //       sse.close();
  //     };
  //   });
  //   return () => {
  //     sseList.forEach(sse => sse.close());
  //   };
  // }, [multiJobIds]);


  // useEffect(() => {
  //   console.log('multiJobIds:', multiJobIds);
  //   console.log('finalResults:', finalResults);
  //   if (!multiJobIds.length) return;
  //   const allCompleted = finalResults.length === multiJobIds.length;
  //   if (allCompleted) {
      
  //     console.log("🎉 모든 작업 완료!", finalResults);
  //     setShowCompleted(true);
  //   }
  // }, [finalResults, multiJobIds]);

  // ✅ SSE 관련 상태 초기화
const sseRef = useRef<EventSource | null>(null);
const connectedJobIdsRef = useRef<Set<string>>(new Set());

// ✅ SSE 연결 및 결과 수신 처리
useEffect(() => {
  if (!multiJobIds.length) return;

  const sseList: EventSource[] = [];

  multiJobIds.forEach((jobId) => {
    if (connectedJobIdsRef.current.has(jobId)) {
      console.log(`[SSE] 이미 연결된 job_id 건너뛰기: ${jobId}`);
      return;
    }

    console.log('[SSE] 연결 시도:', jobId);
    connectedJobIdsRef.current.add(jobId);

    const sse = new EventSource(`${process.env.NEXT_PUBLIC_API_BASE_URL}/scripts/analysis-progress/${jobId}`);
    sseList.push(sse);

    sse.onopen = () => {
      console.log(`[SSE][${jobId}] 연결됨`);
    };

    sse.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log(`[SSE][${jobId}] 수신:`, data);
    
      if (data.status === 'completed' && data.result?.result) {
        console.log(`🎯 [SSE 결과 추가] jobId: ${jobId}, overall_score: ${data.result.result.overall_score}`);
        
        setFinalResults((prev) => {
          const exists = prev.some(
            (r) => r.overall_score === data.result.result.overall_score
          );
          if (exists) {
            console.log(`[SSE] 중복 결과 무시: ${jobId}`);
            return prev;
          }
          console.log(`[SSE] 새로운 결과 추가: ${jobId}`);
          return [...prev, data.result.result];
        });
      }
    
      if (["completed", "failed", "error"].includes(data.status)) {
        sse.close();
        connectedJobIdsRef.current.delete(jobId);
      }
    };

    sse.onerror = (e) => {
      console.error(`[SSE][${jobId}] 에러 발생`, e);
      sse.close();
      connectedJobIdsRef.current.delete(jobId);
    };
  });

  return () => {
    sseList.forEach((sse) => sse.close());
  };
}, [multiJobIds]);

// ✅ 결과 개수로 전체 완료 감지
useEffect(() => {
  if (!multiJobIds.length) return;
  const allDone = finalResults.length === multiJobIds.length;
  if (allDone) {
    setTimeout(() => setShowCompleted(true), 1000);
  } else {
    setShowCompleted(false);
  }
}, [finalResults, multiJobIds]);

// ✅ 새로운 분석 시작 시 연결 목록 초기화
useEffect(() => {
  if (multiJobIds.length > 0) {
    console.log('새로운 분석 시작 - 연결 목록 초기화');
    connectedJobIdsRef.current.clear();
  }
}, [multiJobIds.length]);


  





  // 점수 색상 헬퍼
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 80) return "text-yellow-400";
    if (score >= 70) return "text-orange-400";
    return "text-red-400";
  };
  const getScoreLevel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 70) return "Fair";
    return "Poor";
  };

  // 결과 진행상황 토스트 (원래대로 복구)
  useEffect(() => {
    const toastId = "analysis-loading-toast";

    if(!showCompleted && multiJobIds.length > 0) {
      const completedCount = finalResults.length;
      const totalCount = multiJobIds.length;
      const progressText = completedCount > 0 
        ? `${completedCount}번 대사 분석 완료` 
        : "분석 준비 중...";
      toast.loading(
        <div className="flex items-center gap-4 p-2">
          <div className="animate-spin w-16 h-16 border-5 border-green-400 border-t-transparent rounded-full" />
          <div className="flex flex-col">
            <span className="text-white font-semibold text-2xl">결과 분석 중입니다...</span>
            <span className="text-green-300 text-xl">{progressText}</span>
            <span className="text-gray-400 text-lg">{completedCount} / {totalCount} 완료</span>
          </div>
        </div>, 
        {
          id: toastId,
          icon: null,
          position: "bottom-right",
          duration: Infinity,
          style: {
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
            border: '2px solid #22c55e',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(34, 197, 94, 0.2)',
            minWidth: '500px',
            padding: '32px 36px',
          },
        }
      );
    } else {
      toast.dismiss(toastId);
    }
    return () => {
      toast.dismiss(toastId);
    }
  }, [showCompleted, multiJobIds.length, finalResults.length]);

  // 분석 완료 시 결과 섹션으로 스크롤
  useEffect(() => {
    if (showCompleted) {
      const timer = setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [showCompleted]);

  // 결과 보기 버튼 클릭 시 결과 섹션으로 스크롤
  const showResultsSection = useCallback(() => {
    setShowResults(true);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  }, []);

  // 데이터가 준비되지 않았으면 내부 로직 실행하지 않음
  const findScriptIndexByTime = useCallback((time: number) => {
    if (!isReady) return 0;
    const lastIndex = front_data.captions.length - 1;
    const lastScript = front_data.captions[lastIndex];
    if (lastScript && time > lastScript.end_time) return lastIndex;
    const foundIndex = front_data.captions.findIndex(
      (script: any) => time >= script.start_time && time <= script.end_time
    );
    return foundIndex !== -1 ? foundIndex : 0;
  }, [isReady, front_data?.captions]);

  const handleTimeUpdate = useCallback((currentTime: number) => {
    if (!isReady) return;
    setCurrentVideoTime(currentTime);
    const currentScript = front_data.captions[currentScriptIndex];
    if (currentScript && currentTime >= currentScript.end_time) return;
    const newScriptIndex = findScriptIndexByTime(currentTime);
    if (newScriptIndex !== -1 && newScriptIndex !== currentScriptIndex) {
      setCurrentScriptIndex(newScriptIndex);
    }
  }, [isReady, currentScriptIndex, findScriptIndexByTime, front_data?.captions]);

  const getCurrentScriptPlaybackRange = useCallback(() => {
    if (!isReady) return { startTime: 0, endTime: undefined };
    if (!front_data.captions || front_data.captions.length === 0) {
      return { startTime: 0, endTime: undefined };
    }
    const currentScript = front_data.captions[currentScriptIndex];
    if (!currentScript) return { startTime: 0, endTime: undefined };
    return {
      startTime: currentScript.start_time,
      endTime: currentScript.end_time,
    };
  }, [isReady, front_data?.captions, currentScriptIndex]);

  const currentWords = isReady ? (tokenData?.scripts?.[currentScriptIndex]?.words || []) : [];

  useEffect(() => {
    if (!isReady) return;
    if (front_data.captions && front_data.captions[currentScriptIndex]) {
      setCurrentVideoTime(front_data.captions[currentScriptIndex].start_time);
    }
  }, [isReady, currentScriptIndex, front_data?.captions]);

  const handlePlay = () => setIsVideoPlaying(true);
  const handlePause = () => setIsVideoPlaying(false);

  // 사이드바 관련 상태, 컴포넌트, 버튼, setSidebarOpen 등 모두 삭제
  // 기존 VideoPlayer, ScriptDisplay, PitchComparison, 결과 섹션 등만 남김

  // 문장 클릭 시 녹음 중지, 영상 이동 및 정지, 인덱스 변경
  const handleScriptSelect = (index: number) => {
    // 1. 녹음 중이면 PitchComparison의 녹음 중지 핸들 호출
    pitchRef.current?.handleExternalStop();

    // 2. 영상 해당 시점으로 이동 및 정지
    const startTime = front_data.captions[index]?.start_time ?? 0;
    videoPlayerRef.current?.seekTo(startTime);
    videoPlayerRef.current?.pauseVideo();

    // 3. 문장 인덱스 변경
    setCurrentScriptIndex(index);
  };

  // jobId별로 SSE 연결 및 결과 콘솔 출력
  const connectSSEForJob = React.useCallback((jobId: string) => {
    console.log('[DEBUG] connectSSEForJob called', jobId);
    const sse = new EventSource(`${process.env.NEXT_PUBLIC_API_BASE_URL}/scripts/analysis-progress/${jobId}`);
    sse.onopen = () => {
      console.log(`[SSE] 연결 성공: jobId=${jobId}`);
    };
    sse.onmessage = (e) => {
      console.log(`[SSE] 메시지 수신: jobId=${jobId}`, e.data);
      const data = JSON.parse(e.data);
      if (data.status === 'completed' && data.result?.result) {
        console.log('[SSE 결과]', data.result.result);
        // setFinalResults(prev => [...prev, data.result.result]); // 필요시
      }
      if (["completed", "failed", "error"].includes(data.status)) {
        sse.close();
      }
    };
    sse.onerror = (e) => {
      console.error(`[SSE] 연결 에러: jobId=${jobId}`, e);
      sse.close();
    };
  }, []);

  // --- 렌더링 ---
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <span className="text-2xl">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white relative overflow-hidden">
      <Toaster position="top-center" />
      <DubbingHeader
        title={front_data.movie.title}
        category={front_data.movie.category}
        actorName={front_data.captions[0]?.actor?.name || ""}
      />
  
      {/* 본문 - 항상 중앙 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Video & Script */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition"
              >
                📜 스크립트 목록
              </button>
            </div>
            <VideoPlayer
              videoId={front_data.movie.youtube_url.split("v=")[1]}
              onTimeUpdate={handleTimeUpdate}
              startTime={getCurrentScriptPlaybackRange().startTime}
              endTime={getCurrentScriptPlaybackRange().endTime}
              disableAutoPause={true}
              ref={videoPlayerRef}
              onEndTimeReached={() => {
                pitchRef.current?.handleExternalStop?.();
              }}
              onPlay={handlePlay}
              onPause={handlePause}
            />
            <ScriptDisplay
              captions={front_data.captions}
              currentScriptIndex={currentScriptIndex}
              onScriptChange={setCurrentScriptIndex}
              currentVideoTime={currentVideoTime}
              playbackRange={getCurrentScriptPlaybackRange()}
              videoPlayerRef={videoPlayerRef}
              currentWords={currentWords}
            />
          </div>
  
          {/* Right Column */}
          <div className="space-y-6">
            <PitchComparison
              ref={pitchRef}
              currentScriptIndex={currentScriptIndex}
              captions={front_data.captions}
              tokenId={id}
              serverPitchData={serverPitchData}
              videoPlayerRef={videoPlayerRef}
              onNextScript={setCurrentScriptIndex}
              onPlay={handlePlay}
              onPause={handlePause}
              isVideoPlaying={isVideoPlaying}
              scripts={tokenData?.scripts}
              onUploadComplete={(success, jobIds) => {
                console.log('[DEBUG] onUploadComplete', { success, jobIds });
                if (success && Array.isArray(jobIds)) {
                  setMultiJobIds(jobIds);
                }
              }}
            />
          </div>
        </div>
  
        {/* 결과 섹션 */}
        {showCompleted && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 30 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <TestResultAnalysisSection
              result={front_data}
              currentScriptIndex={currentScriptIndex}
              getScoreColor={getScoreColor}
              getScoreLevel={getScoreLevel}
              serverPitchData={serverPitchData}
              id={id}
              resultsRef={resultsRef as React.RefObject<HTMLDivElement>}
            />
          </motion.div>
        )}
  
        {/* 결과 보기 버튼 */}
        {!showCompleted && (
          <div className="text-center mt-8">
            <button
              onClick={showResultsSection}
              className="px-8 py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white rounded-lg text-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              결과 보기
            </button>
          </div>
        )}
      </div>
  
      {/* Sidebar - 오른쪽 고정 */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        captions={front_data.captions}
        currentScriptIndex={currentScriptIndex}
        onScriptSelect={handleScriptSelect}
        actorName="톰 행크스"
        movieTitle="포레스트 검프"
        analyzedCount={12}
        totalCount={191}
      />
    </div>
  );
  
} 