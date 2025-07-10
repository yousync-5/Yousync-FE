import type { User } from "@/types/user";
import type { Short } from "@/components/mypage/ShortsGrid";
import type { RecentVideo } from "@/components/mypage/RecentVideos";

const aespaWhiplashThumb = "https://img.youtube.com/vi/s0ZmPBgJvWk/hqdefault.jpg";

export const dummyUser: User = {
  name: "msms804",
  email: "yuna@email.com",
  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  level: 15,
  totalPlays: 127,
};

export const dummyShorts: Short[] = [
  {
    id: 1,
    title: "킹스맨 명장면",
    thumb: aespaWhiplashThumb,
    date: "2024-07-08",
    views: 1000,
  },
  {
    id: 2,
    title: "테이큰 명대사",
    thumb: aespaWhiplashThumb,
    date: "2024-07-07",
    views: 800,
  },
    {
    id: 3,
    title: "테이큰 명대사",
    thumb: aespaWhiplashThumb,
    date: "2024-07-07",
    views: 800,
  },
  {
    id: 4,
    title: "인셉션 명장면",
    thumb: aespaWhiplashThumb,
    date: "2024-07-06",
    views: 1200,
  },
];

export const dummyShortsV2 = [
  { id: 1, title: "인셉션 명장면 더빙", thumb: aespaWhiplashThumb, date: "2024-07-01", views: 1240 },
  { id: 2, title: "타이타닉 감정연기", thumb: aespaWhiplashThumb, date: "2024-07-02", views: 892 },
  { id: 3, title: "어벤져스 명대사", thumb: aespaWhiplashThumb, date: "2024-07-03", views: 2156 },
  { id: 4, title: "인터스텔라 명장면", thumb: aespaWhiplashThumb, date: "2024-07-04", views: 567 },
];

export const dummyRecentVideos: RecentVideo[] = [
  {
    id: 1,
    title: "터미네이터 연습",
    actor: "아놀드 슈왈제네거",
    thumb: aespaWhiplashThumb,
    date: "2024-07-06",
    score: 95,
  },
  {
    id: 2,
    title: "킹스맨 연습",
    actor: "콜린 퍼스",
    thumb: aespaWhiplashThumb,
    date: "2024-07-05",
    score: 88,
  },
  {
    id: 3,
    title: "내가 왕이 될 상인가",
    actor: "콜린 퍼스",
    thumb: aespaWhiplashThumb,
    date: "2024-07-05",
    score: 88,
  },
  {
    id: 4,
    title: "Happy Birthday, Harry",
    actor: "콜린 퍼스",
    thumb: aespaWhiplashThumb,
    date: "2024-07-05",
    score: 88,
  },
];