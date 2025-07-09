import React from "react";
import { useResultStore } from '@/store/useResultStore';

interface DetailedAnalysisProps {
  getScoreColor: (score: number) => string;
}

const DetailedAnalysis: React.FC<DetailedAnalysisProps> = ({ getScoreColor }) => {
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
      total_words: 0,
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
      total_words: sum.total_words,
    };
  }

  const averages = getAverages(finalResults);

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
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${averages.overall_score}%` }} />
                </div>
                <span className="text-sm text-green-400">{averages.overall_score}%</span>
              </div>
            </div>
            {/* Text Accuracy */}
            <div className="flex justify-between items-center">
              <span className="text-white">Text Accuracy</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${averages.summary.text_accuracy}%` }} />
                </div>
                <span className="text-sm text-green-400">{averages.summary.text_accuracy}%</span>
              </div>
            </div>
            {/* mfcc Average */}
            <div className="flex justify-between items-center">
              <span className="text-white">mfcc Average</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${averages.summary.mfcc_average}%` }} />
                </div>
                <span className="text-sm text-green-400">{averages.summary.mfcc_average}%</span>
              </div>
            </div>
            {/* Passed Words */}
            <div className="flex justify-between items-center">
              <span className="text-white">Passed Words</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-green-400">{averages.total_passed_words} / {averages.total_words}</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h4 className="text-lg font-medium mb-3 text-white">Performance Summary</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Best Area:</span>
              <span className="text-green-400">-</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Needs Improvement:</span>
              <span className="text-yellow-500">-</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Overall Rating:</span>
              <span className="text-green-400">-</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedAnalysis; 