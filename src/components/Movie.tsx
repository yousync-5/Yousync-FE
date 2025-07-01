// src/components/Movie.tsx
import React from "react";
import MovieList from "./MovieList";
import { VideoType } from "@/type/VideoType";

interface MovieProps {
  onVideoClick: (youtubeId: string) => void;
  // 3줄의 각 영상 배열을 props로 받음
  bestVideos: VideoType[];
  latestVideos: VideoType[];
  nowPlayingVideos: VideoType[];
}

export default function Movie({
  bestVideos,
  latestVideos,
  nowPlayingVideos,
  onVideoClick,
}: MovieProps) {
  return (
    <div className="w-full">
      <MovieList
        videos={bestVideos}
        onVideoClick={onVideoClick}
      />
      <MovieList
        videos={latestVideos}
        onVideoClick={onVideoClick}
      />
      <MovieList
        videos={nowPlayingVideos}
        onVideoClick={onVideoClick}
      />
    </div>
  );
}
