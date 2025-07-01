// import { useEffect, useState, useMemo } from "react";
// import dynamic from "next/dynamic";
// import axios from "axios";
// import { PitchItem,Caption } from "@/type/PitchdataType";

// const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });
// interface CaptionState {
//   currentIdx: number;
//   captions: Caption[];
// }

// interface ServerPitchGraphProps {
//   captionState: CaptionState;
// }

// export default function ServerPitchGraph({ captionState = { currentIdx: 0, captions: [] } }: ServerPitchGraphProps)  {
//   const { currentIdx, captions } = captionState;
//   const [pitchData, setPitchData] = useState<PitchItem[]>([]);
//   useEffect(() => {
//     console.log("[ServerPitchGraph] 전달받은 captionState:", captionState);
//   }, [captionState]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await axios.get<PitchItem[]>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tokens/${token_id}`;
//         console.log("받아온 전체 피치 데이터:", res.data);
//         setPitchData(res.data);
//       } catch (err) {
//         console.error("에러:", err);
//       }
//     };

//     fetchData();
//   }, []);

//   const currentCaption = captions[currentIdx];

//   const filteredData = useMemo(() => {
//   if (!currentCaption || pitchData.length === 0) {
//     console.warn("현재 caption이 없거나 pitch 데이터가 없습니다.");
//     return [];
//   }

//   const pitchItem = pitchData[0];  // 서버에서 내려온 데이터는 배열이므로 [0]번째 항목 사용
//   const { start_time: totalStart, end_time: totalEnd, actor_pitch_values } = pitchItem;

//   // 전체 시간 길이를 피치값 개수로 나누어 간격(interval) 계산
//   const totalDuration = totalEnd - totalStart;
//   const interval = totalDuration / actor_pitch_values.length;

//   const captionStart = currentCaption.start_time;
//   const captionEnd = currentCaption.end_time;

//   // 결과 배열
//   const result: { x: number; y: number }[] = [];

//   actor_pitch_values.forEach((pitch_hz, index) => {
//     const currentTime = totalStart + interval * index;

//     // 현재 caption 범위 안에 있는 값들만 선택
//     if (currentTime >= captionStart && currentTime <= captionEnd) {
//       result.push({
//         x: currentTime - captionStart,  // 상대적 시간으로
//         y: pitch_hz,
//       });
//     }
//   });

//   return result;
// }, [pitchData, currentCaption]);



//   useEffect(() => {
//     console.log("그래프 데이터(filteredData):", filteredData);
//   }, [filteredData]);

//   const series = [
//     {
//       name: "Pitch (Hz)",
//       data: filteredData,
//     },
//   ];

//   const options = {
//     chart: {
//       id: "pitch-graph",
//       toolbar: { show: false },
//     },
//     stroke: {
//       width: 2,
//     },
//     tooltip:{
//         enabled: false,
//     },

//     xaxis: {
//       labels: { show: false },
//       axisBorder: { show: false },
//       axisTicks: { show: false },
//     },
//     yaxis: {
//       tickAmount: 0,
//       labels: { show: false },
//       axisTicks: { show: false },
//       axisBorder: { show: false },
//     },
//     grid: {
//       yaxis: { lines: { show: false } },
//     },
//     annotations: {
//       yaxis: [
//         {
//           y: 330,
//           borderColor: "rgba(255, 255, 255, 0.3)",
//           borderWidth: 1,
//         },
//       ],
//     },
//   };

//   return (
//     <ApexChart
//       options={options}
//       series={series}
//       type="line"
//       height={70}
//     />
//   );
// }
