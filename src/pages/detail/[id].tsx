"use client";

import { useState, useRef, useEffect } from "react";
import YouTube, { YouTubeEvent } from "react-youtube";
import { extractYoutubeVideoId } from "@/utils/extractYoutubeVideoId";
import { mergeWavBlobs } from "@/utils/mergeWavBlobs";
import { useRouter } from "next/router";
import axios from "axios";

import ServerPitchGraph from "@/components/graph/ServerPitchGraph";
import { MyPitchGraph } from "@/components/graph/MyPitchGraph";
import SlotScript from "@/components/dubbing/SlotScript";
import { Timer } from "@/components/Timer";

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

import type { CaptionState } from "@/type/PitchdataType";

/* ────────── 타입 ────────── */
export interface Caption {
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
  actor: { name: string; id: number };
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

export interface TokenInfo {
  message: string;
  job_id: string;
  status: string;
}

/* ────────── 컴포넌트 ────────── */
export default function Detail() {
  const playerRef = useRef<YT.Player | null>(null);

  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [currentSec, setCurrentSec] = useState(0);

  const [captions, setCaptions] = useState<Caption[]>([]);
  const [prevIdx, setPrevIdx] = useState<number | null>(null);
  const [gaugeProgress, setGaugeProgress] = useState(0);
  const [highlightEnabled, setHighlightEnabled] = useState(true);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [movieData, setMovieData] = useState<Video | null>(null);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);

  const { startRecording, stopRecording, recording, getAllBlobs } =
    useVoiceRecorder();
  const { audioCtx } = useAudioStore();
  useAudioStream();

  /* ----- URL 파라미터 ----- */
  const router = useRouter();
  const token_id = router.query.id;
  const movieUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/tokens/${token_id}`;

  /* ----- 자막·영상 정보 fetch ----- */
  useEffect(() => {
    if (!token_id || Array.isArray(token_id)) return;

    const fetchCaptions = async () => {
      try {
        const { data } = await axios.get<Video>(movieUrl);
        setCaptions(data.scripts);
        setMovieData(data);
      } catch (err) {
        console.error("자막 스크립트를 불러올 수 없습니다.", err);
      }
    };

    fetchCaptions();
  }, [token_id, movieUrl]);

  /* ----- YouTube 옵션 / 제어 ----- */
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
    playing ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
    setPlaying(!playing);
  };

  const seekBy = (currentIdx: number) => {
    const nextIdx = currentIdx + 1;
    const prevIdx = currentIdx - 1;

    return {
      next: () => {
        if (playerRef.current && nextIdx < captions.length)
          playerRef.current.seekTo(captions[nextIdx].start_time, true);
      },
      prev: () => {
        if (playerRef.current && prevIdx >= 0)
          playerRef.current.seekTo(captions[prevIdx].start_time, true);
      },
    };
  };

  /* ----- 현재 재생 시간 추적 ----- */
  useEffect(() => {
    const id = setInterval(() => {
      setCurrentSec(playerRef.current?.getCurrentTime() ?? 0);
    }, 200);
    return () => clearInterval(id);
  }, []);

  /* ----- 현재 자막 인덱스 & 상태 ----- */
  const currentIdx = captions.findIndex(
    (c) => currentSec >= c.start_time && currentSec < c.end_time
  );
  const currentCaption = captions[currentIdx] || null;

  const captionState: CaptionState = { currentIdx, captions };

  /* ----- 자막 바뀔 때 녹음·게이지·하이라이트 ----- */
  useEffect(() => {
    let pauseTimer: NodeJS.Timeout;
    let resumeTimer: NodeJS.Timeout;
    let enableTimer: NodeJS.Timeout;
    let stopTimer: NodeJS.Timeout;

    if (prevIdx !== null && currentIdx !== prevIdx) {
      setHighlightEnabled(false);
      playerRef.current?.pauseVideo();
      setPlaying(false);
      setGaugeProgress(0);

      pauseTimer = setTimeout(() => {
        setGaugeProgress(1);

        resumeTimer = setTimeout(async () => {
          playerRef.current?.playVideo();
          setPlaying(true);
          setGaugeProgress(0);

          if (recording && playingIdx !== null) await stopRecording(playingIdx);
          setPlayingIdx(currentIdx);
          startRecording();

          const delta =
            captions[currentIdx].end_time - captions[currentIdx].start_time;

          stopTimer = setTimeout(
            async () => await stopRecording(currentIdx),
            delta * 1000
          );

          enableTimer = setTimeout(() => setHighlightEnabled(true), 200);
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

  /* ----- 병합된 WAV 미리듣기 & 업로드 ----- */
  const previewMergedWav = async () => {
    const blobs = getAllBlobs();
    if (blobs.length === 0 || !audioCtx) return;
    const merged = await mergeWavBlobs(blobs, audioCtx);
    setAudioUrl(URL.createObjectURL(merged));
  };

  const sendWav = async () => {
    if (!token_id || Array.isArray(token_id)) return;
    const blobs = getAllBlobs();
    if (blobs.length === 0 || !audioCtx) return;

    const audioBlob = await mergeWavBlobs(blobs, audioCtx);
    const formData = new FormData();
    formData.append("file", audioBlob, "dub.wav");

    try {
      const { data } = await axios.post<TokenInfo>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/tokens/${token_id}/upload-audio`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setTokenInfo(data);
    } catch (err) {
      console.error("업로드 오류", err);
    }
  };

  /* ----- 로딩 가드 ----- */
  if (!movieData) return null;
  const videoId = extractYoutubeVideoId(movieData.youtube_url);

  /* ----- 렌더 ----- */
  return (
    <div className="flex min-h-screen flex-col bg-black text-white pt-20">
      <div className="flex flex-1">
        {/* ───── Video Area ───── */}
        <div
          className={
            expanded ? "fixed inset-0 z-50 bg-black" : "relative flex-1 overflow-hidden"
          }
        >
          {expanded && (
            <div className="absolute top-4 right-4 z-50 flex items-center space-x-2 rounded-md bg-gray-900/80 p-2 opacity-60">
              <button onClick={() => setExpanded(false)}>
                <Bars3Icon className="h-7 w-7 text-white" />
              </button>
            </div>
          )}

          <div className="relative h-full w-full">
            <div className="relative w-full pb-[56.25%]">
              <YouTube
                videoId={videoId || undefined}
                opts={ytOpts}
                onReady={onReady}
                className="absolute inset-0"
                iframeClassName="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>

          {/* ───── Video Controls ───── */}
          <div className="pointer-events-auto absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center space-x-6 rounded-md bg-black/30 px-4 py-2">
            <button onClick={() => seekBy(currentIdx).prev()}>
              <ChevronLeftIcon className="h-6 w-6 text-white" />
            </button>
            <button onClick={togglePlay}>
              {playing ? (
                <PauseIcon className="h-6 w-6 text-white" />
              ) : (
                <PlayIcon className="h-6 w-6 text-white" />
              )}
            </button>
            <button
              onClick={() => {
                playerRef.current?.seekTo(0, true);
                setPlaying(true);
              }}
            >
              <ArrowPathIcon className="h-6 w-6 text-white" />
            </button>
            <button onClick={() => seekBy(currentIdx).next()}>
              <ChevronRightIcon className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>

        {/* ───── Sidebar ───── */}
        <aside className={`${expanded ? "hidden" : "flex w-80 flex-col bg-gray-800"}`}>
          <div className="flex items-center justify-end space-x-2 bg-gray-900/80 p-4">
            <button onClick={() => setExpanded(true)}>
              <Bars3Icon className="h-7 w-7 text-white" />
            </button>
          </div>

          {/* 자막 SlotScript */}
          <SlotScript captions={captions} currentIdx={currentIdx} />

          {/* 그래프 & 버튼 영역 */}
          <div className="relative -bottom-2 flex-none space-y-2 px-4 pb-4">
            <div className="h-16 w-full rounded bg-gray-700">
              <ServerPitchGraph
                captionState={captionState}
                token_id={Number(router.query.id)}
              />
            </div>
            <div className="h-16 w-full rounded bg-gray-700">
              <MyPitchGraph currentIdx={currentIdx} />
            </div>

            <button
              onClick={previewMergedWav}
              className="rounded-lg bg-red-500 p-4 text-white"
            >
              병합된 녹음 듣기
            </button>

            {audioUrl && (
              <div>
                <audio src={audioUrl} controls />
                <button
                  onClick={sendWav}
                  className="rounded-lg bg-red-500 p-4 text-white"
                >
                  서버로 보내기
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ───── Footer (타이머 & 대사) ───── */}
      {currentCaption && (
        <footer className="bg-black p-4 text-center">
          <div className="flex w-full justify-center">
            <div className="flex items-center space-x-4">
              <Timer currentIdx={currentIdx} />

              <div className="relative text-left">
                <div
                  className="absolute inset-y-0 left-0 bg-blue-500/40 transition-all duration-1000"
                  style={{ width: `${gaugeProgress * 100}%` }}
                />
                <p className="relative z-10 whitespace-nowrap text-4xl font-extrabold leading-tight">
                  {currentCaption.script.split("").map((ch, i) => (
                    <span
                      key={i}
                      className={
                        i <
                        Math.floor(
                          ((currentSec - currentCaption.start_time) /
                            (currentCaption.end_time - currentCaption.start_time)) *
                            currentCaption.script.length
                        ) && highlightEnabled
                          ? "text-green-400"
                          : "text-white"
                      }
                    >
                      {ch}
                    </span>
                  ))}
                </p>
                <p className="relative z-10 mt-2 text-xl italic text-gray-300">
                  {currentCaption.translation}
                </p>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
