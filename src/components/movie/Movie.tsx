// src/components/movie/Movie.tsx
import { useState, useEffect } from "react";
import MovieDetailModal from "@/components/modal/MovieDetailModal";
import MovieList from "./MovieList";
import { NavBar } from "@/components/ui/NavBar";
import type { TokenDetailResponse } from "@/types/pitch";
import {motion, AnimatePresence} from "framer-motion";
import {
  PlayIcon,
  StarIcon,
  HeartIcon,
  SparklesIcon,
  UserGroupIcon,
  InformationCircleIcon,
  VideoCameraIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilmIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import DuetDetailModal from "@/components/modal/DuetDetailModal";

interface MovieProps {
  tokens: TokenDetailResponse[];
  popularTokens: TokenDetailResponse[];
  latestTokens: TokenDetailResponse[];
  romanticTokens: TokenDetailResponse[];
  isLoading: boolean;
  error: string | null;
  onOpenModal?: (youtubeId: string) => void;
  duetScenes?: any[];
  duetScenesLoading?: boolean;
  duetScenesError?: any;
}

export default function Movie({ tokens, popularTokens, latestTokens, romanticTokens, isLoading, error, onOpenModal, duetScenes = [], duetScenesLoading = false, duetScenesError = null }: MovieProps) {
  
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const router = useRouter();
  const [selectedDuet, setSelectedDuet] = useState<{ scene: any; pair: any } | null>(null);
  const closeDuetModal = () => setSelectedDuet(null);

  

  const videos = tokens.map(({ id, youtubeId, actor_name }) => ({
    videoId: String(id),
    youtubeId,
    actor_name,
  }));

  const selectedTokenData: TokenDetailResponse | undefined =
    selectedTokenId && tokens.length
      ? tokens.find((v) => String(v.id) === selectedTokenId)
      : undefined;

  const openModal = (tokenId: string) => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setSelectedTokenId(tokenId);
    if (onOpenModal) {
      onOpenModal(tokenId);
    }
  };

  const closeModal = () => {
    const timeout = setTimeout(() => {
      setSelectedTokenId(null);
    }, 200);
    setHoverTimeout(timeout);
  };

  const playDubbing = (videoId: string) => {
    setPlayingVideo(videoId);
    const currentModalId = selectedTokenId;
    const query = currentModalId ? `?modalId=${currentModalId}` : '';
    router.push(`/detail/${videoId}${query}`);
  };

  const stopDubbing = () => {
    setPlayingVideo(null);
    console.log("Stopping dubbing");
  };

  const topCreators = [
    { id: 1, name: "김더빙", followers: "12.5K", image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face" },
    { id: 2, name: "이연기", followers: "8.9K", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" },
    { id: 3, name: "박목소리", followers: "15.2K", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" },
  ];

  const sections = [
    {
      id: "top-collections",
      title: "베스트 더빙",
      subtitle: "완벽한 더빙의 정석",
      icon: <StarIcon className="w-6 h-6 text-yellow-500" />,
      videos: popularTokens.map(({ id, youtubeId, actor_name }) => ({ videoId: String(id), youtubeId, actor_name })),
      isPlayable: false,
    },
    
    {
      id: "sync-collection",
      title: "싱크 컬렉션",
      subtitle: "짧고 강한 더빙 숏츠",
      icon: <VideoCameraIcon className="w-6 h-6 text-purple-500" />,
      videos: videos.slice(0, Math.min(10, videos.length)),
      isPlayable: false,
      isShorts: true,
    },
    {
      id: "new-releases",
      title: "신상 더빙",
      subtitle: "방금 나온 신작들",
      icon: <SparklesIcon className="w-6 h-6 text-purple-500" />,
      videos: latestTokens.map(({ id, youtubeId, actor_name }) => ({ videoId: String(id), youtubeId, actor_name })),
      isPlayable: false,
    },
    {
      id: "animation-dubbing",
      title: "애니 더빙",
      subtitle: "재미있는 애니메이션 더빙",
      icon: <FilmIcon className="w-6 h-6 text-green-500" />,
      videos: romanticTokens.map(({ id, youtubeId, actor_name }) => ({ videoId: String(id), youtubeId, actor_name })),
      isPlayable: false,
    },
    {
      id: "trending-collabo",
      title: "로맨틱 더빙",
      subtitle: "설레는 더빙 연기",
      icon: <HeartIcon className="w-6 h-6 text-pink-500" />,
      videos: romanticTokens.map(({ id, youtubeId, actor_name }) => ({ videoId: String(id), youtubeId, actor_name })),
      isPlayable: false,
    },
   
  ];

  const featuredVideo = videos[0];
  const heroVideos = latestTokens.slice(0, 5);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 5초마다 자동으로 오른쪽(다음)으로 이동
  useEffect(() => {
    const interval = setInterval(() => {
      goToNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [heroVideos.length, currentIndex]);

  const goToPrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? heroVideos.length - 1 : prev - 1))
  };
  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === heroVideos.length - 1 ? 0 : prev + 1))
  };
  const goToIndex = (idx: number) => {
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx)
  };
  //슬라이드가 왼쪽/오른쪽으로 이동하는지 구분
  const [direction, setDirection] = useState(0); // -1: 왼쪽, 1: 오른쪽

  // 임시 듀엣 더빙용 데이터 (실제 데이터로 교체 가능)
  const duetTokens = [
    { videoId: "201", youtubeId: "S6KnqDc-tis", actor_name: "AI 배우 김연기" },
    
  ];

  return (
    <div className="bg-black min-h-screen text-white font-sans overflow-x-hidden flex flex-col">
      {/* NavBar */}
      <NavBar />
      
      {/* Main Content */}
      <div className="pt-24">
        {/* Hero Banner */}
        {heroVideos.length > 0 && (
          <div className="relative h-[70vh] min-h-[500px] mb-8">
            {/* 유튜브 썸네일 배경 */}
            <div className="absolute inset-0">
              <AnimatePresence initial={false} custom={direction}>
                <motion.img
                  key={currentIndex}
                  src={`https://img.youtube.com/vi/${heroVideos[currentIndex].youtubeId}/maxresdefault.jpg`}
                  alt="배너 배경"
                  className="w-full h-full object-cover object-center absolute inset-0"
                  style={{ filter: 'brightness(1)' }}
                  initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              </AnimatePresence>
              {/* 기존 어두운 오버레이 */}
              <div className="absolute inset-0 bg-black/60"></div>
            </div>
            <div className="relative z-10 h-full flex items-center">
              {/* 좌측 화살표 */}
              <button
                onClick={goToPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl"
                aria-label="이전 비디오"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              {/* 비디오 정보 */}
              <div className="max-w-7xl mx-auto px-2 w-full">
                <div className="max-w-2xl">
                  <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg">
                    {heroVideos[currentIndex].actor_name}
                  </h1>
                  <p className="text-xl text-white/90 mb-8 max-w-lg">
                    AI와 함께 더빙의 재미를 발견하세요! 실시간 피치 분석으로 완벽한 연기를 만들어보세요.
                  </p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        openModal(String(heroVideos[currentIndex].id))}}
                      className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-green-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      <PlayIcon className="w-6 h-6" />
                      재생하기
                    </button>
                    <button
                      className="flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full font-bold hover:bg-white/20 transition-all duration-200 transform hover:scale-105 border border-white/20"
                      onClick={() => {router.push(`/actor/${encodeURIComponent(heroVideos[currentIndex].actor_name)}`)}}
                    >
                      <InformationCircleIcon className="w-6 h-6" />
                      더 자세히
                    </button>
                  </div>
                </div>
              </div>
              {/* 우측 화살표 */}
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl"
                aria-label="다음 비디오"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>
            </div>
            {/* 인디케이터 */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {heroVideos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToIndex(idx)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${currentIndex === idx ? 'bg-white scale-125' : 'bg-gray-500 opacity-60'}`}
                  aria-label={`비디오 ${idx + 1}번`}
                />
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent"></div>
          </div>
        )}
        <div className="max-w-7xl mx-auto px-2">
          
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin w-8 h-8 border-3 border-green-400 border-t-transparent rounded-full" />
                <div className="text-gray-500 font-medium">영화를 불러오는 중...</div>
              </div>
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center py-20">
              <div className="text-red-400 font-medium">에러 발생: {error.toString()}</div>
            </div>
          )}
          {!isLoading && !error && (
            <div className="space-y-12">
              {sections.map((section) => (
                <div key={section.id} className="relative group">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      {section.icon}
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        {section.title}
                      </h2>
                    </div>
                    <p className="text-gray-500 ml-9 font-medium">{section.subtitle}</p>
                  </div>
                  {/* MovieList만! */}
                  <MovieList
                    sectionId={section.id}
                    videos={section.videos}
                    isPlayable={section.isPlayable}
                    isShorts={section.isShorts}
                    playingVideo={playingVideo}
                    onPlay={playDubbing}
                    onOpenModal={openModal}
                    onStop={stopDubbing}
                  />
                  {/* 싱크 컬렉션 아래에만 듀엣 더빙 섹션 삽입 */}
                  {section.id === "sync-collection" && (
                    <div className="relative group mt-16">
                      <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                          <UserGroupIcon className="w-6 h-6 text-blue-400" />
                          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            배우와 듀엣 더빙
                          </h2>
                        </div>
                        <p className="text-gray-500 ml-9 font-medium">실제 배우와 함께 명장면을 연기해보세요!</p>
                      </div>
                      {duetScenesLoading ? (
                        <div className="text-gray-400 text-lg py-8">듀엣 더빙 목록을 불러오는 중...</div>
                      ) : duetScenesError ? (
                        <div className="text-red-400 text-lg py-8">듀엣 더빙 목록을 불러오지 못했습니다.</div>
                      ) : (
                        <div className="flex gap-6 overflow-x-auto pb-4">
                          {duetScenes.map((scene: any) => (
                            <div
                              key={scene.youtube_url}
                              className="relative bg-gray-900 border-2 border-gray-800 rounded-3xl overflow-hidden hover:border-blue-400 hover:shadow-2xl transition-all duration-300 cursor-pointer flex-shrink-0 transform hover:scale-105 aspect-video"
                              style={{ minWidth: "280px", maxWidth: "280px" }}
                              onClick={() => {
                                setSelectedDuet({ scene, pair: scene.duet_pair[0] });
                              }}
                            >
                              {/* 듀엣 전용 오버레이 */}
                              <div className="absolute inset-0 z-10 flex flex-col justify-between pointer-events-none">
                                <div className="flex justify-between p-3">
                                  <div className="flex items-center gap-1 bg-blue-500/80 text-white px-2 py-1 rounded-full text-xs font-bold shadow">
                                    {scene.duet_pair[0].actor_name}
                                  </div>
                                  <div className="flex items-center gap-1 bg-green-500/80 text-white px-2 py-1 rounded-full text-xs font-bold shadow">
                                    {scene.duet_pair[1].actor_name}
                                  </div>
                                </div>
                                <div className="flex justify-center mb-3">
                                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">듀엣 더빙</span>
                                </div>
                              </div>
                              {/* 유튜브 썸네일 */}
                              <img
                                src={`https://img.youtube.com/vi/${scene.duet_pair[0].youtube_url.split('v=')[1]}/mqdefault.jpg`}
                                alt={scene.scene_title}
                                className="w-full h-full object-cover"
                                draggable={false}
                              />
                              {/* 카드 설명 영역 */}
                              <div className="p-6 relative z-20 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                                <h3 className="font-bold mb-2 text-white text-lg">
                                  {scene.scene_title}
                                </h3>
                                <p className="text-sm text-gray-300 font-medium mb-3">
                                  {scene.duet_pair[0].actor_name} & {scene.duet_pair[1].actor_name}
                                </p>
                                <button
                                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors shadow-lg bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-white hover:brightness-110"
                                  style={{ pointerEvents: 'auto' }}
                                >
                                  <PlayIcon className="w-4 h-4" />
                                  듀엣 시작
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {/* 듀엣 더빙 전용 섹션 */}
              {/* This section is now rendered inside the sections.map loop */}
            </div>
          )}
        </div>
      </div>
      {/* 모달 렌더링 */}
      <MovieDetailModal
        youtubeId={selectedTokenData?.youtubeId || ''}
        isOpen={!!selectedTokenId}
        onClose={closeModal}
        tokenData={selectedTokenData as any}
      />
      {/* 듀엣 디테일 모달 */}
      {selectedDuet && (
        <DuetDetailModal
          youtubeId={selectedDuet.pair.youtube_url.split("v=")[1]}
          isOpen={!!selectedDuet}
          onClose={closeDuetModal}
          tokenData={selectedDuet.pair}
          duetPair={selectedDuet.scene.duet_pair.map((a: any) => ({ actor_name: a.actor_name, actor_id: a.id }))}
        />
      )}
    </div>
  );
}