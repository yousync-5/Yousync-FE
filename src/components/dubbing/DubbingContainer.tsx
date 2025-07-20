"use client";

import React, { useRef, useCallback, useEffect, useState } from "react";
import DubbingHeader from "@/components/dubbing/DubbingHeader";
import VideoPlayer, { VideoPlayerRef } from "@/components/dubbing/VideoPlayer";
import ScriptDisplay from "@/components/dubbing/ScriptDisplay";
import PitchComparison from "@/components/dubbing/PitchComparison";
import ResultContainer from "@/components/result/ResultComponent";

import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { useAudioStream } from "@/hooks/useAudioStream";
import { useJobIdsStore } from '@/store/useJobIdsStore';
import { useDubbingState } from "@/hooks/useDubbingState";
import { useBackgroundAudio } from "@/hooks/useBackgroundAudio";
import DubbingListenModal from "@/components/result/DubbingListenModal";
import Sidebar from "@/components/ui/Sidebar";


interface DubbingContainerProps {
  tokenData: any;
  front_data: any;
  serverPitchData: any;
  id: string;
  modalId?: string;
}

const DubbingContainer = ({
  tokenData,
  front_data,
  serverPitchData,
  id,
  modalId,
}: DubbingContainerProps) => {
  // 데이터 준비 여부 체크
  const isReady = !!(front_data && tokenData && serverPitchData);
  
  // 기본 상태들을 훅으로 관리
  const dubbingState = useDubbingState(front_data?.captions?.length || 0, {
    onScriptChange: (index: number) => {
      // 스크립트 변경 시 추가 로직이 필요하면 여기에
    },
    onPlay: () => {
      // 재생 시 추가 로직이 필요하면 여기에
    },
    onPause: () => {
      // 일시정지 시 추가 로직이 필요하면 여기에
    },
    onRecordingChange: (recording: boolean) => {
      // 녹음 상태 변경 시 추가 로직이 필요하면 여기에
    }
  });

  // 기존 상태들을 훅에서 가져오기
  const {
    isSidebarOpen,
    showCompleted,
    showResults,
    currentScriptIndex,
    currentVideoTime,
    isVideoPlaying,
    finalResults,
    latestResultByScript,
    recording,
    recordingCompleted,
    isAnalyzing,
    setIsSidebarOpen,
    setShowCompleted,
    setShowResults,
    setCurrentScriptIndex,
    setCurrentVideoTime,
    setIsVideoPlaying,
    setFinalResults,
    setLatestResultByScript,
    setRecording,
    setRecordingCompleted,
    setIsAnalyzing,
    handleRecordingComplete,
    handlePlay,
    handlePause,
    handleScriptSelect
  } = dubbingState;

  const videoPlayerRef = useRef<VideoPlayerRef | null>(null);
  const pitchRef = useRef<{ handleExternalStop: () => void, stopLooping?: () => void } | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const { cleanupMic } = useAudioStream();

  // zustand에서 multiJobIds 읽기
  const multiJobIds = useJobIdsStore((state) => state.multiJobIds);
  const setMultiJobIds = useJobIdsStore((state) => state.setMultiJobIds);

  // 🆕 분석 결과 수신 상태 추가
  const [hasAnalysisResults, setHasAnalysisResults] = useState(false);

  // 🆕 더빙본 들어보기 모달 상태
  const [isDubbingListenModalOpen, setIsDubbingListenModalOpen] = useState(false);

  // 🆕 hasAnalysisResults 상태 디버깅
  useEffect(() => {
    console.log('[🔍 상태 확인] hasAnalysisResults:', hasAnalysisResults);
    console.log('[🔍 상태 확인] showResults:', showResults);
    console.log('[🔍 상태 확인] showCompleted:', showCompleted);
  }, [hasAnalysisResults, showResults, showCompleted]);

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
    console.log('[SSE] API URL:', `${process.env.NEXT_PUBLIC_API_BASE_URL}/scripts/analysis-progress/${jobId}`);
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
        // word_analysis에서 script 재구성
        const wordArr = data.result.result.word_analysis?.map((w: any) => w.word) || [];
        const joinedScript = wordArr.join(' ').replace(/\s+/g, ' ').trim();
        const resultScriptNorm = normalizeScript(joinedScript);

        const captionsNorm = front_data.captions.map((c: any) => normalizeScript(c.script));
        const idx = captionsNorm.findIndex((normScript: string) => normScript === resultScriptNorm);

        console.log('[디버깅] jobId:', jobId);
        console.log('[디버깅] joinedScript:', joinedScript);
        console.log('[디버깅] resultScriptNorm:', resultScriptNorm);
        console.log('[디버깅] captionsNorm:', captionsNorm);
        console.log('[디버깅] idx:', idx);

        // 1. jobId 기준으로 저장 (진행상황용)
        setFinalResults((prev: Record<string, any>) => ({
          ...prev,
          [jobId]: data.result.result
        }));
        
        // 2. script 기준으로 마지막 결과만 저장 (문장별 결과용)
        setLatestResultByScript((prev: Record<string, any>) => {
          const newState = {
            ...prev,
            [resultScriptNorm]: data.result.result
          };
          console.log('[디버깅] latestResultByScript 업데이트:');
          console.log('- 이전 상태:', Object.keys(prev));
          console.log('- 새로 추가된 키:', resultScriptNorm);
          console.log('- 업데이트 후 전체 키:', Object.keys(newState));
          
          // 분석 결과가 도착하면 상태 초기화
          setRecordingCompleted(false);
          setIsAnalyzing(false);
          return newState;
        });

        // 🆕 분석 결과 수신 시 상태 업데이트
        setHasAnalysisResults(true);
        console.log(`[✅ 분석 결과 수신] Job ID ${jobId} 분석 완료`);
        console.log(`[✅ 상태 업데이트] hasAnalysisResults를 true로 설정`);
        console.log(`[✅ 분석 데이터] 받은 결과:`, data.result.result);
      }
    
      if (["completed", "failed", "error"].includes(data.status)) {
        console.log(`[SSE][${jobId}] 상태 변경: ${data.status}`, data);
        sse.close();
        connectedJobIdsRef.current.delete(jobId);
      }
    };

    sse.onerror = (e) => {
      console.error(`[SSE][${jobId}] 에러 발생`, e);
      console.error(`[SSE][${jobId}] 에러 타입:`, e.type);
      console.error(`[SSE][${jobId}] 에러 상태:`, sse.readyState);
      console.error(`[SSE][${jobId}] URL:`, sse.url);
      
      // 브라우저의 자동 재연결에 맡기고 수동 재연결 로직 제거
      if (sse.readyState === EventSource.CLOSED) {
        console.log(`[SSE][${jobId}] 연결이 닫힘 - 브라우저 자동 재연결 대기`);
        connectedJobIdsRef.current.delete(jobId);
      }
    };
  });

  return () => {
    sseList.forEach((sse) => {
      console.log('[SSE] 연결 해제:', sse.url);
      sse.close();
    });
  };
}, [multiJobIds]);

// ✅ 결과 개수로 전체 완료 감지
useEffect(() => {
  if (!multiJobIds.length) return;
  
  const totalCount = front_data.captions.length;
  const resultCount = Object.keys(latestResultByScript).length;
  const allDone = resultCount === totalCount && totalCount > 0;
  
  console.log('[완료 감지] totalCount:', totalCount, 'resultCount:', resultCount, 'allDone:', allDone);
  
  if (allDone) {
    console.log('[완료 감지] 분석 완료 - showCompleted를 true로 설정');
    // 토스트 강제 해제
    toast.dismiss("analysis-loading-toast");
    toast.dismiss(); // 모든 토스트 해제
    setShowCompleted(true);
  } else {
    setShowCompleted(false);
  }
}, [latestResultByScript, multiJobIds.length, front_data.captions.length]);

// 분석 완료 시 토스트 해제
// useEffect(() => {
//   const totalCount = front_data.captions.length;
//   const resultCount = Object.keys(latestResultByScript).length;
  
//   if (resultCount > 0 && resultCount < totalCount) {
//     // 분석 결과가 추가되었을 때 토스트 해제
//     setTimeout(() => {
//       toast.dismiss("analysis-loading-toast");
//     }, 100);
//   }
// }, [latestResultByScript, front_data.captions.length]);

// ✅ 새로운 분석 시작 시 연결 목록 초기화
useEffect(() => {
  if (multiJobIds.length > 0) {
    console.log('새로운 분석 시작 - 연결 목록 초기화');
    connectedJobIdsRef.current.clear();
  }
}, [multiJobIds.length]);

  // 문장 개수만큼 분석 결과가 쌓이면 콘솔 출력
  useEffect(() => {
    const totalCount = front_data.captions.length;
    const resultCount = Object.keys(latestResultByScript).length;
  
    console.log("🧪 useEffect 실행됨");
    console.log("📌 totalCount (captions.length):", totalCount);
    console.log("📌 resultCount (latestResultByScript 개수):", resultCount);
    console.log("📌 keys:", Object.keys(latestResultByScript));
    console.log(JSON.stringify(latestResultByScript, null, 2));
    if (resultCount === totalCount && totalCount > 0) {
      console.log('✅ 모든 문장 분석 결과가 도착했습니다.');
      console.log('📊 latestResultByScript 전체 내용:');
      console.log(JSON.stringify(latestResultByScript, null, 2));
    }
  }, [latestResultByScript, front_data.captions]);

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

  // 결과 진행상황 토스트 (완전 재작성)


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

  // 🆕 결과 조회 버튼 클릭 핸들러
  const handleViewResults = useCallback(() => {
    setShowResults(true);
    // 레이아웃 안정화를 위한 약간의 지연
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

  // 기존 함수들을 훅의 함수로 대체
  const customHandlePlay = () => {
    handlePlay();
  };

  const customHandlePause = () => {
    handlePause();
  };

  // 문장 클릭 시 녹음 중지, 영상 이동 및 정지, 인덱스 변경
  const customHandleScriptSelect = (index: number) => {
    // 1. 녹음 중이면 PitchComparison의 녹음 중지 핸들 호출
    pitchRef.current?.handleExternalStop();

    // 2. 영상 해당 시점으로 이동 및 정지
    const startTime = front_data.captions[index]?.start_time ?? 0;
    videoPlayerRef.current?.seekTo(startTime);
    videoPlayerRef.current?.pauseVideo();

    // 3. 문장 인덱스 변경
    handleScriptSelect(index);
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

  // 문자열 정규화 함수 (소문자화 + 알파벳/숫자만 남김)
  function normalizeScript(str: any) {
    if (!str || typeof str !== 'string') return '';
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  const [showAnalysisResult, setShowAnalysisResult] = useState(false);
  const [isRecordingPlayback, setIsRecordingPlayback] = useState(false);

  // 현재 문장의 분석 결과 가져오기
  const currentScript = front_data.captions[currentScriptIndex];
  const normKey = normalizeScript(currentScript?.script);
  const analysisResult = latestResultByScript[normKey];

  // 분석 결과가 들어오면 계속 표시
  useEffect(() => {
    if (analysisResult) {
      console.log('[DubbingContainer] 분석 결과 도착');
      setShowAnalysisResult(true);
    }
  }, [analysisResult]);

  // 녹음이 시작되면 분석 결과 표시 해제
  useEffect(() => {
    if (recording) {
      console.log('[DubbingContainer] 녹음 시작 - 분석 결과 표시 해제');
      setShowAnalysisResult(false);
    }
  }, [recording]);

  // 자동재생 상태에 따라 분석 결과 표시 제어
  useEffect(() => {
    if (isRecordingPlayback) {
      console.log('[DubbingContainer] 자동재생 시작 - 분석 결과 표시 해제');
      setShowAnalysisResult(false);
    } else if (analysisResult && !recording) {
      console.log('[DubbingContainer] 자동재생 완료 - 분석 결과 다시 표시');
      setShowAnalysisResult(true);
    }
  }, [isRecordingPlayback, analysisResult, recording]);
  // Job ID 유효성 확인 함수
  const validateJobId = async (jobId: string): Promise<boolean> => {
    try {
      console.log(`[DEBUG] Job ID 유효성 확인: ${jobId}`);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/scripts/analysis-progress/${jobId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`[DEBUG] Job ID ${jobId} 상태:`, data.status);
        return data.status !== 'failed' && data.status !== 'error';
      } else {
        console.error(`[DEBUG] Job ID ${jobId} 확인 실패:`, response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error(`[DEBUG] Job ID ${jobId} 확인 중 에러:`, error);
      return false;
    }
  };

  // Job ID 유효성 확인 후 SSE 연결
  const connectSSEWithValidation = async (jobId: string) => {
    const isValid = await validateJobId(jobId);
    if (!isValid) {
      console.error(`[SSE] Job ID ${jobId}가 유효하지 않습니다.`);
      return null;
    }
    
    console.log(`[SSE] Job ID ${jobId} 유효성 확인 완료, SSE 연결 시작`);
    return new EventSource(`${process.env.NEXT_PUBLIC_API_BASE_URL}/scripts/analysis-progress/${jobId}`);
  };

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
      <div className="w-full mx-auto px-2 sm:px-4 md:px-6 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Left Column - Video & Script */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
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
              onPlay={customHandlePlay}
              onPause={customHandlePause}
            />
            <ScriptDisplay
              captions={front_data.captions}
              currentScriptIndex={currentScriptIndex}
              onScriptChange={setCurrentScriptIndex}
              currentVideoTime={currentVideoTime}
              playbackRange={getCurrentScriptPlaybackRange()}
              videoPlayerRef={videoPlayerRef}
              currentWords={currentWords}
              recording={recording}
              recordingCompleted={recordingCompleted}
              isAnalyzing={isAnalyzing}
              onStopLooping={() => pitchRef.current?.stopLooping?.()}
              showAnalysisResult={showAnalysisResult}
              analysisResult={analysisResult}
            />
          </div>
  
          {/* Right Column */}
          <div className="space-y-6">
            {/* latestResultByScript 값 확인용 로그 (렌더링 중이 아닌 useEffect에서 출력) */}
            <PitchComparison
              ref={pitchRef}
              currentScriptIndex={currentScriptIndex}
              captions={front_data.captions}
              tokenId={id}
              serverPitchData={serverPitchData}
              videoPlayerRef={videoPlayerRef}
              onNextScript={setCurrentScriptIndex}
              onPlay={customHandlePlay}
              onPause={customHandlePause}
              isVideoPlaying={isVideoPlaying}
              scripts={tokenData?.scripts}
              onUploadComplete={(success, jobIds) => {
                console.log(`[🔄 DubbingContainer] onUploadComplete 콜백 호출됨`);
                console.log(`[📊 결과] success: ${success}, jobIds: ${JSON.stringify(jobIds)}`);
                
                if (success && Array.isArray(jobIds)) {
                  // 새로운 분석 시작 시에만 초기화 (기존 결과 유지)
                  if (multiJobIds.length === 0) {
                    console.log('[DEBUG] 새로운 분석 시작 - 상태 초기화');
                    setFinalResults({});
                    setLatestResultByScript({});
                  }
                  // 2. jobId와 문장 인덱스 매핑 콘솔 출력
                  jobIds.forEach((jobId, idx) => {
                    const script = front_data.captions[idx]?.script;
                    console.log(`[분석 요청] jobId: ${jobId}, 문장 인덱스: ${idx}, script: "${script}"`);
                  });
                  // 3. 새 jobIds로 세팅
                  setMultiJobIds(jobIds);
                  // 4. 분석 시작 상태 설정
                  setIsAnalyzing(true);
                }
              }}
              onRecordingChange={setRecording}
              handleRecordingComplete={handleRecordingComplete}
              showAnalysisResult={showAnalysisResult}
              recordingCompleted={recordingCompleted}
              onRecordingPlaybackChange={setIsRecordingPlayback}
              onOpenSidebar={() => setIsSidebarOpen(true)}
              onShowResults={handleViewResults}
              onOpenDubbingListenModal={() => setIsDubbingListenModalOpen(true)}
              latestResultByScript={latestResultByScript || {}}
            />
          </div>
        </div>
  
        {/* 🆕 결과 섹션을 기존 레이아웃 안에 통합 */}
        {showResults && (
          <div ref={resultsRef} className="result-container mt-8">
            <div className="animate-fade-in-up">
              <ResultContainer
                finalResults={finalResults}
                latestResultByScript={latestResultByScript}
                hasAnalysisResults={hasAnalysisResults}
                showResults={showResults}
                showCompleted={showCompleted}
                onViewResults={handleViewResults}
              />
            </div>
          </div>
        )}

        {/* 🆕 분석 결과 조회 버튼 - 항상 렌더링 */}
        {/* ResultViewBtn 완전히 제거 */}


      </div>
      {/* Sidebar - 오른쪽 고정 */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        captions={front_data.captions}
        currentScriptIndex={currentScriptIndex}
        onScriptSelect={customHandleScriptSelect}
        actorName="톰 행크스"
        movieTitle="포레스트 검프"
        analyzedCount={12}
        totalCount={191}
        recording={recording}
        onStopLooping={() => pitchRef.current?.stopLooping?.()}
        recordedScripts={recordingCompleted ? Array(front_data.captions.length).fill(false).map((_, i) => i === currentScriptIndex) : []}
        latestResultByScript={latestResultByScript}
        recordingCompleted={recordingCompleted}
      />

      {/* 더빙본 들어보기 모달 */}
      <DubbingListenModal
        open={isDubbingListenModalOpen}
        onClose={() => setIsDubbingListenModalOpen(false)}
        tokenId={Number(id)}
        modalId={modalId}
      />
    </div>
  );
}

export default DubbingContainer;