import React from 'react';
import MovieItem from './MovieItem';  // import에 중괄호 X, 기본 내보내기라면!
import { VideoType } from '@/type/VideoType';

interface VideoListProps {
  videos: VideoType[];
  onVideoClick: (youtubeId: string) => void;
}

export const MovieList = ({ videos, onVideoClick }: VideoListProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-7 max-w-7xl mx-auto py-6">
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
