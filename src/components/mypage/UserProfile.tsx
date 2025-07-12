"use client";

import { UserInfo } from '@/services/auth';

interface UserProfileProps {
  user: UserInfo | null;
  stats: {
    totalPracticeCount: number;
    averageScore: number;
  };
  loading?: boolean;
}

export default function UserProfile({ user, stats, loading }: UserProfileProps) {
  if (loading) {
    return (
      <div className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800">
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-neutral-700 animate-pulse mb-4"></div>
          <div className="h-6 bg-neutral-700 rounded w-24 mb-2 animate-pulse"></div>
          <div className="h-4 bg-neutral-700 rounded w-32 mb-4 animate-pulse"></div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="h-8 bg-neutral-700 rounded w-12 mb-1 animate-pulse"></div>
              <div className="h-3 bg-neutral-700 rounded w-8 animate-pulse"></div>
            </div>
            <div className="text-center">
              <div className="h-8 bg-neutral-700 rounded w-12 mb-1 animate-pulse"></div>
              <div className="h-3 bg-neutral-700 rounded w-12 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800">
        <div className="flex flex-col items-center text-center">
          <div className="text-gray-400">사용자 정보를 불러올 수 없습니다.</div>
        </div>
      </div>
    );
  }

  // 레벨 계산 (연습 횟수 기반)
  const level = Math.floor(stats.totalPracticeCount / 10) + 1;

  return (
    <div className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800">
      <div className="flex flex-col items-center text-center">
        <img
          src={user.profile_picture || "https://randomuser.me/api/portraits/lego/1.jpg"}
          alt={user.full_name}
          className="w-24 h-24 rounded-full border-4 border-blue-500 mb-4"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://randomuser.me/api/portraits/lego/1.jpg";
          }}
        />
        <h2 className="text-2xl font-bold mb-1">{user.full_name}</h2>
        <p className="text-gray-400 text-sm mb-4">{user.email}</p>
        <div className="flex gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">Lv.{level}</div>
            <div className="text-xs text-gray-500">레벨</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{stats.totalPracticeCount}</div>
            <div className="text-xs text-gray-500">연습횟수</div>
          </div>
        </div>
      </div>
    </div>
  );
} 