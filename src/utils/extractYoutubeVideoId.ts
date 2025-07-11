//아해완료
export const extractYoutubeVideoId = (url: string): string | null => {
    const match = url.match(/(?:v=|youtu.be\/)([\w-]+)/);
    return match ? match[1] : null;
};

export const getYoutubeThumbnail = (url: string) => {
    const match = url.match(/(?:v=|youtu.be\/)([\w-]+)/);
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : '';
};