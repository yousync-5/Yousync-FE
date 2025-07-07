"use client";

import { useState } from 'react';
import { useRecentVideos } from '@/hooks/useRecentVideos';
import { FaHistory, FaTrash, FaEye } from 'react-icons/fa';

interface RecentVideosProps {
  category?: string;
  limit?: number;
  showCategoryFilter?: boolean;
  onVideoClick?: (videoId: number) => void;
}

export default function RecentVideos({ 
  category, 
  limit = 10, 
  showCategoryFilter = true,
  onVideoClick 
}: RecentVideosProps) {
  const { 
    recentVideos, 
    getRecentVideosByCategory, 
    getRecentVideos, 
    removeRecentVideo,
    clearRecentVideos 
  } = useRecentVideos();
  
  const [selectedCategory, setSelectedCategory] = useState<string>(category || 'all');

  // 카테고리 목록 추출
  const categories = ['all', ...new Set(recentVideos.map(video => video.category).filter(Boolean))];

  // 선택된 카테고리에 따른 영상 필터링
  const filteredVideos = selectedCategory === 'all' 
    ? getRecentVideos(limit)
    : getRecentVideosByCategory(selectedCategory).slice(0, limit);

  const handleVideoClick = (videoId: string) => {
    onVideoClick?.(videoId);
  };

  const handleRemoveVideo = (e: React.MouseEvent, videoId: string) => {
    e.stopPropagation();
    removeRecentVideo(videoId);
  };

  if (recentVideos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FaHistory className="mx-auto text-4xl mb-4 opacity-50" />
        <p>최근 조회한 영상이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaHistory className="text-xl text-blue-500" />
          <h3 className="text-lg font-semibold">최근 조회한 영상</h3>
        </div>
        <button
          onClick={clearRecentVideos}
          className="text-sm text-red-500 hover:text-red-700 transition-colors"
          title="전체 삭제"
        >
          <FaTrash className="text-sm" />
        </button>
      </div>

      {/* 카테고리 필터 */}
      {showCategoryFilter && categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cat === 'all' ? '전체' : cat}
            </button>
          ))}
        </div>
      )}

      {/* 영상 목록 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredVideos.map((video) => (
          <div
            key={video.youtubeId}
            onClick={() => handleVideoClick(video.youtubeId)}
            className="group relative bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200"
          >
            {/* 썸네일 */}
            <div className="aspect-video bg-gray-700 relative">
              {video.thumbnail_url ? (
                <img
                  src={video.thumbnail_url}
                  alt={video.actor_name || '영상 썸네일'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <FaEye className="text-2xl" />
                </div>
              )}
              
              {/* 조회 수 */}
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {video.viewCount}회
              </div>
              
              {/* 삭제 버튼 */}
              <button
                onClick={(e) => handleRemoveVideo(e, video.youtubeId)}
                className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                title="삭제"
              >
                <FaTrash className="text-xs" />
              </button>
            </div>

            {/* 영상 정보 */}
            <div className="p-3">
              <h4 className="font-medium text-sm line-clamp-2 mb-1">
                {video.actor_name || '제목 없음'}
              </h4>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{video.category || '카테고리 없음'}</span>
                <span>
                  {new Date(video.viewedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 빈 상태 */}
      {filteredVideos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>선택한 카테고리의 최근 영상이 없습니다.</p>
        </div>
      )}
    </div>
  );
} 