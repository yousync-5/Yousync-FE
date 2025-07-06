import React, { useState } from "react";
import { FaMicrophone, FaBullseye, FaStar, FaVideo, FaPlay } from "react-icons/fa";

const user = {
  name: "유나",
  email: "yuna@email.com",
  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
};

const accuracy = [
  { label: "발음", value: 87, color: "bg-blue-500", icon: <FaMicrophone className="text-blue-400 text-2xl mb-2" /> },
  { label: "억양", value: 92, color: "bg-green-500", icon: <FaBullseye className="text-green-400 text-2xl mb-2" /> },
  { label: "총점", value: 89, color: "bg-purple-500", icon: <FaStar className="text-purple-400 text-2xl mb-2" /> },
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

const tabList = [
  { key: "pron", label: "발음", icon: <FaMicrophone /> },
  { key: "accu", label: "정확도", icon: <FaBullseye /> },
  { key: "score", label: "점수", icon: <FaStar /> },
  { key: "shorts", label: "만든숏츠", icon: <FaVideo /> },
];

export default function MyPage() {
  const [activeTab, setActiveTab] = useState("pron");

  return (
    <div className="bg-neutral-950 text-white min-h-screen font-sans overflow-x-hidden">
      <div className="max-w-7xl mx-auto py-8 px-6">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">마이페이지</h1>
          <p className="text-gray-400">당신의 더빙 여정을 확인하세요</p>
        </div>

        {/* 상단: 프로필/그래프 2개 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* 프로필 카드 */}
          <div className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800 flex flex-col items-center text-center">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-24 h-24 rounded-full border-4 border-blue-500 mb-4"
            />
            <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
            <p className="text-gray-400 text-sm mb-2">{user.email}</p>
          </div>
          {/* 그래프 카드 */}
          <div className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800 flex flex-col items-center">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><FaBullseye className="text-green-400" />최근 정확도</h3>
            <div className="flex gap-8 w-full justify-center">
              {accuracy.map((item) => (
                <div key={item.label} className="flex flex-col items-center flex-1">
                  {item.icon}
                  <div className="w-12 h-28 bg-neutral-800 rounded-full flex items-end overflow-hidden mb-2">
                    <div
                      className={`${item.color} rounded-full w-12 transition-all duration-500`}
                      style={{ height: `${item.value}%` }}
                    ></div>
                  </div>
                  <div className="text-lg font-bold text-white mb-1">{item.value}%</div>
                  <div className="text-gray-400 text-sm">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 중앙: 탭 UI */}
        <div className="mb-12">
          <div className="flex gap-2 mb-6 justify-center">
            {tabList.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-lg transition-all duration-200 border-2  ${activeTab === tab.key ? "bg-blue-600 border-blue-400 text-white" : "bg-neutral-900 border-neutral-700 text-gray-300 hover:bg-neutral-800"}`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
          <div className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800 min-h-[180px]">

            {/* 발음 분석 탭 */}
            {activeTab === "pron" && (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="flex items-center gap-2 mb-2">
                  <FaMicrophone className="text-3xl text-blue-400" />
                  <span className="text-2xl font-bold text-white">
                    발음 점수: <span className="text-blue-300">87점</span>
                  </span>
                </div>
                {/* --- 발음 분석 그래프 --- */}
                <div className="w-full max-w-md bg-neutral-800 rounded-lg p-4 mb-4 shadow-lg border border-blue-700">
                  <div className="flex items-end gap-4 h-36">
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-8 h-24 bg-green-400 rounded shadow"></div>
                      <span className="mt-2 text-sm text-white">a</span>
                      <span className="text-green-700 font-bold text-xs">90점</span>
                    </div>
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-8 h-12 bg-yellow-400 rounded shadow"></div>
                      <span className="mt-2 text-sm text-white">th</span>
                      <span className="text-yellow-700 font-bold text-xs">65점</span>
                    </div>
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-8 h-28 bg-green-400 rounded shadow"></div>
                      <span className="mt-2 text-sm text-white">r</span>
                      <span className="text-green-700 font-bold text-xs">92점</span>
                    </div>
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-8 h-8 bg-red-400 rounded shadow"></div>
                      <span className="mt-2 text-sm text-white">e</span>
                      <span className="text-red-700 font-bold text-xs">40점</span>
                    </div>
                  </div>
                  <div className="text-sm text-white text-center mt-4 font-semibold">
                    각 발음별 점수 분석 결과입니다.<br />
                    <span className="text-green-500 font-bold">90점 이상</span>: 정확한 발음<br />
                    <span className="text-yellow-500 font-bold">60~80점</span>: 보통, 약간의 발음 오류<br />
                    <span className="text-red-500 font-bold">60점 이하</span>: 추가 연습 필요
                  </div>
                </div>
                {/* --- 발음 상세 설명 --- */}
                <div className="bg-neutral-800 rounded-lg p-4 w-full max-w-md shadow border border-blue-700">
                  <div className="font-bold text-blue-300 mb-2">상세 피드백</div>
                  <ul className="list-disc pl-6 text-white text-sm mb-2">
                    <li>
                      <b>a</b>: 정확한 발음으로 소리내고 있습니다.
                    </li>
                    <li>
                      <b>th</b>: 혀끝을 윗니에 대고, 공기를 내보내며 소리 내는 연습이 필요합니다.
                    </li>
                    <li>
                      <b>r</b>: 우수한 발음! 자연스럽게 들립니다.
                    </li>
                    <li>
                      <b>e</b>: 입을 더 크게 벌리고 명확하게 소리 내는 연습이 필요합니다.
                    </li>
                  </ul>
                  <div className="mt-2 text-xs text-gray-300">
                    Tip: 발음 교정 유튜브로 반복 학습하세요. <br />
                    "th" 발음 교정 영상:{" "}
                    <a
                      href="https://www.youtube.com/results?search_query=th+발음+교정"
                      target="_blank"
                      className="underline text-blue-400"
                    >
                      유튜브 링크
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* 정확도 분석 탭 */}
            {activeTab === "accu" && (
              <div className="flex flex-col items-center justify-center h-full">
                <FaBullseye className="text-4xl text-green-400 mb-2" />
                <div className="text-xl font-bold mb-2">정확도 분석</div>
                {/* --- 예시 정확도 그래프 --- */}
                <div className="w-full max-w-md bg-neutral-800 rounded-lg p-4 mb-4">
                  <div className="flex items-end gap-4 h-36">
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-8 h-24 bg-green-400 rounded"></div>
                      <span className="mt-2 text-sm text-gray-300">문장1</span>
                      <span className="text-green-300 font-bold text-xs">95%</span>
                    </div>
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-8 h-20 bg-yellow-400 rounded"></div>
                      <span className="mt-2 text-sm text-gray-300">문장2</span>
                      <span className="text-yellow-300 font-bold text-xs">83%</span>
                    </div>
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-8 h-28 bg-green-400 rounded"></div>
                      <span className="mt-2 text-sm text-gray-300">문장3</span>
                      <span className="text-green-300 font-bold text-xs">98%</span>
                    </div>
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-8 h-16 bg-red-400 rounded"></div>
                      <span className="mt-2 text-sm text-gray-300">문장4</span>
                      <span className="text-red-300 font-bold text-xs">70%</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-300 text-center mt-4">
                    최근 4문장의 정확도 분석 결과입니다.<br />
                    <span className="text-green-400 font-bold">95% 이상</span>: 매우 정확한 발음<br />
                    <span className="text-yellow-400 font-bold">80~90%</span>: 약간의 발음 오류 있음<br />
                    <span className="text-red-400 font-bold">70% 이하</span>: 주요 발음 오류, 추가 연습 필요
                  </div>
                </div>
                {/* --- 설명/피드백 --- */}
                <div className="bg-neutral-800 rounded-lg p-4 w-full max-w-md">
                  <div className="font-bold text-green-300 mb-2">상세 피드백</div>
                  <ul className="list-disc pl-6 text-gray-200 text-sm mb-2">
                    <li>
                      <b>문장1:</b> 완벽한 발음! 모든 단어가 또렷하게 들립니다.
                    </li>
                    <li>
                      <b>문장2:</b> "think"의 "th" 발음이 살짝 약합니다. 혀끝을 윗니에 대고 발음해보세요.
                    </li>
                    <li>
                      <b>문장3:</b> 억양과 강세가 자연스럽게 표현되었습니다.
                    </li>
                    <li>
                      <b>문장4:</b> "want"의 "w" 발음이 흐릿합니다. 입술을 둥글게 모으고 소리 내는 연습이 필요합니다.
                    </li>
                  </ul>
                  <div className="mt-2 text-xs text-gray-400">
                    Tip: 녹음 후 본인 목소리를 다시 듣고, AI 분석 결과와 비교해보세요.<br />
                    발음 교정 유튜브 보기:{" "}
                    <a
                      href="https://www.youtube.com/results?search_query=영어+발음+교정"
                      target="_blank"
                      className="underline text-green-400"
                    >
                      영어 발음 교정 영상
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* 점수 분석 탭 */}
            {activeTab === "score" && (
              <div className="flex flex-col items-center justify-center h-full">
                <FaStar className="text-4xl text-yellow-400 mb-2" />
                <div className="text-xl font-bold mb-2">점수 분석</div>
                <div className="w-full max-w-md bg-neutral-800 rounded-lg p-4 mb-4">
                  <div className="flex items-end gap-4 h-36">
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-8 h-28 bg-green-400 rounded"></div>
                      <span className="mt-2 text-sm text-gray-300">최고점</span>
                      <span className="text-green-300 font-bold text-xs">96점</span>
                    </div>
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-8 h-20 bg-blue-400 rounded"></div>
                      <span className="mt-2 text-sm text-gray-300">평균점</span>
                      <span className="text-blue-300 font-bold text-xs">89점</span>
                    </div>
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-8 h-14 bg-yellow-400 rounded"></div>
                      <span className="mt-2 text-sm text-gray-300">최저점</span>
                      <span className="text-yellow-300 font-bold text-xs">72점</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-300 text-center mt-4">
                    최근 10회 연습의 점수 분포입니다.<br />
                    <span className="text-green-400 font-bold">90점 이상</span>: 우수<br />
                    <span className="text-blue-400 font-bold">80~90점</span>: 양호<br />
                    <span className="text-yellow-400 font-bold">80점 이하</span>: 추가 연습 필요
                  </div>
                </div>
                <div className="bg-neutral-800 rounded-lg p-4 w-full max-w-md">
                  <div className="font-bold text-yellow-300 mb-2">상세 피드백</div>
                  <ul className="list-disc pl-6 text-gray-200 text-sm mb-2">
                    <li>최고점: 96점, 꾸준한 연습으로 점수가 상승하고 있습니다.</li>
                    <li>평균점: 89점, 전체적으로 안정적인 실력을 유지하고 있습니다.</li>
                    <li>최저점: 72점, 특정 발음 구간에서 점수가 낮게 나왔으니 해당 부분을 집중 연습해보세요.</li>
                  </ul>
                  <div className="mt-2 text-xs text-gray-400">
                    Tip: 점수 추이를 그래프로 확인하며, 낮은 점수 구간을 반복 연습하세요.
                  </div>
                </div>
              </div>
            )}
            {/* 만든숏츠 탭 */}
            {activeTab === "shorts" && (
              <div>
                <div className="flex flex-wrap gap-6 justify-center">
                  {shorts.map((short) => (
                    <div
                      key={short.id}
                      className="group bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700 hover:border-blue-400 transition-all duration-300 cursor-pointer w-56"
                    >
                      <div className="relative aspect-video">
                        <img
                          src={short.thumb}
                          alt={short.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <button className="bg-white/20 backdrop-blur-sm rounded-full p-3 text-white">
                            <FaPlay />
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
            )}
          </div>
        </div>

        {/* 하단: 최근 플레이한 영상 */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><FaPlay className="text-green-400" />최근 플레이한 영상</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentVideos.map((video) => (
              <div
                key={video.id}
                className="group bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-green-400 transition-all duration-300 cursor-pointer"
              >
                <div className="relative aspect-video">
                  <img
                    src={video.thumb}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button className="bg-white/20 backdrop-blur-sm rounded-full p-3 text-white">
                      <FaPlay />
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
      </div>
    </div>
  );
}
