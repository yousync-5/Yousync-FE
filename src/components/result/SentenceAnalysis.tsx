import React from "react";
import { useResultStore } from '@/store/useResultStore';

const SentenceAnalysis: React.FC = () => {
  const finalResults = useResultStore(state => state.finalResults);

  return (
    <div className="bg-gray-900 border-2 border-gray-800 rounded-xl p-6 mt-8">
      <h3 className="text-xl font-semibold mb-6 text-white">Sentence Analysis</h3>
      <div className="space-y-6">
        {finalResults.map((result, idx) => (
          <div
            key={idx}
            className="p-6 rounded-lg bg-gray-800 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {idx + 1}
                </div>
                <div>
                  <div className="flex flex-wrap gap-1">
                    {result.word_analysis.map((w, i) => (
                      <span
                        key={i}
                        className={w.text_status === 'pass' ? 'text-white' : 'text-red-400'}
                        style={{ fontWeight: 600 }}
                      >
                        {w.word}
                      </span>
                    ))}
                  </div>
                  {/* 번역 등 추가 정보가 있다면 여기에 */}
                </div>
              </div>
              <div className="text-right">
                {/* overall_score 값 표시 */}
                <div className="text-2xl font-bold text-green-400">{Math.round(result.overall_score)}</div>
                <div className="text-xs text-gray-500">Score</div>
              </div>
            </div>
            {/* 피치 그래프 등 추가 가능 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-green-400 mb-2">Your Pitch</div>
                <div className="w-full h-20 bg-gray-700 rounded border border-green-500 relative overflow-hidden">
                  {/* 실제 pitch 그래프는 props로 전달받아 구현 */}
                </div>
              </div>
              <div>
                <div className="text-sm text-green-400 mb-2">Original Pitch</div>
                <div className="w-full h-20 bg-gray-700 rounded border border-green-500 relative overflow-hidden">
                  {/* 실제 pitch 그래프는 props로 전달받아 구현 */}
                </div>
              </div>
            </div>
            {/* 평균값 카드 스타일로 이쁘게 */}
            <div className="flex gap-4 mt-4">
              <div className="flex-1 bg-gray-900 border-2 border-gray-800 rounded-lg p-3 flex flex-col items-center shadow-sm">
                <div className="flex items-center mb-1">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#22d3ee" opacity="0.2"/><path d="M8 12l2 2 4-4" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span className="ml-2 text-xs text-gray-400">Mfcc Similarity Avg</span>
                </div>
                <div className="text-lg font-bold text-cyan-300">{(() => {
                  const { word_analysis } = result;
                  const n = word_analysis.length;
                  const mfccAvg = n ? (word_analysis.reduce((acc, w) => acc + (w.mfcc_similarity ?? 0), 0) / n) : 0;
                  return mfccAvg.toFixed(1);
                })()}</div>
              </div>
              <div className="flex-1 bg-gray-900 border-2 border-gray-800 rounded-lg p-3 flex flex-col items-center shadow-sm">
                <div className="flex items-center mb-1">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="8" fill="#34d399" opacity="0.2"/><path d="M8 12l2 2 4-4" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span className="ml-2 text-xs text-gray-400">Word Score Avg</span>
                </div>
                <div className="text-lg font-bold text-green-300">{(() => {
                  const { word_analysis } = result;
                  const n = word_analysis.length;
                  const wordScoreAvg = n ? (word_analysis.reduce((acc, w) => acc + (w.word_score ?? 0), 0) / n) : 0;
                  return wordScoreAvg.toFixed(1);
                })()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SentenceAnalysis; 