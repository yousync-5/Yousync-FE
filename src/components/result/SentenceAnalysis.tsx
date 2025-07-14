"use client";
import React from "react";

interface SentenceAnalysisProps {
  finalResults: any[];
}

const SentenceAnalysis: React.FC<SentenceAnalysisProps> = ({ finalResults }) => {
  // 디버깅을 위한 콘솔 로그 추가
  React.useEffect(() => {
    console.log('[🔍 SentenceAnalysis] finalResults:', finalResults);
    finalResults.forEach((result, idx) => {
      console.log(`[🔍 문장 ${idx + 1}] 전체 결과:`, result);
      console.log(`[🔍 문장 ${idx + 1}] word_analysis:`, result.word_analysis);
      if (result.word_analysis) {
        result.word_analysis.forEach((word: any, wordIdx: number) => {
          console.log(`[🔍 문장 ${idx + 1} 단어 ${wordIdx + 1}]`, {
            word: word.word,
            text_status: word.text_status,
            mfcc_similarity: word.mfcc_similarity,
            word_score: word.word_score,
            mfcc_type: typeof word.mfcc_similarity,
            word_score_type: typeof word.word_score
          });
        });
      }
    });
  }, [finalResults]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-900 border-2 border-gray-800 rounded-xl p-6 mt-8">
      <h3 className="text-xl font-semibold mb-6 text-white">Sentence Analysis</h3>
      <div className="space-y-6">
        {finalResults.map((result, idx) => {
          // 점수 계산 로직 개선
          const { word_analysis } = result;
          const n = word_analysis?.length ?? 0;
          
          // MFCC Similarity 평균 계산
          const mfccValues = word_analysis?.map((w: any) => w.mfcc_similarity).filter((v: number) => !isNaN(v) && v !== null && v !== undefined) || [];
          const mfccAvg = mfccValues.length > 0 ? (mfccValues.reduce((acc: number, val: number) => acc + val, 0) / mfccValues.length) : 0;
          
          // Word Score 평균 계산
          const wordScoreValues = word_analysis?.map((w: any) => w.word_score).filter((v: number) => !isNaN(v) && v !== null && v !== undefined) || [];
          const wordScoreAvg = wordScoreValues.length > 0 ? (wordScoreValues.reduce((acc: number, val: number) => acc + val, 0) / wordScoreValues.length) : 0;
          
          // 디버깅 로그
          console.log(`[🔍 문장 ${idx + 1} 계산]`, {
            totalWords: n,
            mfccValues,
            mfccAvg,
            wordScoreValues,
            wordScoreAvg,
            rawWordAnalysis: word_analysis
          });

          return (
            <div
              key={result.id ?? idx}
              className="p-6 rounded-lg bg-gray-800 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex flex-wrap gap-1">
                      {result.word_analysis?.map((w: any, i: number) => (
                        <span
                          key={i}
                          className={w.text_status === 'pass' ? 'text-white' : 'text-red-400'}
                          style={{ fontWeight: 600 }}
                        >
                          {w.word}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">  {isNaN(result.overall_score) ? 0 : Math.round(result.overall_score)}</div>
                  <div className="text-xs text-gray-500">Score</div>
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <div className="flex-1 bg-gray-900 border-2 border-gray-800 rounded-lg p-3 flex flex-col items-center shadow-sm">
                  <div className="flex items-center mb-1">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#22d3ee" opacity="0.2"/><path d="M8 12l2 2 4-4" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="ml-2 text-xs text-gray-400">Mfcc Similarity Avg</span>
                  </div>
                  <div className="text-lg font-bold text-cyan-300">
                    {isNaN(mfccAvg) ? 0 : mfccAvg.toFixed(1)}
                  </div>
                  {/* 디버깅용 추가 정보 */}
                  <div className="text-xs text-gray-500 mt-1">
                    {mfccValues.length}개 단어
                  </div>
                  {/* 🆕 디버깅용: 각 단어의 MFCC 값 표시 */}
                  <div className="text-xs text-gray-600 mt-1 max-w-full overflow-hidden">
                    {mfccValues.map((val: number, i: number) => `${val.toFixed(1)}`).join(', ')}
                  </div>
                </div>
                <div className="flex-1 bg-gray-900 border-2 border-gray-800 rounded-lg p-3 flex flex-col items-center shadow-sm">
                  <div className="flex items-center mb-1">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="8" fill="#34d399" opacity="0.2"/><path d="M8 12l2 2 4-4" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="ml-2 text-xs text-gray-400">Word Score Avg</span>
                  </div>
                  <div className="text-lg font-bold text-green-300">
                    {isNaN(wordScoreAvg) ? 0 : wordScoreAvg.toFixed(1)}
                  </div>
                  {/* 디버깅용 추가 정보 */}
                  <div className="text-xs text-gray-500 mt-1">
                    {wordScoreValues.length}개 단어
                  </div>
                  {/* 🆕 디버깅용: 각 단어의 Word Score 값 표시 */}
                  <div className="text-xs text-gray-600 mt-1 max-w-full overflow-hidden">
                    {wordScoreValues.map((val: number, i: number) => `${val.toFixed(1)}`).join(', ')}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SentenceAnalysis;