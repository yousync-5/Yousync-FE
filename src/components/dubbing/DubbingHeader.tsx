//이해완료
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
    // 쿼리 파라미터에서 modalId 확인 (클라이언트 사이드에서만)
    if (typeof window !== 'undefined' && searchParams) {
      const modalId = searchParams.get('modalId');
      if (modalId) {
        // modalId가 있으면 sessionStorage에 저장하고 홈페이지로 이동
        sessionStorage.setItem('modalId', modalId);
        router.replace('/');
        return;
      }
    }
    router.back();
  };

  return (
    <header className="bg-black/50 backdrop-blur-sm border-b border-gray-800">
      <div className="w-full mx-auto px-3 sm:px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold truncate">{title}</h1>
            <p className="text-gray-400 text-xs truncate">{category} - {actorName}</p>
          </div>
          <button
            onClick={handleBackClick}
            className="ml-2 px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm whitespace-nowrap"
          >
            뒤로가기
          </button>
        </div>
      </div>
    </header>
  );
} 