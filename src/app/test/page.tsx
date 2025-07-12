"use client";
import React, { useState } from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
Chart.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// 샘플 데이터
const sampleFinalResults = [
  {
    word_analysis: [
      { word: "I", text_status: "pass" as const, mfcc_similarity: 0.98, word_score: 0.96 },
      { word: "will", text_status: "pass" as const, mfcc_similarity: 0.91, word_score: 0.92 },
      { word: "find", text_status: "fail" as const, mfcc_similarity: 0.60, word_score: 0.55 },
      { word: "you", text_status: "pass" as const, mfcc_similarity: 0.94, word_score: 0.93 },
    ],
    pitch_score: 0.86,
    pronunciation_score: 0.81,
    intonation_score: 0.78,
  },
  {
    word_analysis: [
      { word: "Good", text_status: "pass" as const, mfcc_similarity: 0.97, word_score: 0.95 },
      { word: "luck", text_status: "fail" as const, mfcc_similarity: 0.61, word_score: 0.57 },
    ],
    pitch_score: 0.76,
    pronunciation_score: 0.74,
    intonation_score: 0.70,
  },
  {
    word_analysis: [
      { word: "This", text_status: "pass" as const, mfcc_similarity: 0.85, word_score: 0.87 },
      { word: "is", text_status: "pass" as const, mfcc_similarity: 0.95, word_score: 0.92 },
      { word: "not", text_status: "pass" as const, mfcc_similarity: 0.93, word_score: 0.90 },
      { word: "a", text_status: "fail" as const, mfcc_similarity: 0.52, word_score: 0.51 },
      { word: "game", text_status: "pass" as const, mfcc_similarity: 0.91, word_score: 0.89 },
    ],
    pitch_score: 0.91,
    pronunciation_score: 0.82,
    intonation_score: 0.83,
  },
];

// 컬러 팔레트
const COLORS = {
  bg: "#101112",
  card: "#181a1b",
  border: "#232626",
  text: "#eaeaea",
  subText: "#929ca5",
  point: "#22ff88",
  pass: "#22ff88",
  fail: "#ee5566",
  white: "#fff",
  yellow: "#ffd56a"
};

// 유틸/타입
function calcAvg(arr: number[]) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
function getTotalScores(finalResults: any[]) {
  const allWords = finalResults.flatMap(s => s.word_analysis);
  const totalScore = calcAvg(allWords.map(w => w.word_score));
  const pitch = calcAvg(finalResults.map(s => s.pitch_score));
  const pronunciation = calcAvg(finalResults.map(s => s.pronunciation_score));
  const intonation = calcAvg(finalResults.map(s => s.intonation_score));
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

export default function RhythmGameDashboard() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const { totalScore, pitch, intonation, pronunciation } = getTotalScores(sampleFinalResults);
  const rank = getRank(totalScore);

  // 레이더 데이터
  const radarData = {
    labels: ["총점", "피치", "발음", "억양"],
    datasets: [
      {
        label: "Score",
        data: [totalScore, pitch, pronunciation, intonation].map(v => Math.round(v * 100)),
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
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: COLORS.bg, color: COLORS.text }}
    >
      <div
        style={{
          background: COLORS.card,
          border: `2.5px solid ${COLORS.border}`,
          borderRadius: "24px",
          boxShadow: "0 8px 32px #181b1e60, 0 0px 0px #222",
          width: "100%",
          maxWidth: 600,
          margin: "0 auto",
          position: "relative",
          padding: "38px 0 24px 0"
        }}
      >
        {/* 중앙 대형 랭크 */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "-62px",
            transform: "translateX(-50%)",
            zIndex: 2
          }}
        >
          <div
            style={{
              fontSize: 92,
              fontWeight: 900,
              color: getRankColor(rank),
              textShadow: `0 0 28px ${getRankColor(rank)}66, 0 6px 42px #000a`
            }}
          >
            {rank}
          </div>
        </div>
        {/* 레이더 차트 */}
        <div style={{
          width: "70%",
          maxWidth: 340,
          minWidth: 200,
          height: 250,
          margin: "0 auto 20px auto",
        }}>
          <Radar data={radarData} options={radarOptions} />
        </div>
        {/* 문장별 상세 (아코디언) */}
        <div className="mt-7 mb-2">
          <div className="font-bold text-lg mb-3 text-left" style={{ color: COLORS.subText }}>문장별 결과</div>
          <div>
            {sampleFinalResults.map((sentence, idx) => (
              <div key={idx} style={{
                background: COLORS.bg,
                border: `1.5px solid ${COLORS.border}`,
                borderRadius: 14,
                marginBottom: 10,
                boxShadow: "0 2px 16px #181b1e20"
              }}>
                <button
                  className="flex justify-between items-center w-full p-4 cursor-pointer"
                  style={{
                    color: COLORS.text,
                    fontWeight: 600,
                    fontSize: 16,
                    background: "none",
                    border: "none"
                  }}
                  onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                >
                  <span>Script {idx + 1}</span>
                  <span style={{
                    fontSize: 18,
                    color: sentence.word_analysis.some(w => w.text_status === "fail") ? COLORS.fail : COLORS.point,
                  }}>
                    {(calcAvg(sentence.word_analysis.map(w => w.word_score)) * 100).toFixed(0)}%
                  </span>
                </button>
                {openIdx === idx && (
                  <div className="px-4 pb-4">
                    <div className="flex flex-wrap gap-1 mb-3">
                      {sentence.word_analysis.map((w, i) => (
                        <span
                          key={i}
                          style={{
                            background: w.text_status === "pass" ? "#171e19" : "rgba(238,85,102,0.13)",
                            color: w.text_status === "pass" ? COLORS.point : COLORS.fail,
                            border: `1px solid ${w.text_status === "pass" ? COLORS.point : COLORS.fail}`,
                            borderRadius: 6,
                            fontWeight: 600,
                            fontSize: 15,
                            padding: "3px 10px"
                          }}
                        >
                          {w.word}
                        </span>
                      ))}
                    </div>
                    <div>
                      {sentence.word_analysis.map((w, i) => (
                        <div key={i} style={{ marginBottom: 6 }}>
                          <span style={{
                            color: w.text_status === "pass" ? COLORS.point : COLORS.fail,
                            fontWeight: 700,
                            marginRight: 8,
                            fontSize: 14,
                          }}>
                            {w.word}
                          </span>
                          <span style={{ color: COLORS.subText, fontSize: 13 }}>유사도: {(w.mfcc_similarity * 100).toFixed(1)}% | 점수: {(w.word_score * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* 하단 버튼 */}
        <div className="flex justify-center mt-6">
          <button
            style={{
              background: COLORS.point,
              color: COLORS.bg,
              fontWeight: 800,
              fontSize: 18,
              padding: "12px 44px",
              borderRadius: 12,
              border: "none",
              boxShadow: `0 2px 16px ${COLORS.point}33`
            }}
            onClick={() => alert('다음 단계!')}
          >
            다음으로
          </button>
        </div>
      </div>
    </div>
  );
}
