import { NextRequest, NextResponse } from 'next/server';
import { backendApi } from '@/services/api';

// GET - 북마크 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '20';
    const offset = searchParams.get('offset') || '0';
    
    const response = await backendApi.get(`/mypage/bookmarks/?limit=${limit}&offset=${offset}`);
    return NextResponse.json(response);
  } catch (error) {
    console.error('북마크 목록 조회 실패:', error);
    return NextResponse.json(
      { error: '북마크 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST - 북마크 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token_id } = body;
    
    if (!token_id) {
      return NextResponse.json(
        { error: 'token_id가 필요합니다.' },
        { status: 400 }
      );
    }
    
    const response = await backendApi.post('/mypage/bookmarks', { token_id });
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('북마크 생성 실패:', error);
    return NextResponse.json(
      { error: '북마크 추가에 실패했습니다.' },
      { status: 500 }
    );
  }
} 