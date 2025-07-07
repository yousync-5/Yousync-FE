import { NextRequest, NextResponse } from 'next/server';

interface GoogleLoginRequest {
  id_token: string;
}

interface AuthToken {
  access_token: string;
  token_type: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GoogleLoginRequest = await request.json();
    const { id_token } = body;

    if (!id_token) {
      return NextResponse.json(
        { detail: [{ loc: ["body", "id_token"], msg: "id_token is required", type: "missing" }] },
        { status: 422 }
      );
    }

    // TODO: 실제 구글 토큰 검증 로직 구현
    // 1. 구글 id_token 검증
    // 2. 구글 계정 정보 추출 (이메일, 이름, 프로필 사진 등)
    // 3. 기존 사용자인지 확인 (google_id 또는 email 기준)
    // 4. 신규 사용자면 회원가입, 기존 사용자면 로그인 처리
    // 5. JWT 액세스 토큰 발급

    // 임시 응답 (실제 구현 시 제거)
    const mockResponse: AuthToken = {
      access_token: "mock_jwt_token_" + Date.now(),
      token_type: "bearer"
    };

    return NextResponse.json(mockResponse, { status: 200 });

  } catch (error) {
    console.error('Google login error:', error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
} 