# 🧠 NEXUS 프로젝트 전체 구조 및 기능 정리

## 📋 프로젝트 개요

**NEXUS**는 리그 오브 레전드(LoL) 사용자들을 위한 **내전 관리 및 전적 분석 커뮤니티 플랫폼**입니다.

---

## 🏗️ 기술 스택

### Frontend

- **React 19** + **TypeScript**
- **Zustand** (상태 관리)
- **TailwindCSS** (스타일링)
- **React Router DOM** (라우팅)
- **Socket.IO Client** (실시간 통신)
- **Axios** (HTTP 클라이언트)
- **Lucide React** (아이콘)
- **date-fns** (날짜 처리)

### Backend

- **Node.js** + **Express**
- **PostgreSQL** (메인 데이터베이스)
- **Redis** (캐싱/세션)
- **Socket.IO** (실시간 통신)
- **Passport.js** (OAuth 인증)
- **JWT** (토큰 인증)
- **Riot API** (게임 데이터)

---

## 🎯 주요 기능별 정리

### 1. 🔐 인증 시스템

- **OAuth**: Discord, Google 로그인
- **JWT 토큰** 기반 인증
- **자동 로그인** 및 토큰 갱신
- **보호된 라우트** 시스템
- **토큰 존재 여부 확인** 로직으로 불필요한 API 호출 방지

### 2. 🎮 내전(Custom Game) 시스템

- **내전방 생성/참가**
- **팀 구성 방식**: 경매/가위바위보/없음
- **팀장 선출** 시스템
- **라인 선택** 및 밴픽
- **Riot 토너먼트 API** 연동
- **실시간 게임 진행** 관리

### 3. 📊 전적 분석

- **Riot API** 연동으로 전적 수집
- **일반 게임** + **내전 게임** 전적 통합
- **op.gg 스타일** 전적 카드
- **승률, KDA, 라인별 성과** 분석
- **모스트 챔피언** 통계

### 4. 💬 커뮤니티 기능

- **친구 시스템**: 추가/삭제/차단
- **실시간 DM** 채팅
- **커뮤니티 게시판**
- **사용자 평가** 시스템
- **통합된 친구 패널**: 친구 목록과 메시지 기능을 하나로 통합

### 5. 📺 스트리머 기능

- **스트리머 등록** 및 관리
- **방송 정보** 표시 (Twitch, YouTube, Afreeca)
- **실시간 시청자 수** 및 방송 상태

### 6. 🔍 검색 및 프로필

- **Riot ID 검색**
- **사용자 프로필** 관리
- **티어 정보** 연동
- **주 라인/모스트 챔피언** 설정

---

## 🏗️ 프로젝트 구조

### Frontend (`src/`)

```
src/
├── components/
│   ├── Auth/           # 인증 관련
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── OAuthCallback.tsx
│   │   └── AuthCallback.tsx
│   ├── CustomGame/     # 내전 시스템
│   │   ├── CustomGameList.tsx
│   │   ├── CustomGameDetail.tsx
│   │   ├── CreateCustomGameModal.tsx
│   │   ├── TeamFormation.tsx
│   │   ├── AuctionSystem.tsx
│   │   ├── RockPaperScissors.tsx
│   │   ├── LineSelection.tsx
│   │   ├── TeamLeaderElection.tsx
│   │   ├── TournamentBracket.tsx
│   │   └── GameChat.tsx
│   ├── MyPage/         # 마이페이지
│   │   ├── MyPage.tsx
│   │   ├── UserProfile.tsx
│   │   ├── MatchHistory.tsx
│   │   ├── MatchCard.tsx
│   │   ├── FriendList.tsx
│   │   ├── MessagePanel.tsx
│   │   └── StreamerInfo.tsx
│   ├── Community/      # 커뮤니티
│   │   └── CommunityPage.tsx
│   ├── Streamer/       # 스트리머
│   │   ├── StreamerList.tsx
│   │   ├── StreamerProfile.tsx
│   │   └── RegisterStreamerModal.tsx
│   ├── Layout/         # 레이아웃
│   │   ├── MainLayout.tsx      # 메인 레이아웃 (사이드바 + 메인 콘텐츠)
│   │   ├── Sidebar.tsx         # 사이드바 네비게이션
│   │   ├── FriendsPanel.tsx    # 통합된 친구 패널 (친구 + 메시지)
│   │   └── DMPanel.tsx
│   ├── Home/           # 홈페이지
│   │   └── HomePage.tsx
│   ├── Search/         # 검색
│   │   └── SearchPage.tsx
│   ├── Messages/       # 메시지
│   │   └── MessagesPage.tsx
│   ├── Friends/        # 친구
│   │   └── FriendsList.tsx
│   ├── Feedback/       # 피드백
│   │   └── FeedbackModal.tsx
│   ├── UserEvaluation/ # 사용자 평가
│   │   └── UserEvaluationModal.tsx
│   └── common/         # 공통 컴포넌트
│       ├── Avatar.tsx
│       ├── ThemeProvider.tsx
│       └── ThemeToggle.tsx
├── services/           # API 서비스
│   ├── api.ts          # API 클라이언트 (토큰 확인 로직 포함)
│   ├── riotApi.ts
│   └── socket.ts
├── store/              # Zustand 상태 관리
│   └── useAppStore.ts
├── types/              # TypeScript 타입 정의
│   └── index.ts
├── hooks/              # 커스텀 훅
│   └── useTheme.ts     # 테마 관리 (data-theme 속성 사용)
└── App.tsx             # 메인 앱 컴포넌트 (테마 초기화 포함)
```

### Backend (`backend/src/`)

```
backend/src/
├── routes/             # API 라우트
│   ├── auth.js         # 인증
│   ├── users.js        # 사용자 관리
│   ├── customGames.js  # 내전
│   ├── matches.js      # 전적
│   ├── friends.js      # 친구
│   ├── chat.js         # 채팅
│   ├── community.js    # 커뮤니티
│   ├── streamers.js    # 스트리머
│   ├── tournaments.js  # 토너먼트
│   ├── riotApi.js      # Riot API
│   └── feedback.js     # 피드백
├── config/             # 설정 파일
│   ├── database.js
│   ├── redis.js
│   ├── passport.js
│   └── socket.js
├── database/           # DB 초기화/마이그레이션
│   ├── init.js
│   ├── migrate.js
│   └── seed.js
├── middleware/         # 미들웨어
│   └── rateLimit.js
└── server.js           # 메인 서버 파일
```

---

## 🚀 주요 API 엔드포인트

### 인증

- `POST /auth/login` - 로그인
- `POST /auth/register` - 회원가입
- `GET /auth/oauth/callback` - OAuth 콜백
- `POST /auth/logout` - 로그아웃
- `GET /auth/me` - 현재 사용자 정보 (토큰 확인 로직 포함)

### 내전

- `GET /custom-games` - 내전 목록
- `POST /custom-games` - 내전 생성
- `GET /custom-games/:id` - 내전 상세
- `POST /custom-games/:id/join` - 내전 참가
- `POST /custom-games/:id/teams` - 팀 구성
- `PUT /custom-games/:id/status` - 상태 변경

### 전적

- `GET /matches/user/:userId` - 사용자 전적
- `GET /riot/summoner/:name` - 소환사 정보
- `GET /riot/matches/:puuid` - 매치 목록
- `GET /riot/match/:matchId` - 매치 상세

### 친구/채팅

- `GET /friends` - 친구 목록
- `POST /friends/request` - 친구 요청
- `PUT /friends/:id/status` - 친구 상태 변경
- `GET /messages` - 메시지 목록
- `POST /messages` - 메시지 전송

### 커뮤니티

- `GET /community/posts` - 게시글 목록
- `POST /community/posts` - 게시글 작성
- `GET /community/posts/:id` - 게시글 상세

### 스트리머

- `GET /streamers` - 스트리머 목록
- `POST /streamers` - 스트리머 등록
- `GET /streamers/:id` - 스트리머 상세

---

## 🎨 UI/UX 특징

### 테마 시스템

- **다크 테마** 기본 제공
- **Nexus 브랜드 컬러** 활용
- **반응형 디자인** (모바일/태블릿/데스크톱)
- **CSS 변수 기반** 테마 시스템
- **data-theme 속성** 사용으로 일관된 테마 적용

### 레이아웃

- **사이드바 네비게이션** (bg-secondary 배경 + 그림자)
- **통합된 친구 패널** (우측, 친구 + 메시지 탭)
- **메인 콘텐츠 영역** (bg-primary 배경)
- **디스코드 스타일** 구분감 (명확한 배경색 및 그림자)

### 인터랙티브 요소

- **실시간 업데이트** (Socket.IO)
- **로딩 상태** 및 에러 처리
- **호버 효과** 및 트랜지션
- **확장 가능한 카드** UI
- **토큰 기반 인증** 상태 관리

---

## 🔧 개발 환경

### 실행 방법

```bash
# Frontend
npm install --legacy-peer-deps
npm start

# Backend
cd backend
npm install
npm start
```

### 환경 변수

- `REACT_APP_RIOT_API_KEY`: Riot API 키
- `DATABASE_URL`: PostgreSQL 연결 문자열
- `JWT_SECRET`: JWT 시크릿 키
- `REDIS_URL`: Redis 연결 문자열
- `FRONTEND_URL`: 프론트엔드 URL
- `NODE_ENV`: 환경 설정

---

## 🗄️ 데이터베이스 스키마

### 주요 테이블

- `users`: 사용자 정보
- `custom_games`: 내전 정보
- `matches`: 전적 데이터
- `friends`: 친구 관계
- `messages`: 메시지
- `streamers`: 스트리머 정보
- `tournaments`: 토너먼트
- `community_posts`: 커뮤니티 게시글
- `user_evaluations`: 사용자 평가

---

## 🏷️ 태그 시스템

### 기능별 태그

- `#인증` - 로그인/회원가입/OAuth
- `#내전` - 커스텀 게임 관리
- `#전적` - Riot API 연동 및 전적 분석
- `#커뮤니티` - 친구/채팅/게시판
- `#스트리머` - 스트리머 관리
- `#검색` - 사용자 검색
- `#프로필` - 사용자 프로필 관리
- `#UI/UX` - 사용자 인터페이스 개선

### 기술별 태그

- `#React` - 프론트엔드 프레임워크
- `#TypeScript` - 타입 안전성
- `#Node.js` - 백엔드 런타임
- `#Express` - 웹 프레임워크
- `#PostgreSQL` - 메인 데이터베이스
- `#Redis` - 캐싱/세션
- `#Socket.IO` - 실시간 통신
- `#TailwindCSS` - 스타일링
- `#Zustand` - 상태 관리

### 상태별 태그

- `#개발중` - 개발 진행 중
- `#완료` - 기능 완료
- `#버그` - 버그 수정 필요
- `#개선` - 성능/UI 개선 필요
- `#테스트` - 테스트 필요

---

## 📋 개발 규칙

### 코드 스타일

- **TypeScript** 사용 필수
- **함수형 컴포넌트** 및 **훅** 사용
- **ESLint** 및 **Prettier** 규칙 준수
- **한국어 주석** 사용

### 네이밍 규칙

- **컴포넌트**: PascalCase (예: `UserProfile.tsx`)
- **함수/변수**: camelCase (예: `getUserData`)
- **상수**: UPPER_SNAKE_CASE (예: `API_BASE_URL`)
- **파일명**: kebab-case (예: `user-profile.tsx`)

### 폴더 구조

- **기능별** 폴더 분리
- **공통 컴포넌트**는 `common/` 폴더
- **타입 정의**는 `types/` 폴더
- **서비스**는 `services/` 폴더

### 상태 관리

- **Zustand** 사용
- **전역 상태**는 `useAppStore`에서 관리
- **로컬 상태**는 `useState` 사용
- **서버 상태**는 `useQuery` 패턴 사용

### API 통신

- **Axios** 사용
- **인터셉터**로 토큰 자동 추가
- **에러 핸들링** 통합 관리
- **로딩 상태** 표시
- **토큰 존재 여부 확인** 로직으로 불필요한 API 호출 방지

### 실시간 통신

- **Socket.IO** 사용
- **이벤트 기반** 통신
- **연결 상태** 모니터링
- **재연결** 로직 구현

### 보안

- **JWT 토큰** 사용
- **CORS** 설정
- **Rate Limiting** 적용
- **입력 검증** 필수

### 성능

- **React.memo** 사용
- **useCallback** 및 **useMemo** 활용
- **이미지 최적화**
- **코드 스플리팅** 적용

### 테스트

- **단위 테스트** 작성
- **통합 테스트** 구현
- **E2E 테스트** 계획

---

## 🚀 배포 환경

### 개발 환경

- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:5000`
- **Database**: PostgreSQL (로컬)
- **Cache**: Redis (로컬)

### 프로덕션 환경

- **Frontend**: Vercel/Netlify
- **Backend**: AWS/DigitalOcean
- **Database**: AWS RDS PostgreSQL
- **Cache**: AWS ElastiCache Redis

---

## 📈 향후 계획

### 단기 계획 (1-2개월)

- [x] 친구 패널 통합 및 UI 개선
- [x] 인증 오류 해결
- [x] 디스코드 스타일 레이아웃 적용
- [ ] 실시간 채팅 기능 완성
- [ ] 내전방 생성/관리 기능 완성
- [ ] 팀 구성 시스템 완성
- [ ] Riot API 연동 완성
- [ ] UI/UX 개선

### 중기 계획 (3-6개월)

- [ ] 모바일 반응형 최적화
- [ ] 성능 최적화
- [ ] 테스트 코드 작성
- [ ] 문서화 완성

### 장기 계획 (6개월 이상)

- [ ] 모바일 앱 개발
- [ ] AI 기반 매칭 시스템
- [ ] 실시간 스트리밍 통합
- [ ] 국제화 지원

---

## 🤝 기여 가이드

### 이슈 리포트

- **버그 리포트**: 재현 단계 포함
- **기능 요청**: 상세한 설명 제공
- **문서 개선**: 구체적인 수정 사항

### PR 가이드라인

- **브랜치명**: `feature/기능명` 또는 `fix/버그명`
- **커밋 메시지**: 명확하고 간결하게
- **코드 리뷰**: 필수
- **테스트**: 새로운 기능에 대한 테스트 포함

---

**NEXUS** - 리그 오브 레전드 커뮤니티의 새로운 시작 🚀
