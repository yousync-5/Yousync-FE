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
    <div className="w-full">
      <div className="flex items-center space-x-4 w-full">
        {/* 배우 뱃지 */}
        <div className="bg-emerald-500 text-white px-4 py-2 rounded-full flex items-center space-x-2 shadow-lg">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold">내 대사</span>
        </div>
        {/* 빛나는 컨테이너 안의 자막 */}
        <div className="flex-1 bg-gray-800 rounded-lg p-4 border border-emerald-400/50 shadow-lg shadow-emerald-400/20">
          <div className="text-white text-2xl font-bold text-center leading-tight">
            &quot;{words.map((word: any, idx: number) => {
              const animatedScore = animatedScores[word.word] || 0;
              return (
                <span 
                  key={word.word + idx}
                  className="transition-all duration-150"
                  style={{ color: getGradientColor(animatedScore) }}
                >
                  {word.word}{idx < words.length - 1 ? ' ' : ''}
                </span>
              );
            })}&quot;
          </div>
        </div>
      </div>
      <div className="text-center text-xs text-gray-300 mt-4">
        {analysisResult?.overall_score !== undefined && (
          <>Overall Accuracy: {Math.round(analysisResult.overall_score * 100)}%</>
        )}
      </div>
    </div>
  );
} 