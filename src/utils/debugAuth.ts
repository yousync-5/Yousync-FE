import { diagnoseToken } from '@/utils/tokenUtils';

// 인증 디버깅 유틸리티

export function debugAuth() {
  console.log('=== 인증 디버깅 정보 ===');
  
  // LocalStorage 토큰 확인
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  const expiresAt = localStorage.getItem('expires_at');
  const googleUser = localStorage.getItem('google_user');
  
  console.log('Access Token:', accessToken ? '✅ 존재함' : '❌ 없음');
  if (accessToken) {
    console.log('Access Token 길이:', accessToken.length);
    console.log('Access Token (처음 20자):', accessToken.substring(0, 20) + '...');
  }
  
  console.log('Refresh Token:', refreshToken ? '✅ 존재함' : '❌ 없음');
  if (refreshToken) {
    console.log('Refresh Token 길이:', refreshToken.length);
    console.log('Refresh Token (처음 20자):', refreshToken.substring(0, 20) + '...');
  }
  
  if (expiresAt) {
    const expiryDate = new Date(Number(expiresAt));
    const now = new Date();
    const isExpired = now > expiryDate;
    console.log('만료 시간:', expiryDate.toLocaleString());
    console.log('토큰 상태:', isExpired ? '❌ 만료됨' : '✅ 유효함');
  }
  
  if (googleUser) {
    try {
      const user = JSON.parse(googleUser);
      console.log('구글 사용자 정보:', user);
    } catch (e) {
      console.log('구글 사용자 정보 파싱 실패');
    }
  }
  
  // 환경 변수 확인
  console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
  console.log('Google Client ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? '✅ 설정됨' : '❌ 없음');
  
  console.log('========================');
}

// 토큰 유효성 테스트
export async function testToken() {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    console.log('❌ 토큰이 없습니다');
    return;
  }
  
  try {
    console.log('🔍 토큰 유효성 테스트 중...');
    
    // 토큰 진단 실행
    const diagnosis = await diagnoseToken(accessToken);
    
    if (diagnosis.isValid) {
      console.log('✅ 토큰이 유효합니다!');
      console.log('사용자 정보:', diagnosis.userInfo);
    } else {
      console.log('❌ 토큰이 유효하지 않습니다');
      console.log('오류:', diagnosis.error);
      if (diagnosis.youtubeError) {
        console.log('YouTube API 오류:', diagnosis.youtubeError);
      }
    }
    
  } catch (error) {
    console.error('토큰 테스트 중 오류:', error);
  }
}

// 브라우저 콘솔에서 실행할 수 있는 함수들
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).debugAuth = debugAuth;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).testToken = testToken;
} 