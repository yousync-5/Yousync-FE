import { useRef } from "react";
import YouTube from "react-youtube";

export default function ResultPage() {
    const blueCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const redCanvasRef = useRef<HTMLCanvasElement | null>(null);
    return (
        <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6 pt-20 font-sans">
          <div className="w-full max-w-5xl">
            <div className="grid md:grid-cols-2 gap-8 items-start mb-6">
              {/* 왼쪽 : 유튜브 */}
              <div>
              <div className="relative w-full pt-[56.25%] rounded-xl overflow-hidden mb-4">
                <YouTube
                    videoId="n9xhJrPXop4"
                    className="absolute top-0 left-0 w-full h-full"
                    opts={{ width: "100%", height: "100%", playerVars: { controls: 1 } }}
                />
            </div>
              </div>
      
              {/* 오른쪽 : 그래프 */}
              <div className="space-y-4">
                <canvas ref={blueCanvasRef} className="w-full h-16 bg-gray-700 rounded" />
                <canvas ref={redCanvasRef} className="w-full h-16 bg-gray-700 rounded" />
              </div>
            </div>
      
            {/* 텍스트 스크립트 */}
            <div className="text-center text-lg h-48 overflow-y-auto space-y-2 leading-relaxed">
              <p>
                We <span className="text-red-500 font-bold">used</span> to look up at the sky and wonder...
              </p>
              <p>
                Now we just look down and <span className="text-red-500 font-bold">worry</span> about our place.
              </p>
              <p>Cooper, you were a pilot once, right?</p>
              <p>
                That’s not my <span className="text-red-500 font-bold">job</span> anymore.
              </p>
              <p>
                That’s not my <span className="text-red-500 font-bold">job</span> anymore.
              </p>
              <p>
                That’s not my <span className="text-red-500 font-bold">job</span> anymore.
              </p>
              <p>
                That’s not my <span className="text-red-500 font-bold">job</span> anymore.
              </p>
              <p>
                That’s not my <span className="text-red-500 font-bold">job</span> anymore.
              </p>
              <p>
                That’s not my <span className="text-red-500 font-bold">job</span> anymore.
              </p>

            </div>
            {/* 점수 공개 */}
            <div className="flex flex-col text-center text-2xl mt-12 space-y-4">
                <p>발음 점수 : 39점 + 억양 점수 : 50점 

                   </p>
                   <p className="text-3xl">총 <span className="text-red-500 font-bold">89점</span></p>
            </div>
               {/* 업로드 버튼 */}
          <button className="fixed bottom-12 right-12 bg-blue-500 text-white p-4 rounded-lg text-xl font-bold">
            업로드
          </button>
          </div>
       
        </div>
      );
}