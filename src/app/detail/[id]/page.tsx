"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
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
import VideoPlayer from "@/components/dubbing/VideoPlayer";
import ScriptDisplay from "@/components/dubbing/ScriptDisplay";
import PitchComparison from "@/components/dubbing/PitchComparison";

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
  
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [currentScriptIndex, setCurrentScriptIndex] = useState(0);
  const [tokenData, setTokenData] = useState<TokenDetailResponse | null>(null);
  const [serverPitchData, setServerPitchData] = useState<ServerPitch[]>([]);
  const resultsRef = useRef<HTMLDivElement>(null);

  // 오디오 스트림 초기화
  useAudioStream();

  // 서버 피치 데이터 가져오기
  const fetchServerPitchData = useCallback(async (tokenId: string) => {
    try {
      const numericId = Number(tokenId);
      const response = await axios.get<ServerPitch[]>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/tokens/${numericId}`
      );
      setServerPitchData(response.data);
      console.log('서버 피치 데이터:', response.data);
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
      console.log('토큰 데이터:', response.data);
      
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

  const showResultsSection = useCallback(() => {
    setShowResults(true);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  }, []);

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
            <VideoPlayer videoId={result.movie.youtube_url.split("v=")[1]} />

            {/* Script Display */}
            <ScriptDisplay 
              captions={result.captions}
              currentScriptIndex={currentScriptIndex}
              onScriptChange={setCurrentScriptIndex}
            />
          </div>

          {/* Right Column - Pitch Comparison */}
          <div className="space-y-6">
            <PitchComparison 
              currentScriptIndex={currentScriptIndex}
              captions={result.captions}
              tokenId={id}
              serverPitchData={serverPitchData}
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