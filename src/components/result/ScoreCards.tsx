import React from "react";
import { useResultStore } from '@/store/useResultStore';

interface ScoreCardsProps {
  getScoreColor: (score: number) => string;
  getScoreLevel: (score: number) => string;
}

const ScoreCards: React.FC<ScoreCardsProps> = ({ getScoreColor, getScoreLevel }) => {
  const finalResults = useResultStore(state => state.finalResults);

  function getAverages(results: typeof finalResults) {
    if (!results.length) return {
      overall_score: 0,
      summary: {
        text_accuracy: 0,
        mfcc_average: 0,
        total_words: 0,
        passed_words: 0,
      },
      total_passed_words: 0,
    };
    const sum = results.reduce(
      (acc, cur) => {
        acc.overall_score += cur.overall_score ?? 0;
        acc.text_accuracy += cur.summary.text_accuracy ?? 0;
        acc.mfcc_average += cur.summary.mfcc_average ?? 0;
        acc.total_words += cur.summary.total_words ?? 0;
        acc.passed_words += cur.summary.passed_words ?? 0;
        return acc;
      },
      { overall_score: 0, text_accuracy: 0, mfcc_average: 0, total_words: 0, passed_words: 0 }
    );
    const n = results.length;
    return {
      overall_score: Math.round((sum.overall_score / n) * 100) / 100,
      summary: {
        text_accuracy: Math.round((sum.text_accuracy / n) * 100) / 100,
        mfcc_average: Math.round((sum.mfcc_average / n) * 100) / 100,
        total_words: Math.round((sum.total_words / n) * 100) / 100,
        passed_words: Math.round((sum.passed_words / n) * 100) / 100,
      },
      total_passed_words: sum.passed_words,
    };
  }

  const averages = getAverages(finalResults);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Overall Score */}
      <div className="bg-gray-900 border-2 border-gray-800 rounded-xl p-6 hover:border-green-500 transition-all duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg mb-3 bg-green-900">
            {/* 아이콘 자리 */}
            <span className="text-green-400 text-2xl font-bold">★</span>
          </div>
          <div className={`text-2xl font-bold ${getScoreColor(averages.overall_score)}`}>{averages.overall_score}</div>
          <div className="text-sm text-green-400">Overall Score</div>
          <div className="text-xs text-gray-500 mt-1">{getScoreLevel(averages.overall_score)}</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
            <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${averages.overall_score}%` }} />
          </div>
        </div>
      </div>
      {/* Text Accuracy */}
      <div className="bg-gray-900 border-2 border-gray-800 rounded-xl p-6 hover:border-green-500 transition-all duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg mb-3 bg-green-900">
            <span className="text-green-400 text-2xl font-bold">%</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{averages.summary.text_accuracy}</div>
          <div className="text-sm text-green-400">Text Accuracy</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
            <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${averages.summary.text_accuracy}%` }} />
          </div>
        </div>
      </div>
      {/* Mfcc Average */}
      <div className="bg-gray-900 border-2 border-gray-800 rounded-xl p-6 hover:border-green-500 transition-all duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg mb-3 bg-green-900">
            <span className="text-green-400 text-2xl font-bold">F</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{averages.summary.mfcc_average}</div>
          <div className="text-sm text-green-400">Mfcc Average</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
            <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${averages.summary.mfcc_average}%` }} />
          </div>
        </div>
      </div>
      {/* Passed Words */}
      <div className="bg-gray-900 border-2 border-gray-800 rounded-xl p-6 hover:border-green-500 transition-all duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg mb-3 bg-green-900">
            <span className="text-green-400 text-2xl font-bold">P</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{averages.total_passed_words}</div>
          <div className="text-sm text-green-400">Passed Words</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
            <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${averages.summary.passed_words}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreCards; 