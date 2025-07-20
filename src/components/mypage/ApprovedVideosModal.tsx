"use client";

import React from 'react';

// 승인된 영상 더미 데이터 - 게시판 MY탭과 통일
const approvedVideos = [
  {
    id: 1,
    title: "포레스트 검프 ",
    member: "톰 행크스",
    requestDate: "2025.07.16",
    youtubeUrl: "https://www.youtube.com/watch?v=example1",
    thumbnail: "https://img.youtube.com/vi/example1/mqdefault.jpg",
    description: "톰 행크스의 감정 연기 연습"
  },
  {
    id: 2,
    title: "아바타 ",
    member: "제임스 카메론",
    requestDate: "2025.07.15",
    youtubeUrl: "https://www.youtube.com/watch?v=example2",
    thumbnail: "https://img.youtube.com/vi/example2/mqdefault.jpg",
    description: "제임스 카메론 영화의 더빙 연습"
  },
  {
    id: 3,
    title: "해리포터 ",
    member: "다니엘 래드클리프",
    requestDate: "2025.07.14",
    youtubeUrl: "https://www.youtube.com/watch?v=example3",
    thumbnail: "https://img.youtube.com/vi/example3/mqdefault.jpg",
    description: "마법사 세계의 더빙 연습"
  },
  {
    id: 4,
    title: "반지의 제왕",
    member: "일라이저 우드",
    requestDate: "2025.07.13",
    youtubeUrl: "https://www.youtube.com/watch?v=example4",
    thumbnail: "https://img.youtube.com/vi/example4/mqdefault.jpg",
    description: "판타지 영화 더빙 연습"
  },
  {
    id: 5,
    title: "스타워즈 시리즈",
    member: "마크 해밀",
    requestDate: "2025.07.12",
    youtubeUrl: "https://www.youtube.com/watch?v=example5",
    thumbnail: "https://img.youtube.com/vi/example5/mqdefault.jpg",
    description: "우주 SF 영화 더빙 연습"
  },
  {
    id: 6,
    title: "매트릭스",
    member: "키아누 리브스",
    requestDate: "2025.07.11",
    youtubeUrl: "https://www.youtube.com/watch?v=example6",
    thumbnail: "https://img.youtube.com/vi/example6/mqdefault.jpg",
    description: "액션 영화 더빙 연습"
  },
  {
    id: 7,
    title: "쇼생크 탈출",
    member: "팀 로빈스",
    requestDate: "2025.07.10",
    youtubeUrl: "https://www.youtube.com/watch?v=example7",
    thumbnail: "https://img.youtube.com/vi/example7/mqdefault.jpg",
    description: "드라마 영화 더빙 연습"
  },
  {
    id: 8,
    title: "굿 윌 헌팅",
    member: "맷 데이먼",
    requestDate: "2025.07.09",
    youtubeUrl: "https://www.youtube.com/watch?v=example8",
    thumbnail: "https://img.youtube.com/vi/example8/mqdefault.jpg",
    description: "로맨틱 드라마 더빙 연습"
  },
  {
    id: 9,
    title: "인셉션",
    member: "레오나르도 디카프리오",
    requestDate: "2025.07.08",
    youtubeUrl: "https://www.youtube.com/watch?v=example9",
    thumbnail: "https://img.youtube.com/vi/example9/mqdefault.jpg",
    description: "스릴러 영화 더빙 연습"
  },
  {
    id: 10,
    title: "다크 나이트",
    member: "크리스찬 베일",
    requestDate: "2025.07.07",
    youtubeUrl: "https://www.youtube.com/watch?v=example10",
    thumbnail: "https://img.youtube.com/vi/example10/mqdefault.jpg",
    description: "슈퍼히어로 영화 더빙 연습"
  },
  {
    id: 11,
    title: "인피니티 워",
    member: "로버트 다우니 주니어",
    requestDate: "2025.07.06",
    youtubeUrl: "https://www.youtube.com/watch?v=example11",
    thumbnail: "https://img.youtube.com/vi/example11/mqdefault.jpg",
    description: "마블 영화 더빙 연습"
  },
  {
    id: 12,
    title: "어벤져스",
    member: "크리스 에반스",
    requestDate: "2025.07.05",
    youtubeUrl: "https://www.youtube.com/watch?v=example12",
    thumbnail: "https://img.youtube.com/vi/example12/mqdefault.jpg",
    description: "액션 영화 더빙 연습"
  },
  {
    id: 13,
    title: "라라랜드 더빙 요청",
    member: "라이언 고슬링",
    requestDate: "2025.07.04",
    youtubeUrl: "https://www.youtube.com/watch?v=example13",
    thumbnail: "https://img.youtube.com/vi/example13/mqdefault.jpg",
    description: "뮤지컬 영화 더빙 연습"
  },
  {
    id: 14,
    title: "위대한 개츠비",
    member: "레오나르도 디카프리오",
    requestDate: "2025.07.03",
    youtubeUrl: "https://www.youtube.com/watch?v=example14",
    thumbnail: "https://img.youtube.com/vi/example14/mqdefault.jpg",
    description: "레오나르도 디카프리오 연기 연습"
  },
  {
    id: 15,
    title: "레베카",
    member: "로렌스 올리비에",
    requestDate: "2025.07.02",
    youtubeUrl: "https://www.youtube.com/watch?v=example15",
    thumbnail: "https://img.youtube.com/vi/example15/mqdefault.jpg",
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