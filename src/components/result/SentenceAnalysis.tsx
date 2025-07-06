import React from "react";

interface SentenceAnalysisProps {
  result: any;
}

const SentenceAnalysis: React.FC<SentenceAnalysisProps> = ({ result }) => {
  return (
    <div className="bg-gray-900 border-2 border-gray-800 rounded-xl p-6 mt-8">
      <h3 className="text-xl font-semibold mb-6 text-white">Sentence Analysis</h3>
      <div className="space-y-6">
        {result.captions.map((caption: any) => (
          <div
            key={caption.id}
            className="p-6 rounded-lg bg-gray-800 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {caption.id}
                </div>
                <div>
                  <div className="text-white font-medium">{caption.script}</div>
                  <div className="text-gray-400 text-sm">{caption.translation}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400">85</div>
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
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">92%</div>
                <div className="text-xs text-gray-500">Similarity</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">88%</div>
                <div className="text-xs text-gray-500">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">85%</div>
                <div className="text-xs text-gray-500">Timing</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SentenceAnalysis; 