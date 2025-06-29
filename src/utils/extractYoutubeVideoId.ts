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
<<<<<<< HEAD
      } catch (error) {
=======
      } catch {
>>>>>>> e8967c84206837269296150e181637b4bc6a2d78
        return null;
      }
}