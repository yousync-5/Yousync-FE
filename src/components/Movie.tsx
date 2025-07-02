import React from "react";
import MovieList from "./MovieList";
import { VideoType } from "@/type/VideoType";

interface MovieProps {
  onVideoClick: (youtubeId: string) => void;
  bestVideos: VideoType[];
  latestVideos: VideoType[];
  nowPlayingVideos: VideoType[];
  selectedVideoId?: string | number | null; // ⭐ 추가!
}

export default function Movie({
  bestVideos,
  latestVideos,
  nowPlayingVideos,
  onVideoClick,
  selectedVideoId,
}: MovieProps) {
  return (
    <div className="w-full">
      <MovieList
        videos={bestVideos}
        onVideoClick={onVideoClick}
        selectedVideoId={selectedVideoId}
      />
      <MovieList
        videos={latestVideos}
        onVideoClick={onVideoClick}
        selectedVideoId={selectedVideoId}
      />
      <MovieList
        videos={nowPlayingVideos}
        onVideoClick={onVideoClick}
        selectedVideoId={selectedVideoId}
      />
    </div>
  );
}
