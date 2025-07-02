// import React, { useState } from "react";
// import { FaAngleLeft, FaAngleRight } from "react-icons/fa";

// interface SliderItem {
//   id: number | string;
//   youtubeId: string;
//   date?: string;
//   rating?: number;
// }

// interface SliderProps {
//   items: SliderItem[];
//   onCardClick?: (id: number | string) => void;
// }

// export default function Slider({ items, onCardClick }: SliderProps) {
//   const [page, setPage] = useState(0); // 0 or 1

//   const totalPages = 2;
//   const cardsPerPage = Math.ceil(items.length / totalPages);

//   const goPrev = () => setPage((prev) => (prev === 0 ? 1 : 0));
//   const goNext = () => setPage((prev) => (prev === 1 ? 0 : 1));

//   const visibleItems = items.slice(
//     page * cardsPerPage,
//     Math.min((page + 1) * cardsPerPage, items.length)
//   );

//   return (
//     <section className="w-full bg-black py-6 px-0 select-none">
//       {/* 페이지 인디케이터 */}
//       <div className="flex items-center justify-end w-full px-6 mb-3">
//         <div className="flex items-center gap-1">
//           {[0, 1].map((i) => (
//             <span
//               key={i}
//               className={`w-4 h-1 rounded transition-all duration-200 mr-1 ${
//                 i === page ? "bg-white" : "bg-gray-500"
//               }`}
//             />
//           ))}
//         </div>
//       </div>
//       {/* 카드 리스트 */}
//       <div className="relative flex items-center px-4">
//         <button
//           onClick={goPrev}
//           className="z-10 absolute left-0 bg-black/40 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center text-2xl text-white"
//         >
//           <FaAngleLeft />
//         </button>
//         <div className="w-full flex gap-6 justify-center overflow-hidden">
//           {visibleItems.map((item) => (
//             <div
//               key={item.id}
//               className="
//                 group relative bg-black rounded-lg overflow-hidden cursor-pointer 
//                 aspect-[16/9] min-w-[180px] max-w-[280px] w-full transition-all duration-200 
//                 hover:scale-105 z-0 hover:z-50
//               "
//               onClick={() => onCardClick?.(item.id)}
//             >
//               <img
//                 src={`https://img.youtube.com/vi/${item.youtubeId}/mqdefault.jpg`}
//                 className="object-cover w-full h-full pointer-events-none"
//                 draggable={false}
//                 alt=""
//               />
//               <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end">
//                 <div className="p-4">
//                   {item.date && (
//                     <div className="text-xs text-green-400">{item.date}</div>
//                   )}
//                   {item.rating !== undefined && (
//                     <div className="text-xs text-yellow-300">{item.rating}</div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//         <button
//           onClick={goNext}
//           className="z-10 absolute right-0 bg-black/40 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center text-2xl text-white"
//         >
//           <FaAngleRight />
//         </button>
//       </div>
//     </section>
//   );
// }
