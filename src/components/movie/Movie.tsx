// src/components/movie/Movie.tsx
import { useState } from "react";
import MovieDetailModal from "@/components/modal/MovieDetailModal";
import MovieList from "./MovieList";
import type { TokenDetailResponse } from "@/type/PitchdataType";
import {
  PlayIcon,
  MagnifyingGlassIcon,
  FireIcon,
  StarIcon,
  HeartIcon,
  SparklesIcon,
  UserGroupIcon,
  InformationCircleIcon,
  VideoCameraIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";

interface MovieProps {
  tokens: TokenDetailResponse[];
  isLoading: boolean;
  error: string | null;
}

export default function Movie({ tokens, isLoading, error }: MovieProps) {
  const [selectedTab, setSelectedTab] = useState("인기 영상");
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const tabs = [
    "인기 배우",
    "인기 영상",
    "미국 배우",
    "영국 배우",
    "남자 배우",
    "여자 배우",
  ];

  const videos = tokens.map(({ id, youtubeId, actor_name }) => ({
    videoId: id,
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
  };

  const closeModal = () => {
    const timeout = setTimeout(() => {
      setSelectedVideoId(null);
    }, 200);
    setHoverTimeout(timeout);
  };

  const playDubbing = (youtubeId: string) => {
    setPlayingVideo(youtubeId);
    console.log(`Playing dubbing for: ${youtubeId}`);
  };

  const stopDubbing = () => {
    setPlayingVideo(null);
    console.log("Stopping dubbing");
  };

  const topCreators = [
    { id: 1, name: "김더빙", followers: "12.5K", image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face" },
    { id: 2, name: "이연기", followers: "8.9K", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" },
    { id: 3, name: "박목소리", followers: "15.2K", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" },
    { id: 4, name: "최성우", followers: "6.7K", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" },
    { id: 5, name: "정음성", followers: "9.3K", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face" },
    { id: 6, name: "한더빙왕", followers: "22.1K", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face" },
    { id: 7, name: "윤연기", followers: "11.8K", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face" },
    { id: 8, name: "임목소리", followers: "7.4K", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face" },
    { id: 9, name: "강성우", followers: "13.6K", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face" },
    { id: 10, name: "조음성", followers: "18.9K", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face" },
  ];

  const sections = [
    {
      id: "trending-now",
      title: "지금 핫한 더빙",
      subtitle: "사람들이 미쳐서 하는 더빙들",
      icon: <FireIcon className="w-6 h-6 text-orange-500" />,
      videos: videos.slice(0, Math.min(10, videos.length)),
      isPlayable: true,
    },
    {
      id: "sync-collection",
      title: "싱크 컬렉션",
      subtitle: "짧고 강한 더빙 숏츠",
      icon: <VideoCameraIcon className="w-6 h-6 text-purple-500" />,
      videos: videos.slice(0, Math.min(10, videos.length)),
      isPlayable: true,
      isShorts: true,
    },
    {
      id: "top-collections",
      title: "베스트 더빙",
      subtitle: "완벽한 더빙의 정석",
      icon: <StarIcon className="w-6 h-6 text-yellow-500" />,
      videos: videos.slice(0, Math.min(10, videos.length)),
      isPlayable: false,
    },
    {
      id: "trending-collabo",
      title: "로맨틱 더빙",
      subtitle: "설레는 더빙 연기",
      icon: <HeartIcon className="w-6 h-6 text-pink-500" />,
      videos: videos.slice(0, Math.min(10, videos.length)),
      isPlayable: false,
    },
    {
      id: "new-releases",
      title: "신상 더빙",
      subtitle: "방금 나온 신작들",
      icon: <SparklesIcon className="w-6 h-6 text-purple-500" />,
      videos: videos.slice(0, Math.min(10, videos.length)),
      isPlayable: false,
    },
    {
      id: "popular-actors",
      title: "인기 배우들",
      subtitle: "더빙계 스타들",
      icon: <UserGroupIcon className="w-6 h-6 text-blue-500" />,
      videos: videos.slice(0, Math.min(10, videos.length)),
      isPlayable: false,
    },
  ];

  const featuredVideo = videos[0];

  return (
    <div className="bg-black min-h-screen text-white font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-gray-800 shadow-2xl">
        <div className="max-w-7xl mx-auto px-2 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent animate-pulse">
                YouSync
              </h1>
              <div className="hidden md:flex items-center space-x-6">
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors font-medium">홈</a>
                <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors font-medium">영화</a>
                <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors font-medium">배우</a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors font-medium">결과</a>
                <span className="text-xl walking-cat">🐱</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-green-400 transition-colors">
                <MagnifyingGlassIcon className="w-6 h-6" />
              </button>
              <button className="px-4 py-2 text-gray-400 hover:text-emerald-400 transition-colors font-medium">
                로그인
              </button>
              <button className="px-6 py-2 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white rounded-full transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-105">
                시작하기
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24">
        {/* Hero Banner */}
        {featuredVideo && (
          <div className="relative h-[70vh] min-h-[500px] mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-green-700 via-emerald-700 to-teal-700">
              <div className="absolute inset-0 bg-black/60"></div>
            </div>
            <div className="relative z-10 h-full flex items-center">
              <div className="max-w-7xl mx-auto px-2 w-full">
                <div className="max-w-2xl">
                  <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg">
                    {featuredVideo.actor_name}
                  </h1>
                  <p className="text-xl text-white/90 mb-8 max-w-lg">
                    AI와 함께 더빙의 재미를 발견하세요! 실시간 피치 분석으로 완벽한 연기를 만들어보세요.
                  </p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => openModal(featuredVideo.youtubeId)}
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
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent"></div>
          </div>
        )}
        <div className="max-w-7xl mx-auto px-2">
          <div className="flex justify-center gap-6 text-sm font-medium mb-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`transition-all duration-200 px-6 py-3 rounded-full font-bold ${
                  selectedTab === tab
                    ? "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white shadow-lg transform scale-105"
                    : "text-gray-400 hover:text-green-400 hover:bg-gray-900"
                }`}
                onClick={() => setSelectedTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          {isLoading && (
            <div className="text-center py-20">
              <div className="text-gray-500 font-medium">더빙 준비 중...</div>
            </div>
          )}
          {error && (
            <div className="text-center py-20">
              <div className="text-red-400 font-medium">앗! 문제가 생겼어요!</div>
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
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">Top Creators</h2>
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
      <footer className="py-12 px-2 border-t border-gray-800 mt-20 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent mb-4">
                YouSync
              </h3>
              <p className="text-gray-500 font-medium">
                AI와 함께 더빙의 새로운 재미를 발견하세요!
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">제품</h4>
              <ul className="space-y-2 text-gray-500">
                <li><a href="#" className="hover:text-green-400 transition-colors font-medium">더빙 연습</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors font-medium">성과 분석</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors font-medium">결과 다운로드</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">회사</h4>
              <ul className="space-y-2 text-gray-500">
                <li><a href="#" className="hover:text-green-400 transition-colors font-medium">소개</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors font-medium">팀</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors font-medium">채용</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">지원</h4>
              <ul className="space-y-2 text-gray-500">
                <li><a href="#" className="hover:text-green-400 transition-colors font-medium">도움말</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors font-medium">문의하기</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors font-medium">개인정보처리방침</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-600">
            <p className="font-medium">&copy; 2024 YouSync. All rights reserved.</p>
          </div>
        </div>
      </footer>
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