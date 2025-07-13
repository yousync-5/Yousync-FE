import React, { useState, useEffect } from "react";

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
  showAnalysisResult?: boolean;
  analysisResult?: any;
  recording?: boolean;
}

export default function PronunciationTimingGuide({
  captions,
  currentScriptIndex,
  currentVideoTime,
  currentWords = [],
  showAnalysisResult = false,
  analysisResult = null,
  recording = false,
}: PronunciationTimingGuideProps) {

  const sentence = captions[currentScriptIndex];
  // 분석 결과가 있으면 word_analysis 사용, 아니면 currentWords 사용
  const words = analysisResult?.word_analysis
    ? analysisResult.word_analysis
    : currentWords;

  // 게이지 애니메이션을 위한 상태
  const [animatedScores, setAnimatedScores] = useState<Record<string, number>>({});

  // 분석 결과가 표시될 때 게이지 애니메이션 시작
  useEffect(() => {
    if (analysisResult?.word_analysis) {
      const targetScores: Record<string, number> = {};
      analysisResult.word_analysis.forEach((word: any) => {
        targetScores[word.word] = word.word_score;
      });

      // 애니메이션 시작
      const startTime = performance.now();
      const duration = 2000; // 2초

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // easeOutCubic - 자연스러운 감속
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        
        const newScores: Record<string, number> = {};
        Object.keys(targetScores).forEach(word => {
          newScores[word] = targetScores[word] * easeOutCubic;
        });
        
        setAnimatedScores(newScores);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    } else {
      // 분석 결과가 없으면 애니메이션 상태 초기화
      setAnimatedScores({});
    }
  }, [analysisResult]); // showAnalysisResult 제거, analysisResult만 의존

  // 현재 문장의 분석 결과가 있으면 무조건 분석 결과 표시
  const hasAnalysisResult = analysisResult?.word_analysis;
  const half = Math.ceil(words.length / 2);
  const firstLine = words.slice(0, half);
  const secondLine = words.slice(half);

  // 게이지 색상
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-400';
    if (score >= 0.6) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  // RGB 그라데이션 색상 계산
  const getGradientColor = (score: number) => {
    // 0% = 빨간색 (255, 0, 0)
    // 50% = 노란색 (255, 255, 0) 
    // 100% = 초록색 (0, 255, 0)
    
    let r, g, b;
    
    if (score <= 0.5) {
      // 0% ~ 50%: 빨간색 → 노란색
      const t = score * 2; // 0 ~ 1
      r = 255;
      g = Math.round(255 * t);
      b = 0;
    } else {
      // 50% ~ 100%: 노란색 → 초록색
      const t = (score - 0.5) * 2; // 0 ~ 1
      r = Math.round(255 * (1 - t));
      g = 255;
      b = 0;
    }
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
        <div className="w-full bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h4 className="text-sm font-semibold text-cyan-400 mb-3 text-center">
        {hasAnalysisResult ? '📊 발음 정확도 분석' : '🎵 발음 타이밍 가이드'}
      </h4>
      <div className="flex flex-col items-center justify-center gap-2 mb-4">
        {/* 첫 번째 줄 */}
        <div className="flex items-center justify-center space-x-4">
          {firstLine.map((word: any, idx: number) => {
            // 분석 결과 표시
            if (hasAnalysisResult) {
              const animatedScore = animatedScores[word.word] || 0;
              return (
                <div
                  key={word.word + idx}
                  className="flex flex-col items-center px-2 py-1 rounded-lg transition-all duration-150"
                >
                  <span 
                    className="text-xl font-bold mb-2"
                    style={{ color: getGradientColor(animatedScore) }}
                  >
                    {word.word}
                  </span>
                  <div className="w-20 h-3 bg-gray-700 rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full transition-all duration-200"
                      style={{ 
                        width: `${Math.round(animatedScore * 100)}%`,
                        backgroundColor: getGradientColor(animatedScore)
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-400 mt-1">
                    정확도 {Math.round(animatedScore * 100)}%
                  </span>
                </div>
              );
            }
            // 기존 타이밍 가이드
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
                  {word.start_time?.toFixed(1) ?? ''}s
                </span>
              </div>
            );
          })}
        </div>
        {/* 두 번째 줄 (있을 때만) */}
        {secondLine.length > 0 && (
          <div className="flex items-center justify-center space-x-4">
            {secondLine.map((word: any, idx: number) => {
              if (hasAnalysisResult) {
                const animatedScore = animatedScores[word.word] || 0;
                return (
                  <div
                    key={word.word + idx}
                    className="flex flex-col items-center px-2 py-1 rounded-lg transition-all duration-150"
                  >
                    <span 
                      className="text-xl font-bold mb-2"
                      style={{ color: getGradientColor(animatedScore) }}
                    >
                      {word.word}
                    </span>
                    <div className="w-20 h-3 bg-gray-700 rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full transition-all duration-200"
                        style={{ 
                          width: `${Math.round(animatedScore * 100)}%`,
                          backgroundColor: getGradientColor(animatedScore)
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-400 mt-1">
                      정확도 {Math.round(animatedScore * 100)}%
                    </span>
                  </div>
                );
              }
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
                    {word.start_time?.toFixed(1) ?? ''}s
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="text-center text-xs text-gray-300">
        {hasAnalysisResult && analysisResult?.overall_score !== undefined ? (
          <>전체 정확도: {Math.round(analysisResult.overall_score * 100)}%</>
        ) : (
          <>
            현재: {currentVideoTime.toFixed(1)}s / 
            총 길이: {(sentence?.end_time - sentence?.start_time).toFixed(1)}s
          </>
        )}
      </div>
    </div>
  );
} 