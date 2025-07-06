import React, { useEffect, useRef, useState } from 'react'
import * as Pitchfinder from "pitchfinder";
import { useAudioStore } from '@/store/useAudioStore';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
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
  const [alertShown, setAlertShown] = useState(false);
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

  let micErrorToastId: string | undefined;

  useEffect(() => {
    setSeries([{name: "Pitch", data: []}]);
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
