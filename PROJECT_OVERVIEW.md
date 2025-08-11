# 🧠 NEXUS 프로젝트 전체 구조 및 기능 정리

## 📋 프로젝트 개요

**NEXUS**는 리그 오브 레전드(LoL) 사용자들을 위한 **내전 관리 및 전적 분석 커뮤니티 플랫폼**입니다.

---

## 🏗️ 기술 스택

### Frontend

- **Framework**: React 19 + TypeScript
- **State Management**: Zustand
- **Styling**: TailwindCSS
- **Routing**: React Router DOM
- **Real-time Communication**: Socket.IO Client
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Date Utility**: date-fns

### Backend

- **Framework**: Node.js + Express
- **Database**: PostgreSQL
- **Caching/Session**: Redis
- **Real-time Communication**: Socket.IO
- **Authentication**: Passport.js (for OAuth), JWT
- **Game Data**: Riot API

---

## ⛓️ 의존성 정보

### Frontend (`package.json`)

- **Core**: `react`, `react-dom`, `react-scripts`, `typescript`
- **Routing**: `react-router-dom`
- **State Management**: `zustand`
- **Styling**: `tailwindcss`, `clsx`
- **HTTP Client**: `axios`
- **Real-time**: `socket.io-client`
- **Utilities**: `date-fns`, `lucide-react`, `web-vitals`
- **Testing**: `@testing-library/jest-dom`, `@testing-library/react`, `@testing-library/user-event`
- **Dev Dependencies**: `@tailwindcss/forms`, `@tailwindcss/typography`, `autoprefixer`

### Backend (`backend/package.json`)

- **Core**: `express`, `dotenv`
- **Database**: `pg` (PostgreSQL)
- **Caching**: `redis`
- **Authentication**: `bcryptjs`, `jsonwebtoken`, `passport`, `passport-discord`, `passport-google-oauth20`, `passport-jwt`
- **Real-time**: `socket.io`
- **API Communication**: `axios`
- **Middleware**: `cors`, `helmet`, `morgan`, `express-rate-limit`, `compression`
- **File Handling**: `multer`, `cloudinary`
- **Validation**: `joi`
- **Utilities**: `cron`, `nodemailer`
- **Dev Dependencies**: `jest`, `nodemon`, `supertest`

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
│   ├── CustomGame/     # 내전 시스템
│   ├── MyPage/         # 마이페이지
│   ├── Community/      # 커뮤니티
│   ├── Streamer/       # 스트리머
│   ├── Layout/         # 레이아웃
│   └── common/         # 공통 컴포넌트
├── services/           # API 서비스
├── store/              # Zustand 상태 관리
├── types/              # TypeScript 타입 정의
├── hooks/              # 커스텀 훅
└── App.tsx             # 메인 앱 컴포넌트
```

### Backend (`backend/src/`)

```
backend/src/
├── routes/             # API 라우트
├── config/             # 설정 파일
├── database/           # DB 초기화/마이그레이션
├── middleware/         # 미들웨어
└── server.js           # 메인 서버 파일
```

---

## 🚀 주요 API 엔드포인트

(내용 생략 - 기존과 동일)

---

## 🎨 UI/UX 특징

(내용 생략 - 기존과 동일)

---

## 🔧 개발 환경

(내용 생략 - 기존과 동일)

---

## 🗄️ 데이터베이스 스키마

(내용 생략 - 기존과 동일)

---

## 🏷️ 태그 시스템

(내용 생략 - 기존과 동일)

---

## 📋 개발 규칙

(내용 생략 - 기존과 동일)

---

## 🚀 배포 환경

(내용 생략 - 기존과 동일)

---

## 📈 향후 계획

(내용 생략 - 기존과 동일)

---

## 🤝 기여 가이드

(내용 생략 - 기존과 동일)

---

**NEXUS** - 리그 오브 레전드 커뮤니티의 새로운 시작 🚀