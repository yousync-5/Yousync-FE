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
  const safeResults = Array.isArray(finalResults) ? finalResults.filter(Boolean) : [];
  
  if (safeResults.length === 0) {
    return { syncRate: 0, pronunciation: 0, intonation: 0, timing: 0 };
  }
  
  const allWords = safeResults.flatMap(s =>
    Array.isArray(s.word_analysis) ? s.word_analysis : []
  );
  
  if (allWords.length === 0) {
    return { syncRate: 0, pronunciation: 0, intonation: 0, timing: 0 };
  }
  
  // 발음: word_score 평균
  const pronunciation = calcAvg(allWords.map(w => w.word_score || 0));
  // 억양: mfcc_similarity 평균
  const intonation = calcAvg(allWords.map(w => w.mfcc_similarity || 0));
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
      ? finalResultsObj.filter(Boolean) // null/undefined 필터링
      : (finalResultsObj && typeof finalResultsObj === "object")
        ? Object.values(finalResultsObj).filter(Boolean) // null/undefined 필터링
        : [];

  // 디버깅 로그 추가
  useEffect(() => {
    console.log('ResultComponent - finalResults:', finalResults);
    console.log('ResultComponent - finalResults 타입:', Array.isArray(finalResults) ? 'Array' : typeof finalResults);
    console.log('ResultComponent - finalResults 길이:', Array.isArray(finalResults) ? finalResults.length : 0);
    if (Array.isArray(finalResults) && finalResults.length > 0) {
      console.log('ResultComponent - 첫 번째 항목:', finalResults[0]);
      console.log('ResultComponent - word_analysis 존재 여부:', !!finalResults[0]?.word_analysis);
      
      // 모든 항목에 word_analysis가 있는지 확인
      const allHaveWordAnalysis = finalResults.every(item => !!item?.word_analysis);
      console.log('ResultComponent - 모든 항목에 word_analysis가 있는지:', allHaveWordAnalysis);
      
      // word_analysis가 있는 항목 수
      const itemsWithWordAnalysis = finalResults.filter(item => !!item?.word_analysis).length;
      console.log('ResultComponent - word_analysis가 있는 항목 수:', itemsWithWordAnalysis);
    }
  }, [finalResults]);

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
          {finalResults.length > 0 ? (
            <>
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
            </>
          ) : (
            <div className="text-center max-w-md mx-auto p-6 bg-gray-900 rounded-xl border border-gray-800">
              <div className="text-5xl mb-4">🎬</div>
              <h2 className="text-2xl font-bold mb-4">분석 결과가 없습니다</h2>
              <p className="text-gray-400 mb-6">
                아직 이 토큰에 대한 분석 결과가 없습니다. 먼저 더빙을 진행해주세요.
              </p>
            </div>
          )}
          
          {/* 다시 더빙하기 버튼 */}
          {window.location.pathname === '/result' && (
            <div className="w-full flex justify-center px-2 md:px-0 mt-8">
              <button
                onClick={() => {
                  // URL에서 token_id 파라미터 추출
                  const urlParams = new URLSearchParams(window.location.search);
                  const tokenId = urlParams.get('token_id');
                  if (tokenId) {
                    // 더빙 페이지로 이동
                    window.location.href = `/dubbing?token_id=${tokenId}`;
                  }
                }}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                🎙️ 다시 더빙하기
              </button>
            </div>
          )}
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