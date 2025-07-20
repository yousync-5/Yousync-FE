"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

// 에스파 관련 더미 데이터
const approvedVideos = [
  {
    id: 1,
    title: "에스파 - Next Level",
    member: "카리나",
    completionRate: 95,
    youtubeUrl: "https://www.youtube.com/watch?v=4m1EFMoRFvY",
    thumbnail: "https://img.youtube.com/vi/4m1EFMoRFvY/mqdefault.jpg",
    description: "에스파의 대표곡 Next Level 더빙 완료"
  },
  {
    id: 2,
    title: "에스파 - Savage",
    member: "윈터",
    completionRate: 88,
    youtubeUrl: "https://www.youtube.com/watch?v=WmXWHcnI0PI",
    thumbnail: "https://img.youtube.com/vi/WmXWHcnI0PI/mqdefault.jpg",
    description: "에스파의 Savage 더빙 완료"
  },
  {
    id: 3,
    title: "에스파 - Girls",
    member: "지젤",
    completionRate: 92,
    youtubeUrl: "https://www.youtube.com/watch?v=3bqTKVd2dCI",
    thumbnail: "https://img.youtube.com/vi/3bqTKVd2dCI/mqdefault.jpg",
    description: "에스파의 Girls 더빙 완료"
  }
];

const ApprovedVideosPage = () => {
  const router = useRouter();

  const handleVideoClick = (videoId: number) => {
    router.push(`/approvedvideos/${videoId}`);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">승인된 영상</h1>
          <p className="text-gray-400">완료율 80% 이상의 더빙 영상들을 확인하세요</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {approvedVideos.map((video) => (
            <div
              key={video.id}
              className="group bg-neutral-900 rounded-xl overflow-hidden border border-neutral-700 hover:border-neutral-600 transition-all duration-300 cursor-pointer"
              onClick={() => handleVideoClick(video.id)}
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1519125323398-675f0ddb6308";
                  }}
                />
                {/* 승인 배지 */}
                <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                  승인
                </div>
                {/* 완료율 배지 */}
                <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                  {video.completionRate}%
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-white mb-1 truncate">{video.title}</h3>
                <p className="text-gray-400 text-sm truncate">{video.member}</p>
                <p className="text-purple-400 text-xs mt-1">{video.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApprovedVideosPage; 