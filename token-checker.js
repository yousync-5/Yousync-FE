// 구글 토큰 확인 유틸리티 스크립트
// 브라우저 콘솔에서 실행하세요

function checkGoogleTokens() {
  console.log('=== 구글 토큰 정보 ===');
  
  // LocalStorage에서 토큰들 확인
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
  
  console.log('========================');
}

// 토큰 디코딩 (JWT 토큰인 경우)
function decodeToken(token) {
  if (!token) return null;
  
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.log('토큰 디코딩 실패:', e);
    return null;
  }
}

// 토큰 상세 정보 확인
function checkTokenDetails() {
  const accessToken = localStorage.getItem('access_token');
  if (accessToken) {
    console.log('=== Access Token 상세 정보 ===');
    const decoded = decodeToken(accessToken);
    if (decoded) {
      console.log('토큰 페이로드:', decoded);
      if (decoded.exp) {
        const expiryDate = new Date(decoded.exp * 1000);
        console.log('JWT 만료 시간:', expiryDate.toLocaleString());
      }
    }
  }
}

// 실행
checkGoogleTokens();
checkTokenDetails(); 