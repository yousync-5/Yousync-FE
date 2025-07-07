"use client";

import { useState, useEffect, useCallback } from "react";

export function useSessionStorage<T>(key: string, initialValue: T) {
  // 초기값 가져오기
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.sessionStorage.getItem(key);
      if (!item) return initialValue;
      
      // null, undefined 체크
      if (item === 'null' || item === 'undefined') return initialValue;
      
      // 빈 문자열 체크
      if (item === '""' || item === "''") return initialValue;
      
      // 문자열인지 JSON인지 판단
      if (item.startsWith('{') || item.startsWith('[')) {
        // JSON 객체나 배열인 경우
        try {
          const parsed = JSON.parse(item);
          return parsed;
        } catch (jsonError) {
          console.error(`Error parsing JSON for key "${key}":`, jsonError);
          return initialValue;
        }
      } else {
        // 일반 문자열인 경우
        return item as T;
      }
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error);
      // 에러 발생 시 해당 키를 삭제
      try {
        window.sessionStorage.removeItem(key);
      } catch (removeError) {
        console.error(`Error removing invalid sessionStorage key "${key}":`, removeError);
      }
      return initialValue;
    }
  });

  // 값 설정 함수
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting sessionStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // 값 제거 함수
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // 다른 탭에서의 변경사항 감지
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing sessionStorage key "${key}":`, error);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [key]);

  return [storedValue, setValue, removeValue] as const;
} 