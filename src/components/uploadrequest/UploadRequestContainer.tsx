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
  const {user, isLoading, isLoggedIn, logout} = useUser();
  const router = useRouter();

  useEffect(() => {
    if(!isLoading && !isLoggedIn){
      router.push('/login');
    }
  }, [isLoading, isLoggedIn])
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
              placeholder="제목"
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
            className="bg-neutral-900 border border-emerald-500/20 rounded-xl p-4 shadow flex flex-col gap-2 hover:shadow-xl transition"
            onClick={() => {
              if(selectedStatus == "MY"){
                router.push("/mypage");
              }
            }}
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
    </div>
  );
};

export default UploadRequestContainer;