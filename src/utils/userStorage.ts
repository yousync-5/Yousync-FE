/**
 * 회원별 localStorage 관리 유틸리티
 */

// 회원별 스토리지 키 생성
export const getUserStorageKey = (baseKey: string, userId?: string | number) => {
  const userIdStr = userId?.toString();
  return userIdStr ? `${baseKey}_user_${userIdStr}` : `${baseKey}_guest`;
};

// 회원별 데이터 저장
export const setUserData = <T>(baseKey: string, data: T, userId?: string | number) => {
  try {
    const key = getUserStorageKey(baseKey, userId);
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`✅ 회원별 데이터 저장 완료: ${key}`, data);
    return true;
  } catch (error) {
    console.error(`❌ 회원별 데이터 저장 실패: ${baseKey}`, error);
    return false;
  }
};

// 회원별 데이터 가져오기
export const getUserData = <T>(baseKey: string, userId?: string | number): T | null => {
  try {
    const key = getUserStorageKey(baseKey, userId);
    const stored = localStorage.getItem(key);
    if (stored) {
      const data = JSON.parse(stored);
      console.log(`✅ 회원별 데이터 로드 완료: ${key}`, data);
      return data;
    }
    return null;
  } catch (error) {
    console.error(`❌ 회원별 데이터 로드 실패: ${baseKey}`, error);
    return null;
  }
};

// 회원별 데이터 삭제
export const removeUserData = (baseKey: string, userId?: string | number) => {
  try {
    const key = getUserStorageKey(baseKey, userId);
    localStorage.removeItem(key);
    console.log(`🗑️ 회원별 데이터 삭제 완료: ${key}`);
    return true;
  } catch (error) {
    console.error(`❌ 회원별 데이터 삭제 실패: ${baseKey}`, error);
    return false;
  }
};

// 모든 회원 데이터 가져오기 (관리자용)
export const getAllUserData = <T>(baseKey: string): Record<string, T> => {
  const allData: Record<string, T> = {};
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(baseKey)) {
        const stored = localStorage.getItem(key);
        if (stored) {
          const data = JSON.parse(stored);
          allData[key] = data;
        }
      }
    }
    console.log(`📊 모든 회원 데이터 로드 완료: ${baseKey}`, allData);
    return allData;
  } catch (error) {
    console.error(`❌ 모든 회원 데이터 로드 실패: ${baseKey}`, error);
    return {};
  }
};

// 특정 회원의 모든 데이터 삭제
export const clearUserAllData = (userId: string | number) => {
  try {
    const userIdStr = userId.toString();
    const keysToRemove: string[] = [];
    
    // 해당 회원의 모든 키 찾기
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes(`_user_${userIdStr}`)) {
        keysToRemove.push(key);
      }
    }
    
    // 키들 삭제
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🗑️ 회원 데이터 삭제: ${key}`);
    });
    
    console.log(`✅ 회원 ${userIdStr}의 모든 데이터 삭제 완료`);
    return true;
  } catch (error) {
    console.error(`❌ 회원 데이터 삭제 실패: ${userId}`, error);
    return false;
  }
};

// 사용 예시
export const USER_STORAGE_KEYS = {
  BOOKMARKS: 'yousync_bookmarks',
  SETTINGS: 'yousync_settings',
  HISTORY: 'yousync_history',
  PREFERENCES: 'yousync_preferences'
} as const; 