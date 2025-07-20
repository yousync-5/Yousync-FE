"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';

// 에스파 관련 더미 데이터
const approvedVideos = [
  {
    id: 1,
    title: "에스파 - Next Level",
    member: "카리나",
    completionRate: 95,
    youtubeUrl: "https://www.youtube.com/watch?v=4m1EFMoRFvY",
    thumbnail: "https://img.youtube.com/vi/4m1EFMoRFvY/mqdefault.jpg",
    description: "에스파의 대표곡 Next Level 더빙 완료",
    details: {
      duration: "3분 15초",
      difficulty: "중급",
      genre: "K-Pop",
      releaseDate: "2021년 5월",
      lyrics: "I'm on the Next Level\nYeah, I'm on the Next Level\nI'm on the Next Level\nYeah, I'm on the Next Level"
    }
  },
  {
    id: 2,
    title: "에스파 - Savage",
    member: "윈터",
    completionRate: 88,
    youtubeUrl: "https://www.youtube.com/watch?v=WmXWHcnI0PI",
    thumbnail: "https://img.youtube.com/vi/WmXWHcnI0PI/mqdefault.jpg",
    description: "에스파의 Savage 더빙 완료",
    details: {
      duration: "3분 58초",
      difficulty: "고급",
      genre: "K-Pop",
      releaseDate: "2021년 10월",
      lyrics: "Savage\nMy naevis calling\nAnd I'm gonna answer\nCall me Savage"
    }
  },
  {
    id: 3,
    title: "에스파 - Girls",
    member: "지젤",
    completionRate: 92,
    youtubeUrl: "https://www.youtube.com/watch?v=3bqTKVd2dCI",
    thumbnail: "https://img.youtube.com/vi/3bqTKVd2dCI/mqdefault.jpg",
    description: "에스파의 Girls 더빙 완료",
    details: {
      duration: "3분 21초",
      difficulty: "중급",
      genre: "K-Pop",
      releaseDate: "2022년 7월",
      lyrics: "We are the Girls\nWe are the Girls\nWe are the Girls\nWe are the Girls"
    }
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
                  <span className="text-gray-400">멤버</span>
                  <span className="text-white">{video.member}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">완료율</span>
                  <span className="text-green-400">{video.completionRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">재생 시간</span>
                  <span className="text-white">{video.details.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">난이도</span>
                  <span className="text-yellow-400">{video.details.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">장르</span>
                  <span className="text-white">{video.details.genre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">발매일</span>
                  <span className="text-white">{video.details.releaseDate}</span>
                </div>
              </div>
            </div>

            {/* 가사 섹션 */}
            <div className="bg-neutral-900 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">가사</h2>
              <div className="bg-neutral-800 rounded-lg p-4">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">{video.details.lyrics}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovedVideoDetailPage; 