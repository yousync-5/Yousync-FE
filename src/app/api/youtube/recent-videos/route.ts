import { NextRequest, NextResponse } from 'next/server';

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: string;
  duration: string;
  categoryId: string;
}

interface RecentVideosResponse {
  videos: YouTubeVideo[];
  nextPageToken?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('인증 토큰이 없습니다.');
      return NextResponse.json(
        { error: '인증 토큰이 필요합니다.' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.replace('Bearer ', '');
    const searchParams = request.nextUrl.searchParams;
    const maxResults = searchParams.get('maxResults') || '10';
    const pageToken = searchParams.get('pageToken') || '';

    // YouTube API 키 확인
    const apiKey = process.env.NEXT_PUBLIC_YT_API_KEY;
    if (!apiKey) {
      console.error('YouTube API 키가 설정되지 않았습니다.');
      return NextResponse.json(
        { error: 'YouTube API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    console.log('YouTube API 요청 시작...');
    console.log('API Key:', apiKey ? '설정됨' : '없음');
    console.log('Access Token:', accessToken ? '있음' : '없음');

    // YouTube Data API v3를 사용하여 최근 시청한 영상 가져오기
    const url = new URL('https://www.googleapis.com/youtube/v3/activities');
    url.searchParams.set('part', 'snippet,contentDetails');
    url.searchParams.set('mine', 'true');
    url.searchParams.set('maxResults', maxResults);
    url.searchParams.set('key', apiKey);
    
    if (pageToken) {
      url.searchParams.set('pageToken', pageToken);
    }

    console.log('요청 URL:', url.toString());

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    console.log('YouTube API 응답 상태:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '응답 파싱 실패' }));
      console.error('YouTube API Error:', errorData);
      console.error('응답 상태:', response.status);
      console.error('응답 헤더:', Object.fromEntries(response.headers.entries()));
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: '유효하지 않은 액세스 토큰입니다. YouTube API 권한을 확인해주세요.' },
          { status: 401 }
        );
      }
      
      if (response.status === 403) {
        return NextResponse.json(
          { error: 'YouTube API 접근 권한이 없습니다. YouTube Data API v3가 활성화되어 있는지 확인해주세요.' },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'YouTube API 요청 실패',
          details: errorData,
          status: response.status
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('YouTube API 응답 데이터:', data);
    
    // 활동에서 영상 정보 추출
    const videos: YouTubeVideo[] = [];
    
    for (const item of data.items || []) {
      if (item.snippet.type === 'watch') {
        const videoId = item.contentDetails?.watch?.videoId;
        if (videoId) {
          // 개별 영상 정보 가져오기
          const videoInfo = await getVideoInfo(videoId, accessToken, apiKey);
          if (videoInfo) {
            videos.push(videoInfo);
          }
        }
      }
    }

    const result: RecentVideosResponse = {
      videos,
      nextPageToken: data.nextPageToken,
    };

    console.log('최종 결과:', result);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Recent videos API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', details: error instanceof Error ? error.message : '알 수 없는 오류' },
      { status: 500 }
    );
  }
}

async function getVideoInfo(videoId: string, accessToken: string, apiKey: string): Promise<YouTubeVideo | null> {
  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${apiKey}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Video info fetch failed for ${videoId}:`, response.status);
      return null;
    }

    const data = await response.json();
    const item = data.items?.[0];
    
    if (!item) {
      console.error(`Video not found: ${videoId}`);
      return null;
    }

    return {
      id: item.id,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || '',
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      viewCount: item.statistics?.viewCount || '0',
      duration: item.contentDetails?.duration || '',
      categoryId: item.snippet.categoryId,
    };
  } catch (error) {
    console.error('Video info fetch error:', error);
    return null;
  }
} 