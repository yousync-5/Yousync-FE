"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  captions: { script: string }[];
  currentScriptIndex: number;
  onScriptSelect: (index: number) => void;
  actorName?: string;
  movieTitle?: string;
  analyzedCount?: number;
  totalCount?: number;
  recording?: boolean;
  onStopLooping?: () => void;
  recordedScripts?: boolean[];
  hasAnalysisResult?: boolean;
}

export default function Sidebar({
  isOpen,
  onClose,
  captions,
  currentScriptIndex,
  onScriptSelect,
  recording = false,
  onStopLooping,
  recordedScripts = [],
  hasAnalysisResult = false,
}: SidebarProps) {
  useEffect(() => {
    console.log("[Sidebar] captions:", captions);
  }, [captions]);

  // captions에서 정보 추출 (존재하지 않으면 '-')
  const actorName = (captions[0] && (captions[0] as any).actor && (captions[0] as any).actor.name) ? (captions[0] as any).actor.name : '-';
  const movieTitle = (captions[0] && (captions[0] as any).movie_name) ? (captions[0] as any).movie_name : '-';
  const totalCount = captions.length;
  const analyzedCount = captions.filter(c => (c as any).isAnalyzed).length;

  // 시간 포맷 함수
  function formatTime(sec?: number) {
    if (typeof sec !== 'number' || isNaN(sec)) return '--:--.--';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}`;
  }

  return (
    <motion.div
      initial={{ x: 320 }}
      animate={{ x: isOpen ? 0 : 320 }}
      transition={{ type: "tween", duration: 0.3 }}
      className="fixed top-0 right-0 h-full w-[320px] z-50 shadow-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-l border-gray-700 text-gray-100 overflow-y-auto custom-scrollbar"
      style={{ boxShadow: 'rgba(0,0,0,0.25) -8px 0 24px' }}
    >
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700 bg-gray-900/80 sticky top-0 z-10">
        <span className="font-bold text-lg tracking-tight text-emerald-400 select-none">📑 스크립트 목록</span>
        <button
          onClick={onClose}
          className="ml-2 p-1 rounded-full text-gray-400 hover:text-emerald-400 hover:bg-gray-800 transition text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
          aria-label="사이드바 닫기"
        >
          <span className="text-xl">×</span>
        </button>
      </div>
      {/* 상단 정보 박스 */}
      <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/80 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <span className="font-semibold text-emerald-400">배우명</span>
          <span className="truncate">{actorName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <span className="font-semibold text-emerald-400">영화명</span>
          <span className="truncate">{movieTitle}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <span className="font-semibold text-emerald-400">문장 진행률</span>
          <span>{currentScriptIndex + 1} / {totalCount}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <span className="font-semibold text-emerald-400">문장 분석완료</span>
          <span>{analyzedCount} / {totalCount}</span>
        </div>
      </div>

      {/* 진행률 표시 */}
      <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/80">
        <div className="w-full h-12 bg-gray-800 rounded flex items-center justify-center p-2">
          {/* 문장별 진행률 표시 */}
          <div className="flex w-full h-full space-x-1">
            {captions.map((caption, index) => {
              const isRecorded = recordedScripts[index];
              const isAnalyzed = hasAnalysisResult && index === currentScriptIndex;
              const isCurrent = index === currentScriptIndex;
              
              return (
                <div
                  key={index}
                  className={`flex-1 rounded transition-all duration-200 ${
                    isAnalyzed 
                      ? 'bg-green-500' 
                      : isRecorded 
                      ? 'bg-blue-500' 
                      : isCurrent 
                      ? 'bg-yellow-500' 
                      : 'bg-gray-600'
                  } relative group flex items-center justify-center`}
                  title={`문장 ${index + 1}: ${isAnalyzed ? '분석 완료' : isRecorded ? '녹음 완료' : isCurrent ? '현재' : '미완료'}`}
                >
                  {/* 상태 아이콘 */}
                  {isAnalyzed && (
                    <div className="text-white text-xs">✓</div>
                  )}
                  {isRecorded && !isAnalyzed && (
                    <div className="text-white text-xs">🎤</div>
                  )}
                  {isCurrent && !isRecorded && (
                    <div className="text-white text-xs">●</div>
                  )}
                  
                  {/* 툴팁 */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {`문장 ${index + 1}: ${isAnalyzed ? '분석 완료' : isRecorded ? '녹음 완료' : isCurrent ? '현재' : '미완료'}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* 범례 */}
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-400 mt-2">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-600 rounded"></div>
            <span>미완료</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>현재</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>녹음 완료</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>분석 완료</span>
          </div>
        </div>
      </div>

      <ul className="px-4 py-6 pb-32">
        {captions.map((caption, index) => (
          <li
            key={index}
            onClick={() => {
              if (recording) return;
              if (onStopLooping) onStopLooping();
              onScriptSelect(index);
            }}
            className={`cursor-pointer px-4 py-4 transition-all duration-150 select-none relative
              ${currentScriptIndex === index
                ? "bg-emerald-500/90 text-white shadow-md"
                : "hover:bg-gray-800/50 hover:text-emerald-300 text-gray-200"}
            `}
            style={{ wordBreak: 'break-word', zIndex: 1 }}
          >
            <div className="flex items-start">
              {/* 아이콘 + 번호 */}
              <span className="flex items-center mr-3 mt-1 select-none" style={{ zIndex: 2 }}>
                {currentScriptIndex === index ? (
                  // 빙빙 도는 아이콘 (SVG)
                  <svg className="w-4 h-4 mr-1 text-emerald-300 animate-spin" viewBox="0 0 20 20" fill="none" aria-label="재생 중">
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="3" strokeDasharray="20 10" />
                  </svg>
                ) : (
                  // 플레이 아이콘 (SVG)
                  <svg className="w-4 h-4 mr-1 text-gray-400 group-hover:text-emerald-300 transition-colors" viewBox="0 0 20 20" fill="currentColor" aria-label="플레이">
                    <polygon points="6,4 16,10 6,16" />
                  </svg>
                )}
              </span>
              <span className="flex-1 leading-relaxed">
                {caption.script}
              </span>
            </div>
            {/* 타임라인 */}
            {typeof (caption as any).start_time === 'number' && typeof (caption as any).end_time === 'number' && (
              <div className={`text-xs mt-1 ml-8 font-mono transition-colors duration-150 ${currentScriptIndex === index ? 'text-white' : 'text-gray-400'}`}>
                {formatTime((caption as any).start_time)} ~ {formatTime((caption as any).end_time)}
              </div>
            )}
            {index < captions.length - 1 && (
              <div className="absolute bottom-0 left-4 right-4 h-px"
                style={{ background: currentScriptIndex === index ? '#34d399' : '#a3a3a3', opacity: currentScriptIndex === index ? 0.7 : 0.4, zIndex: 0 }}
              />
            )}
          </li>
        ))}
      </ul>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 7px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2d3748;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </motion.div>
  );
}
