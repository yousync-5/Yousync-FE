"use client";

import YouTube from "react-youtube";

interface VideoPlayerProps {
  videoId: string;
}

export default function VideoPlayer({ videoId }: VideoPlayerProps) {
  return (
    <div className="bg-black rounded-xl overflow-hidden">
      <div className="relative w-full pt-[56.25%]">
        <YouTube
          videoId={videoId}
          className="absolute top-0 left-0 w-full h-full"
          opts={{
            width: "100%",
            height: "100%",
            playerVars: {
              autoplay: 0,
              controls: 1,
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
            },
          }}
        />
      </div>
    </div>
  );
} 