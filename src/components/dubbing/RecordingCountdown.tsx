import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RecordingCountdownProps {
  isVisible: boolean;
  onComplete: () => void;
  duration: number; // 카운트다운 시간(ms)
}

const RecordingCountdown: React.FC<RecordingCountdownProps> = ({ 
  isVisible, 
  onComplete,
  duration = 2000 // 기본값 2초
}) => {
  const [timeLeft, setTimeLeft] = useState(duration / 1000);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isVisible) {
      // 카운트다운 시작
      setTimeLeft(duration / 1000);
      startTimeRef.current = performance.now();
      
      const updateCountdown = (timestamp: number) => {
        if (!startTimeRef.current) return;
        
        const elapsed = timestamp - startTimeRef.current;
        const newTimeLeft = Math.max(0, duration - elapsed) / 1000;
        
        setTimeLeft(newTimeLeft);
        
        if (newTimeLeft > 0) {
          animationFrameRef.current = requestAnimationFrame(updateCountdown);
        } else {
          // 카운트다운 완료
          onComplete();
        }
      };
      
      animationFrameRef.current = requestAnimationFrame(updateCountdown);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVisible, duration, onComplete]);

  if (!isVisible) return null;

  // 정수 부분과 소수점 부분 분리
  const integerPart = Math.floor(timeLeft);
  const decimalPart = timeLeft.toFixed(2).split('.')[1];

  return (
    <AnimatePresence>
      <div className="absolute inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="flex flex-col items-center"
        >
          <div className="flex items-baseline mb-6">
            <span className="text-[12rem] font-bold text-white" style={{ lineHeight: '1' }}>
              {integerPart}
            </span>
            <span className="text-[6rem] font-bold text-white" style={{ lineHeight: '1' }}>
              .{decimalPart}
            </span>
          </div>
          <div className="w-96 h-8 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500"
              initial={{ width: '100%' }}
              animate={{ 
                width: '0%',
                transition: { 
                  duration: duration / 1000,
                  ease: 'linear'
                }
              }}
            />
          </div>
          <div className="text-4xl text-white mt-6 font-semibold">
            {timeLeft <= 0.1 ? "녹음 시작!" : "녹음 준비 중..."}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RecordingCountdown;
