"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  StarIcon,
  ChartBarIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
} from "@heroicons/react/24/solid";
import type { TokenDetailResponse, ServerPitch, ScriptItem } from "@/types/pitch";
import type { Caption } from "@/types/caption";
import axios from "axios";
import { useAudioStream } from "@/hooks/useAudioStream";
import TestResultAnalysisSection from "@/components/result/TestResultAnalysisSection";
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import DubbingHeader from "@/components/dubbing/DubbingHeader";
import VideoPlayer, { VideoPlayerRef } from "@/components/dubbing/VideoPlayer";
import ScriptDisplay from "@/components/dubbing/ScriptDisplay";
import PitchComparison from "@/components/dubbing/PitchComparison";
import { useJobIdStore } from '@/store/useAudioStore';

interface TestResult {
  id: number;
  user_id: number;
  movie_id: number;
  score: number;
  accuracy: number;
  fluency: number;
  pronunciation: number;
  created_at: string;
  user_pitch_data: number[];
  server_pitch_data: number[];
  audio_url: string;
  movie: {
    title: string;
    youtube_url: string;
    category: string;
  };
  captions: Caption[];
}

export default function TestResultPage() {
  const params = useParams();
  const id = params.id as string;
  const searchParams = useSearchParams();
  const modalId = searchParams.get("modalId");
  
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [currentScriptIndex, setCurrentScriptIndex] = useState(0);
  const [tokenData, setTokenData] = useState<TokenDetailResponse | null>(null);
  const [serverPitchData, setServerPitchData] = useState<ServerPitch[]>([]);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);
  const videoPlayerRef = useRef<VideoPlayerRef | null>(null);
  const pitchRef = useRef<any>(null);
  const [score, setScore] = useState<number | null>(null);
  const jobId = useJobIdStore((state) => state.jobId);
  const sseRef = useRef<EventSource | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoEnded, setIsVideoEnded] = useState(false);

  // 오디오 스트림 초기화
  useAudioStream();

  // 현재 시간에 맞는 스크립트 인덱스 찾기
  const findScriptIndexByTime = useCallback((time: number) => {
    if (!result?.captions) return 0;
    
    // 현재 시간이 마지막 문장의 end_time을 초과하면 마지막 문장 인덱스 반환
    const lastIndex = result.captions.length - 1;
    const lastScript = result.captions[lastIndex];
    
    if (lastScript && time > lastScript.end_time) {
      return lastIndex;
    }
    
    // 일반적인 경우: 현재 시간에 맞는 스크립트 찾기
    const foundIndex = result.captions.findIndex(script => 
      time >= script.start_time && time <= script.end_time
    );
    
    // 찾지 못한 경우 -1 대신 0 반환 (첫 번째 문장)
    return foundIndex !== -1 ? foundIndex : 0;
  }, [result?.captions]);

  // 재생 범위 계산 (첫 번째 문장 시작 ~ 마지막 문장 종료)
  const getPlaybackRange = useCallback(() => {
    if (!result?.captions || result.captions.length === 0) {
      return { startTime: 0, endTime: undefined };
    }

    const firstScript = result.captions[0];
    const lastScript = result.captions[result.captions.length - 1];
    
    const range = {
      startTime: firstScript?.start_time || 0,  // 첫 번째 문장 시작
      endTime: lastScript?.end_time || undefined  // 마지막 문장 끝
    };

    return range;
  }, [result?.captions]);

  // 비디오 시간 업데이트 핸들러
  const handleTimeUpdate = useCallback((currentTime: number) => {
    setCurrentVideoTime(currentTime);

    // endTime에 도달해서 멈춘 경우, 인덱스 변경하지 않음
    const currentScript = result?.captions[currentScriptIndex];
    if (currentScript && currentTime >= currentScript.end_time) {
      return;
    }

    // 현재 시간에 맞는 스크립트 찾기
    const newScriptIndex = findScriptIndexByTime(currentTime);

    // 스크립트 인덱스가 변경되었고, 유효한 인덱스라면 업데이트
    if (newScriptIndex !== -1 && newScriptIndex !== currentScriptIndex) {
      setCurrentScriptIndex(newScriptIndex);
    }
  }, [currentScriptIndex, findScriptIndexByTime, result?.captions]);

  // 서버 피치 데이터 가져오기
  const fetchServerPitchData = useCallback(async (tokenId: string) => {
    try {
      const numericId = Number(tokenId);
      const response = await axios.get<ServerPitch[]>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/tokens/${numericId}`
      );
      setServerPitchData(response.data);

    } catch (error) {
      console.error('서버 피치 데이터 가져오기 실패:', error);
    }
  }, []);

  // 토큰 데이터 가져오기
  const fetchTokenData = useCallback(async (tokenId: string) => {
    try {
      const numericId = Number(tokenId);
      const response = await axios.get<TokenDetailResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/tokens/${numericId}`
      );
      setTokenData(response.data);

      
      // 토큰 데이터를 기반으로 result 생성
      const token = response.data;
      const testResult: TestResult = {
        id: token.id,
        user_id: 1, // 임시 값
        movie_id: token.id,
        score: 85, // 임시 점수
        accuracy: 88,
        fluency: 82,
        pronunciation: 90,
        created_at: new Date().toISOString(),
        user_pitch_data: Array.from({ length: 50 }, () => Math.random() * 100), // 임시 사용자 피치 데이터
        server_pitch_data: token.pitch?.map(p => p.hz || 0) || [],
        audio_url: token.bgvoice_url || "",
        movie: {
          title: token.token_name,
          youtube_url: token.youtube_url,
          category: token.category,
        },
        captions: token.scripts?.map((script, index) => ({
          id: script.id,
          movie_id: token.id,
          actor_id: 1, // 임시 값
          script: script.script,
          translation: script.translation || "",
          start_time: script.start_time,
          end_time: script.end_time,
          url: null,
          actor_pitch_values: [],
          background_audio_url: token.bgvoice_url || "",
          actor: {
            name: token.actor_name,
            id: 1
          }
        })) || [],
      };
      
      setResult(testResult);
    } catch (error) {
      console.error('토큰 데이터 가져오기 실패:', error);
    }
  }, []);

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

  useEffect(() => {
    if (!id) return;
    
    // 토큰 데이터와 서버 피치 데이터 가져오기
    fetchTokenData(id);
    fetchServerPitchData(id);
    
    setLoading(false);
  }, [id, fetchTokenData, fetchServerPitchData]);

  useEffect(() => {
    if (!jobId) return;
    if (sseRef.current) {
      console.log('[DEBUG] 이미 SSE 연결이 있습니다.');
      return;
    }
    console.log('[DEBUG] SSE 연결 시작:', jobId);
    const sse = new EventSource(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tokens/analysis-progress/${jobId}`);
    sseRef.current = sse;
    sse.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log("SSE 수신 : ", data);
      if (data.status === "completed" || data.status === "failed" || data.status === "error") {
        if (data.status === "completed") {
          setScore(data.score);
        }
        sse.close();
        sseRef.current = null;
      }
      // 진행 중이면 progress bar 등 갱신 가능
    };
    sse.onerror = (e) => {
      // 연결이 닫힌 경우(정상 종료 포함)에도 호출될 수 있음
      console.error("SSE 에러 발생", e);
      // sse.close()는 onmessage에서만 호출 (중복 close 방지)
      sseRef.current = null;
    };
    return () => {
      if (sseRef.current) {
        sseRef.current.close();
        sseRef.current = null;
      }
    };
  }, [jobId]);

  const showResultsSection = useCallback(() => {
    setShowResults(true);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  }, []);

  // 현재 스크립트의 재생 범위 계산 (마지막 문장에서만 endTime 설정)
  const getCurrentScriptPlaybackRange = useCallback(() => {
    if (!result?.captions || result.captions.length === 0) {
      return { startTime: 0, endTime: undefined };
    }

    const currentScript = result.captions[currentScriptIndex];
    if (!currentScript) {
      return { startTime: 0, endTime: undefined };
    }

    // 모든 문장에 대해 endTime 설정
    return {
      startTime: currentScript.start_time,
      endTime: currentScript.end_time
    };
  }, [result?.captions, currentScriptIndex]);

  // 현재 스크립트의 단어 데이터 추출
  const currentWords = tokenData?.scripts?.[currentScriptIndex]?.words || [];

  // 스크립트 인덱스가 바뀔 때 영상 시간도 새 문장 시작으로 맞춤
  useEffect(() => {
    if (result?.captions && result.captions[currentScriptIndex]) {
      setCurrentVideoTime(result.captions[currentScriptIndex].start_time);
    }
  }, [currentScriptIndex, result?.captions]);

  const handlePlay = () => {
    setIsVideoPlaying(true);
  };

  const handlePause = () => {
    setIsVideoPlaying(false);
  };

  if (loading) return <div>Loading...</div>;
  if (!result) return <div>No result found.</div>;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Toaster position="top-center" />
      
      {/* Header */}
      <DubbingHeader 
        title={result.movie.title}
        category={result.movie.category}
        actorName={result.captions[0]?.actor?.name || ""}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Video & Script */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <VideoPlayer 
              videoId={result.movie.youtube_url.split("v=")[1]} 
              onTimeUpdate={handleTimeUpdate}
              startTime={getCurrentScriptPlaybackRange().startTime}
              endTime={getCurrentScriptPlaybackRange().endTime}
              disableAutoPause={true}
              ref={videoPlayerRef}
              onEndTimeReached={() => {
                console.log('[DEBUG] 영상 endTime 도달 → PitchComparison에게 정지 요청');
                pitchRef.current?.handleExternalStop?.();
              }}
              onPlay={handlePlay}
              onPause={handlePause}
            />

            {/* Script Display */}
            <ScriptDisplay 
              captions={result.captions}
              currentScriptIndex={currentScriptIndex}
              onScriptChange={setCurrentScriptIndex}
              currentVideoTime={currentVideoTime}
              playbackRange={getPlaybackRange()}
              videoPlayerRef={videoPlayerRef}
              currentWords={currentWords}
            />
          </div>

          {/* Right Column - Pitch Comparison */}
          <div className="space-y-6">
            <PitchComparison 
              ref={pitchRef}
              currentScriptIndex={currentScriptIndex}
              captions={result.captions}
              tokenId={id}
              serverPitchData={serverPitchData}
              videoPlayerRef={videoPlayerRef}
              onNextScript={setCurrentScriptIndex}
              onPlay={handlePlay}
              onPause={handlePause}
              isVideoPlaying={isVideoPlaying}
            />
          </div>
        </div>

        {/* Test Page Results Section */}
        {showResults && (
          <TestResultAnalysisSection
            result={result}
            currentScriptIndex={currentScriptIndex}
            getScoreColor={getScoreColor}
            getScoreLevel={getScoreLevel}
            serverPitchData={serverPitchData}
            id={id}
            resultsRef={resultsRef as React.RefObject<HTMLDivElement>}
          />
        )}

        {/* Show Results Button */}
        {!showResults && (
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
    </div>
  );
} 