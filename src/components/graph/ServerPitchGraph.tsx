import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { Caption } from "@/type/PitchdataType";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface CaptionState {
  currentIdx: number;
  captions: Caption[];
}

interface ServerPitch {
  time: number;
  hz: number | null;
}

interface TokenDetailResponse {
  pitch: ServerPitch[];
}

interface ServerPitchGraphProps {
  captionState: CaptionState;
  token_id: number; 
}

export default function ServerPitchGraph({
  captionState = { currentIdx: 0, captions: [] },
  token_id,
}: ServerPitchGraphProps) {
  const { currentIdx, captions } = captionState;
  const [pitch, setPitch] = useState<ServerPitch[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get<TokenDetailResponse>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/tokens/${token_id}`
        );
        setPitch(res.data.pitch || []);
        console.log("서버 피치 데이터 : ", res.data.pitch);
      } catch (err) {
        console.error("서버 피치 데이터 불러오기 에러:", err);
      }
    };

    fetchData();
  }, [token_id]);

  // 자막 구간에 해당하는 피치데이터만 필터링 (x축: caption 구간 내 상대시간)
  const filteredData = useMemo(() => {
    if (!captions.length || pitch.length === 0) return [];
    const currentCaption = captions[currentIdx];
    if (!currentCaption) return [];

    return pitch
      .filter(
        (p) =>
          p.hz !== null &&
          p.time >= currentCaption.start_time &&
          p.time <= currentCaption.end_time
      )
      .map((p) => ({
        x: p.time - currentCaption.start_time, // caption 구간 내 상대시간
        y: p.hz !== null && p.hz !== undefined ? p.hz : 0,
      }));
  }, [pitch, captions, currentIdx]);

  const series = [
    {
      name: "Pitch (Hz)",
      data: filteredData,
    },
  ];

  const options = {
    chart: {
      id: "pitch-graph",
      toolbar: { show: false },
    },
    stroke: { width: 2 },
    tooltip: { enabled: false },
    xaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
    grid: { yaxis: { lines: { show: false } } },
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
