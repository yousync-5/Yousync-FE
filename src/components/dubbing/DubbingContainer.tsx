"use client";

import React, { useRef, useCallback, useEffect, useState } from "react";
import DubbingHeader from "@/components/dubbing/DubbingHeader";
import VideoPlayer, { VideoPlayerRef } from "@/components/dubbing/VideoPlayer";
import ScriptDisplay from "@/components/dubbing/ScriptDisplay";
import ResultContainer from "@/components/result/ResultComponent";
import RecordingCountdown from "@/components/dubbing/RecordingCountdown";

import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { useAudioStream } from "@/hooks/useAudioStream";
import { useJobIdsStore } from '@/store/useJobIdsStore';
import { useDubbingState } from "@/hooks/useDubbingState";
import { useBackgroundAudio } from "@/hooks/useBackgroundAudio";
import DubbingListenModal from "@/components/result/DubbingListenModal";
import Sidebar from "@/components/ui/Sidebar";
import { useTokenStore } from '@/store/useTokenStore';
import { useDubbingRecorder } from '@/hooks/useDubbingRecorder';
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
// 듀엣 모드에 필요한 컴포넌트 import
import { useDuetTokenStore } from '@/store/useDuetTokenStore';

// 전역 타입 선언 (window 객체 확장)
declare global {
  interface Window {
    loopIntervalId?: NodeJS.Timeout;
  }
}



interface DubbingContainerProps {
  tokenData: any;
  front_data: any;
  serverPitchData: any;
  id: string;
  modalId?: string;
  isDuet?: boolean; // 듀엣 더빙 모드 여부
  selectedActor?: string; // 선택한 배우 ID
}

const DubbingContainer = ({
  tokenData,
  front_data,
  serverPitchData,
  id,
  modalId,
  isDuet = false, // 기본값은 일반 더빙 모드
  selectedActor,
}: DubbingContainerProps) => {
  // 듀엣 모드에서 자동 스크립트 전환 여부를 결정하는 플래그
  const [allowAutoScriptChange, setAllowAutoScriptChange] = useState(false);

  // 데이터 준비 여부 체크
  const isReady = !!(front_data && tokenData && serverPitchData);

  // 현재 대사가 '내 대사'인지 확인하는 함수 (듀엣 모드에서만 사용)
  const isMyLine = useCallback((scriptIndex: number) => {
    if (!isDuet || !front_data?.captions) return true; // 일반 모드에서는 항상 true
    const currentScript = front_data.captions[scriptIndex];
    // 듀엣 모드에서는 actor.id가 1인 대사가 '내 대사'
    const result = currentScript?.actor?.id === 1;
    console.log(`[isMyLine] 스크립트 ${scriptIndex}번: ${result ? '내 대사' : '상대방 대사'}, actor.id: ${currentScript?.actor?.id}`);
    return result;
  }, [isDuet, front_data?.captions]);

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
  }, true); // 초기에 사이드바를 열어두기 위해 true로 설정

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
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const { cleanupMic } = useAudioStream();



  // zustand에서 multiJobIds 읽기
  const multiJobIds = useJobIdsStore((state) => state.multiJobIds);
  const setMultiJobIds = useJobIdsStore((state) => state.setMultiJobIds);

  // 녹음 기능 구현
  const {
    recording: recorderRecording,
    recordedScripts,
    uploading,
    startScriptRecording,
    stopScriptRecording,
    getAllBlobs,
  } = useDubbingRecorder({
    captions: front_data.captions,
    tokenId: id,
    scripts: tokenData?.scripts,
    onUploadComplete: (success: boolean, jobIds: string[]) => {
      console.log(`[🔄 DubbingContainer] onUploadComplete 콜백 호출됨`);
      console.log(`[📊 결과] success: ${success}, jobIds: ${JSON.stringify(jobIds)}`);

      if (success && Array.isArray(jobIds) && jobIds.length > 0) {
        // 새로운 분석 시작 시에만 초기화 (기존 결과 유지)
        if (multiJobIds.length === 0) {
          console.log('[DEBUG] 새로운 분석 시작 - 상태 초기화');
          setFinalResults({});
          setLatestResultByScript({});
        }
        // jobId와 문장 인덱스 매핑 콘솔 출력
        jobIds.forEach((jobId, idx) => {
          const script = front_data.captions[idx]?.script;
          console.log(`[분석 요청] jobId: ${jobId}, 문장 인덱스: ${idx}, script: "${script}"`);
        });
        // 새 jobIds로 세팅
        setMultiJobIds(jobIds);
        // 분석 시작 상태 설정
        setIsAnalyzing(true);
      } else if (!success) {
        // 분석 중 상태 설정 (녹음 완료 후 분석 중 표시)
        setRecordingCompleted(true);
        setIsAnalyzing(true);
      }
    },
  });

  // 녹음 상태 동기화
  useEffect(() => {
    setRecording(recorderRecording);
  }, [recorderRecording, setRecording]);

  const [hasAnalysisResults, setHasAnalysisResults] = useState(false);

  // 🆕 더빙본 들어보기 모달 상태
  const [isDubbingListenModalOpen, setIsDubbingListenModalOpen] = useState(false);

  // 구간 반복 상태 추가
  const [isLooping, setIsLooping] = useState(false);
  
  // 카운트다운 상태 추가
  const [showCountdown, setShowCountdown] = useState(false);
  
  // 카운트다운 완료 후 녹음 시작 함수
  const startRecordingAfterCountdown = useCallback(() => {
    // 카운트다운 숨기기
    setShowCountdown(false);
    
    if (!videoPlayerRef?.current || !front_data.captions[currentScriptIndex]) return;
    
    const currentScript = front_data.captions[currentScriptIndex];
    const currentWords = tokenData?.scripts?.[currentScriptIndex]?.words || [];
    
    // 영상을 해당 시점으로 이동
    videoPlayerRef.current.seekTo(currentScript.start_time);
    
    // 영상 재생 시작
    videoPlayerRef.current.playVideo();

    // 영상이 실제로 재생되기 시작할 때까지 대기
    const checkVideoPlaying = () => {
      if (!videoPlayerRef?.current) return;

      const currentTime = videoPlayerRef.current.getCurrentTime();
      const targetTime = currentScript.start_time;

      // 영상이 목표 시간에 도달했는지 확인 (0.1초 허용 오차)
      if (Math.abs(currentTime - targetTime) < 0.1) {
        // 녹음 시작
        startScriptRecording(currentScriptIndex);
        toast.success('녹음이 시작되었습니다!', {
          id: 'recording-started',
          duration: 1000,
        });
        
        // 단어 단위로 녹음 종료 시점 설정
        if (currentWords.length > 0) {
          // 마지막 단어의 종료 시간에 녹음 종료
          const lastWord = currentWords[currentWords.length - 1];
          const recordingDuration = (lastWord.end_time - currentScript.start_time) * 1000;
          
          console.log(`[녹음 설정] 마지막 단어 기준 녹음 종료 예정: ${recordingDuration}ms 후`);
          console.log(`[녹음 정보] 스크립트 시작: ${currentScript.start_time}, 마지막 단어 종료: ${lastWord.end_time}`);
          
          // 녹음 종료 타이머 설정
          setTimeout(() => {
            if (recording) {
              console.log(`[녹음 종료] 마지막 단어 종료 시점에 녹음 종료`);
              stopScriptRecording(currentScriptIndex);
            }
          }, recordingDuration);
        } else {
          console.log(`[녹음 설정] 단어 정보가 없어 스크립트 전체 시간으로 녹음 설정`);
          // 단어 정보가 없으면 스크립트 전체 시간으로 설정
          const scriptDuration = (currentScript.end_time - currentScript.start_time) * 1000;
          setTimeout(() => {
            if (recording) {
              console.log(`[녹음 종료] 스크립트 종료 시점에 녹음 종료`);
              stopScriptRecording(currentScriptIndex);
            }
          }, scriptDuration);
        }
      } else {
        // 아직 재생되지 않았으면 다시 체크
        setTimeout(checkVideoPlaying, 50);
      }
    };

    // 영상 재생 시작 후 체크 시작 (브라우저 렉 고려)
    setTimeout(checkVideoPlaying, 100);
  }, [currentScriptIndex, front_data, recording, startScriptRecording, stopScriptRecording, tokenData, videoPlayerRef, setShowCountdown]);

  // 컴포넌트가 언마운트될 때 구간 반복 인터벌 정리
  useEffect(() => {
    return () => {
      if (window.loopIntervalId) {
        clearInterval(window.loopIntervalId);
        window.loopIntervalId = undefined;
      }
    };
  }, []);

  // 문장이 변경될 때 구간 반복 중지
  useEffect(() => {
    if (isLooping) {
      setIsLooping(false);
      if (window.loopIntervalId) {
        clearInterval(window.loopIntervalId);
        window.loopIntervalId = undefined;
      }
    }
  }, [currentScriptIndex]);

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

      // 에러 상태에 따른 처리
      if (sse.readyState === EventSource.CONNECTING) {
        console.log(`[SSE][${jobId}] 재연결 시도 중...`);
      } else if (sse.readyState === EventSource.CLOSED) {
        console.log(`[SSE][${jobId}] 연결이 닫힘`);
        connectedJobIdsRef.current.delete(jobId);

        // 3초 후 재연결 시도
        setTimeout(() => {
          if (!connectedJobIdsRef.current.has(jobId)) {
            console.log(`[SSE][${jobId}] 재연결 시도`);
            // 여기서 재연결 로직을 추가할 수 있음
          }
        }, 3000);
      }
    };
  });

  return () => {
    sseList.forEach((sse) => {
      console.log('[SSE] 연결 해제:', sse.url);
      sse.close();
    });
  };
}, [multiJobIds, setFinalResults, setLatestResultByScript, setRecordingCompleted, setIsAnalyzing, front_data.captions]);

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
}, [latestResultByScript, multiJobIds.length, front_data.captions.length, setShowCompleted]);


// ✅ 새로운 분석 시작 시 연결 목록 초기화
useEffect(() => {
  if (multiJobIds.length > 0) {
    console.log('새로운 분석 시작 - 연결 목록 초기화');
    connectedJobIdsRef.current.clear();
  }
}, [multiJobIds.length]);

  // 버튼 표시 여부를 결정하는 함수
  const shouldShowCompletedButtons = useCallback(() => {
    // 분석 결과가 없으면 버튼 표시 안함
    if (Object.keys(latestResultByScript || {}).length === 0) {
      return false;
    }
    
    // 듀엣 더빙 모드일 때
    if (isDuet) {
      // 내 대사만 필터링
      const myLines = front_data.captions.filter((_: any, idx: number) => isMyLine(idx));
      
      // 내 대사가 없으면 버튼 표시 안함
      if (myLines.length === 0) {
        return false;
      }
      
      // 내 대사에 대한 분석 결과가 모두 있는지 확인
      const myLinesWithResults = myLines.filter((caption: any) => {
        const scriptKey = normalizeScript(caption.script);
        return !!latestResultByScript[scriptKey];
      });
      
      // 내 대사에 대한 분석 결과가 모두 있으면 버튼 표시
      return myLinesWithResults.length >= 2;
    }
    // 일반 더빙 모드일 때
    else {
      // 모든 대사에 대한 분석 결과가 있으면 버튼 표시
      return Object.keys(latestResultByScript || {}).length === front_data.captions.length;
    }
  }, [isDuet, latestResultByScript, front_data.captions, isMyLine]);
  
  // 현재 마지막 대사인지 확인하는 함수
  const isLastScript = useCallback(() => {
    return currentScriptIndex === front_data.captions.length - 1;
  }, [currentScriptIndex, front_data.captions.length]);

  // 문장 개수만큼 분석 결과가 쌓이면 콘솔 출력
  useEffect(() => {
    const totalCount = front_data.captions.length;
    const resultCount = Object.keys(latestResultByScript).length;

    console.log("🧪 useEffect 실행됨");
    console.log("📌 totalCount (captions.length):", totalCount);
    console.log("📌 resultCount (latestResultByScript 개수):", resultCount);
    console.log("📌 keys:", Object.keys(latestResultByScript));
    if (resultCount === totalCount && totalCount > 0) {
      console.log('✅ 모든 문장 분석 결과가 도착했습니다.');
      console.log('📊 latestResultByScript 전체 내용:');
      console.log(JSON.stringify(latestResultByScript, null, 2));
    }
  }, [latestResultByScript, front_data.captions.length]);

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


  // 결과 보기 버튼 클릭 시 결과 섹션으로 스크롤
  const showResultsSection = useCallback(() => {
    setShowResults(true);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  }, [setShowResults]);

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
  }, [setShowResults]);

  // 데이터가 준비되지 않았으면 내부 로직 실행하지 않음
  const findScriptIndexByTime = useCallback((time: number) => {
    if (!isReady) return 0;
    
    // 녹음 중이 아니고 현재 내 대사인 경우, 시간 기반 인덱스 변경을 방지
    if (!recording && isMyLine(currentScriptIndex)) {
      return currentScriptIndex;
    }
    
    const lastIndex = front_data.captions.length - 1;
    const lastScript = front_data.captions[lastIndex];
    
    if (lastScript && time > lastScript.end_time) return lastIndex;
    
    // 현재 스크립트의 단어 정보 확인
    const currentScript = front_data.captions[currentScriptIndex];
    const currentWords = tokenData?.scripts?.[currentScriptIndex]?.words || [];
    
    // 현재 스크립트 내에 단어 정보가 있고, 현재 시간이 마지막 단어 종료 시간보다 작으면
    // 현재 스크립트 인덱스 유지
    if (currentScript && currentWords.length > 0) {
      const lastWord = currentWords[currentWords.length - 1];
      if (time >= currentScript.start_time && time <= lastWord.end_time) {
        return currentScriptIndex;
      }
    }
    
    // 그 외의 경우 기존 로직대로 스크립트 찾기
    const foundIndex = front_data.captions.findIndex(
      (script: any) => time >= script.start_time && time <= script.end_time
    );
    
    return foundIndex !== -1 ? foundIndex : 0;
  }, [isReady, front_data?.captions, isMyLine, currentScriptIndex, recording, tokenData?.scripts]);

  const handleTimeUpdate = useCallback((currentTime: number) => {
    if (!isReady) return;
    setCurrentVideoTime(currentTime); // 비디오 시간 업데이트
    
    // 녹음 중이면 스크립트 자동 전환 방지
    if (recording) return;
    
    // 현재 스크립트가 내 대사이면 자동 전환 방지
    if (isMyLine(currentScriptIndex)) return;
    
    // 현재 시간에 해당하는 스크립트 인덱스 찾기
    const foundIndex = front_data.captions.findIndex(
      (script: any) => currentTime >= script.start_time && currentTime <= script.end_time
    );
    
    // 찾은 인덱스가 유효하고 현재 인덱스와 다르면 스크립트 변경
    if (foundIndex !== -1 && foundIndex !== currentScriptIndex) {
      // 찾은 스크립트가 상대방 대사인 경우에만 자동 전환
      if (!isMyLine(foundIndex)) {
        console.log(`[자동 전환] 시간 기반 스크립트 전환: ${currentScriptIndex} -> ${foundIndex}`);
        setCurrentScriptIndex(foundIndex);
      }
    }
  }, [isReady, setCurrentVideoTime, recording, currentScriptIndex, isMyLine, front_data?.captions, setCurrentScriptIndex]);

  // DubbingContainer.tsx 내부

const getCurrentScriptPlaybackRange = useCallback(() => {
    if (!isReady) return { startTime: 0, endTime: undefined };
    if (!front_data.captions || front_data.captions.length === 0) {
      return { startTime: 0, endTime: undefined };
    }
    const currentScript = front_data.captions[currentScriptIndex];
    if (!currentScript) return { startTime: 0, endTime: undefined };

    // 듀엣 모드이고, 현재 대사가 '상대방 대사'일 때 특별 로직 적용
    if (isDuet && !isMyLine(currentScriptIndex)) {
      let lastOpponentEndTime = currentScript.end_time;
      let nextIndex = currentScriptIndex + 1;

      // 다음 대사가 있고 '내 대사'인 경우, 다음 대사 시작점을 종료 시간으로 설정
      if (nextIndex < front_data.captions.length && isMyLine(nextIndex)) {
        return {
          startTime: currentScript.start_time,
          endTime: front_data.captions[nextIndex].start_time, // 내 대사 시작점에서 멈춤
        };
      }

      // 다음 대사들을 순서대로 확인하여 연속된 상대방 대사를 하나의 구간으로 처리
      while (nextIndex < front_data.captions.length) {
        // 다음 대사가 '내 대사'이면 연속 구간이 끝난 것이므로 중단
        if (isMyLine(nextIndex)) {
          // 내 대사 시작점을 종료 시간으로 설정
          return {
            startTime: currentScript.start_time,
            endTime: front_data.captions[nextIndex].start_time,
          };
        }
        // 다음 대사도 '상대방 대사'이면, 종료 시간을 업데이트하고 계속 탐색
        lastOpponentEndTime = front_data.captions[nextIndex].end_time;
        nextIndex++;
      }

      // 재생 구간을 [현재 대사 시작 시간 ~ 마지막 연속된 상대방 대사 종료 시간]으로 설정
      return {
        startTime: currentScript.start_time,
        endTime: lastOpponentEndTime,
      };
    }

    // 일반 모드이거나 '내 대사'인 경우는 기존처럼 한 문장 단위로 재생
    return {
      startTime: currentScript.start_time,
      endTime: currentScript.end_time,
    };
}, [isReady, isDuet, front_data?.captions, currentScriptIndex, isMyLine]);

  // 기존 함수들을 훅의 함수로 대체
  const customHandlePlay = () => {
    // 듀엣 모드에서 재생 버튼을 클릭할 때는 자동 전환 비활성화
    if (isDuet) {
      setAllowAutoScriptChange(false);
    }
    handlePlay();
  };

  const customHandlePause = () => {
    handlePause();
  };

  // 마이크 버튼 클릭 핸들러
  const handleMicClick = () => {
    // 듀엣 모드에서 '내 대사'가 아니면 녹음 불가
    if (isDuet && !isMyLine(currentScriptIndex)) {
      toast.error('상대방 대사는 녹음할 수 없습니다.');
      return;
    }

    // 듀엣 모드에서 마이크 버튼을 클릭할 때는 자동 전환 비활성화
    if (isDuet) {
      setAllowAutoScriptChange(false);
    }

    if (videoPlayerRef?.current && front_data.captions[currentScriptIndex]) {
      // 비디오가 재생 중이면 일시 정지
      if (isVideoPlaying) {
        videoPlayerRef.current.pauseVideo();
        customHandlePause();
      }
      
      // 카운트다운 표시 시작
      setShowCountdown(true);
    }
  };
    

  // 문장 클릭 시 영상 이동 및 정지, 인덱스 변경
  const customHandleScriptSelect = (index: number) => {
    // 녹음 중이면 중지
    if (recording) {
      stopScriptRecording(currentScriptIndex);
    }
    
    // 카운트다운 숨기기 (진행 중이었다면)
    setShowCountdown(false);

    // 듀엣 모드에서 상대방 대사를 클릭했을 때 처리
    if (isDuet) {
      const isCurrentMyLine = isMyLine(currentScriptIndex);
      const isTargetMyLine = isMyLine(index);

      // 내 대사를 클릭했을 때는 자동 전환 비활성화
      if (isTargetMyLine) {
        setAllowAutoScriptChange(false);
      }
      // 현재 상대방 대사이고 다음 대사도 상대방 대사일 경우에만 자동 전환 활성화
      else if (!isCurrentMyLine && !isTargetMyLine && index === currentScriptIndex + 1) {
        setAllowAutoScriptChange(true);
      }
      // 그 외의 경우는 자동 전환 비활성화
      else {
        setAllowAutoScriptChange(false);
      }
    } else {
      setAllowAutoScriptChange(false);
    }

    // 영상 해당 시점으로 이동
    const startTime = front_data.captions[index]?.start_time ?? 0;
    videoPlayerRef.current?.seekTo(startTime);

    // 모든 경우에 일시 정지 상태 유지
    videoPlayerRef.current?.pauseVideo();

    // 문장 인덱스 변경
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
  }, [analysisResult, setShowAnalysisResult]);

  // 녹음이 시작되면 분석 결과 표시 해제
  useEffect(() => {
    if (recording) {
      console.log('[DubbingContainer] 녹음 시작 - 분석 결과 표시 해제');
      setShowAnalysisResult(false);
    }
  }, [recording, setShowAnalysisResult]);

  // 자동재생 상태에 따라 분석 결과 표시 제어
  useEffect(() => {
    if (isRecordingPlayback) {
      console.log('[DubbingContainer] 자동재생 시작 - 분석 결과 표시 해제');
      setShowAnalysisResult(false);
    } else if (analysisResult && !recording) {
      console.log('[DubbingContainer] 자동재생 완료 - 분석 결과 다시 표시');
      setShowAnalysisResult(true);
    }
  }, [isRecordingPlayback, analysisResult, recording, setShowAnalysisResult]);
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

  // tokenData 주요 정보 zustand에 저장
  const setTokenInfo = useTokenStore((state) => state.setTokenInfo);
  const setDuetStartTime = useDuetTokenStore((state) => state.setStartTime);
  const setDuetEndTime = useDuetTokenStore((state) => state.setEndTime);
  
  useEffect(() => {
    if (tokenData && tokenData.id && tokenData.actor_name && tokenData.start_time !== undefined && tokenData.end_time !== undefined && tokenData.bgvoice_url) {
      setTokenInfo({
        id: tokenData.id,
        actor_name: tokenData.actor_name,
        start_time: tokenData.start_time,
        end_time: tokenData.end_time,
        bgvoice_url: tokenData.bgvoice_url,
      });
      
      // 듀엣 모드일 때 듀엣 토큰 스토어에도 시간 정보 저장
      if (isDuet) {
        console.log('[듀엣 모드] 시간 정보 설정:', tokenData.start_time, tokenData.end_time);
        setDuetStartTime(tokenData.start_time);
        setDuetEndTime(tokenData.end_time);
      }
    }
  }, [tokenData, setTokenInfo, isDuet, setDuetStartTime, setDuetEndTime]);

  // --- 렌더링 ---
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <span className="text-2xl">Loading...</span>
      </div>
    );
  }
  const currentWords = isReady ? (tokenData?.scripts?.[currentScriptIndex]?.words || []) : [];
  return (
    <div className="min-h-screen bg-neutral-950 text-white relative overflow-hidden">
      <Toaster position="top-center" />

      <DubbingHeader
        title={front_data.movie.title}
        category={front_data.movie.category}
        actorName={front_data.captions[0]?.actor?.name || ""}
      />

      {/* 본문 - 사이드바 열릴 때 크기 조절 */}
      <div
        className={`w-full mx-auto px-2 py-1 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'pr-[400px]' : 'pr-2'
        }`}
      >
        <div className="grid grid-cols-12 gap-2">
          {/* Video - 전체 너비 사용 */}
          <div className="col-span-12 relative">
            <VideoPlayer
              videoId={front_data.movie.youtube_url.split("v=")[1]}
              onTimeUpdate={handleTimeUpdate}
              startTime={getCurrentScriptPlaybackRange().startTime}
              endTime={getCurrentScriptPlaybackRange().endTime}
              disableAutoPause={true}
              ref={videoPlayerRef}
              
              // 수정된 코드: 상대방 대사 -> 내 대사 전환 시 내 대사 시작점에서 멈추도록 수정
              onEndTimeReached={() => {
                // 녹음 중이면 녹음부터 중지
                if (recording) {
                  const currentWords = tokenData?.scripts?.[currentScriptIndex]?.words || [];
                  if (currentWords.length > 0) {
                    const lastWord = currentWords[currentWords.length - 1];
                    const currentTime = videoPlayerRef.current?.getCurrentTime() || 0;
                    if (currentTime >= lastWord.end_time) {
                      console.log(`[녹음 종료] 마지막 단어 종료 시점에 도달하여 녹음 종료`);
                      stopScriptRecording(currentScriptIndex);
                    }
                  } else {
                    stopScriptRecording(currentScriptIndex);
                  }
                  videoPlayerRef.current?.pauseVideo();
                  return;
                }

                // 현재 스크립트가 '내 대사'인 경우, 일시정지
                if (isMyLine(currentScriptIndex)) {
                  videoPlayerRef.current?.pauseVideo();
                  return;
                }

                // 다음 스크립트 인덱스 확인
                const nextScriptIndex = currentScriptIndex + 1;
                
                // 다음 스크립트가 없으면 일시정지
                if (nextScriptIndex >= front_data.captions.length) {
                  videoPlayerRef.current?.pauseVideo();
                  return;
                }
                
                // 다음 스크립트가 '내 대사'인지 확인
                const isNextMyLine = isMyLine(nextScriptIndex);
                
                // 다음 스크립트가 '내 대사'이면 다음 스크립트 시작점에서 일시정지
                if (isNextMyLine) {
                  console.log('[자동 전환] 상대방 대사 -> 내 대사: 내 대사 시작점에서 일시정지');
                  setCurrentScriptIndex(nextScriptIndex);
                  videoPlayerRef.current?.pauseVideo();
                  setTimeout(() => {
                    if (videoPlayerRef.current && front_data.captions[nextScriptIndex]) {
                      videoPlayerRef.current.seekTo(front_data.captions[nextScriptIndex].start_time);
                    }
                  }, 100);
                  return;
                }
                
                // 다음 스크립트가 '상대방 대사'이면 자동으로 다음 스크립트로 전환하고 계속 재생
                // 이 경우 영상을 멈추지 않고 자연스럽게 재생되도록 함
                console.log('[자동 전환] 상대방 대사 -> 상대방 대사: 자동 전환 후 계속 재생');
                setCurrentScriptIndex(nextScriptIndex);
                // 영상을 멈추거나 시간을 이동시키지 않음 - 자연스럽게 계속 재생
              }}
              
              onPlay={customHandlePlay}
              onPause={customHandlePause}
              onOpenSidebar={() => setIsSidebarOpen(true)}
            />
            {/* 녹음 카운트다운 컴포넌트 - 비디오 위에 표시 */}
            {showCountdown && (
              <div className="absolute inset-0">
                <RecordingCountdown 
                  isVisible={showCountdown} 
                  onComplete={startRecordingAfterCountdown}
                  duration={1500} // 2초 카운트다운
                />
              </div>
            )}
          </div>
        </div>

        {/* Script Display - 마진 축소 */}
        <div className="mt-1 col-span-12">
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
            showAnalysisResult={showAnalysisResult}
            analysisResult={analysisResult}
            // 추가된 props
            isVideoPlaying={isVideoPlaying}
            onPlay={customHandlePlay}
            onPause={customHandlePause}
            onMicClick={handleMicClick}
            isLooping={isLooping}
            // 듀엣 모드 관련 props
            isDuet={isDuet}
            isMyLine={isMyLine(currentScriptIndex)}
            onLoopToggle={() => {
              // 구간 반복 상태 토글
              setIsLooping(!isLooping);

              // 듀엣 모드에서 구간 반복 버튼을 클릭할 때는 자동 전환 비활성화
              if (isDuet) {
                setAllowAutoScriptChange(false);
              }

              if (!isLooping) {
                // 구간 반복 시작
                if (videoPlayerRef?.current && front_data.captions[currentScriptIndex]) {
                  const startTime = front_data.captions[currentScriptIndex].start_time;
                  const endTime = front_data.captions[currentScriptIndex].end_time;

                  // 현재 시간이 구간 밖이면 시작 지점으로 이동
                  const currentTime = videoPlayerRef.current.getCurrentTime();
                  if (currentTime < startTime || currentTime >= endTime) {
                    videoPlayerRef.current.seekTo(startTime);
                  }

                  // 재생 시작
                  videoPlayerRef.current.playVideo();

                  // 구간 반복 감시 시작 - 전역 변수로 저장하여 나중에 정리할 수 있도록 함
                  window.loopIntervalId = setInterval(() => {
                    if (!videoPlayerRef.current) {
                      clearInterval(window.loopIntervalId);
                      return;
                    }

                    const currentTime = videoPlayerRef.current.getCurrentTime();
                    if (currentTime >= endTime - 0.1) {
                      videoPlayerRef.current.seekTo(startTime);
                      videoPlayerRef.current.playVideo();
                    }
                  }, 200);
                }
              } else {
                // 구간 반복 중지
                if (window.loopIntervalId) {
                  clearInterval(window.loopIntervalId);
                  window.loopIntervalId = undefined;
                }
              }
            }}
            // 더빙본 들어보기와 결과보기 버튼 관련 props
            showCompletedButtons={shouldShowCompletedButtons()}
            onOpenDubbingListenModal={() => setIsDubbingListenModalOpen(true)}
            onShowResults={handleViewResults}
            id={id} // 추가
          />
        </div>

        {/* 결과 섹션을 기존 레이아웃 안에 통합 */}
        {showResults && (
          <div ref={resultsRef} className="result-container mt-2">
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
      </div>

      {/* Sidebar - 오른쪽 고정 */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        captions={front_data.captions}
        currentScriptIndex={currentScriptIndex}
        onScriptSelect={customHandleScriptSelect}
        actorName={front_data.captions[0]?.actor?.name || ""}
        movieTitle={front_data.movie.title}
        analyzedCount={Object.keys(latestResultByScript || {}).length}
        totalCount={front_data.captions.length}
        recording={recording}
        recordedScripts={recordingCompleted ? Array(front_data.captions.length).fill(false).map((_, i) => i === currentScriptIndex) : []}
        latestResultByScript={latestResultByScript}
        recordingCompleted={recordingCompleted}
        isDuet={isDuet}
        isMyLine={isMyLine}
      />

      {/* 더빙본 들어보기 모달 */}
      <DubbingListenModal
        open={isDubbingListenModalOpen}
        onClose={() => setIsDubbingListenModalOpen(false)}
        tokenId={id}
        modalId={modalId}
      />
    </div>
  );
}

export default DubbingContainer;
