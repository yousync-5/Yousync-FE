import React, { useState } from "react";

export default function FadeVideo() {
  const [BgVideoIndex, setBgVideoIndex] = useState(0);

  const videos = [
    "/taken_001.mp4",
    "/terminator_001.mp4",
  ];

  const handleEnded = () => {
    if (BgVideoIndex < videos.length - 1) {
      setBgVideoIndex((prev) => prev + 1);
    }
    // 마지막 영상에서는 아무 동작 없음 (멈춤)
  };

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#000" }}>
      <video
        key={BgVideoIndex}
        src={videos[BgVideoIndex]}
        style={{ maxWidth: "100%", maxHeight: "100%" }}
        autoPlay
        playsInline
        controls
        onEnded={handleEnded}
      />
    </div>
  );
} 