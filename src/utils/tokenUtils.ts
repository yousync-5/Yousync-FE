// 토큰 관리 유틸리티

export function isTokenExpired(): boolean {
  const expiresAt = localStorage.getItem('expires_at');
  if (!expiresAt) return true;
  return Date.now() > Number(expiresAt);
}

export function getAccessToken(): string | null {
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  
  // 토큰이 만료되었으면 제거
  if (isTokenExpired()) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('expires_at');
    return null;
  }
  
  return token;
}

export function setAccessToken(token: string, expiresIn: number = 3600): void {
  localStorage.setItem('access_token', token);
  const expiresAt = Date.now() + (expiresIn * 1000);
  localStorage.setItem('expires_at', String(expiresAt));
}

export function clearTokens(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('expires_at');
  localStorage.removeItem('google_user');
}

export async function testToken(token: string): Promise<boolean> {
  try {
    console.log('토큰 테스트 시작...');
    
    // 먼저 Google User Info API로 토큰 유효성 확인
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    console.log('User Info API 응답:', userInfoResponse.status, userInfoResponse.statusText);
    
    if (!userInfoResponse.ok) {
      const errorData = await userInfoResponse.json();
      console.error('User Info API 에러:', errorData);
      return false;
    }
    
    const userData = await userInfoResponse.json();
    console.log('사용자 정보:', userData);
    
    // YouTube API 테스트
    const youtubeResponse = await fetch('/api/youtube/recent-videos?maxResults=1', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    console.log('YouTube API 응답:', youtubeResponse.status, youtubeResponse.statusText);
    
    if (!youtubeResponse.ok) {
      const errorData = await youtubeResponse.json();
      console.error('YouTube API 에러:', errorData);
      return false;
    }
    
    console.log('토큰 테스트 성공!');
    return true;
  } catch (error) {
    console.error('토큰 테스트 실패:', error);
    return false;
  }
}

// 토큰 진단 함수
export async function diagnoseToken(token: string): Promise<{
  isValid: boolean;
  userInfo?: unknown;
  youtubeError?: unknown;
  error?: string;
}> {
  try {
    console.log('토큰 진단 시작...');
    
    // 1. Google User Info API 테스트
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!userInfoResponse.ok) {
      const errorData = await userInfoResponse.json();
      return {
        isValid: false,
        error: `Google 인증 실패: ${errorData.error || userInfoResponse.statusText}`,
      };
    }
    
    const userData = await userInfoResponse.json();
    console.log('사용자 정보 확인됨:', userData);
    
    // 2. YouTube API 테스트
    const youtubeResponse = await fetch('/api/youtube/recent-videos?maxResults=1', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!youtubeResponse.ok) {
      const errorData = await youtubeResponse.json();
      return {
        isValid: false,
        userInfo: userData,
        youtubeError: errorData,
        error: `YouTube API 접근 실패: ${errorData.error || youtubeResponse.statusText}`,
      };
    }
    
    return {
      isValid: true,
      userInfo: userData,
    };
    
  } catch (error) {
    console.error('토큰 진단 실패:', error);
    return {
      isValid: false,
      error: `진단 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
    };
  }
} 