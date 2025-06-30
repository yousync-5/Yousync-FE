import { useEffect, useState, useMemo, useLayoutEffect } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  currentIdx: number;
  captions: {
    start_time: number;
    end_time: number;
  }[];
}

interface PitchItem {
  time_sec: number;
  pitch_hz: number;
}

interface ServerResponse {
  actor_pitch_values: PitchItem[];
}

export default function ServerPitchGraph({ currentIdx, captions }: Props) {
  const [pitchValues, setPitchValues] = useState<PitchItem[]>([]);

  useEffect(() => {
    const fetchPitch = async () => {
      try {
        const res = await axios.get<ServerResponse[]>("http://127.0.0.1:5000/api/pitch");
        const data = res.data?.[0]?.actor_pitch_values ?? [];
        setPitchValues(data);
      } catch (err) {
        console.error("피치 데이터 불러오기 실패:", err);
      }
    };
    fetchPitch();
  }, []);

  const currentCaption = captions[currentIdx];
  const start_time = currentCaption?.start_time ?? 0;
  const end_time = currentCaption?.end_time ?? 0;

  const filteredData = useMemo(() => {
    return pitchValues
      .filter((p) => p.time_sec >= start_time && p.time_sec <= end_time)
      .map((p) => ({ x: p.time_sec, y: p.pitch_hz }));
  }, [pitchValues, start_time, end_time]);

  useLayoutEffect(() => {
    ApexCharts.exec("pitch-graph", "updateOptions", {
      xaxis: {
        min: start_time,
        max: end_time,
      },
    }, false); // 그래프 강제 변환. 
  }, [start_time, end_time]);

  const series = [
    {
      name: "Pitch (Hz)",
      data: filteredData,
    },
  ];

  const options = {
    chart: { id: "pitch-graph", toolbar: { show: false } },
    stroke: { width: 2, curve: "straight" as const },
    xaxis: {
      min: start_time,
      max: end_time,
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false },
    },
    yaxis: {
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false },
      tickAmount: 0,
    },
    grid: {
      yaxis: { lines: { show: false } },
    },
    legend: { show: false },
  };

  return (
    <ApexChart
      options={options}
      series={series}
      type="line"
      height={70}
    />
  );
}
