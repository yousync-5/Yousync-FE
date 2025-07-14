"use client";
import React, { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";  // 추가

interface MainStartButtonProps {
  onPlay?: () => void;
}

const posters = [
  "",
  "https://image.tmdb.org/t/p/w500/6b7swg6DLqXCO3XUsMnv6EhdpsE.jpg",
  "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
  "",
  "https://image.tmdb.org/t/p/w500/hziiv14OpD73u9gAak4XDDfBKa2.jpg",
  "",
  "https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg",
  "",
  "https://image.tmdb.org/t/p/w500/5K7cOHoay2mZusSLezBOY0Qxh8a.jpg",
];

export default function DoubleGridBlurSlider({ onPlay }: MainStartButtonProps) {
  const blurRef = useRef(null);
  const clearRef = useRef(null);
  const router = useRouter(); // 추가

  useLayoutEffect(() => {
    if (blurRef.current) {
      gsap.fromTo(
        blurRef.current,
        { yPercent: 0 },
        { yPercent: -33.34, duration: 10, ease: "none", repeat: -1 }
      );
    }
    if (clearRef.current) {
      gsap.fromTo(
        clearRef.current,
        { yPercent: 0 },
        { yPercent: -33.34, duration: 7, ease: "none", repeat: -1 }
      );
    }
  }, []);

  const renderPosterFrame = (src: string, i: number) => (
    <div className={"frame" + (!src ? " empty" : "") } key={i}>
      {src ? <img src={src} alt="" /> : null}
    </div>
  );

  // 버튼 클릭 시 /home으로 이동
  const handlePlay = () => {
    if (onPlay) {
      onPlay();
    } else {
      router.push("/home");
    }
  };

  return (
    <div className="doublegrid-root">
      {/* 뒤쪽 흐릿한 블러 슬라이드 */}
      <div className="doublegrid-blur-layer">
        <div className="doublegrid-blur-wrap">
          <div className="doublegrid-grid blur" ref={blurRef}>
            {posters.map(renderPosterFrame)}
          </div>
        </div>
      </div>
      {/* 위쪽(앞) 선명(약간 흐릿) 슬라이드 */}
      <div className="doublegrid-clear-layer">
        <div className="doublegrid-clear-wrap">
          <div className="doublegrid-grid clear" ref={clearRef}>
            {posters.map(renderPosterFrame)}
          </div>
        </div>
      </div>
      {/* 텍스트/버튼 (항상 선명) */}
      <div className="doublegrid-hero-text">
        <h1>
          Scenes you&apos;ve only watched.<br />
          now,<br />
          reenact them yourself.
        </h1>
        <p>
          YouSyck is a place where anyone,<br />
          can easily and enjoyably recreate iconic scenes!
        </p>
        <button onClick={handlePlay}>Let&apos;s Run!</button>
      </div>
      <style>{`
        .doublegrid-root {
          background:#0f1814;min-height:100vh;position:relative;
        }
        .doublegrid-blur-layer {
          position:fixed;inset:0;z-index:0;pointer-events:none;
        }
        .doublegrid-blur-wrap {
          position:absolute;top:50%;left:68%;
          transform:translate(-50%,-50%) rotate(-10deg);
          width:130vw;height:130vh;overflow:hidden;
        }
        .doublegrid-grid.blur {
          filter: blur(24px) brightness(0.58) saturate(0.65);
        }
        .doublegrid-clear-layer {
          position:fixed;inset:0;z-index:1;pointer-events:none;
        }
        .doublegrid-clear-wrap {
          position:absolute;top:50%;left:68%;
          transform:translate(-50%,-50%) rotate(-10deg);
          width:130vw;height:130vh;overflow:hidden;
        }
        .doublegrid-grid {
          position:absolute;top:0;left:0;width:100%;height:200%;
          display:grid;grid-template-columns:repeat(3,1fr);gap:1.4rem;
        }
        .doublegrid-grid.clear {
          filter: brightness(0.50) blur(3.2px) saturate(0.88);
        }
        .frame {
          transform:rotate(10deg);border-radius:1.2rem;overflow:hidden;
          background:#131e18;box-shadow:0 8px 36px #12ffae2e,0 1.5px 4px #0003;
        }
        .frame img {
          width:100%;height:100%;object-fit:cover;display:block;
          filter:brightness(0.91);
        }
        .frame.empty {
          background: #1e2b25;
          border: 2px dashed #00ffae55;
        }
        .frame:hover img, .frame:focus-visible img {
          filter:brightness(1.13);
        }
        .doublegrid-hero-text{
          position:relative;z-index:3;max-width:700px;margin-left:7vw;margin-top:13vh;
        }
        .doublegrid-hero-text h1{
          font-size:clamp(2.8rem,6vw,5.2rem);font-weight:900;line-height:1.13;
          background:linear-gradient(92deg,#41ffb1 40%,#00ffc3 80%);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;
        }
        .doublegrid-hero-text p{
          margin-top:2.1rem;font-size:clamp(1.15rem,2vw,1.36rem);line-height:1.7;color:#dbfff1;
          text-shadow:0 2px 10px #091f17cc;
        }
        .doublegrid-hero-text button{
          margin-top:2.8rem;font-size:1.2rem;padding:1rem 2.7rem;border:none;border-radius:2.6rem;
          background:linear-gradient(90deg,#0af 0%,#18e7b5 100%);
          color:#fff;cursor:pointer;font-weight:900;
          box-shadow:0 5px 18px #00ffcb44,0 1.2px 3px #0004;
          transition:background .15s,transform .12s;
        }
        .doublegrid-hero-text button:hover{
          background:linear-gradient(90deg,#18e7b5 0%,#0af 100%);
        }
        @media (max-width: 950px) {
          .doublegrid-blur-wrap,.doublegrid-clear-wrap{left:50%;width:98vw;height:98vw;}
          .doublegrid-hero-text{margin-left:3vw;}
        }
      `}</style>
    </div>
  );
}
