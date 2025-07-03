"use client";
import { useState, useRef, useEffect } from "react";
import YouTube, { YouTubeEvent } from "react-youtube";
import { extractYoutubeVideoId } from "@/utils/extractYoutubeVideoId";
import { mergeWavBlobs } from "@/utils/mergeWavBlobs";
import { useRouter } from "next/router";
import axios from "axios";
import ServerPitchGraph from "@/components/graph/ServerPitchGraph";
import type { CaptionState } from "@/type/PitchdataType";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  PlayIcon,
  PauseIcon,
  Bars3Icon,
} from "@heroicons/react/24/solid";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useAudioStream } from "@/hooks/useAudioStream";
import { useAudioStore } from "@/store/useAudioStore";
import { MyPitchGraph } from "@/components/graph/MyPitchGraph";
import { Timer } from "@/components/Timer";

interface Caption {
  movie_id: number;
  actor_id: number;
  start_time: number;
  end_time: number;
  script: string;
  translation: string;
  url: string | null;
  actor_pitch_values: number[];
  background_audio_url: string;
  id: number;
  actor: {
    name: string;
    id: number;
  };
}

export interface Video {
  title: string;
  category: string;
  youtube_url: string;
  total_time: number;
  bookmark: boolean;
  full_background_audio_url: string;
  id: number;
  scripts: Caption[];
}

interface tokenInfo {
  message: string;
  job_id: string;
  status: string;
}
// interface myScore {

// }
export default function Detail() {
  // const streamRef = useRef<MediaStream | null>(null);

  const playerRef = useRef<YT.Player | null>(null);
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [currentSec, setCurrentSec] = useState(0);

  const captionContainerRef = useRef<HTMLDivElement>(null);

  const [captions, setCaptions] = useState<Caption[]>([]);
  const {startRecording, stopRecording, recording, getAllBlobs} = useVoiceRecorder();

  // 이전 자막 인덱스 & 게이지 프로그레스 & 하이라이트 제어
  const [prevIdx, setPrevIdx] = useState<number | null>(null);
  const [gaugeProgress, setGaugeProgress] = useState(0);
  const [highlightEnabled, setHighlightEnabled] = useState(true);
  
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);

  //오디오 url(결과 테스트용)
  const [audioUrl, setAudioUrl] = useState<string|null>(null);
  
  // 해당 영화 정보
  const [movieData, setMovieData] = useState<Video | null>(null);
  const {audioCtx} = useAudioStore();

  // 오디오 스트림 초기화
  useAudioStream();

  // 결과 토큰 id
  const [tokenId, setTokenId] = useState<tokenInfo|null>(null);
  // 점수 
  // const [myScore, setMyScore] = useState(null);
  const router = useRouter();
  const token_id = router.query.id;
  const movieUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/tokens/${token_id}`;

  useEffect(() => {
    if (!token_id || Array.isArray(token_id)) return;

    console.log("초기 렌더링", movieUrl)
    const fetchCaptions = async () => {
      try {
        const res = await axios.get<Video>(movieUrl);
        const movie = res.data;
        console.log("영화 정보:", movie);
        setCaptions(movie?.scripts);
        setMovieData(movie);
      } catch (err) {
        console.error("자막 스크립트를 불러올 수 없습니다. 서버관리자에게 문의해주세요", err);
      }
    };
   fetchCaptions();
  }, [token_id, movieUrl]);
  const ytOpts = {
    width: "100%",
    height: "100%",
    playerVars: { controls: 0, disablekb: 1, wmode: "opaque", rel: 0 },
  };

  const onReady = (e: YouTubeEvent) => {
    playerRef.current = e.target;
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (playing) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
    setPlaying(!playing);
  };


  // 이전으로 이동, 다음으로 이동 함수
  const seekBy = (currentIdx: number) => {
  const nextIdx = currentIdx + 1;
  const prevIdx = currentIdx - 1;

  return {
    next: () => {
      if (playerRef.current && nextIdx < captions.length) {
        playerRef.current.seekTo(captions[nextIdx].start_time, true);
      }
    },
    prev: () => {
      if (playerRef.current && prevIdx >= 0) {
        playerRef.current.seekTo(captions[prevIdx].start_time, true);
      }
    },
  };
};

  // 재생 시간 업데이트
  useEffect(() => {
    const id = setInterval(() => {
      setCurrentSec(playerRef.current?.getCurrentTime() ?? 0);
    }, 200);
    return () => clearInterval(id);
  }, []);

  // 자막 자동 스크롤
  useEffect(() => {
    const idx = captions.findIndex(
      (c) => currentSec >= c.start_time && currentSec < c.end_time
    );
    if (idx >= 0 && captionContainerRef.current) {
      const el = captionContainerRef.current.children[idx] as HTMLElement;
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [currentSec, captions]);
  
  // 1. 서버로부터 결과 기다리기 
  // 2. 결과 받으면 result 페이지로 redirect
  // 3. token_id를 의존성에 넣어야할것같음, 근데 이건 언제?
  useEffect(() => { 
    if (!tokenId) return;
    const sse = new EventSource(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tokens/analysis-progress/${tokenId.job_id}`)
    sse.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log("SSE 수신 : ", data);

      if(data.status === "completed"){
        //여기서 setScore해야
        sse.close();
      }
      
    }
    sse.onerror = (e) => {
      console.error("SSE 에러 발생", e);
      sse.close(); //오류 발생시 연결 종료
    }
    return () => {
      sse.close(); // 컴포넌트 언마운트시 종료
    }
  }, [tokenId])

  // 현재 자막
  const currentIdx = captions.findIndex(
    (c) => currentSec >= c.start_time && currentSec < c.end_time
  );
  const currentCaption = captions[currentIdx] || null;

  const captionState: CaptionState = {
    currentIdx,
    captions,
  };

  // 자막 변경 시: 완전 초기화 → 2초 일시정지 → 게이지 채우기 → 1초 후 재생 → 0.2초 뒤 하이라이트
  useEffect(() => {
    let pauseTimer: NodeJS.Timeout;
    let resumeTimer: NodeJS.Timeout;
    let enableTimer: NodeJS.Timeout;
    let stopTimer: NodeJS.Timeout; 
    
    if (prevIdx !== null && currentIdx !== prevIdx) {
      // 하이라이트 완전 초기화
      setHighlightEnabled(false);
      // 일시정지
      playerRef.current?.pauseVideo();
      setPlaying(false);
      setGaugeProgress(0);

      // 2초 일시정지
      pauseTimer = setTimeout(() => {
        // 게이지 1초 애니메이션
        setGaugeProgress(1);

        // 애니메이션 끝나면 재생 재개
        resumeTimer = setTimeout(async () => {
          playerRef.current?.playVideo();
          setPlaying(true);
          setGaugeProgress(0);

          //이전 재생 중이던 대사 녹음 정지
          if(recording  && playingIdx !== null) {
            await stopRecording(playingIdx);
          }
          // 현재 재생 인덱스 설정 후 녹음 시작
          setPlayingIdx(currentIdx);
          // 녹음시작
          startRecording();

          const currentCaption = captions[currentIdx];
          const startTime = currentCaption?.start_time;
          const endTime = currentCaption?.end_time;
          const deltaTime = endTime - startTime;

          stopTimer = setTimeout(async () => {
            await stopRecording(currentIdx);
          }, 1000 * deltaTime)

          // 0.2초 뒤 하이라이트 재활성화
          enableTimer = setTimeout(() => {
            setHighlightEnabled(true);
          }, 200);
        }, 1000);
      }, 2000);
    }

    setPrevIdx(currentIdx);

    return () => {
      clearTimeout(pauseTimer);
      clearTimeout(resumeTimer);
      clearTimeout(enableTimer);
      clearTimeout(stopTimer);
    };
  }, [currentIdx]);

  // 글자별 하이라이트
  const chars = currentCaption?.script.split("") || [];
  const duration = currentCaption
    ? currentCaption.end_time - currentCaption.start_time
    : 1;
  const elapsed =
    currentCaption && currentSec >= currentCaption.start_time
      ? Math.min(currentSec - currentCaption.start_time, duration)
      : 0;
  const computedCount = Math.floor((elapsed / duration) * chars.length);
  const highlightCount = highlightEnabled ? computedCount : 0;

  const previewMergedWav = async () => {
    const blobs = getAllBlobs();
    if (blobs.length === 0) return;
    if (!audioCtx) return;
    const mergedBlob = await mergeWavBlobs(blobs, audioCtx);
    const url = URL.createObjectURL(mergedBlob);
    setAudioUrl(url);
  };

  // 서버로 .wav전송
  const sendWav = async () => {
    if (!token_id || Array.isArray(token_id)) {
      console.error('movieId가 유효하지 않습니다.');
      return;
    }
  
    const blobs = getAllBlobs();
    if (blobs.length === 0) return;
    if(!audioCtx) return;
    const audioBlob = await mergeWavBlobs(blobs, audioCtx);
    const formData = new FormData();
    formData.append('file', audioBlob, 'hiSHJH.wav');
  
    const uploadUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/tokens/${token_id}/upload-audio`;
  
    try {
      const res = await axios.post<tokenInfo>(uploadUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      console.log('녹음 파일이 성공적으로 업로드되었습니다.', res.data);
      setTokenId(res.data);
      
    } catch (err) {
      console.error('녹음 파일 업로드 중 오류가 발생했습니다.', err);
    }
  };
  
  if (!movieData) return null;
  const videoId = extractYoutubeVideoId(movieData.youtube_url)
  return (
    <div className="flex flex-col flex-1 min-h-screen bg-black text-white pt-20">
      <div className="flex flex-1">
        {/* Video Area */}
        <div
          className={
            expanded
              ? "fixed inset-0 z-50 bg-black"
              : "relative flex-1 overflow-hidden"
          }
        >
          {expanded && (
            <div className="absolute top-4 right-4 flex items-center space-x-2 bg-gray-900/80 p-2 rounded-md z-50 opacity-60">
              <button onClick={() => setExpanded(false)}>
                <Bars3Icon className="w-7 h-7 text-white" />
              </button>
           
            </div>
          )}
          <div className="relative w-full h-full">
            <div className="aspect-video w-full overflow-hidden relative">
              <YouTube
                videoId={videoId || undefined}
                opts={ytOpts}
                onReady={onReady}
                className="absolute inset-0"
                iframeClassName="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-6 bg-black/30 rounded-md px-4 py-2 z-50 pointer-events-auto">
          <button onClick={() => seekBy(currentIdx).prev()}>
              <ChevronLeftIcon className="w-6 h-6 text-white" />
            </button>
            <button onClick={togglePlay}>
              {playing ? (
                <PauseIcon className="w-6 h-6 text-white" />
              ) : (
                <PlayIcon className="w-6 h-6 text-white" />
              )}
            </button>
            <button
              onClick={() => {
                playerRef.current?.seekTo(0, true);
                setPlaying(true);
              }}
            >
              <ArrowPathIcon className="w-6 h-6 text-white" />
            </button>
            <button onClick={() => seekBy(currentIdx).next()}>
              <ChevronRightIcon className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <aside
          className={`${expanded ? "hidden" : "w-80"} bg-gray-800 flex flex-col`}
        >
          <div className="flex justify-end items-center p-4 space-x-2 bg-gray-900/80">
            <button onClick={() => setExpanded(true)}>
              <Bars3Icon className="w-7 h-7 text-white" />
            </button>
           
          </div>
          <div
            ref={captionContainerRef}
            className="max-h-[30rem] overflow-y-auto px-4 pb-4"
          >
            {captions.map((c, i) => (
              <div
                key={i}
                className={`mb-3 ${
                  i === currentIdx
                    ? "text-white font-semibold"
                    : "text-gray-400"
                }`}
              >
                <span className="text-xs font-mono mr-2">
                  {String(Math.floor(c.start_time / 60)).padStart(2, "0")}:
                  {String(Math.floor(c.start_time % 60)).padStart(2, "0")}
                </span>
                {c.script}
              </div>
            ))}
          </div>
          <div className="px-4 pb-4 space-y-2 flex-none relative -bottom-2">
            <div className="w-full h-16 bg-gray-700 rounded">
              <ServerPitchGraph captionState={captionState} token_id={Number(router.query.id)} />
            </div>
            <div
              className="w-full h-16 bg-gray-700 rounded"
            >
              <MyPitchGraph currentIdx={currentIdx}/>
            </div>
            <div>
            <button onClick={previewMergedWav} className="bg-red-500 text-white p-4 rounded-lg">병합된 녹음 듣기</button>
            {audioUrl && <div>
              <audio src={audioUrl} controls/>
              <button className="bg-red-500 p-4 rounded-lg " onClick={sendWav}>서버로 보내기</button>
              </div>}

            </div>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="bg-black p-4 text-center">
  {currentCaption && (
    <div className="w-full flex justify-center">
      {/* 타이머 + 대사 묶기 */}
      <div className="flex items-center space-x-4">
        {/* 타이머 */}
        <Timer currentIdx={currentIdx} />

        {/* 대사 */}
        <div className="relative text-left">
          {/* 게이지 */}
          <div
            className="absolute inset-y-0 left-0 bg-blue-500/40 transition-all duration-1000"
            style={{ width: `${gaugeProgress * 100}%` }}
          />
          {/* 영어 대사 */}
          <p className="relative z-10 text-4xl font-extrabold leading-tight whitespace-nowrap">
            {chars.map((ch, i) => (
              <span
                key={i}
                className={i < highlightCount ? "text-green-400" : "text-white"}
              >
                {ch}
              </span>
            ))}
          </p>
          {/* 한국어 자막 */}
          <p className="relative z-10 text-xl italic text-gray-300 mt-2">
            {currentCaption.translation}
          </p>
        </div>
      </div>
    </div>
  )}
</footer>
    </div>
  );
}