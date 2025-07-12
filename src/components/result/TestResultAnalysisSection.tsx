import React from "react";
import ScoreCards from "./ScoreCards";
import DetailedAnalysis from "./DetailedAnalysis";
import SentenceAnalysis from "./SentenceAnalysis";
import OverallPitchComparison from "./OverallPitchComparison";

// TestResult 타입 정의
interface TestResult {
  id: number;
  user_id: number;
  movie_id: number;
  score: number;
  accuracy: number;
  fluency: number;
  pronunciation: number;
  created_at: string;
  user_pitch_data: number[];
  server_pitch_data: number[];
  audio_url: string;
  movie: {
    title: string;
    youtube_url: string;
    category: string;
  };
  captions: Array<{
    id: number;
    movie_id: number;
    actor_id: number;
    script: string;
    translation: string;
    start_time: number;
    end_time: number;
    url: string | null;
    actor_pitch_values: number[];
    background_audio_url: string;
    actor: {
      name: string;
      id: number;
    };
  }>;
}

interface TestResultAnalysisSectionProps {
  result: TestResult;
  currentScriptIndex: number;
  getScoreColor: (score: number) => string;
  getScoreLevel: (score: number) => string;
  serverPitchData: Array<{ time: number; hz: number | null }>;
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
      <ScoreCards getScoreColor={getScoreColor} getScoreLevel={getScoreLevel} />
      <DetailedAnalysis getScoreColor={getScoreColor} />
      <SentenceAnalysis  />
      {/* <OverallPitchComparison result={result} currentScriptIndex={currentScriptIndex} serverPitchData={serverPitchData} id={id} /> */}
    </div>
  );
};

export default TestResultAnalysisSection; 