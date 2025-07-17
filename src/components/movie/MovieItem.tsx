import { PlayIcon, SpeakerWaveIcon } from "@heroicons/react/24/outline";
import type { MovieItemProps } from "@/types/video";
import { useBookmark } from '@/hooks/useBookmark';
import { BookmarkIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

export default function MovieItem({
  video,
  isPlayable,
  isShorts,
  playingVideo,
  onPlay,
  onOpenModal,
  onStop,
}: MovieItemProps) {
  // 디버깅용 로그
  // console.log('MovieItem video:', video);

  // 북마크 훅 사용
  const { isLoading, isSuccess, isError, addBookmark } = useBookmark();
  // 북마크 상태를 로컬에서 관리 (true/false)
  const [bookmarked, setBookmarked] = useState(false);

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!bookmarked) {
      setBookmarked(true);
      await addBookmark(Number(video.videoId));
    } else {
      setBookmarked(false);
      // TODO: 북마크 해제 API가 있다면 여기에 추가
    }
  };

  return (
    <div
      className={`relative group/video bg-gray-900 border-2 border-gray-800 rounded-3xl overflow-hidden cursor-pointer flex-shrink-0 transition-all duration-300 scale-85 hover:scale-90 hover:border-green-500 hover:shadow-2xl ${
        isShorts ? "aspect-[9/16]" : "aspect-video"
      }`}
      style={{
        minWidth: isShorts ? "180px" : "280px",
        maxWidth: isShorts ? "180px" : "280px",
      }}
      onClick={() => {
        if (isPlayable) {
          if (onPlay) onPlay(video.videoId);
        } else {
          if (onOpenModal) onOpenModal(video.videoId);
        }
      }}
    >
      {/* 북마크 버튼 - 카드 우상단 */}
      <button
        className="absolute top-3 right-3 z-20 bg-white/80 rounded-full p-2 hover:bg-green-200 opacity-0 group-hover/video:opacity-100 transition-all"
        onClick={handleBookmarkClick}
        disabled={isLoading}
        title="북마크 추가"
      >
        <BookmarkIcon className={`w-6 h-6`} style={{ color: bookmarked ? '#22ff88' : '#9ca3af', transition: 'color 0.2s' }} />
      </button>
      {/* 유튜브 썸네일만 표시 */}
      {video.youtubeId ? (
        <img
          src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
          alt={video.actor_name}
          className="w-full h-full object-cover"
          draggable={false}
          onError={(e) => {
            // 에러 시 기본 배경으로 fallback
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : null}

      {/* 아래 카드 설명 영역(더빙/버튼 등)는 그대로 남겨둡니다 */}
      {!isShorts && (
        <div className="p-6">
          <h3 className="font-bold mb-2 text-white group-hover/video:text-green-400 transition-colors text-lg">
            {video.actor_name} 더빙
          </h3>
          <p className="text-sm text-gray-500 font-medium">
            {isPlayable
              ? "클릭해서 바로 들어보세요!"
              : "AI와 함께하는 재미있는 더빙 연습!"}
          </p>
          {isPlayable && (
            <div className="mt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (playingVideo && playingVideo === video.youtubeId) {
                    if (onStop) onStop();
                  } else {
                    if (onPlay) onPlay(video.videoId);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full text-sm font-bold hover:bg-green-700 transition-colors"
              >
                {playingVideo === video.youtubeId ? (
                  <>
                    <SpeakerWaveIcon className="w-4 h-4" />
                    재생 중...
                  </>
                ) : (
                  <>
                    <SpeakerWaveIcon className="w-4 h-4" />
                    들어보기
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}