import { create } from 'zustand';

interface JobIdsState {
  multiJobIds: string[];
  setMultiJobIds: (ids: string[]) => void;
}

export const useJobIdsStore = create<JobIdsState>((set) => ({
  multiJobIds: [],
  setMultiJobIds: (ids) => set({ multiJobIds: ids }),
})); 