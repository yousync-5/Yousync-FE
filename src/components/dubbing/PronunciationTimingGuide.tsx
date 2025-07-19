import React, { useState, useEffect } from "react";
import WebGLProgressBar from "../graph/WebGLProgressBar";
import Loader from "../ui/Loader";

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
  // 분석 결과가 없어도 컴포넌트는 렌더링하되, 내용만 조건부로 표시
  const words = analysisResult?.word_analysis || [];

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
      <div className="bg-gray-800 rounded-lg p-2 sm:p-4 shadow-inner border border-emerald-400/50 shadow-lg shadow-emerald-400/20 flex items-center justify-center min-h-[80px] sm:min-h-[100px] relative overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* 배우 뱃지 - 듀엣자막디스플레이와 동일한 위치 */}
          <div className="absolute top-1/2 -translate-y-1/2 left-3 flex items-center gap-2 px-3 py-1 rounded-full text-xl font-semibold bg-emerald-600 text-white">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            내 대사
          </div>
          {/* 자막 텍스트 - 듀엣자막디스플레이와 동일한 위치 */}
          <div className="text-center w-full">
            <div className="text-2xl font-bold leading-tight text-emerald-100">
              {analysisResult?.word_analysis && analysisResult.word_analysis.length > 0 ? (
                // 분석 결과가 있을 때만 표시
                <>
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
                </>
              ) : (
                // 분석 결과가 없을 때 로딩창 표시
                <div className="flex flex-col items-center justify-center space-y-3 w-full">
                  <Loader />
                  <span className="text-gray-400 text-sm text-center">분석 결과를 기다리는 중...</span>
                </div>
              )}
            </div>
            
            {/* WebGL 게이지바 - 자막 텍스트 바로 아래 */}
            {analysisResult?.word_analysis && analysisResult.word_analysis.length > 0 && analysisResult?.overall_score !== undefined && (
              <div className="mt-3 flex justify-center">
                <WebGLProgressBar 
                  value={analysisResult.overall_score} 
                  width={200} 
                  height={20} 
                  theme="dark" 
                  animation={true} 
                  showPercentage={true} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="text-center text-xs text-gray-300 mt-4 h-4">
        {analysisResult?.overall_score !== undefined ? (
          <>Overall Accuracy: {Math.round(analysisResult.overall_score * 100)}%</>
        ) : (
          <span className="text-gray-500">정확도 계산 중...</span>
        )}
      </div>
    </div>
  );
} 