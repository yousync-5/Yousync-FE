"use client"
import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation';
import axios from 'axios';
import { extractYoutubeVideoId } from '@/utils/extractYoutubeVideoId';
import MovieDetailModal from '@/components/modal/MovieDetailModal';
import type { TokenDetailResponse } from '@/types/pitch';

import { ActorInfo } from '@/components/actor/ActorInfo';
import { LeftSection } from '@/components/actor/LeftSection';
import { RightVideosSection } from '@/components/actor/RightVideosSection';
import { ActorMovie } from '@/types/actor';


export default function ActorPage() {
    const params = useParams<{id: string}>();
    const actorName = decodeURIComponent(params.id);
    const [movies, setMovies] = useState<ActorMovie[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<ActorMovie | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // getActorMovies 함수로 빼기
    const getActorMovies = useCallback(async () => {

        setIsLoading(true);
        try {
            const res = await axios.get<ActorMovie[]>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/actors/${actorName}`)
            setMovies(res.data);
        } catch (error) {
            console.error("영화목록 가져오기 실패", error);
        } finally {
            setIsLoading(false);
        }
    }, [actorName])

    useEffect(() => {
        if(actorName) {
            getActorMovies();

        }
    }, [actorName])

    // 유튜브 썸네일 추출 함수
    const getYoutubeThumbnail = (url: string) => {
        const match = url.match(/(?:v=|youtu.be\/)([\w-]+)/);
        return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : '';
    };

    // 영상 카드 클릭 핸들러
    const handleMovieClick = (movie: ActorMovie) => {
        setSelectedMovie(movie);
        setIsModalOpen(true);
    };

    // 모달 닫기 핸들러
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedMovie(null);
    };

    // ActorMovie를 TokenDetailResponse로 변환하는 함수
    const convertToTokenDetailResponse = (movie: ActorMovie): TokenDetailResponse => {
        const youtubeId = extractYoutubeVideoId(movie.youtube_url);
        return {
            ...movie,
            pitch: [],
            bgvoice_url: movie.s3_bgvoice_url,
            scripts: [],
            youtubeId: youtubeId || '',
        };
    };

    return (
        <div className="min-h-screen bg-neutral-950 pt-20">
            <div className="flex flex-col lg:flex-row h-screen">
                {/* 왼쪽 섹션 */}
               <LeftSection movies={movies} actorName={actorName} />
                {/* 오른쪽 영화 리스트 섹션 */}
                <RightVideosSection 
                    movies={movies} 
                    isLoading={isLoading} 
                    onMovieClick={handleMovieClick} 
                />

            </div>

            {/* MovieDetailModal */}
            {selectedMovie && (
                <MovieDetailModal
                    youtubeId={extractYoutubeVideoId(selectedMovie.youtube_url) || ''}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    tokenData={convertToTokenDetailResponse(selectedMovie)}
                />
            )}
        </div>
    );
}