"use client";

import { useState, useRef, useEffect } from "react";
import YouTube, { YouTubeEvent } from "react-youtube";
import captionsData from "@/dummy/script.json";
import { mergeWavBlobs } from "@/utils/mergeWavBlobs";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  PlayIcon,
  PauseIcon,
  Bars3Icon,
} from "@heroicons/react/24/solid";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";

interface Caption {
  startTime: number;
  endTime: number;
  script: string;
  korean: string;
}

export default function Detail() {
  const playerRef = useRef<YT.Player | null>(null);
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [currentSec, setCurrentSec] = useState(0);

  const captionContainerRef = useRef<HTMLDivElement>(null);
  const blueCanvasRef = useRef<HTMLCanvasElement>(null);
  const redCanvasRef = useRef<HTMLCanvasElement>(null);

  const captions: Caption[] = captionsData as Caption[];
  const {startRecording, stopRecording, recording, getAllBlobs} = useVoiceRecorder();

  // 이전 자막 인덱스 & 게이지 프로그레스 & 하이라이트 제어
  const [prevIdx, setPrevIdx] = useState<number | null>(null);
  const [gaugeProgress, setGaugeProgress] = useState(0);
  const [highlightEnabled, setHighlightEnabled] = useState(true);

  //오디오 url(결과 테스트용)
  const [audioUrl, setAudioUrl] = useState<string|null>(null);

  const ytOpts = {
    width: "100%",
    height: "100%",
    playerVars: { controls: 0, disablekb: 1, wmode: "opaque" },
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
  const seekBy = (sec: number) => {
    if (!playerRef.current) return;
    const t = playerRef.current.getCurrentTime() ?? 0;
    playerRef.current.seekTo(t + sec, true);
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
      (c) => currentSec >= c.startTime && currentSec < c.endTime
    );
    if (idx >= 0 && captionContainerRef.current) {
      const el = captionContainerRef.current.children[idx] as HTMLElement;
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [currentSec]);

  // 파형 그리기 (sidebar)
  useEffect(() => {
    const drawWave = (
      canvas: HTMLCanvasElement | null,
      fn: (x: number, w: number, h: number) => number,
      color: string
    ) => {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const w = canvas.offsetWidth,
        h = canvas.offsetHeight;
      canvas.width = w;
      canvas.height = h;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= w; x++) {
        const y = h / 2 + fn(x, w, h);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    drawWave(
      blueCanvasRef.current,
      (x, w, h) => Math.sin((x / w) * 4 * Math.PI) * (h / 2 - 5),
      "#3b82f6"
    );
    drawWave(
      redCanvasRef.current,
      (x, w, h) => Math.cos((x / w) * 4 * Math.PI) * (h / 2 - 5),
      "#ef4444"
    );
  }, []);

  // 현재 자막
  const currentIdx = captions.findIndex(
    (c) => currentSec >= c.startTime && currentSec < c.endTime
  );
  const currentCaption = captions[currentIdx] || null;

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
        resumeTimer = setTimeout(() => {
          playerRef.current?.playVideo();
          setPlaying(true);
          setGaugeProgress(0);

          // 녹음시작
          startRecording();

          const currentCaption = captions[currentIdx];
          const startTime = currentCaption?.startTime;
          const endTime = currentCaption?.endTime;
          const deltaTime = endTime - startTime;

          stopTimer = setTimeout(() => {
            stopRecording();
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
      // clearTimeout(stopTimer);
    };
  }, [currentIdx]);

  // 글자별 하이라이트
  const chars = currentCaption?.script.split("") || [];
  const duration = currentCaption
    ? currentCaption.endTime - currentCaption.startTime
    : 1;
  const elapsed =
    currentCaption && currentSec >= currentCaption.startTime
      ? Math.min(currentSec - currentCaption.startTime, duration)
      : 0;
  const computedCount = Math.floor((elapsed / duration) * chars.length);
  const highlightCount = highlightEnabled ? computedCount : 0;



  // axios요청 할때는 영상이 끝났을때

  const previewMergedWav = async () => {
    const blobs = getAllBlobs();
    if (blobs.length === 0) return;
  
    const mergedBlob = await mergeWavBlobs(blobs);
    const url = URL.createObjectURL(mergedBlob);
    setAudioUrl(url);
  };
  return (
    <div className="flex flex-col flex-1 min-h-screen bg-black text-white">
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
              <img
                src="https://phinf.pstatic.net/image.nmv/blogucc28/2014/12/08/1637/0d4bc8c08ab22dd55a4fe98e3c9862ae86e1_ugcvideo_270P_01_16x9_logo.jpg?type=w2"
                alt="profile"
                className="w-9 h-9 rounded-full border-2 border-white"
              />
            </div>
          )}
          <div className="relative w-full h-full">
            <div className="aspect-video w-full overflow-hidden relative">
              <YouTube
                videoId="3mUg7PmCsNs"
                opts={ytOpts}
                onReady={onReady}
                className="absolute inset-0"
                iframeClassName="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-6 bg-black/30 rounded-md px-4 py-2 z-50 pointer-events-auto">
            <button onClick={() => seekBy(-10)}>
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
            <button onClick={() => seekBy(10)}>
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
            <img
              src="https://phinf.pstatic.net/image.nmv/blogucc28/2014/12/08/1637/0d4bc8c08ab22dd55a4fe98e3c9862ae86e1_ugcvideo_270P_01_16x9_logo.jpg?type=w2"
              alt="profile"
              className="w-9 h-9 rounded-full border-2 border-white"
            />
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
                  {String(Math.floor(c.startTime / 60)).padStart(2, "0")}:
                  {String(Math.floor(c.startTime % 60)).padStart(2, "0")}
                </span>
                {c.script}
              </div>
            ))}
          </div>
          <div className="px-4 pb-4 space-y-2 flex-none relative -bottom-8">
            <canvas
              ref={blueCanvasRef}
              className="w-full h-16 bg-gray-700 rounded"
            />
            <canvas
              ref={redCanvasRef}
              className="w-full h-16 bg-gray-700 rounded"
            />
            <div>
            <button onClick={previewMergedWav} className="bg-red-500 text-white p-4 ">병합된 녹음 듣기</button>
            {audioUrl && <audio src={audioUrl} controls/>}

            </div>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="bg-black p-4 text-center">
        {currentCaption && (
          <div className="relative inline-block w-full max-w-4xl mx-auto text-center">
            {/* 게이지 */}
            <div
              className="absolute inset-y-0 left-0 bg-blue-500/40 transition-all duration-1000"
              style={{ width: `${gaugeProgress * 100}%` }}
            />
            {/* 영어 대사 */}
            <p className="relative z-10 text-4xl font-extrabold leading-tight">
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
              {currentCaption.korean}
            </p>
          </div>
        )}
      </footer>
    </div>
  );
}
