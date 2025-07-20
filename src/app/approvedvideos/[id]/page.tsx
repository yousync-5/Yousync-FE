"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';

// 승인된 영상 더미 데이터 - 게시판 MY탭과 통일
const approvedVideos = [
  {
    id: 1,
    title: "라라랜드",
    member: "라이언 고슬링",
    completionRate: 95,
    youtubeUrl: "https://www.youtube.com/watch?v=JyQqorUskVM",
    thumbnail: "https://images.christiantoday.co.kr/data/images/full/306792/image.jpg",
    description: "뮤지컬 영화 더빙 연습",
    requestDate: "2025.07.04",
    requester: "이윤아"
  },
  {
    id: 2,
    title: "위대한 개츠비",
    member: "레오나르도 디카프리오",
    completionRate: 88,
    youtubeUrl: "https://www.youtube.com/watch?v=g_Ri7HQAaMw",
    thumbnail: "https://pds.joongang.co.kr/news/component/htmlphoto_mmdata/201911/12/3006d1d1-66d4-4a3f-9b17-83252da27fb4.jpg",
    description: "레오나르도 디카프리오 연기 연습",
    requestDate: "2025.07.03",
    requester: "이윤아"
  },
  {
    id: 3,
    title: "레베카",
    member: "로렌스 올리비에",
    completionRate: 92,
    youtubeUrl: "https://www.youtube.com/watch?v=dIFRonefRms",
    thumbnail: "https://cdn.sisajournal.com/news/photo/202309/271403_189056_2358.jpg",
    description: "고전 영화 더빙 연습",
    requestDate: "2025.07.02",
    requester: "이윤아"
  }
];

const ApprovedVideoDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const videoId = Number(params.id);

  const video = approvedVideos.find(v => v.id === videoId);

  if (!video) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">영상을 찾을 수 없습니다</h1>
          <button
            onClick={() => router.push('/approvedvideos')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/approvedvideos')}
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-4 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            목록으로 돌아가기
          </button>
          <h1 className="text-3xl font-bold mb-2">{video.title}</h1>
          <p className="text-gray-400">{video.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 비디오 섹션 */}
          <div className="space-y-6">
            <div className="bg-neutral-900 rounded-xl overflow-hidden">
              <div className="relative aspect-[16/9] w-full">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* 승인 배지 */}
                <div className="absolute top-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  승인
                </div>
                {/* 완료율 배지 */}
                <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {video.completionRate}%
                </div>
              </div>
            </div>

            {/* 재생 버튼 */}
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition">
              영상 재생하기
            </button>
          </div>

          {/* 정보 섹션 */}
          <div className="space-y-6">
            <div className="bg-neutral-900 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">영상 정보</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">배우</span>
                  <span className="text-white">{video.member}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">완료율</span>
                  <span className="text-green-400">{video.completionRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">요청자</span>
                  <span className="text-white">{video.requester}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">요청일</span>
                  <span className="text-white">{video.requestDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">설명</span>
                  <span className="text-white">{video.description}</span>
                </div>
              </div>
            </div>

            {/* 더빙 정보 섹션 */}
            <div className="bg-neutral-900 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">더빙 정보</h2>
              <div className="bg-neutral-800 rounded-lg p-4">
                <p className="text-sm text-gray-300">
                  이 영상은 승인된 더빙 요청입니다. 
                  {video.title}의 {video.member} 역할을 연습할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovedVideoDetailPage; 