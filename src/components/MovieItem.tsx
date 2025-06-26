import { VideoType } from '@/pages'
import React, { useRef, useState } from 'react'
import YouTube from 'react-youtube';
interface MovieItemProps {
    video: VideoType;
    onVideoClick: (youtubeId: string) => void;
}
export const MovieItem = ({video, onVideoClick}: MovieItemProps) => {
    const playerRef = useRef<any>(null);
    const [isHovered, setIsHovered] = useState(false);
    // 1. 호버시 영상 재생
    const handlePlayVideo = () => {
        setIsHovered(true);
        playerRef.current.seekTo(15)
        playerRef.current?.playVideo();
    }
    const handlePauseVideo = () => {
        setIsHovered(false);
        if(playerRef.current){
            playerRef.current?.pauseVideo();
            playerRef.current.seekTo(15);
        }
    }
    const onPlayerReady = (event: any) => {
            playerRef.current = event.target;
    }
    // 2. 
  return (
    <div>
           <div key={video.youtubeId} 
              onClick={() => {onVideoClick(video.youtubeId)}} 
              className="relative rounded-xl overflow-hidden "
              onMouseEnter={handlePlayVideo}
              onMouseLeave={handlePauseVideo}
              >
                <div className='relative w-full max-w-[400px] h-[180px] mx-auto'>
                <YouTube
                        videoId={video.youtubeId}
                        className="w-full h-full block"
                        opts={{
                          width: "400",
                          height: "180",
                          playerVars: { 
                            autoplay: 0, //초기 자동재생 막기
                            mute: 1,    // 음소거 (autoplay를 브라우저가 허용하게 함)
                            controls: 0, // 컨트롤 UI숨김
                            modestbranding: 1,
                            rel: 0,
                            showinfo: 0,
                          },
                        }}
                        onReady={onPlayerReady}
                      /> 
                      {/* 클릭 막는 투명 레이어 */}
                        <div
                        onClick={() => onVideoClick(video.youtubeId)}
                        className="absolute top-0 left-0 w-full h-full z-10 cursor-pointer"
                        />
                </div>
               
                    
                {video.label && <p className="mt-2 text-sm font-semibold">{video.label}</p>}
              </div>
    </div>
  )
}
