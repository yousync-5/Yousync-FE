"use client";

import React from 'react';

// 승인된 영상 더미 데이터 - 게시판 MY탭과 통일
const approvedVideos = [
  {
    id: 1,
    title: "라라랜드",
    member: "라이언 고슬링",
    requestDate: "2025.07.04",
    youtubeUrl: "https://www.youtube.com/watch?v=JyQqorUskVM",
    thumbnail: "https://images.christiantoday.co.kr/data/images/full/306792/image.jpg",
    description: "뮤지컬 영화 더빙 연습"
  },
  {
    id: 2,
    title: "위대한 개츠비",
    member: "레오나르도 디카프리오",
    requestDate: "2025.07.03",
    youtubeUrl: "https://www.youtube.com/watch?v=g_Ri7HQAaMw",
    thumbnail: "https://pds.joongang.co.kr/news/component/htmlphoto_mmdata/201911/12/3006d1d1-66d4-4a3f-9b17-83252da27fb4.jpg",
    description: "레오나르도 디카프리오 연기 연습"
  },
  {
    id: 3,
    title: "레베카",
    member: "로렌스 올리비에",
    requestDate: "2025.07.02",
    youtubeUrl: "https://www.youtube.com/watch?v=dIFRonefRms",
    thumbnail: "https://cdn.sisajournal.com/news/photo/202309/271403_189056_2358.jpg",
    description: "고전 영화 더빙 연습"
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
      <div className="bg-neutral-900 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {selectedVideo ? selectedVideo.title : '승인된 영상'}
            </h2>
            <p className="text-gray-400">
              {selectedVideo ? `요청일: ${selectedVideo.requestDate}` : '완료율 80% 이상의 더빙 영상들을 확인하세요'}
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