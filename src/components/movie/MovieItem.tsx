import { PlayIcon, SpeakerWaveIcon } from "@heroicons/react/24/outline";
import type { MovieItemProps } from "@/types/video";
import { useBookmark } from '@/hooks/useBookmark';
import { BookmarkIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';

export default function MovieItem({
  video,
  isPlayable,
  isShorts,
  playingVideo,
  onPlay,
  onOpenModal,
  onStop,
}: MovieItemProps) {
  // 북마크 훅 사용
  const { isLoading, isSuccess, isError, addBookmark, removeBookmark, getBookmarks, isLoggedIn } = useBookmark();
  // 북마크 상태를 로컬에서 관리 (true/false)
  const [bookmarked, setBookmarked] = useState(false);

  // 컴포넌트 마운트 시 북마크 상태 확인
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      // 로그인 상태 확인 후 북마크 조회
      if (isLoggedIn()) {
        try {
          const bookmarks = await getBookmarks();
          const isBookmarked = bookmarks.some(bookmark => bookmark.token_id === Number(video.videoId));
          setBookmarked(isBookmarked);
        } catch (error) {
          // 에러 발생 시 북마크 상태를 false로 설정하고 조용히 실패
          setBookmarked(false);
          console.error('북마크 상태 확인 실패:', error);
        }
      } else {
        // 로그인되지 않은 경우 북마크 상태 초기화
        setBookmarked(false);
      }
    };

    // 로그인 상태일 때만 북마크 상태 확인
    if (isLoggedIn()) {
      checkBookmarkStatus();
    } else {
      setBookmarked(false);
    }
  }, [video.videoId, isLoggedIn]);

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // 로그인 상태 확인
    if (!isLoggedIn()) {
      alert('북마크 기능은 로그인 후 이용 가능합니다.');
      return;
    }
    
    try {
      if (!bookmarked) {
        // 북마크되지 않은 경우 추가 API 호출
        await addBookmark(Number(video.videoId));
        setBookmarked(true);
      } else {
        // 이미 북마크된 경우 삭제 API 호출
        const success = await removeBookmark(Number(video.videoId));
        if (success) {
          setBookmarked(false);
        }
      }
    } catch (error) {
      console.error('북마크 처리 중 오류 발생:', error);
    }
  };

  return (
    <div
      className={`relative group/video bg-gray-900 border-2 border-gray-800 rounded-3xl overflow-hidden cursor-pointer flex-shrink-0 transition-all duration-300 hover:scale-105 hover:border-green-500 hover:shadow-2xl ${
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
        title={isLoggedIn() ? (bookmarked ? "북마크 삭제" : "북마크 추가") : "로그인 필요"}
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