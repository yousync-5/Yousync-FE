"use client";

import React from "react";
import PageHeader from "@/components/mypage/PageHeader";
import UserProfile from "@/components/mypage/UserProfile";
import ShortsGrid from "@/components/mypage/ShortsGrid";
import RecentVideos from "@/components/mypage/RecentVideos";
import type { MypageContainerProps } from "@/types/MypageType";

export default function MypageContainer({ user, shorts, recentVideos }: MypageContainerProps) {
  return (
    <div className="max-w-7xl w-full py-8 px-6 lg:px-8 mx-auto">
      <PageHeader
        title="마이페이지"
        subtitle="당신의 더빙 여정을 확인하세요"
      />
      <section className="mb-12 grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
        {/* 프로필을 좌측에 col-span-1로 */}
        <div className="lg:col-span-1 flex justify-start">
          <UserProfile user={user} />
        </div>
        {/* 영상(북마크) 컨테이너를 넓게 col-span-4로 */}
        <div className="lg:col-span-4">
          <ShortsGrid shorts={shorts} />
        </div>
      </section>
      <RecentVideos videos={recentVideos} />
    </div>
  );
}
