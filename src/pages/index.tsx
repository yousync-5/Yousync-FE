import Image from "next/image";
import { useState } from "react";
import "@/styles/globals.css";
import MovieDetailModal from "@/components/MovieDetailModal";
import { MovieList } from "@/components/MovieList";

export interface VideoType {
  youtubeId: string;
  label?: string;
}
export default function Home() {
  const [selectedTab, setSelectedTab] = useState("인기 영상");
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  const tabs = ["인기 배우", "인기 영상", "미국 배우", "영국 배우", "남자 배우", "여자 배우"];
  const videoData = [
    { youtubeId: "bwylOLy5ir0", label: "" },
    { youtubeId: "n9xhJrPXop4", label: "" },
    { youtubeId: "SbXIj2T-_uk", label: "" },
    { youtubeId: "Zi88i4CpHe4", label: "" },
    { youtubeId: "XyHr-s3MfCQ", label: "" },
    { youtubeId: "V75dMMIW2B4", label: "" },
  ];
  const openModal = (youtubeId: string) => {
    setSelectedVideoId(youtubeId);
  }
  const closeModal = () => {
    setSelectedVideoId(null);
  }
  
  return (
    <div className="bg-neutral-950 min-h-screen text-white px-6 py-4 font-sans">
      

      {/* Search */}
      <div className="flex justify-center mb-6 mt-24">
        <div className="flex items-center border-2 border-white rounded-full px-4 py-2 w-full max-w-xl">
          <input
            type="text"
            placeholder="Actor검색 또는 YoutubeURL을 입력해 주세요"
            className="bg-transparent text-white outline-none w-full placeholder:text-white"
          />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
</svg>

        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-4 text-sm font-medium mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`transition-colors ${selectedTab === tab ? "text-red-500" : "text-white"}`}
            onClick={() => setSelectedTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Videos */}
      <MovieList videos={videoData} onVideoClick={openModal}/>
      
      {/* Modal */}
      {selectedVideoId 
      && <MovieDetailModal 
      youtubeId={selectedVideoId || ""}
      isOpen={selectedVideoId !== null}
       onClose={closeModal}/>}
    </div>
  );
}
