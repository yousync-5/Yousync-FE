import React from "react";
import ScoreCards from "./ScoreCards";
import DetailedAnalysis from "./DetailedAnalysis";
import SentenceAnalysis from "./SentenceAnalysis";
import OverallPitchComparison from "./OverallPitchComparison";

// 필요한 타입 import (예시)
import type { TestResult } from "@/pages/detail/[id]";

interface TestResultAnalysisSectionProps {
  result: TestResult;
  currentScriptIndex: number;
  getScoreColor: (score: number) => string;
  getScoreLevel: (score: number) => string;
  serverPitchData: any;
  id: string | string[] | undefined;
  resultsRef: React.RefObject<HTMLDivElement>;
}

const TestResultAnalysisSection: React.FC<TestResultAnalysisSectionProps> = ({
  result,
  currentScriptIndex,
  getScoreColor,
  getScoreLevel,
  serverPitchData,
  id,
  resultsRef,
}) => {
  return (
    <div ref={resultsRef} className="mt-16">
      <ScoreCards result={result} getScoreColor={getScoreColor} getScoreLevel={getScoreLevel} />
      <DetailedAnalysis result={result} getScoreColor={getScoreColor} />
      <SentenceAnalysis result={result} />
      <OverallPitchComparison result={result} currentScriptIndex={currentScriptIndex} serverPitchData={serverPitchData} id={id} />
    </div>
  );
};

export default TestResultAnalysisSection; 