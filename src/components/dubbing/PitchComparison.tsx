"use client";

import ServerPitchGraph from "@/components/graph/ServerPitchGraph";
import { MyPitchGraph } from '@/components/graph/MyPitchGraph';
import type { Caption } from "@/types/caption";
import { VideoPlayerRef } from "./VideoPlayer";
import { useDubbingRecorder } from '@/hooks/useDubbingRecorder';
import { useEffect, useRef, useState } from 'react';
import { useAudioStore } from '@/store/useAudioStore';
import VideoPlayer from "./VideoPlayer";


interface PitchComparisonProps {
  currentScriptIndex: number;
  captions: Caption[];
  tokenId: string;
  serverPitchData: Array<{ time: number; hz: number | null }>;
  videoPlayerRef?: React.RefObject<VideoPlayerRef | null>;
  onNextScript?: (nextIndex: number) => void;
}

export default function PitchComparison({ 
  currentScriptIndex, 
  captions, 
  tokenId, 
  serverPitchData,
  videoPlayerRef,
  onNextScript,
}: PitchComparisonProps) {

  const {
    recording,
    recordedScripts,
    uploading,
    startScriptRecording,
    stopScriptRecording,
    allRecorded,
    uploadAllRecordings,
  } = useDubbingRecorder({
    captions,
    tokenId,
    onUploadComplete: (success) => {
      alert(success ? '녹음 업로드 성공!' : '녹음 업로드 실패!');
    },
  });

  const [volume, setVolume] = useState(0);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (!recording) {
      setVolume(0);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    const analyser = useAudioStore.getState().analyser;
    if (!analyser) return;
    const dataArray = new Uint8Array(analyser.fftSize);
    const update = () => {
      analyser.getByteTimeDomainData(dataArray);
      const avg = dataArray.reduce((a, b) => a + Math.abs(b - 128), 0) / dataArray.length;
      setVolume(Math.min(1, (avg / 128) * 2));
      rafRef.current = requestAnimationFrame(update);
    };
    update();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [recording]);

  const handleMicClick = () => {
    if (videoPlayerRef?.current && captions[currentScriptIndex]) {
      const currentScript = captions[currentScriptIndex];
      videoPlayerRef.current.seekTo(currentScript.start_time);
      videoPlayerRef.current.playVideo();
      if (typeof onNextScript === 'function') {
        onNextScript(currentScriptIndex);
      }
      startScriptRecording(currentScriptIndex);
    }
  };

  // --- 녹음 자동 종료 플래그 ---
  const stoppedRef = useRef(false);
  useEffect(() => {
    if (!videoPlayerRef?.current) return;
    if (recording) {
      stoppedRef.current = false;
    }
    const interval = setInterval(() => {
      const player = videoPlayerRef.current;
      if (!player) {
        console.error('[ERROR] videoPlayerRef.current is null');
        return;
      }
      const currentTime = player.getCurrentTime();
      const endTime = captions[currentScriptIndex]?.end_time;
      if (recording && endTime !== undefined && currentTime >= endTime && !stoppedRef.current) {
        console.log('[DEBUG] stopScriptRecording called', { currentScriptIndex, currentTime, endTime });
        player.pauseVideo();
        try {
          stopScriptRecording(currentScriptIndex);
        } catch (e) {
          console.error('[ERROR] stopScriptRecording threw', e);
        }
        stoppedRef.current = true;
      }
    }, 100);
    return () => clearInterval(interval);
  }, [recording, currentScriptIndex, captions, videoPlayerRef, stopScriptRecording]);

  useEffect(() => {
    if (allRecorded && !uploading) {
      uploadAllRecordings();
    }
  }, [allRecorded, uploading, uploadAllRecordings]);

  const handleNextScript = () => {
    if (!captions || captions.length === 0) return;
    const nextIndex = Math.min(currentScriptIndex + 1, captions.length - 1);
    if (nextIndex !== currentScriptIndex && onNextScript) {
      onNextScript(nextIndex);
      // 영상도 다음 문장 시작으로 이동 및 재생
      if (videoPlayerRef?.current) {
        videoPlayerRef.current.seekTo(captions[nextIndex].start_time);
        videoPlayerRef.current.playVideo();
      }
    }
  };

  const getCurrentScriptPlaybackRange = () => {
    if (!captions || captions.length === 0) {
      return { startTime: 0, endTime: undefined };
    }
    const currentScript = captions[currentScriptIndex];
    return {
      startTime: currentScript?.start_time || 0,
      endTime: currentScript?.end_time || undefined,
    };
  };

  const handleTimeUpdate = (currentTime: number) => {
    // ... (필요시 기존 로직 복구) ...
  };

  useEffect(() => {
    const logInterval = setInterval(() => {
      console.log('[DEBUG][3s]', {
        recording,
        currentScriptIndex,
        uploading,
        allRecorded,
        recordedScripts,
        volume,
      });
    }, 3000);
    return () => clearInterval(logInterval);
  }, [recording, currentScriptIndex, uploading, allRecorded, recordedScripts, volume]);

  // recording 값이 바뀔 때만 로그 출력
  const prevRecordingRef = useRef(recording);
  useEffect(() => {
    if (prevRecordingRef.current !== recording) {
      console.log('[DEBUG][mic button render] recording:', recording);
      prevRecordingRef.current = recording;
    }
  }, [recording]);

  return (
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
              captionState={{ currentIdx: currentScriptIndex, captions: captions }}
              token_id={tokenId}
              serverPitchData={serverPitchData}
            />
          </div>
        </div>
        
        <div className="flex justify-center mt-4 space-x-4">
          <div className="flex flex-col items-center">
            <button
              onClick={handleMicClick}
              disabled={recording}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-lg border-2 border-white/20 ${recording ? 'bg-green-500 animate-pulse-mic' : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white'}`}
              style={recording ? { boxShadow: '0 0 0 8px rgba(34,197,94,0.4), 0 0 0 16px rgba(34,197,94,0.2)' } : undefined}
            >
              {recording && (
                <span className="absolute w-24 h-24 rounded-full border-4 border-green-400 opacity-60 animate-ping-mic z-0"></span>
              )}
              <svg 
                className="w-6 h-6 relative z-10" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" 
                  clipRule="evenodd" 
                />
              </svg>
            </button>
            {recording && (
              <div className="w-28 h-4 bg-gray-800 rounded-lg mt-3 overflow-hidden border-2 border-green-500 shadow-lg">
                <div
                  className={`h-4 transition-all duration-100 ${volume > 0.6 ? 'bg-lime-400 shadow-[0_0_16px_4px_rgba(163,230,53,0.7)]' : 'bg-green-400'}`}
                  style={{ width: `${Math.min(100, volume * 100)}%` }}
                />
              </div>
            )}
          </div>
          <button
            onClick={handleNextScript}
            className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-lg border-2 border-white/20"
            title="다음 문장으로 이동"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 5l7 5-7 5V5zM3 5h2v10H3V5z" />
            </svg>
          </button>
        </div>
        {/* Video Player */}
        {/* <VideoPlayer
          videoId={tokenId}
          onTimeUpdate={handleTimeUpdate}
          startTime={getCurrentScriptPlaybackRange().startTime}
          endTime={getCurrentScriptPlaybackRange().endTime}
          disableAutoPause={true}
          ref={videoPlayerRef}
          onEndTimeReached={() => stopScriptRecording(currentScriptIndex)}
        /> */}
      </div>
    </div>
  );
} 