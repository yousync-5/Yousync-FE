export interface PitchItem {
  movie_id: number;
  actor_id: number;
  start_time: number;
  end_time: number;
  script: string;
  translation: string;
  url: string;
  actor_pitch_values: number[]; // 서버 데이터 추가본
  time_values: number[]; // 서버 데이터 추가본
  background_audio_url: string;
  id: number;
  actor: {
    name: string;
    id: number;
  };
}

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

