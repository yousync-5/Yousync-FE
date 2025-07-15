import { NextRequest, NextResponse } from 'next/server';
import { backendApi } from '@/services/api';

// DELETE - 특정 북마크 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { tokenId: string } }
) {
  try {
    const tokenId = parseInt(params.tokenId);
    
    if (isNaN(tokenId)) {
      return NextResponse.json(
        { error: '유효하지 않은 token_id입니다.' },
        { status: 400 }
      );
    }
    
    await backendApi.delete(`/mypage/bookmarks/${tokenId}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('북마크 삭제 실패:', error);
    return NextResponse.json(
      { error: '북마크 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
} 