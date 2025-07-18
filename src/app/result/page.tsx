'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ResultContainer from '@/components/result/ResultContainer';
import { backendApi } from '@/services/api';

export default function ResultPage() {
  const searchParams = useSearchParams();
  const tokenId = searchParams.get('token_id');
  const [resultData, setResultData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResultData = async () => {
      if (!tokenId) {
        setError('토큰 ID가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        // 토큰 ID에 해당하는 결과 데이터 가져오기
        const response = await backendApi.get(`/mypage/tokens/${tokenId}/analysis-status`);
        console.log('분석 결과 데이터:', response); // 응답 데이터 구조 확인
        setResultData(response);
        setLoading(false);
      } catch (err) {
        console.error('결과 데이터 가져오기 실패:', err);
        setError('결과 데이터를 가져오는데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchResultData();
  }, [tokenId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p>결과 데이터를 불러오는 중...</p>
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
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            뒤로 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <ResultContainer 
      finalResults={resultData?.script_results || []} 
      hasAnalysisResults={resultData?.has_analysis || false} 
      showResults={true} 
    />
  );
}
