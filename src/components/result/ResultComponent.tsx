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
  // 발음: word_score 평균
  const pronunciation = calcAvg(allWords.map(w => w.word_score));
  // 억양: mfcc_similarity 평균
  const intonation = calcAvg(allWords.map(w => w.mfcc_similarity));
  // 발화타임: text_status === 'pass' 비율
  const timing =
    allWords.length > 0
      ? allWords.filter(w => w.text_status === 'pass').length / allWords.length
      : 0;
  // 싱크율 %: 세 점수의 평균
  const syncRate = (pronunciation + intonation + timing) / 3;
  return { syncRate, pronunciation, intonation, timing };
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

export interface TestResultAnalysisSectionProps {
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

  // 결과 컨테이너 ref
  const resultRef = useRef<HTMLDivElement | null>(null);
  const prevShowResults = useRef(showResults);

  // showResults가 false -> true로 바뀔 때만 스크롤
  useEffect(() => {
    if (!prevShowResults.current && showResults && resultRef.current) {
      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        if (resultRef.current) {
          window.scrollTo({ top: resultRef.current.offsetTop, behavior: "smooth" });
        }
      });
    }
    prevShowResults.current = showResults;
  }, [showResults]);

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

  const { syncRate, pronunciation, intonation, timing } = getTotalScores(finalResults);
  const rank = getRank(syncRate);

  const radarData = {
    labels: ["싱크율 %", "발음", "발화타임", "억양"],
    datasets: [
      {
        label: "Score",
        data: [
          Math.round(syncRate * 100),
          Math.round(pronunciation * 100),
          Math.round(timing * 100),
          Math.round(intonation * 100)
        ],
        backgroundColor: "rgba(34,255,136,0.18)", // 더 연한 내부 색(반투명)
        borderColor: "rgba(34,255,136,0.2)", // 연한 선
        borderWidth: 1, // 매우 가는 선
        pointBackgroundColor: "rgba(0,0,0,0)", // 점 완전 투명
        pointRadius: 1, // 아주 작은 점
        pointHoverRadius: 2,
        fill: true
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
      {(showResults || showCompleted) && (
        <div ref={resultRef} className="min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden" style={{ background: '#232B3A', color: COLORS.text }}>
          <ScoreCards
            syncRate={syncRate}
            pronunciation={pronunciation}
            intonation={intonation}
            timing={timing}
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
              width: 260,
              height: 260,
              background: "#181F2A", // 딥 네이비
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
      )}
      <ResultViewBtn
        hasAnalysisResults={hasAnalysisResults}
        showResults={showResults}
        showCompleted={showCompleted}
        onViewResults={onViewResults}
      />
    </>
  );
};

export default ResultComponent; 