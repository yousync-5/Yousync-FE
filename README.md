src/
├── 📁 app/                          # Next.js App Router - 페이지 및 라우트
│   ├── 📁 (auth)/                   # 인증 필요 라우트 그룹 - 로그인 후 접근
│   │   ├── 📁 dashboard/            # 대시보드 페이지 - 사용자 대시보드
│   │   └── 📁 profile/              # 프로필 페이지 - 사용자 프로필 관리
│   ├── 📁 (public)/                 # 공개 라우트 그룹 - 로그인 없이 접근
│   │   ├── 📁 about/                # 소개 페이지 - 서비스 소개
│   │   └── 📁 contact/              # 연락처 페이지 - 고객 지원
│   ├── 📁 api/                      # API 라우트 - 서버리스 함수
│   │   └── 📁 hello/                # Hello API 엔드포인트
│   │       └── route.ts             # Hello API 구현 - 테스트용 API
│   ├── 📁 detail/                   # 상세 페이지 라우트 - 더빙 상세
│   │   └── 📁 [id]/                 # 동적 라우트 - 영화 ID 기반
│   │       └── page.tsx             # 더빙 상세 페이지 - 실제 더빙 기능
│   ├── 📁 mypage/                   # 마이페이지 라우트 - 사용자 페이지
│   │   └── page.tsx                 # 마이페이지 - 사용자 정보 및 통계
│   ├── 📁 providers/                # Provider 컴포넌트 - 전역 상태 제공
│   │   └── QueryProvider.tsx        # React Query Provider - 서버 상태 관리
│   ├── layout.tsx                   # 루트 레이아웃 - 전체 앱 레이아웃
│   └── page.tsx                     # 홈(메인) 페이지 - 영화 리스트 메인
│
├── 📁 components/                    # 재사용 가능한 UI/기능 컴포넌트
│   ├── 📁 dubbing/                  # 더빙 관련 컴포넌트 - 더빙 기능 전용
│   │   ├── DubbingHeader.tsx        # 더빙 페이지 헤더 - 제목, 뒤로가기
│   │   ├── MiniGame.tsx             # 미니게임 컴포넌트 - 더빙 연습 게임
│   │   ├── PitchComparison.tsx      # 피치 비교 컴포넌트 - 내 피치 vs 원본
│   │   ├── ScriptContainer.tsx      # 스크립트 컨테이너 - 스크립트 관리
│   │   ├── ScriptDisplay.tsx        # 스크립트 표시 - 현재 대사 표시
│   │   ├── SlotScript.tsx           # 슬롯 스크립트 - 스크립트 슬롯
│   │   ├── VideoPlayer.tsx          # 비디오 플레이어 - 유튜브 재생
│   │   └── YoutubeVideo.tsx         # 유튜브 비디오 - 유튜브 임베드
│   ├── 📁 features/                 # 기능별 컴포넌트 - 확장 가능한 기능
│   │   ├── 📁 auth/                 # 인증 관련 컴포넌트 - 로그인/회원가입
│   │   ├── 📁 dashboard/            # 대시보드 관련 컴포넌트 - 차트/통계
│   │   └── 📁 user/                 # 사용자 관련 컴포넌트 - 프로필/설정
│   ├── 📁 forms/                    # 폼 관련 컴포넌트 - 입력 폼들 (현재 빈 폴더)
│   ├── 📁 graph/                    # 그래프 관련 컴포넌트 - 데이터 시각화
│   │   ├── MyPitchGraph.tsx         # 내 피치 그래프 - 사용자 음성 피치
│   │   └── ServerPitchGraph.tsx     # 서버 피치 그래프 - 원본 음성 피치
│   ├── 📁 layout/                   # 레이아웃 관련 컴포넌트 - 레이아웃 구성 (현재 빈 폴더)
│   ├── 📁 modal/                    # 모달 컴포넌트 - 팝업 창들
│   │   ├── ActorNameModal.tsx       # 배우 이름 모달 - 배우 정보 팝업
│   │   ├── CategoryModal.tsx        # 카테고리 모달 - 카테고리 선택 팝업
│   │   └── MovieDetailModal.tsx     # 영화 상세 모달 - 영화 정보 팝업
│   ├── 📁 movie/                    # 영화 관련 컴포넌트 - 영화 리스트/아이템
│   │   ├── Movie.tsx                # 영화 메인 컴포넌트 - 영화 리스트 메인
│   │   ├── MovieItem.tsx            # 영화 아이템 - 개별 영화 카드
│   │   └── MovieList.tsx            # 영화 리스트 - 영화 목록 표시
│   ├── 📁 mypage/                   # 마이페이지 전용 컴포넌트 - 사용자 페이지
│   │   ├── PageHeader.tsx           # 페이지 헤더 - 페이지 제목/설명
│   │   ├── RecentVideos.tsx         # 최근 영상 - 최근 플레이한 영상들
│   │   ├── ShortsGrid.tsx           # 숏츠 그리드 - 내가 만든 숏츠 목록
│   │   ├── StatsGrid.tsx            # 통계 그리드 - 사용자 통계 카드들
│   │   └── UserProfile.tsx          # 사용자 프로필 - 사용자 정보 카드
│   ├── 📁 result/                   # 결과/분석 관련 컴포넌트 - 더빙 결과 분석
│   │   ├── DetailedAnalysis.tsx     # 상세 분석 - 더빙 결과 상세 분석
│   │   ├── OverallPitchComparison.tsx # 전체 피치 비교 - 전체 피치 분석
│   │   ├── ScoreCards.tsx           # 점수 카드 - 더빙 점수 표시
│   │   ├── SentenceAnalysis.tsx     # 문장 분석 - 문장별 분석
│   │   └── TestResultAnalysisSection.tsx # 테스트 결과 분석 섹션 - 결과 섹션
│   ├── 📁 ui/                       # 공통 UI 컴포넌트 - 재사용 가능한 UI
│   │   ├── Footer.tsx               # 푸터 - 하단 네비게이션
│   │   └── NavBar.tsx               # 네비게이션 바 - 상단 네비게이션
│   └── Timer.tsx                    # 타이머 컴포넌트 - 3초 카운트다운
│
├── 📁 hooks/                        # 커스텀 훅 - 재사용 가능한 로직
│   ├── useAudioStream.ts            # 오디오 스트림 관리 - 마이크 권한/스트림
│   ├── useDebounce.ts               # 디바운스 훅 - 입력 지연 처리
│   ├── useLocalStorage.ts           # 로컬스토리지 관리 - 브라우저 저장소
│   ├── useModal.ts                  # 모달 상태 관리 - 모달 열기/닫기
│   ├── useSessionStorage.ts         # 세션스토리지 관리 - 세션 저장소
│   ├── useVideos.ts                 # 비디오 데이터 관리 - 영화 목록 API
│   └── useVoiceRecorder.ts          # 음성 녹음 관리 - 음성 녹음 기능
│
├── 📁 lib/                          # 공통 라이브러리/상수/밸리데이션
│   ├── constants.ts                 # 상수 정의 - 앱 전체 상수
│   ├── utils.ts                     # 공통 유틸리티 - 공통 함수들
│   └── validations.ts               # 유효성 검사 스키마 - 입력 검증
│
├── 📁 services/                     # API 통신/비즈니스 로직
│   └── api.ts                       # API 클라이언트 - axios 설정/인터셉터
│
├── 📁 store/                        # 전역 상태 관리 - Zustand 스토어
│   └── useAudioStore.ts             # 오디오 상태 관리 - 오디오 컨텍스트/스트림
│
├── 📁 styles/                       # 전역 및 컴포넌트별 스타일
│   ├── globals.css                  # 전역 스타일 - 전체 앱 스타일
│   └── MoreButton.css               # 더보기 버튼 스타일 - 특정 컴포넌트 스타일
│
├── 📁 types/                        # TypeScript 타입 정의
│   ├── caption.ts                   # 캡션 관련 타입 - 스크립트/자막 타입
│   ├── pitch.ts                     # 피치/더빙 관련 타입 - 음성 분석 타입
│   └── video.ts                     # 비디오/영화 관련 타입 - 영화/비디오 타입
│
└── 📁 utils/                        # 도구 함수들 - 유틸리티 함수
    ├── analytics.ts                 # 애널리틱스 유틸리티 - 사용자 행동 추적
    ├── delayPlay.ts                 # 지연 재생 유틸리티 - 오디오 지연 재생
    ├── encodeWav.ts                 # WAV 인코딩 유틸리티 - 오디오 인코딩
    ├── errorHandler.ts              # 에러 처리 유틸리티 - 에러 처리/로깅
    ├── extractYoutubeVideoId.ts     # 유튜브 비디오 ID 추출 - URL에서 ID 추출
    ├── logger.ts                    # 로깅 유틸리티 - 로그 기록/관리
    └── mergeWavBlobs.ts            # WAV 블롭 병합 유틸리티 - 오디오 파일 병합