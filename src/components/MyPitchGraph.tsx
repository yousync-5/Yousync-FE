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
      id: "realtime-pitch",
      animations: {
        enabled: true,
        easing: "linear",
        dynamicAnimation: {speed: 100},
      },
      toolbar: {show: false},
      zoom: {enabled: false},

      //padding 추가
      // offsetY: 0, // 위로 조금 올리기
    },
    xaxis: {
      labels: {show: false},
      type: "numeric" as const,
      axisTicks: {
        show: false,
      },
      // axisBorder : {
      //   show: false,
      // }
    },
    yaxis: {
      min: 70, 
      max: 500, 
      tickAmount: 0,
      labels: {show: false},
      axisTicks: {show: false},
      axisBorder: {show: false},
    },
    grid: {
      xaxis: {
        lines: {show: false},
      },
      yaxis: {
        lines: {show: false},
      },
    },
    stroke: {curve: "smooth" as const, width: 2},
    annotations: {
      yaxis: [
        {
          y: 330,
          borderColor: "rgba(50, 205, 50, 0,3)",
          borderWidth: 1,
          strokeDashArray: 0,
        }
      ]
    }
  }
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
