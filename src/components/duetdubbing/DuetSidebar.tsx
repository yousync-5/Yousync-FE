"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Loader from "../ui/Loader";
import { checkAllAnalyzedDuetResult } from '@/utils/checkAllAnalyzedDuetResult';
import isMyLine from "@/utils/isMyLine";
import DuetResult from "@/utils/DuetResult";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  captions: { 
    script: string;
    actor?: {
      name: string;
      id: number;
    };
    start_time?: number;
    end_time?: number;
  }[];
  currentScriptIndex: number;
  onScriptSelect: (index: number) => void;
  actorName?: string;
  movieTitle?: string;
  analyzedCount?: number;
  totalCount?: number;
  recording?: boolean;
  onStopLooping?: () => void;
  recordedScripts?: boolean[];
  latestResultByScript?: Record<string, any>; // 추가
  recordingCompleted?: boolean; // 추가
}

function normalizeScript(str: string) {
  if (!str || typeof str !== 'string') return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}
// 문장이 넘어갈 때 마다 칸에 맞게 자동스크롤이 되는 형태. 해당 자동스크롤은 버튼을 통한 문장이동에도 반응해야한다.
// => 지금 화면을 차지한 문장이 스크롤을 통해 언제나 특정위치에 존재해야한다.
// 6번째 문장이 까지는 그냥 내려가다가, 7번째문장이 되면 그게 6번째 위치가 되게 자동스크롤 되게 하고싶다. 
// 2. 분석 완료된 문장에 표시하기. 결과가 존재하면 반드시 -> 녹음 완료된 문장들(recordedScripts)을 위에서 받는구나
export default function Sidebar({
  isOpen,
  onClose,
  captions,
  currentScriptIndex,
  onScriptSelect,
  recording = false,
  onStopLooping,
  recordedScripts = [],
  latestResultByScript = {},
  recordingCompleted = false,
}: SidebarProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [detailIndex, setDetailIndex] = useState<number | null>(null); // 클릭 시 세부 정보 표시용
  const [showMyLinesOnly, setShowMyLinesOnly] = useState(false);

  // 자동스크롤을 위한 ref
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  // 화자 구분 로직 - Second Speaker가 내 대사
  const currentScript = captions[currentScriptIndex];
  const isMineCurrent = isMyLine(currentScript?.actor);

  // 내 대사만 필터링
  const myCaptions = captions.filter(caption => isMyLine(caption.actor));
  // 내 대사 중 분석 완료된 개수
  const myAnalyzedCount = myCaptions.filter(c => {
    const scriptKey = normalizeScript(c.script);
    return !!latestResultByScript[scriptKey];
  }).length;
  // 내 대사만 모두 분석 완료됐는지 체크
  const isAllAnalyzed = myCaptions.length > 0 && myAnalyzedCount === myCaptions.length;

  useEffect(() => {
    console.log("[Sidebar] captions:", captions);
  }, [captions]);

  useEffect(() => {
    // currentScriptIndex가 변경될 때마다 자동스크롤 실행
    scrollToSelectedItem();
  }, [currentScriptIndex, myCaptions])

  // captions에서 정보 추출 (존재하지 않으면 '-')
  const actorName = (captions[0] && (captions[0] as any).actor && (captions[0] as any).actor.name) ? (captions[0] as any).actor.name : '-';
  const movieTitle = (captions[0] && (captions[0] as any).movie_name) ? (captions[0] as any).movie_name : '-';
  const totalCount = captions.length;
  const analyzedCount = captions.filter(c => {
    const scriptKey = normalizeScript(c.script);
    return !!latestResultByScript[scriptKey];
  }).length;
  // 분석 완료 여부 유틸 함수로 판별 (기존 코드 삭제)
  // const isAllAnalyzed = checkAllAnalyzedDuetResult(captions.length, Object.values(latestResultByScript));

  // 시간 포맷 함수
  function formatTime(sec?: number) {
    if (typeof sec !== 'number' || isNaN(sec)) return '--:--.--';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}`;
  }

  const scrollToSelectedItem = () => {
    if(!listRef.current || !sidebarRef.current) return;

    // 현재 선택된 문장의 DOM요소 찾기
    const selectedElement = listRef.current.querySelector(`[data-index="${currentScriptIndex}"]`) as HTMLElement;
    if(!selectedElement) return;

    // 사이드바의 높이와 스크롤 위치 계산
    const sidebarHeight = sidebarRef.current.clientHeight;
    const listTop = listRef.current.offsetTop;
    const itemTop = selectedElement.offsetTop;
    const itemHeight = selectedElement.clientHeight;

    // 현재 스크롤 위치
    const currentScrollTop = sidebarRef.current.scrollTop;
   
    // 아이템이 보이는 영역 계산
    const itemVisibleTop = itemTop - currentScrollTop;
    const itemVisibleBottom = itemVisibleTop + itemHeight;

    // 목표 위치 (6번째 위치)
    const targetVisibleTop =5 * itemHeight;

    // 아이템이 목표 위치보다 아래에 있으면 스크롤 조정
    if(itemVisibleTop > targetVisibleTop) {
      const scrollOffset = itemVisibleTop - targetVisibleTop;
      
      // 부드러운 스크롤 애니메이션
      sidebarRef.current.scrollTo({
        top: currentScrollTop + scrollOffset,
        behavior: 'smooth'
      });
    }
  }

  return (
    <motion.div
      ref={sidebarRef}
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
        <div className="flex items-center justify-between text-sm text-gray-300">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-emerald-400">배우명</span>
            <span className="truncate">{actorName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">내 대사만</span>
            <button 
              onClick={() => setShowMyLinesOnly(!showMyLinesOnly)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                showMyLinesOnly ? 'bg-emerald-500' : 'bg-gray-600'
              }`}
            >
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                showMyLinesOnly ? 'translate-x-5' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <span className="font-semibold text-emerald-400">영화명</span>
          <span className="truncate">{movieTitle}</span>
        </div>

        {/* 문장 진행률 게이지 */}
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>문장 진행률</span>
            <span>{myCaptions.length} / {captions.length}</span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded">
            <div
              className="h-2 bg-emerald-400 rounded"
              style={{ width: `${(myCaptions.length / captions.length) * 100}%` }}
            />
          </div>
        </div>
        {/* 분석 완료 게이지 */}
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>문장 분석완료</span>
            <span>{myAnalyzedCount} / {myCaptions.length}</span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded">
            <div
              className="h-2 bg-blue-400 rounded"
              style={{ width: `${(myAnalyzedCount / myCaptions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
      {/* 범례 */}
      <div className="flex items-center justify-center space-x-4 text-xs text-gray-400 mt-2">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-gray-600 rounded"></div>
          <span>미완료</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-400 rounded"></div>
          <span>분석중</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-400 rounded"></div>
          <span>분석완료</span>
        </div>
      </div>

      <ul ref={listRef} className="px-4 py-6 pb-32">
        {captions.map((caption, index) => {
          const scriptKey = normalizeScript(caption.script);
          const isAnalyzed = !!latestResultByScript[scriptKey];
          const originalIndex = index;
          const isSelected = currentScriptIndex === originalIndex;
          const isMine = isMyLine(caption.actor);
          
          return (
            <li
              key={index}
              data-index={originalIndex}
              onClick={() => {
                if (recording) return;
                if (onStopLooping) onStopLooping();
                onScriptSelect(originalIndex);
              }}
              className={`cursor-pointer px-4 py-4 transition-all duration-150 select-none relative
                ${isSelected
                  ? isMine
                    ? "border-2 border-emerald-400 scale-[1.03] bg-transparent text-white shadow-md z-10"
                    : "border-2 border-blue-400 scale-[1.03] bg-transparent text-white shadow-md z-10"
                  : isAnalyzed
                  ? "border-2 border-emerald-400 bg-transparent text-white"
                  : "hover:bg-gray-800/50 hover:text-emerald-300 text-gray-200"}
                ${isMine && !isSelected && !isAnalyzed
                  ? "bg-emerald-900/30 border-l-4 border-emerald-400 shadow-lg" 
                  : ""}
                ${!isMine && !isSelected && !isAnalyzed
                  ? "bg-blue-900/30 border-l-4 border-blue-400 shadow-lg" 
                  : ""}
                ${isSelected ? "transition-transform" : ""}
              `}
              style={{ wordBreak: 'break-word', zIndex: isSelected ? 10 : 1 }}
            >
              {/* Loader 오버레이 - 현재 선택된 문장에서만 표시 */}
              {isSelected && !isMine && !recording && recordingCompleted && null}
              {isSelected && isMine && !recording && recordingCompleted && (
                <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-[1px] flex items-center justify-center z-20 rounded pointer-events-none">
                  <Loader />
                </div>
              )}
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1">
                  {/* 아이콘 + 번호 */}
                  <span className="flex items-center mr-3 mt-1 select-none" style={{ zIndex: 2 }}>
                    {isSelected ? (
                      isMine ? (
                        // 내 대사 - 빙글빙글 없이 초록색 강조
                        <svg className="w-4 h-4 mr-1 text-emerald-400" viewBox="0 0 20 20" fill="currentColor" aria-label="선택됨">
                          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="3" />
                        </svg>
                      ) : (
                        // 상대 대사 - 빙글빙글 없음, 강조만 파란색
                        <svg className="w-4 h-4 mr-1 text-blue-400" viewBox="0 0 20 20" fill="currentColor" aria-label="선택됨">
                          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="3" />
                        </svg>
                      )
                    ) : isMine ? (
                      // 내 대사 - 사용자 아이콘
                      <div className="px-2 py-1 text-xs font-medium text-green-300 bg-green-900/50 border border-green-400 rounded-full">
                        나
                      </div>
                    ) : (
                      // 상대 대사 - "상대" 텍스트
                      <div className="px-2 py-1 text-xs font-medium text-blue-300 bg-blue-900/50 border border-blue-400 rounded-full">
                        상대
                      </div>
                    )}
                  </span>
                  <span className="flex-1 leading-relaxed">
                    {caption.script}
                  </span>
                </div>
                {/* 분석완료 표시 - 대사 우측에 빨간글씨 */}
                {isAnalyzed && (
                  <span className="text-red-500 text-xs font-semibold ml-2 mt-1 select-none">
                    분석완료
                  </span>
                )}
              </div>
              {/* 타임라인 */}
              {typeof (caption as any).start_time === 'number' && typeof (caption as any).end_time === 'number' && (
                <div className={`text-xs mt-1 ml-8 font-mono transition-colors duration-150 ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                  {formatTime((caption as any).start_time)} ~ {formatTime((caption as any).end_time)}
                </div>
              )}
              {index < captions.length - 1 && (
                <div className="absolute bottom-0 left-4 right-4 h-px"
                  style={{ background: isSelected ? '#34d399' : '#a3a3a3', opacity: isSelected ? 0.7 : 0.4}}
                />
              )}
            </li>
          );
        })}
      </ul>
      {/* 세부 정보 모달/패널 (분석 완료 문장 클릭 시) */}
      {detailIndex !== null && latestResultByScript[normalizeScript(captions[detailIndex].script)] && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40" onClick={() => setDetailIndex(null)}>
          <div className="bg-gray-900 rounded-lg p-6 min-w-[320px] max-w-[90vw] shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={() => setDetailIndex(null)}>×</button>
            <div className="font-bold text-lg mb-2 text-emerald-300">문장 {detailIndex + 1}</div>
            <div className="mb-2 text-gray-200">{captions[detailIndex].script}</div>
            <div className="space-y-1 text-sm">           {Object.entries(latestResultByScript[normalizeScript(captions[detailIndex].script)]).map(([k, v]) => (
                <div key={k}><span className="text-emerald-300">{k}</span>: {typeof v === 'object' ? JSON.stringify(v, null,2) : String(v)}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 토스트 스타일 전체 녹음 들어보기 버튼 */}
      {isAllAnalyzed && (
        <div
          className={`
            fixed bottom-8 z-[9999]
            w-[220px] max-w-[90vw]
            bg-gradient-to-r from-emerald-400 via-blue-400 to-pink-400
            text-white font-bold rounded-2xl shadow-2xl
            flex items-center gap-3 px-4 py-3 animate-pulse
            transition-all duration-500
            ${isOpen ? 'right-4 translate-x-0' : 'right-[-240px] translate-x-full'}
          `}
          style={{ boxShadow: "0 8px 32px rgba(34,197,94,0.25)" }}
        >
          <button
            className="flex-1 flex items-center gap-2 focus:outline-none"
            onClick={() => onStopLooping && onStopLooping()}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
              <polygon points="10,8 16,12 10,16" fill="white" />
            </svg>
            전체 녹음 들어보기
          </button>
        </div>
      )}
      {/* 토스트 스타일 전체 녹음 들어보기 버튼 */}

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