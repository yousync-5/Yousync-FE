import React from "react";

interface PronunciationTimingGuideProps {
  captions: Array<{
    id: number;
    script: string;
    translation: string;
    start_time: number;
    end_time: number;
  }>;
  currentScriptIndex: number;
  currentVideoTime: number;
  currentWords: Array<{
    script_id: number;
    start_time: number;
    end_time: number;
    word: string;
    probability: number;
    id: number;
  }>;
}

export default function PronunciationTimingGuide({
  captions,
  currentScriptIndex,
  currentVideoTime,
  currentWords = [],
}: PronunciationTimingGuideProps) {
  const sentence = captions[currentScriptIndex];
  const half = Math.ceil(currentWords.length / 2);
  const firstLine = currentWords.slice(0, half);
  const secondLine = currentWords.slice(half);
  return (
    <div className="w-full bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h4 className="text-sm font-semibold text-cyan-400 mb-3 text-center">
        🎵 발음 타이밍 가이드
      </h4>
      <div className="flex flex-col items-center justify-center gap-2 mb-4">
        {/* 첫 번째 줄 */}
        <div className="flex items-center justify-center space-x-4">
          {firstLine.map((word) => {
            const isCurrent = currentVideoTime >= word.start_time && currentVideoTime <= word.end_time;
            const isUpcoming = currentVideoTime < word.start_time;
            const isCompleted = currentVideoTime > word.end_time;
            return (
              <div
                key={word.id}
                className="flex flex-col items-center px-2 py-1 rounded-lg transition-all duration-150 cursor-pointer hover:bg-gray-600/60 hover:shadow-lg hover:scale-105"
              >
                <span className={`text-xl font-bold mb-2 ${
                  isCurrent ? 'text-yellow-400' : 
                  isCompleted ? 'text-green-400' : 
                  isUpcoming ? 'text-gray-400' : 'text-white'
                }`}>
                  {word.word}
                </span>
                <div className="w-20 h-3 bg-gray-700 rounded-full overflow-hidden mb-1">
                  <div 
                    className={`h-full transition-all duration-200 ${
                      isCurrent ? 'bg-yellow-400' : 
                      isCompleted ? 'bg-green-400' : 
                      isUpcoming ? 'bg-gray-500' : 'bg-gray-600'
                    }`}
                    style={{
                      width: isCurrent ? 
                        `${((currentVideoTime - word.start_time) / (word.end_time - word.start_time)) * 100}%` :
                        isCompleted ? '100%' : '0%'
                    }}
                  />
                </div>
                <span className="text-sm text-gray-400 mt-1">
                  {word.start_time.toFixed(1)}s
                </span>
              </div>
            );
          })}
        </div>
        {/* 두 번째 줄 (있을 때만) */}
        {secondLine.length > 0 && (
          <div className="flex items-center justify-center space-x-4">
            {secondLine.map((word) => {
              const isCurrent = currentVideoTime >= word.start_time && currentVideoTime <= word.end_time;
              const isUpcoming = currentVideoTime < word.start_time;
              const isCompleted = currentVideoTime > word.end_time;
              return (
                <div
                  key={word.id}
                  className="flex flex-col items-center px-2 py-1 rounded-lg transition-all duration-150 cursor-pointer hover:bg-gray-600/60 hover:shadow-lg hover:scale-105"
                >
                  <span className={`text-xl font-bold mb-2 ${
                    isCurrent ? 'text-yellow-400' : 
                    isCompleted ? 'text-green-400' : 
                    isUpcoming ? 'text-gray-400' : 'text-white'
                  }`}>
                    {word.word}
                  </span>
                  <div className="w-20 h-3 bg-gray-700 rounded-full overflow-hidden mb-1">
                    <div 
                      className={`h-full transition-all duration-200 ${
                        isCurrent ? 'bg-yellow-400' : 
                        isCompleted ? 'bg-green-400' : 
                        isUpcoming ? 'bg-gray-500' : 'bg-gray-600'
                      }`}
                      style={{
                        width: isCurrent ? 
                          `${((currentVideoTime - word.start_time) / (word.end_time - word.start_time)) * 100}%` :
                          isCompleted ? '100%' : '0%'
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-400 mt-1">
                    {word.start_time.toFixed(1)}s
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="text-center text-xs text-gray-300">
        현재: {currentVideoTime.toFixed(1)}s / 
        총 길이: {(sentence?.end_time - sentence?.start_time).toFixed(1)}s
      </div>
    </div>
  );
} 