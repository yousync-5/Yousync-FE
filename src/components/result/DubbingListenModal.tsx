// DubbingListenModal.tsx

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useTokenStore } from '@/store/useTokenStore';
import { useDuetTokenStore } from '@/store/useDuetTokenStore';
const YouTube = dynamic(() => import('react-youtube'), { ssr: false });

interface SynthesizeAudioResponse {
  status: string;
  message: string;
  dubbing_audio_url: string;
}

interface DubbingListenModalProps {
  open: boolean;
  onClose: () => void;
  modalId?: string;
  tokenId: string;
}


const DubbingListenModal: React.FC<DubbingListenModalProps> = ({ open, onClose, modalId, tokenId }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  let urlTokenId: string | undefined = undefined;
  let videoId: string | undefined = modalId;

  if (pathname.startsWith('/duetdubbing')) {
    urlTokenId = searchParams.get('selected') || undefined;
    if (!videoId) {
      videoId = pathname.split('/')[2];
    }
  } else {
    const parts = pathname.split('/');
    if (parts.length > 2) {
      urlTokenId = parts[2];
      if (!videoId) {
        videoId = parts[2];
      }
    }
  }
  
  const [audioResponse, setAudioResponse] = useState<SynthesizeAudioResponse | null>(null);
  const startTime = useTokenStore((state) => state.start_time);
  const endTime = useTokenStore((state) => state.end_time);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const youtubePlayerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { startTime: duetStartTime, endTime: duetEndTime } = useDuetTokenStore();
  
  const isDuetDubbing = pathname.startsWith('/duetdubbing');
  
  const finalStartTime = isDuetDubbing ? duetStartTime : startTime;
  const finalEndTime = isDuetDubbing ? duetEndTime : endTime;
  
  // 디버깅 로그 추가
  useEffect(() => {
    if (open) {
      console.log('[DubbingListenModal] 모달 열림');
      console.log('[DubbingListenModal] isDuetDubbing:', isDuetDubbing);
      console.log('[DubbingListenModal] startTime:', startTime);
      console.log('[DubbingListenModal] endTime:', endTime);
      console.log('[DubbingListenModal] duetStartTime:', duetStartTime);
      console.log('[DubbingListenModal] duetEndTime:', duetEndTime);
      console.log('[DubbingListenModal] finalStartTime:', finalStartTime);
      console.log('[DubbingListenModal] finalEndTime:', finalEndTime);
    }
  }, [open, isDuetDubbing, startTime, endTime, duetStartTime, duetEndTime, finalStartTime, finalEndTime]);

  // [수정 1] 플레이어가 준비되었는지 추적하는 상태 추가
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const getSynthesizeAudio = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.post<SynthesizeAudioResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/synthesize/${urlTokenId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAudioResponse(res.data);
    } catch (error) {
      setAudioResponse(null);
    }
  };

  useEffect(() => {
    if (open) {
      setShowThumbnail(true);
      setIsPlaying(false);
      // 모달이 열릴 때 플레이어 준비 상태 초기화
      setIsPlayerReady(false); 
      if (urlTokenId) {
        getSynthesizeAudio();
      }
    }
  }, [open, urlTokenId]);

  const youtubeOpts = {
    width: 640,
    height: 360,
    playerVars: {
      autoplay: 0,
      mute: 1,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      fs: 0,
      disablekb: 1,
      iv_load_policy: 3,
      showinfo: 0,
      cc_load_policy: 0,
      playsinline: 1,
      // start와 end 옵션이 제대로 적용되도록 수정
      start: finalStartTime ? Math.floor(finalStartTime) : undefined,
      end: finalEndTime ? Math.ceil(finalEndTime) : undefined
    },
  };

  // [수정 2] onReady 핸들러는 플레이어 준비 상태만 설정하도록 단순화
  const handleYouTubeReady = (event: any) => {
    console.log("[DubbingListenModal] YouTube Player is Ready.");
    youtubePlayerRef.current = event.target;
    event.target.mute();
    setIsPlayerReady(true);
  };
  
  // [수정 3] 플레이어가 준비되고, 시작 시간이 유효할 때 seekTo를 실행하는 useEffect 추가
  useEffect(() => {
    if (isPlayerReady && youtubePlayerRef.current && typeof finalStartTime === 'number' && !isNaN(finalStartTime)) {
      console.log("[useEffect] Player is ready and start time is valid. Seeking to:", finalStartTime);
      youtubePlayerRef.current.seekTo(finalStartTime, true);
      youtubePlayerRef.current.pauseVideo();
    }
  }, [isPlayerReady, finalStartTime]); // 플레이어 준비 상태와 시작 시간에 따라 실행

  const handleStateChange = (event: any) => {
    if (event.data === 1) { // playing
      setIsPlaying(true);
      if (typeof finalEndTime === 'number' && !isNaN(finalEndTime)) {
        console.log('[DubbingListenModal] 영상 재생 시작, 종료 시간 체크 설정:', finalEndTime);
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
          const current = youtubePlayerRef.current?.getCurrentTime();
          if (typeof current === 'number' && current >= finalEndTime) {
            console.log('[DubbingListenModal] 종료 시간 도달:', current, '>=', finalEndTime);
            youtubePlayerRef.current.pauseVideo();
            setIsPlaying(false);
            if(intervalRef.current) clearInterval(intervalRef.current);
          }
        }, 200);
      } else {
        console.warn('[DubbingListenModal] 종료 시간이 유효하지 않음:', finalEndTime);
      }
    } else { // paused, ended, etc.
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  };
  
  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      youtubePlayerRef.current?.pauseVideo();
    } else {
      setShowThumbnail(false);
      audioRef.current?.play();
      youtubePlayerRef.current?.playVideo();
    }
  };
  
  const handleRestart = () => {
    setShowThumbnail(false);
    
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
    
    if (youtubePlayerRef.current && typeof finalStartTime === 'number' && !isNaN(finalStartTime)) {
      console.log('[DubbingListenModal] 영상 재시작, 시작 시간으로 이동:', finalStartTime);
      youtubePlayerRef.current.seekTo(finalStartTime, true);
      setTimeout(() => {
        youtubePlayerRef.current?.playVideo();
      }, 100);
    } else {
      console.warn('[DubbingListenModal] 시작 시간이 유효하지 않음:', finalStartTime);
      // 시작 시간이 유효하지 않으면 0초로 이동
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.seekTo(0, true);
        setTimeout(() => {
          youtubePlayerRef.current?.playVideo();
        }, 100);
      }
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className="relative bg-gray-900 rounded-3xl shadow-2xl z-10 flex flex-col items-center px-8 py-6"
        style={{ maxWidth: '800px', width: '90vw' }}
      >
        <div className="mb-6 flex justify-center" style={{ width: '640px', height: '360px' }}>
          <div className="relative" style={{ width: '640px', height: '360px' }}>
            {videoId && (
              <YouTube
                videoId={videoId}
                opts={youtubeOpts}
                onReady={handleYouTubeReady}
                onStateChange={handleStateChange}
                className="rounded-xl border border-gray-800"
                style={{ width: '640px', height: '360px', position: 'absolute', top: 0, left: 0 }}
              />
            )}
            <div 
              className="absolute inset-0 rounded-xl z-10"
              onClick={(e) => e.stopPropagation()}
              style={{ cursor: 'default' }}
            />
            {showThumbnail && (
              <div className="absolute inset-0 rounded-xl z-20 flex items-center justify-center bg-gray-900">
                <img
                  src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
                  alt="Video thumbnail"
                  className="rounded-xl w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center" onClick={handlePlayPause}>
                  <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center cursor-pointer">
                    <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <audio ref={audioRef} src={audioResponse?.dubbing_audio_url || ""} />
        <div className="flex flex-row gap-4 mt-4">
          <button
            onClick={handlePlayPause}
            className={`w-16 h-16 ${isPlaying ? 'bg-gradient-to-r from-gray-500 to-gray-700' : 'bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-600'} text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-lg border-2 border-white/20`}
            title={isPlaying ? '정지' : '재생'}
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M5 5h10v10H5z"/></svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M6 4l10 6-10 6z"/></svg>
            )}
          </button>
          <button
            className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-lg border-2 border-white/20"
            onClick={handleRestart}
            title="처음부터"
          >
           <svg viewBox="0 0 48 48" fill="none" className={`w-7 h-7`} stroke="currentColor" strokeWidth="4">
                <path d="M8 24c0-8.837 7.163-16 16-16 4.418 0 8.418 1.79 11.314 4.686" strokeLinecap="round"/>
                <path d="M40 8v8h-8" strokeLinecap="round"/>
                <path d="M40 24c0 8.837-7.163 16-16 16-4.418 0-8.418-1.79-11.314-4.686" strokeLinecap="round"/>
                <path d="M8 40v-8h8" strokeLinecap="round"/>
              </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DubbingListenModal;