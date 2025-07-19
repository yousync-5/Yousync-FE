import { PlayIcon, SpeakerWaveIcon } from "@heroicons/react/24/outline";
import type { MovieItemProps } from "@/types/video";
import { useLocalBookmark } from '@/hooks/useLocalBookmark';
import { BookmarkIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';

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

  // 로컬 북마크 훅 사용
  const { isLoading, isSuccess, isError, addBookmark, removeBookmark, isBookmarked } = useLocalBookmark();
  // 북마크 상태를 로컬에서 관리 (true/false)
  const [bookmarked, setBookmarked] = useState(false);
  // 로그인 상태 확인
  const { isLoggedIn } = useUser();

  // 컴포넌트 마운트 시 북마크 상태 확인
  useEffect(() => {
    setBookmarked(isBookmarked(Number(video.videoId)));
  }, [video.videoId, isBookmarked]);

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('🔍 북마크 클릭됨:', {
      videoId: video.videoId,
      actorName: video.actor_name,
      currentBookmarked: bookmarked,
      isLoggedIn
    });
    
    try {
      if (!bookmarked) {
        // 북마크되지 않은 경우 추가
        console.log('📝 북마크 추가 시도...');
        await addBookmark(
          Number(video.videoId), 
          `${video.actor_name} 더빙`, 
          video.actor_name, 
          '액션', // 기본 카테고리
          video.youtubeId ? `https://www.youtube.com/watch?v=${video.youtubeId}` : undefined
        );
        setBookmarked(true);
        console.log(`✅ 북마크 추가 완료: ${video.actor_name} 더빙`);
        
        // 로컬스토리지 확인
        const stored = localStorage.getItem('yousync_bookmarks');
        console.log('💾 저장된 북마크 데이터:', stored ? JSON.parse(stored) : '없음');
      } else {
        // 이미 북마크된 경우 삭제
        console.log('🗑️ 북마크 제거 시도...');
        const success = await removeBookmark(Number(video.videoId));
        if (success) {
          setBookmarked(false);
          console.log(`🗑️ 북마크 제거 완료: ${video.actor_name} 더빙`);
        }
      }
    } catch (error) {
      console.error('❌ 북마크 처리 중 오류 발생:', error);
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
      {isLoggedIn && (
        <button
          className="absolute top-3 right-3 z-20 bg-white/80 rounded-full p-2 hover:bg-green-200 opacity-0 group-hover/video:opacity-100 transition-all"
          onClick={handleBookmarkClick}
          disabled={isLoading}
          title={bookmarked ? "북마크 제거" : "북마크 추가"}
        >
          <BookmarkIcon className={`w-6 h-6`} style={{ color: bookmarked ? '#22ff88' : '#9ca3af', transition: 'color 0.2s' }} />
        </button>
      )}
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