"use client";
import React, { useState, useRef, useEffect } from "react";
import { Radar } from "react-chartjs-2";
import {Chart,RadialLinearScale,PointElement,LineElement,Filler,Tooltip,Legend} from "chart.js";
import { useDubbingState } from "@/hooks/useDubbingState";
import ScoreCards from "./ScoreCards";
import SentenceAnalysis from "./SentenceAnalysis";
import { COLORS } from "../../../tailwind.config";
import ResultViewBtn from "./ResultViewBtn";
Chart.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function calcAvg(arr: number[]) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function getTotalScores(finalResults: any[]) {
  const safeResults = Array.isArray(finalResults) ? finalResults : [];
  const allWords = safeResults.flatMap(s =>
    Array.isArray(s.word_analysis) ? s.word_analysis : []
  );
  const totalScore = calcAvg(allWords.map(w => w.word_score));
  const pitch = calcAvg(safeResults.map(s => s.pitch_score));
  const pronunciation = calcAvg(safeResults.map(s => s.pronunciation_score));
  const intonation = calcAvg(safeResults.map(s => s.intonation_score));
  return { totalScore, pitch, pronunciation, intonation };
}

function getRank(score: number) {
  if (score >= 0.95) return "S";
  if (score >= 0.85) return "A";
  if (score >= 0.7) return "B";
  return "C";
}

function getRankColor(rank: string) {
  if (rank === "S") return COLORS.point;
  if (rank === "A") return COLORS.yellow;
  if (rank === "B") return "#6cd4ff";
  return COLORS.fail;
}

interface TestResultAnalysisSectionProps {
  finalResults?: Record<string, any>;
  latestResultByScript?: Record<string, any>;
  hasAnalysisResults?: boolean;
  showResults?: boolean;
  showCompleted?: boolean;
  onViewResults?: () => void;
}

const ResultComponent: React.FC<TestResultAnalysisSectionProps> = ({ 
  finalResults: propFinalResults,
  latestResultByScript: propLatestResultByScript,
  hasAnalysisResults = false,
  showResults = false,
  showCompleted = false,
  onViewResults
}) => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  // 자동 스크롤용 ref
  const resultRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);

  // props로 받은 데이터가 있으면 사용, 없으면 훅에서 가져오기
  const dubbingState = useDubbingState();
  const finalResultsObj = propFinalResults || dubbingState.finalResults;
  const latestResultByScriptObj = propLatestResultByScript || dubbingState.latestResultByScript;

  // 🆕 latestResultByScript에서 실제 데이터 추출
  const finalResults = latestResultByScriptObj && typeof latestResultByScriptObj === "object"
    ? Object.values(latestResultByScriptObj)
    : Array.isArray(finalResultsObj)
      ? finalResultsObj
      : (finalResultsObj && typeof finalResultsObj === "object")
        ? Object.values(finalResultsObj)
        : [];

  // 결과가 추가되거나 showResults, showCompleted가 true가 될 때 자동 스크롤
  useEffect(() => {
    if ((showResults || showCompleted) && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    }
  }, [finalResults.length, showResults, showCompleted]);

  // 결과 조회 버튼이 나타날 때 자동 스크롤
  useEffect(() => {
    if (hasAnalysisResults && !showResults && !showCompleted && btnRef.current) {
      setTimeout(() => {
        btnRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    }
  }, [hasAnalysisResults, showResults, showCompleted]);

  const { totalScore, pitch, intonation, pronunciation } = getTotalScores(finalResults);
  const rank = getRank(totalScore);

  const radarData = {
    labels: ["총점", "피치", "발음", "억양"],
    datasets: [
      {
        label: "Score",
        data: [totalScore, pitch, pronunciation, intonation].map(v => Math.round(v)),
        backgroundColor: "rgba(34,255,136,0.16)",
        borderColor: COLORS.point,
        borderWidth: 3,
        pointBackgroundColor: COLORS.point
      }
    ]
  };
  const radarOptions = {
    scales: {
      r: {
        angleLines: { color: "#242626" },
        grid: { color: "#232626" },
        pointLabels: { color: COLORS.text, font: { size: 16 } },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: { display: false },
      }
    },
    plugins: { legend: { display: false } },
    responsive: true,
    maintainAspectRatio: false
  };

  return (
    <>
      <div ref={resultRef} className="min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden" style={{ background: COLORS.bg, color: COLORS.text }}>
        <ScoreCards
          totalScore={totalScore}
          pitch={pitch}
          pronunciation={pronunciation}
          intonation={intonation}
        />
        <div className="flex items-center justify-center mb-10" style={{ gap: 28 }}>
          <div
            style={{
              fontSize: 88,
              fontWeight: 900,
              color: getRankColor(rank),
              textShadow: `0 0 28px ${getRankColor(rank)}66, 0 6px 42px #000a`,
              minWidth: 110
            }}
          >
            {rank}
          </div>
          <div style={{
            width: 220,
            height: 220,
            background: "#111317",
            borderRadius: 18,
            border: "2px solid #222f2b",
            padding: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>
        <SentenceAnalysis finalResults={finalResults} />
      </div>
      <div ref={btnRef}>
        <ResultViewBtn
          hasAnalysisResults={hasAnalysisResults}
          showResults={showResults}
          showCompleted={showCompleted}
          onViewResults={onViewResults}
        />
      </div>
    </>
  );
};

export default ResultComponent; 