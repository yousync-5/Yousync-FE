// src/components/movie/Movie.tsx
import { useState } from "react";
import MovieDetailModal from "@/components/modal/MovieDetailModal";
import MovieList from "./MovieList";
import { NavBar } from "@/components/ui/NavBar";
import type { TokenDetailResponse } from "@/types/pitch";
import {motion, AnimatePresence} from "framer-motion";
import {
  PlayIcon,
  FireIcon,
  StarIcon,
  HeartIcon,
  SparklesIcon,
  UserGroupIcon,
  InformationCircleIcon,
  VideoCameraIcon,
  TrophyIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface MovieProps {
  tokens: TokenDetailResponse[];
  popularTokens: TokenDetailResponse[];
  latestTokens: TokenDetailResponse[];
  romanticTokens: TokenDetailResponse[];
  isLoading: boolean;
  error: string | null;
  onOpenModal?: (youtubeId: string) => void;
}

export default function Movie({ tokens, popularTokens, latestTokens, romanticTokens, isLoading, error, onOpenModal }: MovieProps) {
  
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const router = useRouter();

  

  const videos = tokens.map(({ id, youtubeId, actor_name }) => ({
    videoId: String(id),
    youtubeId,
    actor_name,
  }));

  const selectedTokenData: TokenDetailResponse | undefined =
    selectedVideoId && tokens.length
      ? tokens.find((v) => v.youtubeId === selectedVideoId)
      : undefined;

  const openModal = (youtubeId: string) => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setSelectedVideoId(youtubeId);
    if (onOpenModal) {
      onOpenModal(youtubeId);
    }
  };

  const closeModal = () => {
    const timeout = setTimeout(() => {
      setSelectedVideoId(null);
    }, 200);
    setHoverTimeout(timeout);
  };

  const playDubbing = (videoId: string) => {
    setPlayingVideo(videoId);
    const currentModalId = selectedVideoId;
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
                      onClick={() => openModal(heroVideos[currentIndex].youtubeId)}
                      className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-green-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      <PlayIcon className="w-6 h-6" />
                      재생하기
                    </button>
                    <button className="flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full font-bold hover:bg-white/20 transition-all duration-200 transform hover:scale-105 border border-white/20">
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
                  {/* 여기서 MovieList만! 아래 map 반복 구현 완전히 제거 */}
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
                  {section.id === "sync-collection" && (
                    <div className="mt-12">
                      <div className="flex items-center gap-3 mb-6">
                        <TrophyIcon className="w-6 h-6 text-yellow-500" />
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">Top User</h2>
                      </div>
                      <p className="text-gray-500 ml-9 font-medium mb-6">더빙계 인기 크리에이터들</p>
                      <div className="grid grid-cols-5 gap-8">
                        {topCreators.map((creator) => (
                          <div key={creator.id} className="text-center group cursor-pointer">
                            <div className="relative mb-3">
                              <img
                                src={creator.image}
                                alt={creator.name}
                                className="w-20 h-20 rounded-full object-cover border-2 border-gray-700 group-hover:border-green-500 transition-all duration-200 transform group-hover:scale-110"
                              />
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-white">✓</span>
                              </div>
                            </div>
                            <h3 className="text-sm font-bold text-white group-hover:text-green-400 transition-colors truncate">
                              {creator.name}
                            </h3>
                            <p className="text-xs text-gray-500 font-medium">
                              {creator.followers}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {selectedVideoId && selectedTokenData && (
        <MovieDetailModal
          youtubeId={selectedVideoId}
          isOpen={!!selectedVideoId}
          onClose={closeModal}
          tokenData={selectedTokenData}
        />
      )}
    </div>
  );
}
