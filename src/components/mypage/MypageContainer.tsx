"use client";

import React, { useState } from 'react';
import { useMyPageOverview } from '@/hooks/useMyPageOverview';
import { API_ENDPOINTS } from '@/lib/constants';
import UserProfile from './UserProfile';
import StatsGrid from './StatsGrid';
import ShortsGrid from './ShortsGrid';
import RecentVideos from './RecentVideos';
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
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
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
      <PageHeader 
        title="마이페이지" 
        subtitle={`안녕하세요, ${data.user_info.full_name || data.user_info.email}님!`} 
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <UserProfile 
              user={data.user_info} 
              stats={{
                totalPracticeCount: data.total_practice_count,
                averageScore: data.average_completion_rate,
              }}
            />
            
            <StatsGrid 
              stats={{
                totalBookmarks: data.total_bookmarks,
                totalDubbedTokens: data.total_dubbed_tokens,
                totalPracticeCount: data.total_practice_count,
                averageScore: data.average_completion_rate,
              }}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <ShortsGrid 
              bookmarks={data.recent_bookmarks}
              loading={isRemovingBookmark}
              onRemoveBookmark={handleRemoveBookmark}
            />

            <RecentVideos 
              dubbedTokens={data.recent_dubbed_tokens}
              loading={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MypageContainer; 