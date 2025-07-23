// DubbingListenModal.tsx

import React, { useEffect, useState, useRef, useMemo } from 'react';
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
  
  // 디버깅 로그 제거
  useEffect(() => {
    // 모달이 열릴 때 필요한 초기화 작업만 수행
  }, [open, isDuetDubbing, startTime, endTime, duetStartTime, duetEndTime, finalStartTime, finalEndTime]);

  // 반응형 크기 계산을 위한 훅 추가
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080
  });

  // 화면 크기 변경 감지
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 반응형 비디오 크기 계산
  const calculateVideoSize = () => {
    // 기본 비디오 크기 (16:9 비율)
    const baseWidth = 1280;
    const baseHeight = 720;
    
    // 모달 최대 너비 (화면 너비의 90%)
    const maxModalWidth = windowSize.width * 0.9;
    // 모달 최대 높이 (화면 높이의 80%)
    const maxModalHeight = windowSize.height * 0.8;
    
    // 비디오 최대 너비 (패딩 고려)
    const maxVideoWidth = maxModalWidth - 40; // 좌우 패딩 20px씩
    // 비디오 최대 높이 (패딩과 버튼 영역 고려)
    const maxVideoHeight = maxModalHeight - 140; // 상하 패딩 + 버튼 영역
    
    // 너비 기준으로 크기 계산
    let width = Math.min(baseWidth, maxVideoWidth);
    let height = width * (baseHeight / baseWidth);
    
    // 높이가 최대 높이를 초과하면 높이 기준으로 다시 계산
    if (height > maxVideoHeight) {
      height = maxVideoHeight;
      width = height * (baseWidth / baseHeight);
    }
    
    return {
      width: Math.floor(width),
      height: Math.floor(height)
    };
  };
  
  const videoSize = calculateVideoSize();

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

  // [수정 1] 플레이어가 준비되었는지 추적하는 상태 추가
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const youtubeOpts = {
    width: calculateVideoSize().width,
    height: calculateVideoSize().height,
    playerVars: {
      autoplay: 0, // 자동 재생 비활성화
      mute: 1,     // 음소거 활성화
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

  // onReady 핸들러는 플레이어 준비 상태만 설정하도록 단순화
  const handleYouTubeReady = (event: any) => {
    youtubePlayerRef.current = event.target;
    
    // 항상 음소거 상태로 유지
    event.target.mute();
    
    setIsPlayerReady(true);
    
    // 썸네일 제거
    setShowThumbnail(false);
    
    // 영상 자동 재생
    if (typeof finalStartTime === 'number' && !isNaN(finalStartTime)) {
      event.target.seekTo(finalStartTime, true);
      
      // 약간의 지연 후 재생 시작
      setTimeout(() => {
        if (youtubePlayerRef.current) {
          youtubePlayerRef.current.playVideo();
          setIsPlaying(true);
          
          // 오디오도 함께 재생
          if (audioRef.current && audioResponse?.dubbing_audio_url) {
            audioRef.current.play().catch(err => {
              console.error('오디오 재생 실패:', err);
              // 오디오 재생 실패 시 사용자에게 알림 (선택 사항)
            });
          }
        }
      }, 500);
    }
  };

  const handleStateChange = (event: any) => {
    // 항상 음소거 상태 유지
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.mute();
    }
    
    if (event.data === 1) { // playing
      setIsPlaying(true);
      if (typeof finalEndTime === 'number' && !isNaN(finalEndTime)) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
          const current = youtubePlayerRef.current?.getCurrentTime();
          if (typeof current === 'number' && current >= finalEndTime) {
            youtubePlayerRef.current.pauseVideo();
            setIsPlaying(false);
            if(intervalRef.current) clearInterval(intervalRef.current);
          }
        }, 200);
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
      
      // 항상 음소거 상태 유지
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.mute();
      }
      
      // 오디오 URL이 있을 때만 재생 시도
      if (audioRef.current && audioResponse?.dubbing_audio_url) {
        audioRef.current.play().catch(err => {
          console.error('오디오 재생 실패:', err);
        });
      }
      
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
      // 항상 음소거 상태 유지
      youtubePlayerRef.current.mute();
      
      youtubePlayerRef.current.seekTo(finalStartTime, true);
      setTimeout(() => {
        youtubePlayerRef.current?.playVideo();
      }, 100);
    } else {
      // 시작 시간이 유효하지 않으면 0초로 이동
      if (youtubePlayerRef.current) {
        // 항상 음소거 상태 유지
        youtubePlayerRef.current.mute();
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
        className="relative bg-gray-900 rounded-3xl shadow-2xl z-10 flex flex-col items-center px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6 md:py-8"
        style={{ 
          maxWidth: Math.min(calculateVideoSize().width + 80, 1400), // 비디오 너비 + 패딩
          width: '95vw'
        }}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-800/80 hover:bg-gray-700 flex items-center justify-center transition-all duration-200 text-gray-400 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <div className="mb-4 sm:mb-6 md:mb-8 flex justify-center" style={{ width: calculateVideoSize().width, height: calculateVideoSize().height }}>
          <div 
            className="relative" 
            style={{ width: calculateVideoSize().width, height: calculateVideoSize().height }}
          >
            {videoId && (
              <YouTube
                videoId={videoId}
                opts={youtubeOpts}
                onReady={handleYouTubeReady}
                onStateChange={handleStateChange}
                className="rounded-xl border border-gray-800"
                style={{ width: calculateVideoSize().width, height: calculateVideoSize().height, position: 'absolute', top: 0, left: 0 }}
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
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {audioResponse?.dubbing_audio_url ? (
          <audio ref={audioRef} src={audioResponse.dubbing_audio_url} />
        ) : (
          <audio ref={audioRef} />
        )}
        <div className="flex flex-row gap-8 mt-6">
          <button
            onClick={handlePlayPause}
            className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-300 shadow-lg border border-white/10 transform hover:scale-105 active:scale-95 ${
              isPlaying 
                ? 'bg-gradient-to-br from-purple-800 to-indigo-900 hover:from-purple-700 hover:to-indigo-800' 
                : 'bg-gradient-to-br from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700'
            }`}
            style={{ boxShadow: isPlaying ? '0 0 10px rgba(139, 92, 246, 0.3)' : '0 0 10px rgba(20, 184, 166, 0.3)' }}
            title={isPlaying ? '정지' : '재생'}
          >
            {isPlaying ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5.14v14l11-7-11-7z" />
              </svg>
            )}
          </button>
          <button
            className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-300 shadow-lg border border-white/10 transform hover:scale-105 active:scale-95 bg-gradient-to-br from-slate-700 to-slate-800 hover:from-amber-700 hover:to-orange-800 text-white`}
            style={{ boxShadow: '0 0 10px rgba(245, 158, 11, 0.3)' }} // Loop 버튼의 기본 boxShadow 유지

            onClick={handleRestart}
            title="처음부터"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="2">
              <path d="M4 12c0-4.4 3.6-8 8-8 2.2 0 4.2 0.9 5.7 2.3" strokeLinecap="round"/>
              <path d="M20 4v4h-4" strokeLinecap="round"/>
              <path d="M20 12c0 4.4-3.6 8-8 8-2.2 0-4.2-0.9-5.7-2.3" strokeLinecap="round"/>
              <path d="M4 20v-4h4" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DubbingListenModal;