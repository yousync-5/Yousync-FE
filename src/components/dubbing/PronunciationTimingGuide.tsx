import React, { useState, useEffect } from "react";
import WebGLProgressBar from "../graph/WebGLProgressBar";

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
  // 분석 결과가 없으면 아무것도 렌더링하지 않음
  if (!analysisResult?.word_analysis) return null;

  const words = analysisResult.word_analysis;

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
      setAnimatedScores({});
    }
  }, [analysisResult]);

  const WORDS_PER_LINE = 10;
  const firstLine = words.slice(0, WORDS_PER_LINE);
  const secondLine = words.slice(WORDS_PER_LINE, WORDS_PER_LINE * 2);
  const thirdLine = words.slice(WORDS_PER_LINE * 2);

  // RGB 그라데이션 색상 계산
  const getGradientColor = (score: number) => {
    let r, g, b;
    if (score <= 0.5) {
      const t = score * 2;
      r = 255;
      g = Math.round(255 * t);
      b = 0;
    } else {
      const t = (score - 0.5) * 2;
      r = Math.round(255 * (1 - t));
      g = 255;
      b = 0;
    }
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className="w-full bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h4 className="text-sm font-semibold text-cyan-400 mb-3 text-center">
        📊 Pronunciation Accuracy Analysis
      </h4>
      <div className="flex flex-col items-center justify-center gap-2 mb-4">
        {/* 첫 번째 줄 */}
        <div className="flex items-center justify-center space-x-4">
          {firstLine.map((word: any, idx: number) => {
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
                <div className="w-20 h-3 mb-1">
                  <WebGLProgressBar value={animatedScore} width={80} height={12} theme="dark" animation={true} showPercentage={false} />
                </div>
                <span className="text-sm text-gray-400 mt-1">
                  Accuracy {Math.round(animatedScore * 100)}%
                </span>
              </div>
            );
          })}
        </div>
        {/* 두 번째 줄 (있을 때만) */}
        {secondLine.length > 0 && (
          <div className="flex items-center justify-center space-x-4">
            {secondLine.map((word: any, idx: number) => {
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
                  <div className="w-20 h-3 mb-1">
                    <WebGLProgressBar value={animatedScore} width={80} height={12} theme="dark" animation={true} showPercentage={false} />
                  </div>
                  <span className="text-sm text-gray-400 mt-1">
                    Accuracy {Math.round(animatedScore * 100)}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
        {/* 세 번째 줄 (있을 때만) */}
        {thirdLine.length > 0 && (
          <div className="flex items-center justify-center space-x-4">
            {thirdLine.map((word: any, idx: number) => {
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
                  <div className="w-20 h-3 mb-1">
                    <WebGLProgressBar value={animatedScore} width={80} height={12} theme="dark" animation={true} showPercentage={false} />
                  </div>
                  <span className="text-sm text-gray-400 mt-1">
                    Accuracy {Math.round(animatedScore * 100)}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="text-center text-xs text-gray-300">
        {analysisResult?.overall_score !== undefined && (
          <>Overall Accuracy: {Math.round(analysisResult.overall_score * 100)}%</>
        )}
      </div>
    </div>
  );
} 