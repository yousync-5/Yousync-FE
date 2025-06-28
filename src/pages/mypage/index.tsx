import React, { useState } from 'react'
import YouTube from 'react-youtube'
import { FaArrowRight, FaFilter} from 'react-icons/fa'
import { CategoryModal } from '@/components/CategoryModal'

export default function ProfilePage() {
  const shortIds = [
    'Xp6CXF-Cesg', 'QYh6mYIJG2Y', '3fumBcKC6RE', 'fJ9rUzIMcZQ',
    'dQw4w9WgXcQ', 'kXYiU_JCYtU', 'hTWKbfoikeg', 'eVTXPUF4Oz4'
  ]
  const videoIds = ['M7lc1UVf-VE', 'E7wJTI-1dvQ', 'ScMzIvxBSi4']

  const [currentShortIndex, setCurrentShortIndex] = useState(0)
  const [isActorModalOpen, setIsActorModalOpen] = useState(false)
  const shortsToShow = shortIds.slice(currentShortIndex, currentShortIndex + 4)
  const canNext = currentShortIndex + 4 < shortIds.length

  const handleNextShort = () => {
    if (canNext) setCurrentShortIndex(currentShortIndex + 4)
    else setCurrentShortIndex(0)
  }

  const handleActorModalOpen = () => {
    setIsActorModalOpen(true)
  }

  const handleActorModalClose = () => {
    setIsActorModalOpen(false)
  }

  const optsShort = {
    height: '260',
    width: '140',
    playerVars: { autoplay: 0 },
  }
  const optsVideo = {
    height: '180',
    width: '320',
    playerVars: { autoplay: 0 },
  }

  return (
    <div className="bg-neutral-900 min-h-screen">
      <div
        className="flex flex-col items-center justify-center"
        style={{
          minHeight: 'calc(100vh - 64px)',
          paddingTop: '64px',
        }}
      >
        <div className="flex w-full max-w-6xl gap-8 mb-12 justify-center">
          <button
            className="flex flex-col justify-center items-center w-80 h-80 bg-neutral-600 rounded-3xl text-4xl font-bold shadow-lg transition-colors cursor-pointer"
          >
          </button>

          {/* 숏츠 리스트 컨테이너 */}
          <div className="relative flex-1 flex items-center gap-4 bg-neutral-800 rounded-2xl px-8 py-6 shadow-lg justify-center">
            {/* 우측 상단 모달 오픈 아이콘 */}
            <button
              onClick={handleActorModalOpen}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
            >
              <FaFilter />
            </button>

            <div className="flex gap-4">
              {shortsToShow.map((id) => (
                <div
                  key={id}
                  className="rounded-xl overflow-hidden bg-black flex flex-col items-center shadow-md"
                  style={{ width: 140, height: 260 }}
                >
                  <YouTube videoId={id} opts={optsShort} />
                </div>
              ))}
            </div>
            <button
              onClick={handleNextShort}
              className="ml-4 w-12 h-12 flex items-center justify-center rounded-full bg-neutral-700 hover:bg-neutral-600 transition"
            >
              <FaArrowRight className="text-2xl" />
            </button>
          </div>
        </div>

        {/* 하단: 일반 유튜브 영상 */}
        <div className="w-full max-w-6xl flex justify-center">
          <div className="grid grid-cols-3 gap-8">
            {videoIds.map((videoId) => (
              <div
                key={videoId}
                className="relative rounded-2xl overflow-hidden bg-black shadow-lg group"
                style={{ width: 320, height: 180 }}
              >
                <YouTube videoId={videoId} opts={optsVideo} />
                {/* 유튜브 플레이 버튼 느낌 */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black/50 rounded-full p-3">
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CategoryModal 
        isOpen={isActorModalOpen} 
        onClose={handleActorModalClose} 
      />
    </div>
  )
}