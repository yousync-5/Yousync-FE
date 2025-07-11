"use client"
import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation';
import axios from 'axios';
import { extractYoutubeVideoId } from '@/utils/extractYoutubeVideoId';
import MovieDetailModal from '@/components/modal/MovieDetailModal';
import type { TokenDetailResponse } from '@/types/pitch';

interface ActorMovie {
    token_name: string;
    actor_name: string;
    category: string;
    start_time: number;
    end_time: number;
    s3_textgrid_url: string;
    s3_pitch_url: string;
    s3_bgvoice_url: string;
    youtube_url: string;
    view_count: number;
    id: number;
}

export default function ActorPage() {
    const params = useParams<{id: string}>();
    const actorName = decodeURIComponent(params.id);
    const [movies, setMovies] = useState<ActorMovie[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<ActorMovie | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchActorMovies = useCallback(async () => {
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
            fetchActorMovies();
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
        <div className="min-h-screen bg-neutral-950 pb-10">
            {/* Hero Banner */}
            {movies.length > 0 && (
                <div className="relative h-[60vh] min-h-[400px] mb-12">
                    {/* 유튜브 썸네일 배경 */}
                    <img
                        src={getYoutubeThumbnail(movies[0].youtube_url)}
                        alt="배너 배경"
                        className="w-full h-full object-cover object-center absolute inset-0"
                        style={{ filter: 'brightness(1)' }}
                    />
                    {/* 어두운 오버레이 */}
                    <div className="absolute inset-0 bg-black/60"></div>
                    <div className="relative z-10 h-full flex items-center justify-start">
                        <div className="max-w-2xl px-12 text-left">
                            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg">
                                {actorName.split(' ').map((word, idx) => (
                                    <span key={idx}>
                                        {word}
                                        <br />
                                    </span>
                                ))}
                            </h1>
                        </div>
                    </div>
                    {/* 하단 그라데이션 */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent"></div>
                </div>
            )}
            <div className="px-4">
                {isLoading && <div className="text-center text-gray-400">로딩중...</div>}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                    {movies.map(movie => (
                        <div
                            key={movie.id}
                            className="bg-gray-900 border-2 border-gray-800 rounded-xl overflow-hidden shadow-lg hover:border-green-500 transition-all duration-300 flex flex-col cursor-pointer"
                            onClick={() => handleMovieClick(movie)}
                        >
                            <img
                                src={getYoutubeThumbnail(movie.youtube_url)}
                                alt={movie.token_name}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="text-lg font-bold text-white mb-1">{movie.token_name}</div>
                                <div className="text-sm text-gray-400 mb-2">{movie.category}</div>
                                <div className="text-xs text-gray-500 mb-2">조회수 {movie.view_count}</div>
                            </div>
                        </div>
                    ))}
                </div>
                {(!isLoading && movies.length === 0) && (
                    <div className="text-center text-gray-400 mt-12">등록된 영상이 없습니다.</div>
                )}
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