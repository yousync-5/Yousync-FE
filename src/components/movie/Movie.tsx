import React from "react";
import MovieList from "@/components/movie/MovieList";
import { VideoType } from "@/type/VideoType";

interface MovieProps {
  onVideoClick: (youtubeId: string) => void;
  bestVideos: VideoType[];
  latestVideos: VideoType[];
  nowPlayingVideos: VideoType[];
  selectedVideoId?: string | number | null; 
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
