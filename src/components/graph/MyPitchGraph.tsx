import React, { useEffect, useRef, useState } from 'react'
import * as Pitchfinder from "pitchfinder";
import { useAudioStore } from '@/store/useAudioStore';
import toast from 'react-hot-toast';

interface MyPitchGraphProps{
  currentIdx: number;
}

// pitchFinder
export const MyPitchGraph = ({currentIdx}: MyPitchGraphProps) => {
  const [myPitch, setMyPitch] = useState<number | null>(null);
  const [pitchData, setPitchData] = useState<{x: number, y: number}[]>([]);
  const [dynamicRange, setDynamicRange] = useState<{min: number, max: number}>({min: 80, max: 1000});
  const detectPitchRef = useRef<ReturnType<typeof Pitchfinder.YIN> | null>(null);
  const pitchIndexRef = useRef(0); //x축 인덱스
  const [alertShown, setAlertShown] = useState(false);

  let micErrorToastId: string | undefined;

  useEffect(() => {
    setPitchData([]);
    setDynamicRange({min: 80, max: 1000}); // 초기값으로 리셋
    pitchIndexRef.current = 0;
  }, [currentIdx])

  useEffect(() => {
    detectPitchRef.current = Pitchfinder.YIN();//ref로 사용하도록 변경

    const interval = setInterval(() => {
      const {analyser} = useAudioStore.getState();
      if(!analyser || !detectPitchRef.current) {
        // 첫 번째 호출에서만 alert 표시
        if (!alertShown) {
          if (!micErrorToastId) {
            micErrorToastId = toast('마이크가 초기화되지 않았습니다.\n\n페이지를 새로고침하고 마이크 권한을 허용해주세요.', { id: 'mic-error' });
          }
          setAlertShown(true);
        }
        return;
      }

      const buffer = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(buffer);

      // RMS 계산 -> 작으면 무음으로 판단
      const rms = Math.sqrt(buffer.reduce((sum, x) => sum + x * x, 0) / buffer.length);
      if (rms < 0.01) {
        console.log('음성 입력이 없습니다. (RMS:', rms, ')');
        return;
      }

      const pitch = detectPitchRef.current(buffer);

      // 사람 목소리 범위 필터(80~1000Hz)
      if(pitch && pitch > 80 && pitch < 1000){
        console.log('피치 감지됨:', pitch, 'Hz');
        setMyPitch(pitch);
        
        setPitchData(prev => {
          const newData = [...prev, {x: pitchIndexRef.current++, y: pitch}];
          
          // 최근 50개 데이터만 유지 (성능 최적화)
          const recentData = newData.slice(-50);
          
          // 동적 범위 업데이트
          if (recentData.length > 0) {
            const values = recentData.map(d => d.y);
            const currentMin = Math.min(...values);
            const currentMax = Math.max(...values);
            
            // 범위가 너무 좁으면 확장
            const range = currentMax - currentMin;
            const minRange = 50; // 최소 50Hz 범위 보장
            
            if (range < minRange) {
              const padding = (minRange - range) / 2;
              setDynamicRange({
                min: Math.max(80, currentMin - padding),
                max: Math.min(1000, currentMax + padding)
              });
            } else {
              setDynamicRange({
                min: Math.max(80, currentMin - range * 0.1), // 10% 패딩
                max: Math.min(1000, currentMax + range * 0.1)
              });
            }
          }
          
          return recentData;
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [])

  // y값 스케일링 (동적 범위 사용)
  const getY = (y: number) => {
    if (dynamicRange.max === dynamicRange.min) return 20; // flat line
    return 40 - ((y - dynamicRange.min) / (dynamicRange.max - dynamicRange.min)) * 40;
  };

  // 데이터가 없으면 빈 그래프 표시
  if (pitchData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
        음성 입력 대기 중...
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
        <defs>
          <linearGradient id="myPitchGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path
          d={`M 0,${getY(pitchData[0].y)} ${pitchData.map((point, index) => 
            `L ${(index / (pitchData.length - 1)) * 100},${getY(point.y)}`
          ).join(' ')}`}
          stroke="#3B82F6"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={`M 0,${getY(pitchData[0].y)} ${pitchData.map((point, index) => 
            `L ${(index / (pitchData.length - 1)) * 100},${getY(point.y)}`
          ).join(' ')} L 100,40 L 0,40 Z`}
          fill="url(#myPitchGradient)"
        />
      </svg>
    </div>
  );
}
