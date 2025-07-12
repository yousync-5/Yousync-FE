import React, { useEffect, useRef } from "react";

export default function ResultComponent({ ...props }) {
  const resultRef = useRef<HTMLDivElement>(null);

  // 결과 데이터가 바뀔 때마다 자동 스크롤
  useEffect(() => {
    if (resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [finalResults, showResults, showCompleted]);

  return (
    <div ref={resultRef}>
      {/* 결과 UI */}
    </div>
  );
}
