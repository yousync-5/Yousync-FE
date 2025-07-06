"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { MyPitchGraph } from "@/components/graph/MyPitchGraph";
import YouTube from "react-youtube";
import {
  StarIcon,
  ChartBarIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  CpuChipIcon,
  CodeBracketIcon,
} from "@heroicons/react/24/solid";

// 임시 ServerPitchGraph 컴포넌트
const ServerPitchGraph = ({ pitchData }: { pitchData: number[] }) => {
  return (
    <div className="w-full h-full relative">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
        <defs>
          <linearGradient id="pitchGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path
          d={`M 0,${40 - (pitchData[0] / 100) * 40} ${pitchData.map((value, index) => 
            `L ${(index / (pitchData.length - 1)) * 100},${40 - (value / 100) * 40}`
          ).join(' ')}`}
          stroke="#10B981"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={`M 0,${40 - (pitchData[0] / 100) * 40} ${pitchData.map((value, index) => 
            `L ${(index / (pitchData.length - 1)) * 100},${40 - (value / 100) * 40}`
          ).join(' ')} L 100,40 L 0,40 Z`}
          fill="url(#pitchGradient)"
        />
      </svg>
    </div>
  );
};

// 임시 UserPitchGraph 컴포넌트
const UserPitchGraph = ({ pitchData }: { pitchData: number[] }) => {
  return (
    <div className="w-full h-full relative">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
        <defs>
          <linearGradient id="userPitchGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#34D399" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#34D399" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path
          d={`M 0,${40 - (pitchData[0] / 100) * 40} ${pitchData.map((value, index) => 
            `L ${(index / (pitchData.length - 1)) * 100},${40 - (value / 100) * 40}`
          ).join(' ')}`}
          stroke="#34D399"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={`M 0,${40 - (pitchData[0] / 100) * 40} ${pitchData.map((value, index) => 
            `L ${(index / (pitchData.length - 1)) * 100},${40 - (value / 100) * 40}`
          ).join(' ')} L 100,40 L 0,40 Z`}
          fill="url(#userPitchGradient)"
        />
      </svg>
    </div>
  );
};

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
  captions: Array<{
    id: number;
    script: string;
    translation: string;
    start_time: number;
    end_time: number;
  }>;
}

export default function TestResultPage() {
  const router = useRouter();
  const { id } = router.query;
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedCaption, setSelectedCaption] = useState(0);
  const [currentScriptIndex, setCurrentScriptIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;

    // 임시 더미 데이터 생성
    const dummyResult: TestResult = {
      id: 1,
      user_id: 1,
      movie_id: 1,
      score: 85,
      accuracy: 88,
      fluency: 82,
      pronunciation: 90,
      created_at: new Date().toISOString(),
      user_pitch_data: Array.from({ length: 50 }, () => Math.random() * 100),
      server_pitch_data: Array.from({ length: 50 }, () => Math.random() * 100),
      audio_url: "https://example.com/audio.mp3",
      movie: {
        title: "The Great Gatsby",
        youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        category: "Drama"
      },
      captions: [
        {
          id: 1,
          script: "So we beat on, boats against the current, borne back ceaselessly into the past.",
          translation: "그래서 우리는 계속 앞으로 나아가며, 과거로 끊임없이 밀려오는 물결에 맞서 배를 저어갑니다.",
          start_time: 0,
          end_time: 5
        },
        {
          id: 2,
          script: "I hope she'll be a fool—that's the best thing a girl can be in this world.",
          translation: "그녀가 바보가 되기를 바랍니다—이 세상에서 여자가 될 수 있는 가장 좋은 일이니까요.",
          start_time: 5,
          end_time: 10
        },
        {
          id: 3,
          script: "The only way to do great work is to love what you do.",
          translation: "훌륭한 일을 하는 유일한 방법은 당신이 하는 일을 사랑하는 것입니다.",
          start_time: 10,
          end_time: 15
        }
      ]
    };

    setResult(dummyResult);
    setLoading(false);
  }, [id]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 80) return "text-yellow-500";
    if (score >= 70) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreLevel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 70) return "Fair";
    return "Poor";
  };

  const showResultsSection = () => {
    setShowResults(true);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-white text-xl">결과를 불러오는 중...</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-white text-xl">결과를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{result.movie.title}</h1>
              <p className="text-gray-400 text-sm">{result.movie.category}</p>
            </div>
            <button
              onClick={() => router.back()}
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
                    playerVars: { controls: 1, modestbranding: 1 },
                  }}
                />
              </div>
            </div>

                         {/* Script Display */}
             <div className="bg-gray-900 rounded-xl p-6">
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
            <div className="bg-gray-900 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Pitch Comparison</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400 mb-2">Your Pitch</div>
                  <div className="w-full h-16 bg-gray-800 rounded">
                    <MyPitchGraph currentIdx={0} />
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-2">Original Pitch</div>
                  <div className="w-full h-16 bg-gray-800 rounded">
                    <ServerPitchGraph pitchData={result.server_pitch_data} />
                  </div>
                </div>
              </div>
            </div>

            
          </div>
        </div>

        {/* Test Page Results Section */}
        {showResults && (
          <div ref={resultsRef} className="mt-16">
            <div className="space-y-8">
              {/* Score Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-900 border-2 border-gray-800 rounded-xl p-6 hover:border-green-500 transition-all duration-300">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg mb-3 bg-green-900">
                      <StarIcon className="w-6 h-6 text-green-400" />
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                      {result.score}
                    </div>
                    <div className="text-sm text-green-400">Overall Score</div>
                    <div className="text-xs text-gray-500 mt-1">{getScoreLevel(result.score)}</div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${result.score}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 border-2 border-gray-800 rounded-xl p-6 hover:border-green-500 transition-all duration-300">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg mb-3 bg-green-900">
                      <ChartBarIcon className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-green-400">{result.accuracy}</div>
                    <div className="text-sm text-green-400">Accuracy</div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${result.accuracy}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 border-2 border-gray-800 rounded-xl p-6 hover:border-green-500 transition-all duration-300">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg mb-3 bg-green-900">
                      <PlayIcon className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-green-400">{result.fluency}</div>
                    <div className="text-sm text-green-400">Fluency</div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${result.fluency}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 border-2 border-gray-800 rounded-xl p-6 hover:border-green-500 transition-all duration-300">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg mb-3 bg-green-900">
                      <ArrowPathIcon className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-green-400">{result.pronunciation}</div>
                    <div className="text-sm text-green-400">Pronunciation</div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${result.pronunciation}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="bg-gray-900 border-2 border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 text-white">Detailed Analysis</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-medium mb-3 text-white">Score Breakdown</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white">Overall Score</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${result.score}%` }}
                            />
                          </div>
                          <span className="text-sm text-green-400">{result.score}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white">Accuracy</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${result.accuracy}%` }}
                            />
                          </div>
                          <span className="text-sm text-green-400">{result.accuracy}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white">Fluency</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${result.fluency}%` }}
                            />
                          </div>
                          <span className="text-sm text-green-400">{result.fluency}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white">Pronunciation</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${result.pronunciation}%` }}
                            />
                          </div>
                          <span className="text-sm text-green-400">{result.pronunciation}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium mb-3 text-white">Performance Summary</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Best Area:</span>
                        <span className="text-green-400">Pronunciation</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Needs Improvement:</span>
                        <span className="text-yellow-500">Fluency</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Overall Rating:</span>
                        <span className="text-green-400">Good</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sentence Analysis */}
              <div className="bg-gray-900 border-2 border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-6 text-white">Sentence Analysis</h3>
                <div className="space-y-6">
                  {result.captions.map((caption) => (
                    <div
                      key={caption.id}
                      className="p-6 rounded-lg bg-gray-800 border border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {caption.id}
                          </div>
                          <div>
                            <div className="text-white font-medium">{caption.script}</div>
                            <div className="text-gray-400 text-sm">{caption.translation}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-400">85</div>
                          <div className="text-xs text-gray-500">Score</div>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-green-400 mb-2">Your Pitch</div>
                          <div className="w-full h-20 bg-gray-700 rounded border border-green-500 relative overflow-hidden">
                            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                              <defs>
                                <linearGradient id={`userPitchGradient${caption.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                  <stop offset="0%" stopColor="#34D399" stopOpacity="0.8" />
                                  <stop offset="100%" stopColor="#34D399" stopOpacity="0.2" />
                                </linearGradient>
                              </defs>
                              <path
                                d={`M 0,${40 - (result.user_pitch_data[0] / 100) * 40} ${result.user_pitch_data.slice(0, 20).map((value, index) => 
                                  `L ${(index / 19) * 100},${40 - (value / 100) * 40}`
                                ).join(' ')}`}
                                stroke="#34D399"
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d={`M 0,${40 - (result.user_pitch_data[0] / 100) * 40} ${result.user_pitch_data.slice(0, 20).map((value, index) => 
                                  `L ${(index / 19) * 100},${40 - (value / 100) * 40}`
                                ).join(' ')} L 100,40 L 0,40 Z`}
                                fill={`url(#userPitchGradient${caption.id})`}
                              />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-green-400 mb-2">Original Pitch</div>
                          <div className="w-full h-20 bg-gray-700 rounded border border-green-500 relative overflow-hidden">
                            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                              <defs>
                                <linearGradient id={`serverPitchGradient${caption.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.2" />
                                </linearGradient>
                              </defs>
                              <path
                                d={`M 0,${40 - (result.server_pitch_data[0] / 100) * 40} ${result.server_pitch_data.slice(0, 20).map((value, index) => 
                                  `L ${(index / 19) * 100},${40 - (value / 100) * 40}`
                                ).join(' ')}`}
                                stroke="#10B981"
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d={`M 0,${40 - (result.server_pitch_data[0] / 100) * 40} ${result.server_pitch_data.slice(0, 20).map((value, index) => 
                                  `L ${(index / 19) * 100},${40 - (value / 100) * 40}`
                                ).join(' ')} L 100,40 L 0,40 Z`}
                                fill={`url(#serverPitchGradient${caption.id})`}
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-400">92%</div>
                          <div className="text-xs text-gray-500">Similarity</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-400">88%</div>
                          <div className="text-xs text-gray-500">Accuracy</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-400">85%</div>
                          <div className="text-xs text-gray-500">Timing</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overall Pitch Comparison */}
              <div className="bg-gray-900 border-2 border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-6 text-white">Overall Pitch Comparison</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-green-400 mb-2">Your Pitch</div>
                    <div className="w-full h-16 bg-gray-700 rounded border border-green-500 relative overflow-hidden">
                      <UserPitchGraph pitchData={result.user_pitch_data} />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-green-400 mb-2">Original Pitch</div>
                    <div className="w-full h-16 bg-gray-700 rounded border border-green-500 relative overflow-hidden">
                      <ServerPitchGraph pitchData={result.server_pitch_data} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
