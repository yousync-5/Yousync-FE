"use client";

import React, { useState } from 'react';
import { useLocalBookmark } from '@/hooks/useLocalBookmark';
import { BookmarkIcon } from '@heroicons/react/24/solid';

interface LocalBookmarkSectionProps {
  itemsPerPage?: number;
}

export default function LocalBookmarkSection({ itemsPerPage = 6 }: LocalBookmarkSectionProps) {
  const { bookmarks, removeBookmark, isLoading } = useLocalBookmark();
  const [currentPage, setCurrentPage] = useState(1);
  const [isRemovingBookmark, setIsRemovingBookmark] = useState(false);

  // 북마크 정렬 및 페이지네이션 계산
  const sortedBookmarks = [...bookmarks].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const totalPages = Math.ceil(sortedBookmarks.length / itemsPerPage);
  const currentBookmarks = sortedBookmarks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 페이지 번호 버튼 생성 함수
  const renderPaginationButtons = () => {
    if (totalPages <= 1) return null;
    
    const buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentPage === i
              ? 'bg-blue-600 text-white'
              : 'bg-neutral-800 text-gray-300 hover:bg-neutral-700'
          }`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  const handleRemoveBookmark = async (tokenId: number) => {
    setIsRemovingBookmark(true);
    try {
      const success = await removeBookmark(tokenId);
      if (success) {
        console.log(`🗑️ 북마크 제거 완료: ${tokenId}`);
      }
    } catch (error) {
      console.error('북마크 삭제 실패:', error);
    } finally {
      setIsRemovingBookmark(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          내 북마크{' '}
          <span className="text-blue-400 text-lg ml-2">
            ({bookmarks.length}개)
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <BookmarkIcon className="w-5 h-5 text-blue-400" />
          <span className="text-sm text-gray-400">로컬 저장</span>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">북마크를 불러오는 중...</p>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-4">📌</div>
          <p>아직 북마크한 토큰이 없습니다.</p>
          <p className="text-sm mt-2">메인화면에서 관심있는 토큰을 북마크해보세요!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {currentBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="group bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700 hover:border-neutral-600 transition-all duration-300 cursor-pointer"
                onClick={() => {
                  // 토큰 클릭 시 더빙 페이지로 이동 (실제 구현 시 적절한 경로로 수정)
                  console.log(`북마크 클릭: ${bookmark.token_name} (ID: ${bookmark.token_id})`);
                }}
              >
                {/* 썸네일 */}
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-2xl mb-2">🎬</div>
                      <div className="text-sm font-medium">{bookmark.actor_name}</div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveBookmark(bookmark.token_id);
                    }}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={isRemovingBookmark}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {bookmark.category}
                  </div>
                </div>

                {/* 카드 내용 */}
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-2 line-clamp-2">
                    {bookmark.token_name}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{bookmark.actor_name}</span>
                    <span>{formatDate(bookmark.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                {renderPaginationButtons()}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 