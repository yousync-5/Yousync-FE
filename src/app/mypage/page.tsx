"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from "@/components/mypage/PageHeader";
import UserProfile from "@/components/mypage/UserProfile";
import ShortsGrid from "@/components/mypage/ShortsGrid";
import RecentVideos from "@/components/mypage/RecentVideos";
import StatsGrid from "@/components/mypage/StatsGrid";
import { useMyPage } from "@/hooks/useMyPage";

export default function MyPage() {
  const router = useRouter();
  const { data, loading, error, removeBookmark } = useMyPage();

  useEffect(() => {
    // 로그인 체크
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        router.push('/login');
        return;
      }
    }
  }, [router]);

  const handleRemoveBookmark = async (tokenId: number) => {
    try {
      await removeBookmark(tokenId);
    } catch (error) {
      console.error('북마크 삭제 실패:', error);
      // 에러 토스트 메시지 표시 (선택사항)
    }
  };

  if (error) {
    return (
      <div className="bg-neutral-950 text-white min-h-screen font-sans overflow-x-hidden">
        <div className="max-w-7xl mx-auto py-8 px-6">
          <div className="text-center py-12">
            <div className="text-4xl mb-4">😵</div>
            <h2 className="text-2xl font-bold mb-2">데이터를 불러올 수 없습니다</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-950 text-white min-h-screen font-sans overflow-x-hidden">
      <div className="max-w-7xl mx-auto py-8 px-6">
        {/* 헤더 */}
        <PageHeader 
          title="마이페이지" 
          subtitle="당신의 더빙 여정을 확인하세요" 
        />

        {/* 1. 사용자 프로필 + 북마크 */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 프로필 카드 */}
            <UserProfile 
              user={data.user} 
              stats={{
                totalPracticeCount: data.stats.totalPracticeCount,
                averageScore: data.stats.averageScore
              }}
              loading={loading}
            />

            {/* 내 북마크 */}
            <ShortsGrid 
              bookmarks={data.bookmarks} 
              loading={loading}
              onRemoveBookmark={handleRemoveBookmark}
            />
          </div>
        </section>

        {/* 2. 최근 더빙한 토큰 */}
        <RecentVideos 
          dubbedTokens={data.dubbedTokens} 
          loading={loading}
        />

        {/* 3. 통계 */}
        <StatsGrid 
          stats={data.stats} 
          loading={loading}
        />
      </div>
    </div>
  );
} 