import { useState, useEffect, useRef } from "react";
import YouTube, { YouTubeEvent } from "react-youtube";
import { motion, AnimatePresence } from "framer-motion";

export interface Caption {
  start_time: number;
  end_time: number;
  script: string;
}

const API_URL = "https://yousync-fastapi-production.up.railway.app/tokens/13";
const toMMSS = (t: number) =>
  `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

export default function FixedTokenPage() {
  const playerRef = useRef<YT.Player | null>(null);
  const [ready, setReady] = useState(false);
  const [sec, setSec] = useState(0);
  const [videoId, setVideoId] = useState<string>("");
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        const id = data.youtube_url?.split("v=")[1]?.split("&")[0] ?? "";
        setVideoId(id);
        setCaptions(data.scripts || []);
      });
  }, []);

  const onReady = (e: YouTubeEvent) => {
    playerRef.current = e.target;
    setReady(true);
  };

  useEffect(() => {
    if (!ready) return;
    const id = setInterval(() => setSec(playerRef.current?.getCurrentTime() ?? 0), 200);
    return () => clearInterval(id);
  }, [ready]);

  useEffect(() => {
    let idx = captions.findIndex((c) => sec >= c.start_time && sec < c.end_time);
    if (idx === -1 && captions.length > 0) {
      for (let i = 0; i < captions.length; i++) {
        const isLast = i === captions.length - 1;
        if (
          sec >= captions[i].end_time &&
          (isLast || sec < captions[i + 1].start_time)
        ) {
          idx = i;
          break;
        }
      }
    }
    setActiveIdx(idx);
  }, [sec, captions]);

  // 자막 5줄 출력
  const lines: (Caption | null)[] = [];
  for (let offset = -2; offset <= 2; offset++) {
    const idx = activeIdx + offset;
    lines.push(idx >= 0 && idx < captions.length ? captions[idx] : null);
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#1a1333] via-[#22223b] to-[#171720] text-white">
      <header className="flex h-16 items-center justify-between px-10 bg-neutral-900/80 backdrop-blur-md z-10">
        <span className="font-bold tracking-tight text-purple-300 drop-shadow">🎬 Fixed Token Demo</span>
        <span className="text-xs text-white/50">Demo mode</span>
      </header>
      <main className="flex flex-1 flex-col lg:flex-row gap-10 p-10 lg:py-14">
        {/* 영상 */}
        <section className="flex-[7] flex items-center justify-center">
          <div className="relative w-full max-w-3xl aspect-video bg-gradient-to-tr from-purple-700/30 to-indigo-700/30 overflow-hidden">
            {videoId && (
              <YouTube
                videoId={videoId}
                opts={{ width: "100%", height: "100%" }}
                onReady={onReady}
                className="absolute inset-0"
                iframeClassName="absolute inset-0 w-full h-full object-cover bg-black"
              />
            )}
          </div>
        </section>
        {/* 중앙 고정 5줄 */}
        <aside className="flex-[5] flex items-center justify-center">
          <div className="w-full relative flex items-center" style={{ height: 280 }}>
            {/* 윗줄 2개 */}
            <div className="absolute left-0 w-full flex flex-col items-center" style={{ top: 0 }}>
              {[0, 1].map(i =>
                lines[i] ? (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.28 }}
                    className="text-gray-400 blur-sm text-lg font-medium max-w-3xl text-center"
                    style={{ minHeight: 34, marginTop: i === 1 ? 2 : 0 }}
                  >
                    {lines[i]?.script}
                  </motion.div>
                ) : (
                  <div key={i} style={{ minHeight: 34 }} />
                )
              )}
            </div>
            {/* 중앙(고정) 자막 */}
            <div className="absolute left-0 right-0 flex flex-col items-center"
                 style={{ top: "50%", transform: "translateY(-50%)" }}>
              {lines[2] && (
<motion.div
  key="center"
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{
    opacity: 1,
    scale: 1.08,
  }}
  exit={{ opacity: 0, scale: 0.98 }}
  transition={{ duration: 0.36 }}
  className="
    text-2xl font-extrabold
    text-[#fffde0]      
    px-5 py-2
    max-w-3xl
    text-center
  "
  style={{
    textShadow: "0 0 8px #be8cff, 0 0 18px #be8cff, 0 0 32px #be8cff", // 연보라색 빛 효과만!
    minHeight: 44,
  }}
>
  {lines[2].script}
</motion.div>

              )}
            </div>
            {/* 아랫줄 2개 */}
            <div className="absolute left-0 w-full flex flex-col items-center" style={{ bottom: 0 }}>
              {[3, 4].map(i =>
                lines[i] ? (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.28 }}
                    className="text-gray-400 blur-sm text-lg font-medium max-w-3xl text-center"
                    style={{ minHeight: 34, marginTop: 2 }}
                  >
                    {lines[i]?.script}
                  </motion.div>
                ) : (
                  <div key={i} style={{ minHeight: 34 }} />
                )
              )}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
