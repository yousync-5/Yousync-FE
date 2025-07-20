"use client";

import React, { useState } from 'react';
import { useMyPageOverview } from '@/hooks/useMyPageOverview';
import { API_ENDPOINTS } from '@/lib/constants';
import UserProfile from './UserProfile';
import PageHeader from './PageHeader';
import { extractYoutubeVideoId, getYoutubeThumbnail } from '@/utils/extractYoutubeVideoId';

const MypageContainer: React.FC = () => {
  const { data, loading, error, refetch } = useMyPageOverview();
  const [dubbedPage, setDubbedPage] = useState(1);
  const itemsPerPage = 6; // 페이지당 표시할 항목 수



  // 디버깅: 서버 더빙 토큰 데이터 확인
  console.log('🎬 서버 더빙 토큰 데이터:', {
    totalTokens: data?.recent_dubbed_tokens?.length || 0,
    tokens: data?.recent_dubbed_tokens?.map(token => ({
      token_id: token.token_id,
      token_name: token.token_name,
      actor_name: token.actor_name,
      youtube_url: token.youtube_url,
      has_youtube: !!token.youtube_url
    })) || [],
    youtubeCount: data?.recent_dubbed_tokens?.filter(token => token.youtube_url)?.length || 0
  });

  // 더빙한 토큰에서 유튜브 URL이 있는 토큰들만 필터링하여 표시
  const dubbedTokensWithYoutube = data?.recent_dubbed_tokens?.filter(token => token.youtube_url) || [];
  console.log('🎬 유튜브 URL이 있는 더빙 토큰:', {
    count: dubbedTokensWithYoutube.length,
    tokens: dubbedTokensWithYoutube.map(token => ({
      token_id: token.token_id,
      token_name: token.token_name,
      youtube_url: token.youtube_url
    }))
  });



  // 더빙한 토큰 정렬 및 페이지네이션 계산
  const sortedDubbedTokens = data ? [...data.recent_dubbed_tokens].sort((a, b) => b.token_id - a.token_id) : [];
  const totalDubbedPages = data ? Math.ceil(sortedDubbedTokens.length / itemsPerPage) : 0;
  const currentDubbedTokens = data ? sortedDubbedTokens.slice(
    (dubbedPage - 1) * itemsPerPage,
    dubbedPage * itemsPerPage
  ) : [];

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



  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

          {/* 로컬 북마크 섹션 */}
          <div className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                내 북마크{' '}
                <span className="text-blue-400 text-lg ml-2">
                  ({bookmarks.length}개)
                </span>
              </h2>
            </div>

            {bookmarks.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-4">📌</div>
                <p>아직 북마크한 토큰이 없습니다.</p>
                <p className="text-sm mt-2">메인화면에서 관심있는 토큰을 북마크해보세요!</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                  {currentLocalBookmarks.map((bookmark) => (
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
                        {bookmark.youtube_url ? (
                          <img
                            src={getYoutubeThumbnail(bookmark.youtube_url)}
                            alt={bookmark.token_name}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                              console.log('❌ 유튜브 썸네일 로드 실패:', bookmark.youtube_url);
                              const target = e.target as HTMLImageElement;
                              target.src = "https://images.unsplash.com/photo-1519125323398-675f0ddb6308";
                            }}
                            onLoad={() => {
                              console.log('✅ 유튜브 썸네일 로드 성공:', bookmark.youtube_url);
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <div className="text-white text-center">
                              <div className="text-2xl mb-2">🎬</div>
                              <div className="text-sm font-medium">{bookmark.actor_name}</div>
                              <div className="text-xs mt-1 opacity-75">썸네일 없음</div>
                            </div>
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveLocalBookmark(bookmark.token_id);
                          }}
                          className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={isRemovingBookmark}
                          title={isRemovingBookmark ? "삭제 중..." : "북마크 삭제"}
                        >
                          {isRemovingBookmark ? (
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                          ) : (
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
                          )}
                        </button>
                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {bookmark.category}
                        </div>
                        {bookmark.youtube_url && (
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            🎬 유튜브
                          </div>
                        )}
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
                
                {/* 페이지네이션 버튼 */}
                {totalLocalBookmarkPages > 1 && (
                  <div className="flex justify-center mt-8 gap-2">
                    {renderPaginationButtons(totalLocalBookmarkPages, bookmarkPage, setBookmarkPage)}
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
                        {token.youtube_url ? (
                          <img
                            src={getYoutubeThumbnail(token.youtube_url)}
                            alt={token.token_name}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                              console.log('❌ 더빙 토큰 유튜브 썸네일 로드 실패:', {
                                token_id: token.token_id,
                                token_name: token.token_name,
                                youtube_url: token.youtube_url
                              });
                              const target = e.target as HTMLImageElement;
                              target.src = "https://images.unsplash.com/photo-1519125323398-675f0ddb6308";
                            }}
                            onLoad={() => {
                              console.log('✅ 더빙 토큰 유튜브 썸네일 로드 성공:', {
                                token_id: token.token_id,
                                token_name: token.token_name,
                                youtube_url: token.youtube_url
                              });
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                            <div className="text-white text-center">
                              <div className="text-2xl mb-2">🎬</div>
                              <div className="text-sm font-medium">{token.actor_name}</div>
                              <div className="text-xs mt-1 opacity-75">썸네일 없음</div>
                            </div>
                          </div>
                        )}
                        {token.youtube_url && (
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            🎬 유튜브
                          </div>
                        )}
                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {token.category}
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
                {totalDubbedPages > 1 && (
                  <div className="flex justify-center mt-8 gap-2">
                    {renderPaginationButtons(totalDubbedPages, dubbedPage, setDubbedPage)}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MypageContainer;