"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { PitchItem } from "@/type/PitchdataType";
import { CaptionState } from "@/type/CaptionTypes";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });


interface ServerPitchGraphProps {
  captionState: CaptionState;
}

export default function ServerPitchGraph({ captionState }: ServerPitchGraphProps) {
  const [pitchData, setPitchData] = useState<PitchItem[]>([]);

  
  useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await axios.get<PitchItem[]>("http://127.0.0.1:5000/api/pitch");
      setPitchData(res.data);
    } catch (err) {
      console.error("에러:", err);
    }
  };

  fetchData();
}, []);


let graphData: { x: number; y: number }[] = [];

if (pitchData.length > 0 && pitchData[0].time_values) {
  const item = pitchData[0];
  graphData = item.actor_pitch_values.map((pitch, index) => ({
    x: item.time_values[index],
    y: pitch,
  }));
}

const series = [
  {
    name: "Pitch",
    data: graphData,
  },
];

const options = {
  chart: {
    id: "pitch-graph",
    toolbar: { show: false }
  },
  stroke: {
    width: 2
  },

  xaxis: {
    title: { text: "" },
    labels: { show: false },
    axisBorder: { show: false }, 
    axisTicks: { show: false }, 
  },
  yaxis: {
    tickAmount: 0,
    labels: { show: false },
    axisTicks: { show: false },
    axisBorder: { show: false }
},
grid: {
  yaxis: {
    lines: { show: false }
  }
},
annotations: {
  yaxis: [
    {
      y: 330,
      borderColor: "rgba(255, 255, 255, 0.3)",
      borderWidth: 1,                         
      strokeDashArray: 0
    }
  ]
}

};

return (
    <ApexChart
      options={options}
      series={series}
      type="line"
      height={70}
    />
  )
}