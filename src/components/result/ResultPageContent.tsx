'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ResultContainer from '@/components/result/ResultContainer';
import { backendApi } from '@/services/api';

// 스크립트 결과 아이템에 대한 타입 정의
interface ScriptResultItem {
  has_result: boolean;
  result: any;
}

// 분석 응답 타입 정의
interface AnalysisResponse {
  script_results?: Array<ScriptResultItem>;
  has_analysis: boolean;
}

export default function ResultPageContent() {
  const searchParams = useSearchParams();
  const tokenId = searchParams.get('token_id');
  const [resultData, setResultData] = useState<AnalysisResponse | null>(null);
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
        const response = await backendApi.get<AnalysisResponse>(`/mypage/tokens/${tokenId}/analysis-status`);
        console.log('분석 결과 데이터:', response); // 응답 데이터 구조 확인
        
        // 데이터 구조 디버깅
        if (response?.script_results) {
          console.log('script_results 개수:', response.script_results.length);
          console.log('첫 번째 script_result:', response.script_results[0]);
          if (response.script_results[0]?.result) {
            console.log('첫 번째 result:', response.script_results[0].result);
            console.log('word_analysis 존재 여부:', !!response.script_results[0].result.word_analysis);
          }
        }
        
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

  // 분석 결과가 없는 경우
  if (!resultData?.has_analysis) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-gray-900 rounded-xl border border-gray-800">
          <div className="text-5xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold mb-4">분석 결과가 없습니다</h2>
          <p className="text-gray-400 mb-6">
            아직 이 토큰에 대한 분석 결과가 없습니다. 먼저 더빙을 진행해주세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = `/dubbing?token_id=${tokenId}`}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold rounded-lg shadow-lg hover:from-blue-600 hover:to-green-600 transition-all"
            >
              🎙️ 더빙하러 가기
            </button>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition"
            >
              ↩️ 뒤로가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ResultContainer 
      finalResults={resultData?.script_results
        ?.filter((item: ScriptResultItem) => item.has_result && item.result)
        ?.map((item: ScriptResultItem) => item.result) || []} 
      hasAnalysisResults={resultData?.has_analysis || false} 
      showResults={true} 
    />
  );
}
