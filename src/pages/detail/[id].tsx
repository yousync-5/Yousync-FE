"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import YouTube from "react-youtube";
import {
  StarIcon,
  ChartBarIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
} from "@heroicons/react/24/solid";
import ServerPitchGraph from "@/components/graph/ServerPitchGraph";
import type { TokenDetailResponse, ServerPitch, ScriptItem } from "@/type/PitchdataType";
import type { Caption } from "@/type/PitchdataType";
import axios from "axios";
import { MyPitchGraph } from '@/components/graph/MyPitchGraph';
import { useAudioStream } from "@/hooks/useAudioStream";
import TestResultAnalysisSection from "@/components/result/TestResultAnalysisSection";
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

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
  const router = useRouter();
  const {
    query: { id },
    isReady,
  } = router;
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
    if (!isReady || !id) return;
    
    const tokenId = Array.isArray(id) ? id[0] : id;
    
    // 토큰 데이터와 서버 피치 데이터 가져오기
    fetchTokenData(tokenId);
    fetchServerPitchData(tokenId);
    

    
    setLoading(false);
  }, [isReady, id, fetchTokenData, fetchServerPitchData]);

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
      <header className="bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{result.movie.title}</h1>
              <p className="text-gray-400 text-sm">{result.movie.category}</p>
            </div>
            <button
              onClick={() => {
                // 쿼리스트링에 modalId가 있으면 홈페이지로 돌아가면서 모달을 열도록 설정
                if (router.query.modalId) {
                  router.push({ 
                    pathname: '/', 
                    query: { modalId: router.query.modalId as string } 
                  });
                } else {
                  router.back();
                }
              }}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              뒤로가기
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Video & Score */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="bg-black rounded-xl overflow-hidden">
              <div className="relative w-full pt-[56.25%]">
                <YouTube
                  videoId={result.movie.youtube_url.split("v=")[1]}
                  className="absolute top-0 left-0 w-full h-full"
                  opts={{
                    width: "100%",
                    height: "100%",
                    playerVars: {
                      autoplay: 0,
                      controls: 1,
                      modestbranding: 1,
                      rel: 0,
                      showinfo: 0,
                    },
                  }}
                />
              </div>
            </div>

             {/* Script Display */}
             <div className="bg-gray-900 rounded-xl p-6 w-[77em] flex flex-col relative">

               <h3 className="text-lg font-semibold mb-4">Current Script</h3>
               
               {/* Progress */}
               <div className="flex items-center justify-center mb-4">
                 <div className="flex items-center space-x-2">
                   <span className="text-sm text-gray-400">
                     Script {currentScriptIndex + 1} of {result.captions.length}
                   </span>
                   <div className="w-16 bg-gray-600 rounded-full h-1.5">
                     <div 
                       className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 h-1.5 rounded-full transition-all duration-500"
                       style={{ width: `${((currentScriptIndex + 1) / result.captions.length) * 100}%` }}
                     />
                   </div>
                   <span className="text-xs text-green-400 font-medium">
                     {Math.round(((currentScriptIndex + 1) / result.captions.length) * 100)}%
                   </span>
                 </div>
               </div>
               
               {/* Current Script Content with Navigation */}
               <div className="flex items-center space-x-4">
                 <button
                   onClick={() => setCurrentScriptIndex(Math.max(0, currentScriptIndex - 1))}
                   disabled={currentScriptIndex === 0}
                   className={`p-2 rounded-full transition-all duration-200 ${
                     currentScriptIndex === 0 
                       ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                       : 'bg-gray-700 text-green-400 hover:bg-gray-600 hover:text-green-300'
                   }`}
                 >
                   <ChevronLeftIcon className="w-5 h-5" />
                 </button>
                 
                 <div className="bg-gray-800 rounded-lg p-4 flex-1">
                   <div className="text-sm text-gray-400 mb-2">
                     {String(Math.floor(result.captions[currentScriptIndex]?.start_time / 60)).padStart(2, "0")}:
                     {String(Math.floor(result.captions[currentScriptIndex]?.start_time % 60)).padStart(2, "0")} - 
                     {String(Math.floor(result.captions[currentScriptIndex]?.end_time / 60)).padStart(2, "0")}:
                     {String(Math.floor(result.captions[currentScriptIndex]?.end_time % 60)).padStart(2, "0")}
                   </div>
                   <div className="text-white text-lg mb-2">
                     "{result.captions[currentScriptIndex]?.script}"
                   </div>
                   <div className="text-sm text-gray-400">
                     {result.captions[currentScriptIndex]?.translation}
                   </div>
                 </div>
                 
                 <button
                   onClick={() => setCurrentScriptIndex(Math.min(result.captions.length - 1, currentScriptIndex + 1))}
                   disabled={currentScriptIndex === result.captions.length - 1}
                   className={`p-2 rounded-full transition-all duration-200 ${
                     currentScriptIndex === result.captions.length - 1 
                       ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                       : 'bg-gray-700 text-green-400 hover:bg-gray-600 hover:text-green-300'
                   }`}
                 >
                   <ChevronRightIcon className="w-5 h-5" />
                 </button>
               </div>
             </div>
          </div>

          {/* Right Column - Pitch Graphs & Captions */}
          <div className="space-y-6">
            {/* Pitch Comparison */}
            <div className="bg-gray-900 rounded-xl p-6 h-[28em]">
              <h3 className="text-lg font-semibold mb-4">Pitch Comparison</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400 mb-2">Your Pitch</div>
                  <div className="w-full h-16 bg-gray-800 rounded">
                    <MyPitchGraph currentIdx={currentScriptIndex} />
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-2">Original Pitch</div>
                  <div className="w-full h-16 bg-gray-800 rounded">
                    <ServerPitchGraph
                      captionState={{ currentIdx: currentScriptIndex, captions: result.captions as Caption[] }}
                      token_id={Array.isArray(id) ? id[0] : id}
                      serverPitchData={serverPitchData}
                    />
                  </div>
                </div>
              </div>
            </div>

            
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
            resultsRef={resultsRef}
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
