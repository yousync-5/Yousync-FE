"use client";
import React from "react";

export interface ScoreCardsProps {
  syncRate: number;
  pronunciation: number;
  intonation: number;
  timing: number;
}

const ScoreCards: React.FC<ScoreCardsProps> = ({ syncRate, pronunciation, intonation, timing }) => {
  const scoreCards = [
    { icon: "⭐️", label: "싱크율 %", value: Math.round(syncRate * 100) },
    { icon: "P", label: "발음", value: Math.round(pronunciation * 100) },
    { icon: "🕒", label: "발화타임", value: Math.round(timing * 100) },
    { icon: "🪗", label: "억양", value: Math.round(intonation * 100) }
  ];
  return (
    <div className="w-full max-w-2xl mx-auto mb-9">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {scoreCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-gray-900 border-2 border-gray-800 rounded-xl p-6 flex flex-col items-center shadow transition-all duration-300"
            style={{ minWidth: 120 }}
          >
            <div style={{
              fontSize: 36,
              fontWeight: 700,
              color: "#7dcfff",
              marginBottom: 7
            }}>{card.icon}</div>
            <div style={{
              fontSize: 28,
              fontWeight: 800,
              color: "#d9eaff",
              marginBottom: 5
            }}>{isNaN(card.value) ? 0 : card.value}</div>
            <div style={{
              fontSize: 15,
              color: "#90a0b0",
              fontWeight: 500
            }}>{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreCards;