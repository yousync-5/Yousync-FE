import React from "react";

interface ScoreCardsProps {
  result: any;
  getScoreColor: (score: number) => string;
  getScoreLevel: (score: number) => string;
}

const ScoreCards: React.FC<ScoreCardsProps> = ({ result, getScoreColor, getScoreLevel }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Overall Score */}
      <div className="bg-gray-900 border-2 border-gray-800 rounded-xl p-6 hover:border-green-500 transition-all duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg mb-3 bg-green-900">
            {/* 아이콘 자리 */}
            <span className="text-green-400 text-2xl font-bold">★</span>
          </div>
          <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>{result.score}</div>
          <div className="text-sm text-green-400">Overall Score</div>
          <div className="text-xs text-gray-500 mt-1">{getScoreLevel(result.score)}</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
            <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${result.score}%` }} />
          </div>
        </div>
      </div>
      {/* Accuracy */}
      <div className="bg-gray-900 border-2 border-gray-800 rounded-xl p-6 hover:border-green-500 transition-all duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg mb-3 bg-green-900">
            <span className="text-green-400 text-2xl font-bold">%</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{result.accuracy}</div>
          <div className="text-sm text-green-400">Accuracy</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
            <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${result.accuracy}%` }} />
          </div>
        </div>
      </div>
      {/* Fluency */}
      <div className="bg-gray-900 border-2 border-gray-800 rounded-xl p-6 hover:border-green-500 transition-all duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg mb-3 bg-green-900">
            <span className="text-green-400 text-2xl font-bold">F</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{result.fluency}</div>
          <div className="text-sm text-green-400">Fluency</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
            <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${result.fluency}%` }} />
          </div>
        </div>
      </div>
      {/* Pronunciation */}
      <div className="bg-gray-900 border-2 border-gray-800 rounded-xl p-6 hover:border-green-500 transition-all duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg mb-3 bg-green-900">
            <span className="text-green-400 text-2xl font-bold">P</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{result.pronunciation}</div>
          <div className="text-sm text-green-400">Pronunciation</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
            <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${result.pronunciation}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreCards; 