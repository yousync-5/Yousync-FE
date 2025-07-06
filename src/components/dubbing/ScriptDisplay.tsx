"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

interface ScriptDisplayProps {
  captions: Array<{
    id: number;
    script: string;
    translation: string;
    start_time: number;
    end_time: number;
  }>;
  currentScriptIndex: number;
  onScriptChange: (index: number) => void;
}

export default function ScriptDisplay({ 
  captions, 
  currentScriptIndex, 
  onScriptChange 
}: ScriptDisplayProps) {
  return (
    <div className="bg-gray-900 rounded-xl p-6 w-[77em] flex flex-col relative">
      <h3 className="text-lg font-semibold mb-4">Current Script</h3>
      
      {/* Progress */}
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">
            Script {currentScriptIndex + 1} of {captions.length}
          </span>
          <div className="w-16 bg-gray-600 rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${((currentScriptIndex + 1) / captions.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-green-400 font-medium">
            {Math.round(((currentScriptIndex + 1) / captions.length) * 100)}%
          </span>
        </div>
      </div>
      
      {/* Current Script Content with Navigation */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => onScriptChange(Math.max(0, currentScriptIndex - 1))}
          disabled={currentScriptIndex === 0}
          className={`p-2 rounded-full transition-all duration-200 ${
            currentScriptIndex === 0 
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
              : 'bg-gray-700 text-green-400 hover:bg-gray-600 hover:text-green-300'
          }`}
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        
        <div className="bg-gray-800 rounded-lg p-4 flex-1">
          <div className="text-sm text-gray-400 mb-2">
            {String(Math.floor(captions[currentScriptIndex]?.start_time / 60)).padStart(2, "0")}:
            {String(Math.floor(captions[currentScriptIndex]?.start_time % 60)).padStart(2, "0")} - 
            {String(Math.floor(captions[currentScriptIndex]?.end_time / 60)).padStart(2, "0")}:
            {String(Math.floor(captions[currentScriptIndex]?.end_time % 60)).padStart(2, "0")}
          </div>
          <div className="text-white text-lg mb-2">
            &ldquo;{captions[currentScriptIndex]?.script}&rdquo;
          </div>
          <div className="text-sm text-gray-400">
            {captions[currentScriptIndex]?.translation}
          </div>
        </div>
        
        <button
          onClick={() => onScriptChange(Math.min(captions.length - 1, currentScriptIndex + 1))}
          disabled={currentScriptIndex === captions.length - 1}
          className={`p-2 rounded-full transition-all duration-200 ${
            currentScriptIndex === captions.length - 1 
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
              : 'bg-gray-700 text-green-400 hover:bg-gray-600 hover:text-green-300'
          }`}
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
} 