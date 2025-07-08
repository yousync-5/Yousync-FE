"use client";

import PageHeader from "@/components/mypage/PageHeader";
import UserProfile from "@/components/mypage/UserProfile";
import ShortsGrid from "@/components/mypage/ShortsGrid";
import StatsGrid from "@/components/mypage/StatsGrid";

const user = {
  name: "유나",
  email: "yuna@email.com",
  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  level: 15,
  totalPlays: 127,
};

const shorts = [
  { id: 1, title: "인셉션 명장면 더빙", thumb: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308", date: "2024-07-01", views: 1240 },
  { id: 2, title: "타이타닉 감정연기", thumb: "https://images.unsplash.com/photo-1506744038136-46273834b3fb", date: "2024-07-02", views: 892 },
  { id: 3, title: "어벤져스 명대사", thumb: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca", date: "2024-07-03", views: 2156 },
  { id: 4, title: "인터스텔라 명장면", thumb: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308", date: "2024-07-04", views: 567 },
];

const recentVideos = [
  { id: 1, title: "인터스텔라 감동씬", actor: "매튜 맥커너히", thumb: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308", date: "2024-07-04", score: 89 },
  { id: 2, title: "포레스트 검프 따라잡기", actor: "톰 행크스", thumb: "https://images.unsplash.com/photo-1506744038136-46273834b3fb", date: "2024-07-03", score: 92 },
  { id: 3, title: "타이타닉 명장면", actor: "레오나르도 디카프리오", thumb: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca", date: "2024-07-02", score: 87 },
  { id: 4, title: "어벤져스 액션씬", actor: "로버트 다우니 주니어", thumb: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308", date: "2024-07-01", score: 94 },
];

const stats = [
  { label: "총 연습 횟수", value: "127회", icon: "🎯" },
  { label: "평균 점수", value: "89점", icon: "⭐" },
  { label: "최고 점수", value: "96점", icon: "🏆" },
  { label: "연속 연습", value: "7일", icon: "🔥" },
];

export default function MyPage() {
  return (
    <div className="bg-neutral-950 text-white min-h-screen font-sans overflow-x-hidden">
      <div className="max-w-7xl mx-auto py-8 px-6">
        {/* 헤더 */}
        <PageHeader 
          title="마이페이지" 
          subtitle="당신의 더빙 여정을 확인하세요" 
        />

        {/* 1. 사용자 프로필 + 내가 만든 숏츠 */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 프로필 카드 */}
            <UserProfile user={user} />

            {/* 내가 만든 숏츠 */}
            <ShortsGrid shorts={shorts} />
          </div>
        </section>

        {/* 2. 최근 플레이한 비디오 */}
        {/* TODO: Add a component to display recentVideos here, e.g. <RecentVideosGrid videos={recentVideos} /> */}

        {/* 3. 통계 */}
        <StatsGrid stats={stats} />
      </div>
    </div>
  );
} 