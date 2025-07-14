import React, { useEffect, useRef } from "react";

interface LiquidGaugeProps {
  value?: number; // 0~100, undefined 허용
  size?: number; // px
}

const LiquidGauge: React.FC<LiquidGaugeProps> = ({ value = 33, size = 80 }) => {
  const waveRef = useRef<SVGPathElement>(null);

  // 물결 애니메이션 효과
  useEffect(() => {
    let frame = 0;
    let anim: number;
    function animate() {
      frame++;
      if (waveRef.current) {
        // 진폭 20, 속도 빠르게
        waveRef.current.setAttribute(
          "transform",
          `translate(${Math.sin(frame / 8) * 20},0)`
        );
      }
      anim = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(anim);
  }, []);

  // value(0~100)에 따라 물 높이 계산
  const percent = Math.max(0, Math.min(100, Number(value) || 0));
  const waveHeight = size * (1 - percent / 100);

  return (
    <div className="absolute bottom-[17em] left-1/2 -translate-x-1/2 z-10">
      {/* LiquidGauge 컴포넌트 전체 코드 */}
      <div className="mx-auto mt-70" style={{ width: 80 }}>
        <svg width={80} height={80} viewBox="0 0 80 80">
          {/* 하얀색 반투명 원 + 그림자 */}
          <circle
            cx={40}
            cy={40}
            r={36}
            fill="rgba(255,255,255,0.7)"
            stroke="#e0e7ef"
            strokeWidth="4"
            style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.10))" }}
          />
          {/* 액체(물결) */}
          <clipPath id="liquid-clip">
            <circle cx={40} cy={40} r={36} />
          </clipPath>
          <g clipPath="url(#liquid-clip)">
            <path
              d={`
                M 0 ${waveHeight + 10}
                Q 20 ${waveHeight - 10}, 40 ${waveHeight + 10}
                T 80 ${waveHeight + 10}
                V 80
                H 0
                Z
              `}
              fill="url(#green-gradient)"
              style={{ transition: "d 0.7s cubic-bezier(.4,2,.6,1)" }}
            />
          </g>
          {/* 그라데이션 */}
          <defs>
            <linearGradient id="green-gradient" x1="0" y1="0" x2="0" y2={80} gradientUnits="userSpaceOnUse">
              <stop stopColor="#22ff88" />
              <stop offset="1" stopColor="#10b981" />
            </linearGradient>
          </defs>
          {/* 텍스트 */}
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dy=".3em"
            fontSize={22}
            fill="#e5e7eb"
            fontWeight={700}
            style={{ textShadow: "0 1px 4px #222" }}
          >
            {percent}%
          </text>
        </svg>
      </div>
    </div>
  );
};

export default LiquidGauge;