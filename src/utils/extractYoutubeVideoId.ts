export function extractYoutubeVideoId(url: string){
    try {
        const parsed = new URL(url);
        if(parsed.hostname === "www.youtube.com" || parsed.hostname === "youtube.com"){
          return parsed.searchParams.get("v");
        }
        if(parsed.hostname === "youtu.be"){
          return parsed.pathname.slice(1);
        }
        return null;
      } catch {
        return null;
      }
}