import React from 'react';
import { MovieItem } from './MovieItem';
import { VideoType } from '@/type/VideoType';

interface VideoListProps {
  videos: VideoType[];
  onVideoClick: (youtubeId: string) => void;
}

export const MovieList = ({ videos, onVideoClick }: VideoListProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {videos.map((video) => (
        <MovieItem
          key={video.youtubeId}
          video={video}
          onVideoClick={() => onVideoClick(video.youtubeId)}
        />
      ))}
    </div>
  );
};