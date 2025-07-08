"use client";

import ServerPitchGraph from "@/components/graph/ServerPitchGraph";
import { MyPitchGraph } from '@/components/graph/MyPitchGraph';
import { VideoControls } from './VideoControls';
import type { Caption } from "@/types/caption";
import { Score } from "./Score";

interface PitchComparisonProps {
  currentScriptIndex: number;
  captions: Caption[];
  tokenId: string;
  serverPitchData: Array<{ time: number; hz: number | null }>;
}

export default function PitchComparison({ 
  currentScriptIndex, 
  captions, 
  tokenId, 
  serverPitchData 
}: PitchComparisonProps) {
  return (
    <div className="bg-gray-900 rounded-xl p-6 h-[28em] flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Pitch Comparison</h3>
      
      {/* 그래프 영역 */}
      <div className="space-y-4 flex-shrink-0">
        <div>
          <div className="text-sm text-gray-400 mb-2">Your Pitch</div>
          <div className="w-full h-16 bg-gray-800 rounded">
            <MyPitchGraph currentIdx={currentScriptIndex} />
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-400 mb-2">Original Pitch</div>
          <div className="w-full h-16 bg-gray-800 rounded">
            <ServerPitchGraph
              captionState={{ currentIdx: currentScriptIndex, captions: captions }}
              token_id={tokenId}
              serverPitchData={serverPitchData}
            />
          </div>
        </div>
      </div>
      
      {/* VideoControls를 중앙에 배치 */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <VideoControls />
        <Score />
      </div>


    </div>
  );
} 