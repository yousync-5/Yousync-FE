export interface Caption {
  movie_id: number;
  actor_id: number;
  start_time: number;
  end_time: number;
  script: string;
  translation: string;
  url: string | null;
  actor_pitch_values: number[];
  background_audio_url: string;
  id: number;
  actor: {
    name: string;
    id: number;
  };
}

export interface CaptionState {
  currentIdx: number;
  captions: Caption[];
}
