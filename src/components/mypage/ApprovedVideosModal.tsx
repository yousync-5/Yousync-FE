"use client";

import React from 'react';

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

interface ApprovedVideosModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVideoId: number | null;
}

const ApprovedVideosModal: React.FC<ApprovedVideosModalProps> = ({ isOpen, onClose, selectedVideoId }) => {
  if (!isOpen) return null;

  // 선택된 영상 찾기
  const selectedVideo = selectedVideoId ? approvedVideos.find(video => video.id === selectedVideoId) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {selectedVideo ? selectedVideo.title : '승인된 영상'}
            </h2>
            <p className="text-gray-400">
              {selectedVideo ? `${selectedVideo.member} - 완료율 ${selectedVideo.completionRate}%` : '완료율 80% 이상의 더빙 영상들을 확인하세요'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {selectedVideo ? (
          <div className="space-y-6">
            {/* 유튜브 영상 재생 */}
            <div className="relative aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeUrl.split('v=')[1]}?autoplay=1`}
                title={selectedVideo.title}
                className="w-full h-full rounded-lg"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p>영상을 선택해주세요.</p>
          </div>
        )}
        
        <div className="text-center mt-6">

        </div>
      </div>
    </div>
  );
};

export default ApprovedVideosModal; 