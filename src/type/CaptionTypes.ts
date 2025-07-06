export interface CaptionState {
  currentIdx: number;
  captions: Caption[];
}

export interface Caption {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
}
