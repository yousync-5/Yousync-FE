"use client";

import React, { useState } from 'react';
import { useMyPageOverview } from '@/hooks/useMyPageOverview';
import { API_ENDPOINTS } from '@/lib/constants';
import UserProfile from './UserProfile';
import PageHeader from './PageHeader';
import ApprovedVideosModal from './ApprovedVideosModal';
import { extractYoutubeVideoId, getYoutubeThumbnail } from '@/utils/extractYoutubeVideoId';


const MypageContainer: React.FC = () => {
  const { data, loading, error, refetch } = useMyPageOverview();
  const [bookmarkPage, setBookmarkPage] = useState(1);
  const [dubbedPage, setDubbedPage] = useState(1);
  const [approvedPage, setApprovedPage] = useState(1);
  const [isRemovingBookmark, setIsRemovingBookmark] = useState(false);
  const [isApprovedVideosModalOpen, setIsApprovedVideosModalOpen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
  const itemsPerPage = 6; // 페이지당 표시할 항목 수

  // 북마크 정렬 및 페이지네이션 계산
  const sortedBookmarks = data ? [...data.recent_bookmarks].sort((a, b) => b.id - a.id) : [];
  const totalBookmarkPages = data ? Math.ceil(sortedBookmarks.length / itemsPerPage) : 0;
  const currentBookmarks = data ? sortedBookmarks.slice(
    (bookmarkPage - 1) * itemsPerPage,
    bookmarkPage * itemsPerPage
  ) : [];

  // 더빙 토큰 정렬 및 페이지네이션 계산
  const sortedDubbedTokens = data ? [...data.recent_dubbed_tokens].sort((a, b) => b.token_id - a.token_id) : [];
  const totalDubbedPages = data ? Math.ceil(sortedDubbedTokens.length / itemsPerPage) : 0;
  const currentDubbedTokens = data ? sortedDubbedTokens.slice(
    (dubbedPage - 1) * itemsPerPage,
    dubbedPage * itemsPerPage
  ) : [];

  // 승인된 영상 정렬 및 페이지네이션 계산 (더미 데이터)
  const approvedTokens = [
    {
      token_id: 1,
      token_name: "라라랜드",
      actor_name: "라이언 고슬링",
      completed_scripts: 95,
      total_scripts: 100,
      youtube_url: "https://www.youtube.com/watch?v=JyQqorUskVM",
      thumbnail: "https://images.christiantoday.co.kr/data/images/full/306792/image.jpg"
    },
    {
      token_id: 2,
      token_name: "위대한 개츠비",
      actor_name: "레오나르도 디카프리오",
      completed_scripts: 88,
      total_scripts: 100,
      youtube_url: "https://www.youtube.com/watch?v=g_Ri7HQAaMw",
      thumbnail: "https://pds.joongang.co.kr/news/component/htmlphoto_mmdata/201911/12/3006d1d1-66d4-4a3f-9b17-83252da27fb4.jpg"
    },
    {
      token_id: 3,
      token_name: "레베카",
      actor_name: "로렌스 올리비에",
      completed_scripts: 92,
      total_scripts: 100,
      youtube_url: "https://www.youtube.com/watch?v=dIFRonefRms",
      thumbnail: "https://cdn.sisajournal.com/news/photo/202309/271403_189056_2358.jpg"
    }
  ];
  const sortedApprovedTokens = approvedTokens.sort((a, b) => b.token_id - a.token_id);
  const totalApprovedPages = Math.ceil(sortedApprovedTokens.length / itemsPerPage);
  const currentApprovedTokens = sortedApprovedTokens.slice(
    (approvedPage - 1) * itemsPerPage,
    approvedPage * itemsPerPage
  );



  // 페이지 번호 버튼 생성 함수
  const renderPaginationButtons = (totalPages: number, currentPage: number, setPage: (page: number) => void) => {
    const buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setPage(i)}
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
            </div>

            {data.recent_bookmarks.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-4">📌</div>
                <p>아직 북마크한 토큰이 없습니다.</p>
                <p className="text-sm mt-2">관심있는 토큰을 북마크해보세요!</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                  {currentBookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="group bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700 hover:border-neutral-600 transition-all duration-300 cursor-pointer"
                      onClick={() => {
                        // 토큰 클릭 시 결과 페이지로 이동
                        window.location.href = `/result?token_id=${bookmark.token.id}`;
                      }}
                    >
                      {/* 썸네일 */}
                      <div className="relative aspect-[16/9] w-full overflow-hidden">
                        <img
                          src={
                            bookmark.token.youtube_url 
                              ? getYoutubeThumbnail(bookmark.token.youtube_url)
                              : bookmark.token.thumbnail_url ||
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
                
                {/* 페이지네이션 버튼 */}
                {totalBookmarkPages > 1 && (
                  <div className="flex justify-center mt-8 gap-2">
                    {renderPaginationButtons(totalBookmarkPages, bookmarkPage, setBookmarkPage)}
                  </div>
                )}
              </>
            )}
          </div>

          {/* 최근 더빙한 토큰 섹션 */}
          <div className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                내가 더빙한 영상{' '}
                <span className="text-green-400 text-lg ml-2">
                  ({data.recent_dubbed_tokens.length}개)
                </span>
              </h2>
            </div>

            {data.recent_dubbed_tokens.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-4">🎬</div>
                <p>아직 더빙한 토큰이 없습니다.</p>
                <p className="text-sm mt-2">토큰을 더빙해보세요!</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                  {currentDubbedTokens.map((token) => (
                    <div
                      key={token.token_id}
                      className="group bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700 hover:border-neutral-600 transition-all duration-300 cursor-pointer"
                      onClick={() => {
                        // 토큰 클릭 시 결과 페이지로 이동
                        window.location.href = `/result?token_id=${token.token_id}`;
                      }}
                    >
                      <div className="relative aspect-[16/9] w-full overflow-hidden">
                        <img
                          src={token.youtube_url ? getYoutubeThumbnail(token.youtube_url) : "https://images.unsplash.com/photo-1519125323398-675f0ddb6308"}
                          alt={token.token_name}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://images.unsplash.com/photo-1519125323398-675f0ddb6308";
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-white mb-1 truncate">{token.token_name}</h3>
                        <p className="text-gray-400 text-sm truncate">{token.actor_name}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* 페이지네이션 버튼 */}
                {totalDubbedPages > 1 && (
                  <div className="flex justify-center mt-8 gap-2">
                    {renderPaginationButtons(totalDubbedPages, dubbedPage, setDubbedPage)}
                  </div>
                )}
              </>
            )}
          </div>

          {/* 승인된 영상 섹션 */}
          <div className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                승인된 영상{' '}
                <span className="text-purple-400 text-lg ml-2">
                  ({sortedApprovedTokens.length}개)
                </span>
              </h2>
            </div>

            {sortedApprovedTokens.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-4">✅</div>
                <p>아직 승인된 영상이 없습니다.</p>
                <p className="text-sm mt-2">더빙을 완료하면 승인된 영상이 표시됩니다!</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                  {currentApprovedTokens.map((token) => (
                    <div
                      key={token.token_id}
                      className="group bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700 hover:border-neutral-600 transition-all duration-300 cursor-pointer"
                      onClick={() => {
                        setSelectedVideoId(token.token_id);
                        setIsApprovedVideosModalOpen(true);
                      }}
                    >
                      <div className="relative aspect-[16/9] w-full overflow-hidden">
                        <img
                          src={token.thumbnail || `https://img.youtube.com/vi/${token.youtube_url.split('v=')[1]}/mqdefault.jpg`}
                          alt={token.token_name}
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
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-white mb-1 truncate">{token.token_name}</h3>
                        <p className="text-gray-400 text-sm truncate">{token.actor_name}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* 페이지네이션 버튼 */}
                {totalApprovedPages > 1 && (
                  <div className="flex justify-center mt-8 gap-2">
                    {renderPaginationButtons(totalApprovedPages, approvedPage, setApprovedPage)}
                  </div>
                )}
              </>
            )}
          </div>

          {/* 승인된 영상 모달 */}
          <ApprovedVideosModal
            isOpen={isApprovedVideosModalOpen}
            onClose={() => {
              setIsApprovedVideosModalOpen(false);
              setSelectedVideoId(null);
            }}
            selectedVideoId={selectedVideoId}
          />
        </div>
      </div>
    </div>
  );
};

export default MypageContainer;