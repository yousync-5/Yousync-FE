
# YouSync
유싱크는 실시간 분석서버와 연동된 온라인 더빙 웹 프로젝트입니다.  
실시간으로 분석하며 sync를 맞춰보세요!


## **2. 프로젝트 구조 섹션**
```markdown
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트 (YouTube 프록시, 오디오 프록시)
│   ├── dubbing/           # 더빙 페이지
│   ├── duetdubbing/       # 듀엣 더빙 페이지
│   └── ...
├── components/            # UI 컴포넌트
│   ├── dubbing/          # 더빙 관련 컴포넌트
│   ├── result/           # 결과 표시 컴포넌트
│   ├── graph/            # 피치 그래프 컴포넌트
│   └── ...
├── hooks/                # 커스텀 훅
├── services/             # API 서비스
├── store/                # Zustand 상태 관리
└── utils/                # 유틸리티 함수
```


## 🛠️ 기술 스택
### Frontend
<img width="3291" height="2135" alt="fe_stazck" src="https://github.com/user-attachments/assets/d6cba2b9-3161-4cc2-b830-9e4e369f01f0" />

### Backend Integration
<img width="3291" height="2135" alt="Backend   Integration" src="https://github.com/user-attachments/assets/f8e68137-201c-4d30-9db6-d5f056d93085" />


### 성능 개선
<img width="3291" height="2135" alt="스크린샷 2025-07-24 오후 8 35 38" src="https://github.com/user-attachments/assets/3c334bb8-1a63-4f81-8aeb-b0d1e13f6070" />


### 오디오 녹음 문제
마이크 권한이 거부된 경우 브라우저 설정에서 권한을 허용해주세요.
