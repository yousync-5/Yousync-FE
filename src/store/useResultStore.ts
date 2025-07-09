// store/useResultStore.ts
import { create } from 'zustand'

interface WordAnalysis {
  word: string;
  text_status: 'fail' | 'pass';
  mfcc_similarity: number;
  word_score: number;
}

interface Summary {
  text_accuracy: number;
  mfcc_average: number;
  total_words: number;
  passed_words: number;
}

export interface PitchResult {
  overall_score: number;
  summary: Summary;
  word_analysis: WordAnalysis[];
}

interface ResultStore {
  finalResults: PitchResult[];
  setFinalResults: (results: PitchResult[] | ((prev: PitchResult[]) => PitchResult[])) => void;
}

export const useResultStore = create<ResultStore>((set) => ({
  finalResults: [],
  setFinalResults: (results) =>
    set((state) => ({
      finalResults: typeof results === 'function' ? results(state.finalResults) : results,
    })),
}));
