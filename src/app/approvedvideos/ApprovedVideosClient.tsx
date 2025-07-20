"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

// 승인된 영상 더미 데이터 - 게시판 MY탭과 통일
const approvedVideos = [
  {
    id: 1,
    title: "라라랜드",
    member: "라이언 고슬링",
    completionRate: 95,
    youtubeUrl: "https://www.youtube.com/watch?v=JyQqorUskVM",
    thumbnail: "https://images.christiantoday.co.kr/data/images/full/306792/image.jpg",
    description: "뮤지컬 영화 더빙 연습"
  },
  {
    id: 2,
    title: "위대한 개츠비",
    member: "레오나르도 디카프리오",
    completionRate: 88,
    youtubeUrl: "https://www.youtube.com/watch?v=g_Ri7HQAaMw",
    thumbnail: "https://pds.joongang.co.kr/news/component/htmlphoto_mmdata/201911/12/3006d1d1-66d4-4a3f-9b17-83252da27fb4.jpg",
    description: "레오나르도 디카프리오 연기 연습"
  },
  {
    id: 3,
    title: "레베카",
    member: "로렌스 올리비에",
    completionRate: 92,
    youtubeUrl: "https://www.youtube.com/watch?v=dIFRonefRms",
    thumbnail: "https://cdn.sisajournal.com/news/photo/202309/271403_189056_2358.jpg",
    description: "고전 영화 더빙 연습"
  }
];

const ApprovedVideosClient = () => {
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

export default ApprovedVideosClient; 