import React from "react";

const user = {
  name: "유나",
  email: "yuna@email.com",
  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  level: 15,
  totalPlays: 127,
};

const accuracy = [
  { label: "발음", value: 87, color: "bg-blue-500" },
  { label: "억양", value: 92, color: "bg-green-500" },
  { label: "총점", value: 89, color: "bg-purple-500" },
];

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">마이페이지</h1>
          <p className="text-gray-400">당신의 더빙 여정을 확인하세요</p>
        </div>

        {/* 1. 사용자 프로필 + 내가 만든 숏츠 */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 프로필 카드 */}
            <div className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800">
              <div className="flex flex-col items-center text-center">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-full border-4 border-blue-500 mb-4"
                />
                <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
                <p className="text-gray-400 text-sm mb-4">{user.email}</p>
                <div className="flex gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-400">Lv.{user.level}</div>
                    <div className="text-xs text-gray-500">레벨</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">{user.totalPlays}</div>
                    <div className="text-xs text-gray-500">연습횟수</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 내가 만든 숏츠 */}
            <div className="lg:col-span-2 bg-neutral-900 rounded-2xl p-8 border border-neutral-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">내가 만든 숏츠</h2>
                <button className="text-blue-400 hover:text-blue-300 text-sm">전체보기</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {shorts.map((short) => (
                  <div
                    key={short.id}
                    className="group bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-neutral-700 transition-all duration-300 cursor-pointer"
                  >
                    {/* [수정] 썸네일 세로 비율(숏츠) */}
                    <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl">
                      <img
                        src={short.thumb}
                        alt={short.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button className="bg-white/20 backdrop-blur-sm rounded-full p-3 text-white">
                          ▶
                        </button>
                      </div>
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {short.views.toLocaleString()}회
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-1 truncate">{short.title}</h3>
                      <p className="text-gray-400 text-sm">{short.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 2. 최근 플레이한 비디오 */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">최근 플레이한 영상</h2>
            <button className="text-blue-400 hover:text-blue-300 text-sm">전체보기</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentVideos.map((video) => (
              <div
                key={video.id}
                className="group bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-neutral-700 transition-all duration-300 cursor-pointer"
              >
                <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                  <img
                    src={video.thumb}
                    alt={video.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button className="bg-white/20 backdrop-blur-sm rounded-full p-3 text-white">
                      ▶
                    </button>
                  </div>
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded font-bold">
                    {video.score}점
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1 truncate">{video.title}</h3>
                  <p className="text-gray-400 text-sm mb-2">{video.actor}</p>
                  <p className="text-gray-500 text-xs">{video.date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. 추가 정보 카드 */}
        <section>
          <h2 className="text-2xl font-bold mb-6">통계</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-neutral-900 rounded-xl p-6 border border-neutral-800 text-center"
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
