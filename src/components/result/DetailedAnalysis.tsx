import React from "react";

interface DetailedAnalysisProps {
  result: any;
  getScoreColor: (score: number) => string;
}

const DetailedAnalysis: React.FC<DetailedAnalysisProps> = ({ result, getScoreColor }) => {
  return (
    <div className="bg-gray-900 border-2 border-gray-800 rounded-xl p-6 mt-8">
      <h3 className="text-xl font-semibold mb-4 text-white">Detailed Analysis</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-medium mb-3 text-white">Score Breakdown</h4>
          <div className="space-y-3">
            {/* Overall Score */}
            <div className="flex justify-between items-center">
              <span className="text-white">Overall Score</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${result.score}%` }} />
                </div>
                <span className="text-sm text-green-400">{result.score}%</span>
              </div>
            </div>
            {/* Accuracy */}
            <div className="flex justify-between items-center">
              <span className="text-white">Accuracy</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${result.accuracy}%` }} />
                </div>
                <span className="text-sm text-green-400">{result.accuracy}%</span>
              </div>
            </div>
            {/* Fluency */}
            <div className="flex justify-between items-center">
              <span className="text-white">Fluency</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${result.fluency}%` }} />
                </div>
                <span className="text-sm text-green-400">{result.fluency}%</span>
              </div>
            </div>
            {/* Pronunciation */}
            <div className="flex justify-between items-center">
              <span className="text-white">Pronunciation</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${result.pronunciation}%` }} />
                </div>
                <span className="text-sm text-green-400">{result.pronunciation}%</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h4 className="text-lg font-medium mb-3 text-white">Performance Summary</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Best Area:</span>
              <span className="text-green-400">Pronunciation</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Needs Improvement:</span>
              <span className="text-yellow-500">Fluency</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Overall Rating:</span>
              <span className="text-green-400">Good</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedAnalysis; 