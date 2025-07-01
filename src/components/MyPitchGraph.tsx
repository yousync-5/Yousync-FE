import React, { useEffect, useRef, useState } from 'react'
import * as Pitchfinder from "pitchfinder";
import { useAudioStore } from '@/store/useAudioStore';
import dynamic from 'next/dynamic';
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
})
interface MyPitchGraphProps{
  currentIdx: number;
}
// pitchFinder
export const MyPitchGraph = ({currentIdx}: MyPitchGraphProps) => {
  const [myPitch, setMyPitch] = useState<number | null>(null);
  const [series, setSeries] = useState([{name: "Pitch", data: [] as {x: number, y: number}[]}]);
  const detectPitchRef = useRef<ReturnType<typeof Pitchfinder.YIN> | null>(null);
  const pitchIndexRef = useRef(0); //x축 인덱스
  const options = {
    chart: {
      id: "pitch-graph",
      toolbar: { show: false },
    },
    stroke: { width: 2 },
    curve: "smooth",
    tooltip: { enabled: false },
    xaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
    grid: { yaxis: { lines: { show: false } } },
  };

  useEffect(() => {
    setSeries([{name: "Pitch", data: []}]);
    pitchIndexRef.current = 0;
  }, [currentIdx])
  useEffect(() => {
    detectPitchRef.current = Pitchfinder.YIN();//ref로 사용하도록 변경

    const interval = setInterval(() => {
      const {analyser} = useAudioStore.getState();
      if(!analyser || !detectPitchRef.current) return;

      const buffer = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(buffer);

      // RMS 계산 -> 작으면 무음으로 판단
      const rms = Math.sqrt(buffer.reduce((sum, x) => sum + x * x, 0) / buffer.length);
      if (rms < 0.01) {
        return;
      }

      const pitch = detectPitchRef.current(buffer);

      // 사람 목소리 범위 필터(80~1000Hz)
      if(pitch && pitch > 80 && pitch < 1000){
        setMyPitch(pitch);
        setSeries(prev => [{
          ...prev[0],
          data: [...prev[0].data, {x: pitchIndexRef.current++, y: pitch}]
        }])
      }
    }, 100);

    return () => clearInterval(interval);
  }, [])

  return (
    <div>
      {/* <h2 className='text-lg font-bold'>실시간 pitch</h2>
      <div className='text-2xl'>
        {myPitch ? `${myPitch.toFixed(1)}` : '---'}
      </div> */}
      {/* {myPitch ? `${myPitch.toFixed(1)}` : '---'} */}
      <ReactApexChart 
        options={options}
        series={series}
        type='line'
        height={64}/>

    </div>
  )
}
