"use client";
import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  useEffect(() => {
    if (blurRef.current) {
      gsap.fromTo(
        blurRef.current,
        { yPercent: 0 },
        { 
          yPercent: -33.34, 
          duration: 15, 
          ease: "none", 
          repeat: -1 
        }
      );
    }
    if (clearRef.current) {
      gsap.fromTo(
        clearRef.current,
        { yPercent: 0 },
        { 
          yPercent: -33.34, 
          duration: 12, 
          ease: "none", 
          repeat: -1 
        }
      );
    }
  }, []);

  const renderPosterFrame = (src: string, i: number) => (
    <div className={"frame" + (!src ? " empty" : "") } key={i}>
      {src ? <img src={src} alt="" /> : null}
    </div>
  );

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
        <div className="brand-logo">
          <span className="you">You</span>
          <span className="sync">Sync</span>
        </div>
        <h1>
          Step Into the Scene.<br />
          <span className="highlight">Create Your Own Classic.</span>
        </h1>
        <p>
          YouSync와 함께하는 더빙의 새로운 경험<br />
          좋아하는 영화 장면에 당신만의 감정을 담아보세요
        </p>
        <div className="cta-section">
          <button className="main-cta" onClick={handlePlay}>
            <span className="button-text">지금 시작하기</span>
          </button>
          <div className="features">
            <div className="feature">
            </div>
            <div className="feature">
              <span>실시간 피드백</span>
            </div>
            <div className="feature">
              <span>명장면 컬렉션</span>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .doublegrid-root {
          background: linear-gradient(135deg, #0a0f0d 0%, #1a2420 50%, #0f1814 100%);
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }
        .doublegrid-blur-layer {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }
        .doublegrid-blur-wrap {
          position: absolute;
          top: 50%;
          left: 68%;
          transform: translate(-50%, -50%) rotate(-10deg);
          width: 130vw;
          height: 130vh;
          overflow: hidden;
        }
        .doublegrid-grid.blur {
          filter: blur(32px) brightness(0.35) saturate(0.8);
        }
        .doublegrid-clear-layer {
          position: fixed;
          inset: 0;
          z-index: 1;
          pointer-events: none;
        }
        .doublegrid-clear-wrap {
          position: absolute;
          top: 50%;
          left: 68%;
          transform: translate(-50%, -50%) rotate(-10deg);
          width: 130vw;
          height: 130vh;
          overflow: hidden;
        }
        .doublegrid-grid {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 200%;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.4rem;
        }
        .doublegrid-grid.clear {
          filter: brightness(0.4) blur(5px) saturate(0.95);
        }
        .frame {
          aspect-ratio: 16/9;
          width: 100%;
          height: 100%;
          border-radius: 1.2rem;
          overflow: hidden;
          background: #131e18;
          box-shadow: 0 8px 36px rgba(18, 255, 174, 0.15), 0 1.5px 4px rgba(0, 0, 0, 0.2);
        }
        .frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: brightness(0.85);
        }
        .frame.empty {
          background: linear-gradient(135deg, #1e2b25 0%, #2a3530 100%);
          border: 2px dashed rgba(0, 255, 174, 0.3);
        }
        .doublegrid-hero-text {
          position: relative;
          z-index: 3;
          max-width: 750px;
          margin-left: 7vw;
          margin-top: 8vh;
          padding: 2rem 0;
        }
        .brand-logo {
          margin-bottom: 2rem;
          font-size: 2.5rem;
          font-weight: 900;
          letter-spacing: -0.02em;
        }
        .brand-logo .you {
          color: #ffffff;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
        }
        .brand-logo .sync {
          background: linear-gradient(135deg, #00ffc3 0%, #41ffb1 50%, #0af 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 30px rgba(0, 255, 195, 0.4);
        }
        .doublegrid-hero-text h1 {
          font-size: clamp(2.5rem, 5.5vw, 4.8rem);
          font-weight: 800;
          line-height: 1.2;
          color: #ffffff;
          margin-bottom: 1.5rem;
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
        }
        .doublegrid-hero-text h1 .highlight {
          background: linear-gradient(135deg, #00ffc3 0%, #41ffb1 50%, #0af 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
        }
        .doublegrid-hero-text h1 .highlight::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #00ffc3 0%, #0af 100%);
          border-radius: 2px;
          opacity: 0.6;
        }
        .doublegrid-hero-text p {
          margin-bottom: 3rem;
          font-size: clamp(1.1rem, 2vw, 1.3rem);
          line-height: 1.8;
          color: #b8e6d3;
          text-shadow: 0 2px 10px rgba(9, 31, 23, 0.8);
          font-weight: 400;
        }
        .cta-section {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .main-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          padding: 1.3rem 3rem;
          border: none;
          border-radius: 60px;
          background: linear-gradient(135deg, #00ffc3 0%, #0af 100%);
          color: #ffffff;
          cursor: pointer;
          font-weight: 600;
          box-shadow: 
            0 4px 20px rgba(0, 255, 195, 0.25),
            0 1px 3px rgba(0, 0, 0, 0.12);
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
          overflow: hidden;
          text-shadow: none;
          align-self: flex-start;
          letter-spacing: 0.02em;
        }
        .main-cta::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .main-cta:hover::before {
          opacity: 1;
        }
        .main-cta:hover {
          transform: translateY(-1px);
          box-shadow: 
            0 8px 30px rgba(0, 255, 195, 0.35),
            0 2px 8px rgba(0, 0, 0, 0.15);
        }
        .main-cta:active {
          transform: translateY(0);
          transition: all 0.15s ease;
        }
        .button-text {
          position: relative;
          z-index: 1;
        }
        .features {
          display: flex;
          gap: 2.5rem;
          flex-wrap: wrap;
          margin-top: 0.5rem;
        }
        .feature {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          color: #a8d4be;
          font-size: 0.95rem;
          font-weight: 500;
          opacity: 0.9;
        }
        .feature-icon {
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
        }
        @media (max-width: 950px) {
          .doublegrid-blur-wrap, .doublegrid-clear-wrap {
            left: 50%;
            width: 98vw;
            height: 98vw;
          }
          .doublegrid-hero-text {
            margin-left: 5vw;
            margin-right: 5vw;
            margin-top: 6vh;
          }
          .brand-logo {
            font-size: 2rem;
          }
          .features {
            gap: 1.5rem;
          }
          .main-cta {
            font-size: 1.1rem;
            padding: 1rem 2rem;
          }
        }
        @media (max-width: 640px) {
          .doublegrid-hero-text {
            margin-left: 4vw;
            margin-right: 4vw;
          }
          .features {
            flex-direction: column;
            gap: 1rem;
          }
          .cta-section {
            gap: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}