"use client"
import React, { useEffect, useState } from 'react'
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';

interface UploadRequest {
    id: string;
    title: string;
    content: string;
    date: string;
    status: "심사중" | "승인됨" | "거절됨";
    url: string;
    requester?: string;
}

const dummyData: UploadRequest[] = [
    {
      id: "1",
      title: "인터스텔라 더빙 요청",
      content: "이 장면은 꼭 더빙하고 싶어요!",
      date: "2025.07.19",
      status: "심사중",
      url: "https://",
      requester: "원산하"
    },
    {
      id: "2",
      title: "타이타닉 명장면 요청",
      content: "감정 표현 연습용으로 요청합니다",
      date: "2025.07.18",
      status: "승인됨",
      url: "https://",
      requester: "최우석"
    },
    {
      id: "3",
      title: "드래곤볼 요청",
      content: "애니메이션 더빙을 연습하고 싶습니다",
      date: "2025.07.17",
      status: "거절됨",
      url: "https://",
      requester: "윤정환"
    },
    // MY 탭용 더미 데이터 - 다양한 사용자별 요청들
    {
      id: "4",
      title: "포레스트 검프 명장면",
      content: "톰 행크스의 감정 연기 연습하고 싶어요",
      date: "2025.07.16",
      status: "승인됨",
      url: "https://www.youtube.com/watch?v=example1",
      requester: "김영희"
    },
    {
      id: "5",
      title: "아바타 더빙 요청",
      content: "제임스 카메론 영화의 더빙 연습",
      date: "2025.07.15",
      status: "심사중",
      url: "https://www.youtube.com/watch?v=example2",
      requester: "김영희"
    },
    {
      id: "6",
      title: "해리포터 시리즈",
      content: "마법사 세계의 더빙 연습",
      date: "2025.07.14",
      status: "거절됨",
      url: "https://www.youtube.com/watch?v=example3",
      requester: "김영희"
    },
    {
      id: "7",
      title: "반지의 제왕",
      content: "판타지 영화 더빙 연습",
      date: "2025.07.13",
      status: "승인됨",
      url: "https://www.youtube.com/watch?v=example4",
      requester: "박철수"
    },
    {
      id: "8",
      title: "스타워즈 시리즈",
      content: "우주 SF 영화 더빙 연습",
      date: "2025.07.12",
      status: "심사중",
      url: "https://www.youtube.com/watch?v=example5",
      requester: "박철수"
    },
    {
      id: "9",
      title: "매트릭스",
      content: "액션 영화 더빙 연습",
      date: "2025.07.11",
      status: "승인됨",
      url: "https://www.youtube.com/watch?v=example6",
      requester: "박철수"
    },
    {
      id: "10",
      title: "쇼생크 탈출",
      content: "드라마 영화 더빙 연습",
      date: "2025.07.10",
      status: "거절됨",
      url: "https://www.youtube.com/watch?v=example7",
      requester: "이미영"
    },
    {
      id: "11",
      title: "굿 윌 헌팅",
      content: "로맨틱 드라마 더빙 연습",
      date: "2025.07.09",
      status: "승인됨",
      url: "https://www.youtube.com/watch?v=example8",
      requester: "이미영"
    },
    {
      id: "12",
      title: "인셉션",
      content: "스릴러 영화 더빙 연습",
      date: "2025.07.08",
      status: "심사중",
      url: "https://www.youtube.com/watch?v=example9",
      requester: "이미영"
    },
    {
      id: "13",
      title: "다크 나이트",
      content: "슈퍼히어로 영화 더빙 연습",
      date: "2025.07.07",
      status: "승인됨",
      url: "https://www.youtube.com/watch?v=example10",
      requester: "최민수"
    },
    {
      id: "14",
      title: "인피니티 워",
      content: "마블 영화 더빙 연습",
      date: "2025.07.06",
      status: "심사중",
      url: "https://www.youtube.com/watch?v=example11",
      requester: "최민수"
    },
    {
      id: "15",
      title: "어벤져스",
      content: "액션 영화 더빙 연습",
      date: "2025.07.05",
      status: "거절됨",
      url: "https://www.youtube.com/watch?v=example12",
      requester: "최민수"
    },
    // 현재 사용자용 더미 데이터 (user?.name이 있을 때 사용)
    {
      id: "16",
      title: "라라랜드 더빙 요청",
      content: "뮤지컬 영화 더빙 연습하고 싶어요",
      date: "2025.07.04",
      status: "승인됨",
      url: "https://www.youtube.com/watch?v=example13",
      requester: "사용자"
    },
    {
      id: "17",
      title: "위대한 개츠비",
      content: "레오나르도 디카프리오 연기 연습",
      date: "2025.07.03",
      status: "심사중",
      url: "https://www.youtube.com/watch?v=example14",
      requester: "사용자"
    },
    {
      id: "18",
      title: "레베카",
      content: "고전 영화 더빙 연습",
      date: "2025.07.02",
      status: "거절됨",
      url: "https://www.youtube.com/watch?v=example15",
      requester: "사용자"
    },

];

const statusColors = {
  심사중: "bg-yellow-900/60 text-yellow-300 border-yellow-500/40",
  승인됨: "bg-emerald-900/60 text-emerald-300 border-emerald-400/40",
  거절됨: "bg-red-900/60 text-red-300 border-red-400/40",
};

const UploadRequestContainer = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>("전체");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [requester, setRequester] = useState("");
  const [url, setUrl] = useState("");
  const [requests, setRequests] = useState<UploadRequest[]>(dummyData);
  const [showForm, setShowForm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<UploadRequest | null>(null);
  const {user, isLoading, isLoggedIn, logout} = useUser();
  const router = useRouter();

  useEffect(() => {
    if(!isLoading && !isLoggedIn){
      router.push('/login');
    }
  }, [isLoading, isLoggedIn])

  // 사용자별 더미 데이터 생성
  useEffect(() => {
    if (user?.name) {
      const userSpecificData: UploadRequest[] = [
        {
          id: "user1",
          title: "라라랜드 더빙 요청",
          content: "뮤지컬 영화 더빙 연습하고 싶어요",
          date: "2025.07.04",
          status: "승인됨",
          url: "https://www.youtube.com/watch?v=example13",
          requester: user.name
        },
        {
          id: "user2",
          title: "위대한 개츠비",
          content: "레오나르도 디카프리오 연기 연습",
          date: "2025.07.03",
          status: "심사중",
          url: "https://www.youtube.com/watch?v=example14",
          requester: user.name
        },
        {
          id: "user3",
          title: "레베카",
          content: "고전 영화 더빙 연습",
          date: "2025.07.02",
          status: "거절됨",
          url: "https://www.youtube.com/watch?v=example15",
          requester: user.name
        },
      ];

      // 기존 데이터에서 "사용자" 요청자 데이터 제거하고 새로운 사용자별 데이터 추가
      const filteredData = dummyData.filter(item => item.requester !== "사용자");
      setRequests([...filteredData, ...userSpecificData]);
    }
  }, [user?.name]);

  const handleSubmit = () => {
    if (!title || !content || !url) return;

    const newRequest: UploadRequest = {
      id: Date.now().toString(),
      title,
      content,
      url,
      date: new Date().toISOString().slice(0, 10).replace(/-/g, "."),
      status: "심사중",
      requester: user?.name,
    };

    setRequests([newRequest, ...requests]);
    setTitle("");
    setContent("");
    setUrl("");
    setShowForm(false);
  };

  const handleRequestClick = (item: UploadRequest) => {
    if (selectedStatus === "MY") {
      if (item.requester === user?.name) {
        if (item.status === "승인됨") {
          // 승인된 요청은 더빙 페이지로 이동
          alert("승인된 요청입니다! 더빙 페이지로 이동합니다.");
          router.push("/mypage");
        } else if (item.status === "거절됨") {
          // 거절된 요청은 수정 모달 표시
          setSelectedRequest(item);
          setShowStatusModal(true);
        } else if (item.status === "심사중") {
          // 심사중인 요청은 상태 확인 메시지
          alert("현재 심사 중입니다. 조금만 기다려주세요!");
        }
      }
    }
  };

  const handleEditRequest = () => {
    if (selectedRequest) {
      setTitle(selectedRequest.title);
      setContent(selectedRequest.content);
      setUrl(selectedRequest.url);
      setShowStatusModal(false);
      setShowForm(true);
      // 기존 요청 제거
      setRequests(requests.filter(r => r.id !== selectedRequest.id));
    }
  };

  const filteredData =
    selectedStatus === "전체"
      ? requests
      : selectedStatus === "MY"
      ? requests.filter((d) => d.requester === user?.name)
      : requests.filter((d) => d.status === selectedStatus);

  if(isLoading) {
    return <div className='text-white'>로딩 중...</div>
  }
  if(!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center py-12">
      {/* 그라데이션 헤더 */}
      <div className="w-full max-w-xl mb-8">
        <h2 className="text-3xl font-bold text-white text-center mb-2">
          업로드 요청
        </h2>
        <div className="h-1 w-24 mx-auto bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400 rounded-full" />
      </div>
      {/* 상단: 요청하기 버튼 */}
      <div className="flex justify-end w-full max-w-xl mb-4">
        <button
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400 text-black font-bold shadow-lg hover:scale-105 transition-all"
          onClick={() => setShowForm((prev) => !prev)}
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
            <rect x="10" y="4" width="4" height="16" rx="2" fill="currentColor" />
            <rect x="4" y="10" width="16" height="4" rx="2" fill="currentColor" />
          </svg>
          요청하기
        </button>
      </div>
      {/* 입력 폼 (애니메이션) */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          showForm ? "max-h-[500px] opacity-100 mb-8" : "max-h-0 opacity-0 mb-0"
        }`}
      >
        <div className="w-full max-w-xl bg-neutral-900 rounded-2xl p-6 text-white shadow-lg border border-emerald-500/30">
          <h2 className="text-lg font-bold mb-4 text-emerald-400">새 요청 작성</h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="배우"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-lg bg-neutral-800 text-white border border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
            />
            <textarea
              placeholder="요청 내용"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 rounded-lg bg-neutral-800 text-white border border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
            />
            <input
              type="text"
              placeholder="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-3 rounded-lg bg-neutral-800 text-white border border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                className="px-5 py-2 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400 text-black rounded-full font-bold shadow hover:scale-105 transition"
              >
                등록
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* 상태 필터 */}
      <div className="flex justify-between items-center mb-6 w-full max-w-xl">
        <div className="flex space-x-2">
          {["전체", "심사중", "승인됨", "거절됨", "MY"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                selectedStatus === status
                  ? "bg-gradient-to-r from-emerald-400 to-green-500 text-black border-transparent shadow"
                  : "bg-neutral-900 text-emerald-300 border-emerald-800 hover:bg-neutral-800"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
      {/* 요청 리스트 */}
      <div className="w-full max-w-xl space-y-4">
        {filteredData.length === 0 && (
          <div className="text-center text-emerald-800 py-8">요청이 없습니다.</div>
        )}
        {filteredData.map((item) => (
          <div
            key={item.id}
            className="bg-neutral-900 border border-emerald-500/20 rounded-xl p-4 shadow flex flex-col gap-2 hover:shadow-xl transition cursor-pointer"
            onClick={() => handleRequestClick(item)}
          >
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-lg font-bold text-emerald-300">{item.title}</h3>
              <span
                className={`px-3 py-1 rounded-full border font-bold ${statusColors[item.status]}`}
              >
                {item.status}
              </span>
            </div>
            <p className="mb-1 text-emerald-100">{item.content}</p>
            <div className="flex justify-between items-center text-xs text-emerald-500">
              <span>요청자: {item.requester}</span>
              <span>{item.date}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 상태 모달 */}
      {showStatusModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-emerald-500/30 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-emerald-300 mb-4">요청 상태</h3>
            <div className="space-y-3 mb-6">
              <div>
                <span className="text-emerald-500 font-semibold">제목:</span>
                <p className="text-white">{selectedRequest.title}</p>
              </div>
              <div>
                <span className="text-emerald-500 font-semibold">내용:</span>
                <p className="text-white">{selectedRequest.content}</p>
              </div>
              <div>
                <span className="text-emerald-500 font-semibold">상태:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${statusColors[selectedRequest.status]}`}>
                  {selectedRequest.status}
                </span>
              </div>
              {selectedRequest.status === "거절됨" && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-300 text-sm">
                    요청이 거절되었습니다. 내용을 수정하여 다시 제출하시겠습니까?
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              {selectedRequest.status === "거절됨" && (
                <button
                  onClick={handleEditRequest}
                  className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg transition"
                >
                  수정하기
                </button>
              )}
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white font-bold rounded-lg transition"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadRequestContainer;