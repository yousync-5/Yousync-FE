"use client";

import React, { useState } from 'react';
import { useMyPageOverview } from '@/hooks/useMyPageOverview';
import { API_ENDPOINTS } from '@/lib/constants';
import UserProfile from './UserProfile';
import PageHeader from './PageHeader';


const MypageContainer: React.FC = () => {
  const { data, loading, error, refetch } = useMyPageOverview();
  const [isRemovingBookmark, setIsRemovingBookmark] = useState(false);

  const handleRemoveBookmark = async (tokenId: number) => {
    setIsRemovingBookmark(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/mypage/bookmarks/${tokenId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error('북마크 삭제에 실패했습니다.');
      }

      refetch();
    } catch (error) {
      console.error('북마크 삭제 실패:', error);
      alert('북마크 삭제에 실패했습니다.');
    } finally {
      setIsRemovingBookmark(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p>마이페이지 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">데이터를 불러올 수 없습니다.</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <PageHeader title="마이페이지" subtitle="" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* 사용자 프로필 */}
          <UserProfile
            user={data.user_info}
            stats={{
              totalDubbedTokens: data.total_dubbed_tokens,
              averageScore: data.average_completion_rate,
              totalPracticeCount: data.total_practice_count,
            }}
          />

          {/* 북마크 섹션 */}
          <div className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                내 북마크{' '}
                <span className="text-blue-400 text-lg ml-2">
                  ({data.recent_bookmarks.length}개)
                </span>
              </h2>
              <button className="text-blue-400 hover:text-blue-300 text-sm">전체보기</button>
            </div>

            {data.recent_bookmarks.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-4">📌</div>
                <p>아직 북마크한 토큰이 없습니다.</p>
                <p className="text-sm mt-2">관심있는 토큰을 북마크해보세요!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {data.recent_bookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="group bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700 hover:border-neutral-600 transition-all duration-300 cursor-pointer"
                  >
                    {/* 썸네일 */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden">
                      <img
                        src={
                          bookmark.token.thumbnail_url ||
                          'https://images.unsplash.com/photo-1519125323398-675f0ddb6308'
                        }
                        alt={bookmark.token.token_name}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            'https://images.unsplash.com/photo-1519125323398-675f0ddb6308';
                        }}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveBookmark(bookmark.token.id);
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
                    </div>

                    {/* 정보 */}
                    <div className="p-4">
                      <h3 className="font-medium text-white mb-1 truncate">
                        {bookmark.token.token_name}
                      </h3>
                      <p className="text-gray-400 text-sm truncate">{bookmark.token.actor_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 최근 더빙한 토큰 섹션 */}
          <div className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                최근 더빙한 토큰{' '}
                <span className="text-green-400 text-lg ml-2">
                  ({data.recent_dubbed_tokens.length}/{data.total_dubbed_tokens}개)
                </span>
              </h2>
              <button className="text-green-400 hover:text-green-300 text-sm">전체보기</button>
            </div>

            {data.recent_dubbed_tokens.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-4">🎬</div>
                <p>아직 더빙한 토큰이 없습니다.</p>
                <p className="text-sm mt-2">토큰을 더빙해보세요!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {data.recent_dubbed_tokens.map((token) => (
                  <div
                    key={token.token_id}
                    className="group bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700 hover:border-neutral-600 transition-all duration-300 cursor-pointer"
                  >
                    <div className="relative aspect-[16/9] w-full overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308"
                        alt={token.token_name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-white mb-1 truncate">{token.token_name}</h3>
                      <p className="text-gray-400 text-sm truncate">{token.actor_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MypageContainer;