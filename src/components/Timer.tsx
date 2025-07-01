import React, { useEffect, useState, useRef } from 'react'
import {motion, AnimatePresence, frame} from 'framer-motion';
import {
    CircularProgressbarWithChildren,
    buildStyles,
} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export const Timer = ({currentIdx}: {currentIdx : number}) => {
    //1. 카운트 다운 변수 필요할듯
    const [countDown, setCountDown] = useState<number>(3);
    const [start, setStart] = useState<string | null>(null);
    const timerRef = useRef<number | null>(null);
    const [percentage, setPercentage] = useState<number>(100);

    // 숫자 초기화
    // 처음에는 채워지는 로직이 없는데.. 왜 두번째 세번째는...
    useEffect(() => {
        setCountDown(3);
        setStart(null);
        setPercentage(100);

        // 한 프레임 뒤에 애니메이션 시작
        const timeout = setTimeout(() => {
            let start = performance.now();
            const duration = 3000;

            function animateFrame(now: number) {
            const elapsed = now - start;
            const progress = Math.min(1, elapsed / duration);
            const value = 100 * (1 - progress);

            setPercentage(value);

            if (progress < 1) {
                timerRef.current = requestAnimationFrame(animateFrame);
            }
            }

            if (timerRef.current !== null) cancelAnimationFrame(timerRef.current);
            timerRef.current = requestAnimationFrame(animateFrame);
        }, 0);

        return () => {
            clearTimeout(timeout);
            if (timerRef.current !== null) cancelAnimationFrame(timerRef.current);
        };
    }, [currentIdx])

    // // 숫자 타이머 
    // useEffect(() => {
    //     setStart(null);
    //     if (countDown === 0) {
    //         setStart("시작");
    //         return
    //     };
    //     const timeId = setTimeout(() => {
    //         setCountDown((cnt) => cnt - 1)
    //     }, 1000)
    //     return () => clearInterval(timeId)
    // }, [countDown]) // deps에 넣어야..?

    // 부드러운 퍼센트 감소
    // useEffect(() => {
    //     const totalDuration = 3000;
    //     const frameRate = 1000 / 60;    // 60fps
    //     const steps = totalDuration / frameRate;
    //     const decrement = 100 / steps;

    //     if(timerRef.current) clearInterval(timerRef.current);

    //     timerRef.current = setInterval(() => {
    //         setPercentage((prev) => {
    //             const next = prev - decrement;
    //             if(next <= 0){
    //                 clearInterval(timerRef.current!);
    //                 return 0;
    //             }
    //             return next;
    //         })
    //     }, frameRate)

    //     return () => {
    //         if(timerRef.current) clearInterval(timerRef.current);
    //     }
    // }, [currentIdx])  
    // useEffect(() => {
    //     let start = performance.now();
    //     const duration = 3000;
    //     function animateFrame(now: number) {
    //         const elapsed = now - start;
    //         const progress = Math.min(1, elapsed / duration);
    //         const value = 100 * (1 - progress);
        
    //         setPercentage(value);
        
    //         if (progress < 1) {
    //           timerRef.current = requestAnimationFrame(animateFrame);
    //         }
    //       }
    //       // 🛠 애니메이션 시작 전에 상태를 100으로 강제 반영
    //       setPercentage(100);

    //       if (timerRef.current) cancelAnimationFrame(timerRef.current);
    //       timerRef.current = requestAnimationFrame(animateFrame);
        
    //       return () => {
    //         if (timerRef.current) cancelAnimationFrame(timerRef.current);
    //       };
    // }, [currentIdx])
    //3, 2, 1 동안은 준비 , 끝나면 시작 뜨게 만들면 될듯
  return (
    <div className='flex flex-row '>
        <div className='w-24 h-24'>
        <CircularProgressbarWithChildren
        strokeWidth={12}
        value={percentage}
        styles={buildStyles({
          pathColor: '#46c288', // emerald-500: #46c288
          trailColor: '#1f2937', // gray-800
        })}
      >
        {/* <div className='mt-4 text-emerald-500 text-4xl h-10 overflow-hidden'>
            <AnimatePresence mode='wait'>
                <motion.div
                    key={start ?? countDown}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                  
                </motion.div>
            </AnimatePresence>
            </div> */}
            </CircularProgressbarWithChildren>

        </div>
    </div>
  )
}
