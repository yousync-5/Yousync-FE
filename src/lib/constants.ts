// API 관련 상수
export const API_ENDPOINTS = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  TOKENS: '/tokens',
} as const;

// 애플리케이션 상수
export const APP_CONFIG = {
  NAME: 'YouSync',
  DESCRIPTION: 'AI와 함께 더빙의 재미를 발견하세요!',
  VERSION: '1.0.0',
} as const;

// UI 관련 상수
export const UI_CONSTANTS = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  TOAST_DURATION: 3000,
} as const;

// 점수 관련 상수
export const SCORE_LEVELS = {
  EXCELLENT: { min: 90, color: 'text-green-400', label: 'Excellent' },
  GOOD: { min: 80, color: 'text-yellow-400', label: 'Good' },
  FAIR: { min: 70, color: 'text-orange-400', label: 'Fair' },
  POOR: { min: 0, color: 'text-red-400', label: 'Poor' },
} as const; 