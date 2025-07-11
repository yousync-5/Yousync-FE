import React from 'react'
import { ActorMovie } from '@/types/actor'

interface ActorInfoProps {
  movies: ActorMovie[];
  actorName: string;
}

export const ActorInfo: React.FC<ActorInfoProps> = ({ movies, actorName }) => {
  return (
    <div className="h-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 lg:p-8 border-t border-gray-700">
        <div className="text-white">
            <h2 className="text-2xl lg:text-3xl font-bold mb-6 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                배우 정보
            </h2>
            <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <span className="text-emerald-400 font-medium min-w-[60px]">이름:</span>
                    <span className="text-white font-medium">{actorName}</span>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <span className="text-emerald-400 font-medium min-w-[60px]">영화 수:</span>
                    <span className="text-white font-medium">{movies.length}개</span>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <span className="text-emerald-400 font-medium min-w-[60px]">카테고리:</span>
                    <span className="text-white font-medium">
                        {movies.length > 0 ? movies[0].category : 'N/A'}
                    </span>
                </div>
            </div>
        </div>
    </div>
  )
}
