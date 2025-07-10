import MypageContainer from '@/components/mypage/MypageContainer';
import { dummyUser, dummyShorts, dummyRecentVideos } from '@/dummy/userDummy';

export default function MyPage() {
  return <MypageContainer user={dummyUser} shorts={dummyShorts} recentVideos={dummyRecentVideos} />;
}