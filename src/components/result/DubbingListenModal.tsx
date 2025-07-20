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
  // 1. useParams로 시도
  const pathname = usePathname();
  const searchParams = useSearchParams();
  let urlTokenId: string | undefined = undefined;
  if (pathname.startsWith('/duetdubbing')) {
    if (typeof window !== 'undefined' && searchParams) {
      urlTokenId = searchParams.get('selected') || undefined;
    }
  } else {
    // /dubbing/72?modalId=... → ['', 'dubbing', '72']
    const parts = pathname.split('/');
    if (parts.length > 2) {
      urlTokenId = parts[2];
    }
  }
  console.log("[DubbingListenModal] urlTokenId:", urlTokenId);
// 합성 오디오 응답 state
const [audioResponse, setAudioResponse] = useState<SynthesizeAudioResponse | null>(null);
  const startTime = useTokenStore((state) => state.start_time);
  const endTime = useTokenStore((state) => state.end_time);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const youtubePlayerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { startTime: duetStartTime, endTime: duetEndTime } = useDuetTokenStore()
  
  // 🆕 URL에 따른 시간 분기처리
  const isDuetDubbing = pathname.startsWith('/duetdubbing');
  const finalStartTime = isDuetDubbing ? duetStartTime : startTime;
  const finalEndTime = isDuetDubbing ? duetEndTime : endTime;
  
  // 🆕 썸네일 표시 상태
  const [showThumbnail, setShowThumbnail] = useState(true);
  
  // 🆕 재생 상태 관리
  const [isPlaying, setIsPlaying] = useState(false);
  
  console.log("일찍퇴근 기원 1일차", {
    isDuetDubbing,
    duetStartTime,
    duetEndTime,
    startTime,
    endTime,
    finalStartTime,
    finalEndTime
  });
  // 개발용 더미 데이터
  // useEffect(() => {
  //   setAudioResponse({
  //     status: "success",
  //     message: "합성 및 업로드 완료",
  //     dubbing_audio_url: "https://testgrid-pitch-bgvoice-yousync.s3.amazonaws.com/user_Dubbing_auido/4/72/dubbing_audio.wav?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA6GBMBOXKN4OYNXQG%2F20250719%2Fap-northeast-2%2Fs3%2Faws4_request&X-Amz-Date=20250719T165514Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=3525ab5d0b282165c06f25e19299e6bd7b6b112be5d23fe46ebdf2be7f15ad8f"
  //   });
  // }, []);
  const getSynthesizeAudio = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.post<SynthesizeAudioResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/synthesize/${urlTokenId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(">> 합성음성", res.data); 
      setAudioResponse(res.data);
    } catch (error) {
      setAudioResponse(null);
    }
  }
  useEffect(() => {
    if(open){
      setShowThumbnail(true);
      setIsPlaying(false);
    }
  }, [open])

  useEffect(() => {
    if(open && urlTokenId){
      getSynthesizeAudio();
    }
  }, [open, urlTokenId]);

  // 🆕 고정 크기 YouTube 옵션
  const youtubeOpts = {
    width: 640,
    height: 360,
    playerVars: {
      autoplay: 0, // 자동재생 off
      mute: 1, // 항상 음소거
      controls: 0, // 컨트롤 바 숨김
      modestbranding: 1,
      rel: 0, // 관련영상(추천영상) 안 뜨게
      fs: 0, // 전체화면 버튼 비활성화
      disablekb: 1, // 키보드 단축키 비활성화
      iv_load_policy: 3, // 주석 비활성화
      showinfo: 0, // 영상 정보 숨김
      cc_load_policy: 0, // 자막 비활성화
      playsinline: 1, // 인라인 재생 강제
    },
  };

  // YouTube onReady 핸들러
  const handleYouTubeReady = (event: any) => {
    youtubePlayerRef.current = event.target;
    event.target.mute();
    if (typeof finalStartTime === 'number') {
      event.target.seekTo(finalStartTime, true);
      event.target.pauseVideo(); // start_time에서 멈춤
    }
  };

  // YouTube onStateChange 핸들러: endTime 도달 시 정지
  const handleStateChange = (event: any) => {
    // 🆕 재생 상태 업데이트
    if (event.data === 1) { // 1: playing
      setIsPlaying(true);
      if (typeof finalEndTime === 'number') {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
          const current = youtubePlayerRef.current?.getCurrentTime();
          if (typeof current === 'number' && current >= finalEndTime) {
            youtubePlayerRef.current.pauseVideo();
            setIsPlaying(false);
            clearInterval(intervalRef.current!);
          }
        }, 200);
      }
    } else if (event.data === 2) { // 2: paused
      setIsPlaying(false);
    } else if (event.data === 0) { // 0: ended
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  };

  // 🆕 토글 재생/정지 핸들러
  const handlePlayPause = () => {
    if (isPlaying) {
      // 정지
      audioRef.current?.pause();
      youtubePlayerRef.current?.pauseVideo();
      setIsPlaying(false);
    } else {
      // 재생
      setShowThumbnail(false);
      audioRef.current?.play();
      youtubePlayerRef.current?.playVideo();
      setIsPlaying(true);
    }
  };
  
  const handleRestart = () => {
    // 🆕 처음부터 재생 시 썸네일 숨기기
    setShowThumbnail(false);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
    if (youtubePlayerRef.current && typeof finalStartTime === 'number') {
      youtubePlayerRef.current.seekTo(finalStartTime, true);
      youtubePlayerRef.current.playVideo();
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className="relative bg-gray-900 rounded-3xl shadow-2xl z-10 flex flex-col items-center px-8 py-6"
        style={{
          maxWidth: '800px',
          width: '90vw',
          minWidth: '400px',
          maxHeight: '85vh',
          margin: '7vh auto',
          border: '2.5px solid #23272a',
        }}
      >
        {/* 항상 고정된 크기의 영상/썸네일 영역 */}
        <div className="mb-6 flex justify-center" style={{ width: '640px', height: '360px' }}>
          <div className="relative w-full h-full" style={{ width: '640px', height: '360px' }}>
            {modalId && (
              <YouTube
                videoId={modalId}
                opts={youtubeOpts}
                onReady={handleYouTubeReady}
                onStateChange={handleStateChange}
                className="rounded-xl border border-gray-800"
                style={{
                  width: '640px',
                  height: '360px',
                  position: 'absolute',
                  top: 0,
                  left: 0
                }}
              />
            )}
            {/* YouTube 영상만 클릭 차단하는 오버레이 */}
            <div 
              className="absolute inset-0 rounded-xl z-10"
              onClick={(e) => e.stopPropagation()}
              style={{ 
                cursor: 'default',
                userSelect: 'none',
                width: '640px',
                height: '360px',
                top: 0,
                left: 0
              }}
            />
            {/* 썸네일 이미지 (로딩 화면 가리기) */}
            {showThumbnail && (
              <div 
                className="absolute inset-0 rounded-xl z-20 flex items-center justify-center bg-gray-900"
                style={{
                  width: '640px',
                  height: '360px',
                  top: 0,
                  left: 0
                }}
              >
                <img
                  src={`https://img.youtube.com/vi/${modalId}/maxresdefault.jpg`}
                  alt="Video thumbnail"
                  className="rounded-xl w-full h-full object-cover"
                  onError={(e) => {
                    // 고화질 썸네일이 없으면 중간 화질로 대체
                    const target = e.target as HTMLImageElement;
                    target.src = `https://img.youtube.com/vi/${modalId}/hqdefault.jpg`;
                  }}
                />
                {/* 재생 버튼 오버레이 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* 오디오 플레이어 (숨김) */}
        <audio ref={audioRef} src={audioResponse?.dubbing_audio_url || ""} />
        {/* 영상 아래 버튼 UI */}
        <div className="flex flex-row gap-4 mt-4">
          {/* 🆕 토글 재생/정지 버튼 */}
          <button
            onClick={handlePlayPause}
            className={`w-16 h-16 ${isPlaying ? 'bg-gradient-to-r from-gray-500 to-gray-700' : 'bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-600'} text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-lg border-2 border-white/20`}
            title={isPlaying ? '정지' : '재생'}
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <rect x="5" y="5" width="10" height="10" rx="2" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <polygon points="6,4 16,10 6,16" />
              </svg>
            )}
          </button>
          
          {/* 처음부터 버튼 */}
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