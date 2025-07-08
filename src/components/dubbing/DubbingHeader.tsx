<<<<<<< HEAD
=======
//이해완료
>>>>>>> 6afcd6bd82b7ca9849a17388d634aa46fe195272
"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface DubbingHeaderProps {
  title: string;
  category: string;
  actorName: string;
}

export default function DubbingHeader({ title, category, actorName }: DubbingHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleBackClick = () => {
    // 쿼리 파라미터에서 modalId 확인
    const modalId = searchParams.get('modalId');
    if (modalId) {
      // modalId가 있으면 sessionStorage에 저장하고 홈페이지로 이동
      sessionStorage.setItem('modalId', modalId);
      router.replace('/');
    } else {
      router.back();
    }
  };

  return (
    <header className="bg-black/50 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-gray-400 text-sm">{category} - {actorName}</p>
          </div>
          <button
            onClick={handleBackClick}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            뒤로가기
          </button>
        </div>
      </div>
    </header>
  );
} 