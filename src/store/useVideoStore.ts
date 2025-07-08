import { create } from 'zustand';

interface VideoStore {
    isPlaying: boolean;
    videoRef: React.RefObject<YT.Player | HTMLVideoElement | null>;
    currentTime: number;
    showThumbnail: boolean;
    isLoading: boolean;

    // Actions
    setIsPlaying: (playing: boolean) => void;
    setVideoRef: (ref: React.RefObject<YT.Player | HTMLVideoElement | null>) => void;
    setShowThumbnail: (show: boolean) => void;
    setIsLoading: (loading: boolean) => void;
    play: () => void;
    pause: () => void;
    togglePlay: () => void;
}

export const useVideoStore = create<VideoStore>((set, get) => ({
    // State
    isPlaying: false,
    videoRef: { current: null },
    currentTime: 0,
    showThumbnail: true,
    isLoading: false,

    // Actions
    setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),
    
    setVideoRef: (ref: React.RefObject<YT.Player | HTMLVideoElement | null>) => set({ videoRef: ref }),
    
    setShowThumbnail: (show: boolean) => set({ showThumbnail: show }),
    
    setIsLoading: (loading: boolean) => set({ isLoading: loading }),
    
    play: () => {
        const { videoRef } = get();
        if (videoRef?.current) {
            if (typeof (videoRef.current as any).playVideo === 'function') {
                (videoRef.current as YT.Player).playVideo();
            } else if (typeof (videoRef.current as any).play === 'function') {
                (videoRef.current as HTMLVideoElement).play();
            }
            set({ isPlaying: true });
        }
    },
    
    pause: () => {
        const { videoRef } = get();
        if (videoRef?.current) {
            if (typeof (videoRef.current as any).pauseVideo === 'function') {
                (videoRef.current as YT.Player).pauseVideo();
            } else if (typeof (videoRef.current as any).pause === 'function') {
                (videoRef.current as HTMLVideoElement).pause();
            }
            set({ isPlaying: false });
        }
    },
    
    togglePlay: () => {
        const { isPlaying, play, pause } = get();
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    },
}));

