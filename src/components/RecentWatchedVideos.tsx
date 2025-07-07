"use client";

import { useEffect } from 'react';
import { useRecentVideos } from '@/hooks/useRecentVideos';
import { FaHistory, FaPlay, FaEye, FaClock } from 'react-icons/fa';
import YouTube from 'react-youtube';

interface RecentWatchedVideosProps {
  className?: string;
  onVideoClick?: (videoId: string) => void;
}

export default function RecentWatchedVideos({ 
  className = "", 
  onVideoClick 
}: RecentWatchedVideosProps) {
  const { videos, isLoading, error, hasMore, loadMore, refetch } = useRecentVideos(12);

  // 디버깅을 위한 useEffect
  useEffect(() => {
    console.log('RecentWatchedVideos 마운트됨');
    const token = localStorage.getItem('access_token');
    console.log('토큰 확인:', token ? '있음' : '없음');
    if (token) {
      console.log('토큰 길이:', token.length);
      console.log('토큰 (처음 20자):', token.substring(0, 20) + '...');
    }
  }, []);

  const handleVideoClick = (videoId: string) => {
    onVideoClick?.(videoId);
  };

  const formatDuration = (duration: string) => {
    // ISO 8601 duration 형식을 읽기 쉬운 형태로 변환
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatViewCount = (viewCount: string) => {
    const count = parseInt(viewCount);
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // 디버깅을 위한 로그
  console.log('RecentWatchedVideos 상태:', { isLoading, error, videosCount: videos.length });

  // 로딩 중일 때 로딩 표시
  if (isLoading && videos.length === 0) {
    return (
      <div className={`relative z-10 h-full flex items-center ${className}`} style={{ minHeight: '240px' }}>
        <div className="w-full text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-blue-400">최근 영상을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 발생 시 에러 표시
  if (error) {
    return (
      <div className={`relative z-10 h-full flex items-center ${className}`} style={{ minHeight: '240px' }}>
        <div className="w-full text-center">
          <p className="text-red-400 mb-2">최근 영상을 불러올 수 없습니다</p>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={refetch}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white text-sm"
            >
              다시 시도
            </button>
            {error.includes('로그인') && (
              <button
                onClick={() => window.location.href = '/login'}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded text-white text-sm"
              >
                로그인하기
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className={`relative z-10 h-full flex items-center ${className}`} style={{ minHeight: '240px' }}>
        <div className="w-full text-center">
          <FaHistory className="text-4xl text-gray-400 mx-auto mb-2" />
          <p className="text-gray-400">최근에 시청한 영상이 없습니다</p>
          <p className="text-gray-500 text-sm mt-1">YouTube에서 영상을 시청하면 여기에 표시됩니다</p>
        </div>
      </div>
    );
  }

  // 최근 영상의 썸네일을 배경으로 표시
  const latestThumbnail = videos[0]?.thumbnail;

  return (
    <div className={`relative z-10 h-full flex items-center ${className}`} style={{ minHeight: '240px' }}>
      {latestThumbnail && (
        <div className="absolute inset-0 -z-10">
          <img
            src={latestThumbnail}
            alt="최근 시청 썸네일"
            className="w-full h-full object-cover opacity-60"
            style={{ filter: 'blur(2px)' }}
          />
          {/* 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>
      )}
      <div className="w-full">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FaHistory className="text-xl text-blue-500" />
            <h2 className="text-xl font-semibold text-white">최근 시청한 영상</h2>
          </div>
          <span className="text-sm text-gray-200 drop-shadow-md">{videos.length}개 영상</span>
        </div>
        {/* 영상 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((video) => (
            <div
              key={video.id}
              onClick={() => handleVideoClick(video.id)}
              className="group relative bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200"
            >
              {/* 썸네일 */}
              <div className="aspect-video bg-gray-700 relative">
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FaPlay className="text-2xl" />
                  </div>
                )}
                {/* 재생 시간 */}
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(video.duration)}
                </div>
                {/* 재생 버튼 오버레이 */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <FaPlay className="text-white text-3xl" />
                </div>
              </div>
              {/* 영상 정보 */}
              <div className="p-3">
                <h3 className="font-medium text-sm line-clamp-2 mb-2 text-white">
                  {video.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="truncate">{video.channelTitle}</span>
                  <div className="flex items-center gap-1">
                    <FaEye className="text-xs" />
                    <span>{formatViewCount(video.viewCount)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-300 mt-1">
                  <FaClock className="text-xs" />
                  <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* 더 보기 버튼 */}
        {hasMore && (
          <div className="text-center mt-4">
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {isLoading ? '로딩 중...' : '더 보기'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 