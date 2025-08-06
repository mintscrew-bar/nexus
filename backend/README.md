# NEXUS Backend

NEXUS 웹 애플리케이션의 백엔드 API 서버입니다.

## 기술 스택

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Cache**: Redis
- **Authentication**: JWT + Passport.js
- **Real-time**: Socket.IO
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting

## 주요 기능

### 인증 시스템

- JWT 기반 인증
- Google OAuth2
- Discord OAuth2
- 자체 회원가입/로그인
- Riot ID 연동

### 사용자 관리

- 프로필 관리
- 친구 시스템
- 실시간 메시징
- 사용자 평가 (좋아요/싫어요)

### 내전 시스템

- 커스텀 게임 생성/참가
- 실시간 채팅
- 팀 구성 방식 (경매, 가위바위보)
- 관전자 모드

### 커뮤니티

- 게시글 작성/수정/삭제
- 댓글 시스템
- 좋아요/싫어요
- 카테고리별 분류

### 스트리머 기능

- 스트리머 등록
- 실시간 방송 정보
- 플랫폼별 연동 (Twitch, YouTube, AfreecaTV)

### Riot API 연동

- 소환사 정보 조회
- 매치 히스토리
- 리그 정보
- 정적 데이터 (챔피언, 아이템, 룬 등)

### 피드백 시스템

- 기능별 피드백 수집
- 사용자 평가
- 신고 시스템

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 `env.example`을 참고하여 설정:

```bash
cp env.example .env
```

### 3. 데이터베이스 설정

PostgreSQL과 Redis가 설치되어 있어야 합니다.

#### PostgreSQL 설정

```sql
CREATE DATABASE nexus_db;
```

#### Redis 설정

```bash
redis-server
```

### 4. 데이터베이스 마이그레이션

```bash
npm run migrate
```

### 5. 샘플 데이터 시드

```bash
npm run seed
```

### 6. 서버 실행

#### 개발 모드

```bash
npm run dev
```

#### 프로덕션 모드

```bash
npm start
```

## API 엔드포인트

### 인증

- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/discord` - Discord OAuth
- `POST /api/auth/link-riot` - Riot ID 연동
- `GET /api/auth/me` - 현재 사용자 정보

### 사용자

- `GET /api/users/:userId` - 사용자 정보 조회
- `GET /api/users/friends` - 친구 목록
- `POST /api/users/friends` - 친구 요청
- `GET /api/users/messages` - 메시지 목록
- `POST /api/users/messages` - 메시지 전송

### 내전

- `GET /api/custom-games` - 내전 목록
- `POST /api/custom-games` - 내전 생성
- `POST /api/custom-games/:gameId/join` - 내전 참가
- `DELETE /api/custom-games/:gameId/leave` - 내전 나가기

### 커뮤니티

- `GET /api/community/posts` - 게시글 목록
- `POST /api/community/posts` - 게시글 작성
- `GET /api/community/posts/:postId` - 게시글 상세
- `POST /api/community/posts/:postId/comments` - 댓글 작성

### 스트리머

- `GET /api/streamers` - 스트리머 목록
- `POST /api/streamers/register` - 스트리머 등록

### Riot API

- `GET /api/riot/summoner/:name/:tag` - 소환사 정보
- `GET /api/riot/league/:summonerId` - 리그 정보
- `GET /api/riot/matches/:puuid` - 매치 히스토리
- `GET /api/riot/match/:matchId` - 매치 상세

### 피드백

- `POST /api/feedback` - 피드백 제출
- `POST /api/feedback/evaluate-user` - 사용자 평가
- `POST /api/feedback/report` - 사용자 신고

## 데이터베이스 스키마

### 주요 테이블

- `users` - 사용자 정보
- `friends` - 친구 관계
- `messages` - 메시지
- `custom_games` - 내전 정보
- `custom_game_participants` - 내전 참가자
- `community_posts` - 커뮤니티 게시글
- `community_comments` - 댓글
- `streamer_info` - 스트리머 정보
- `matches` - 매치 정보
- `user_evaluations` - 사용자 평가
- `user_feedback` - 피드백
- `user_reports` - 신고

## 실시간 기능

Socket.IO를 통한 실시간 기능:

- 실시간 채팅
- 친구 온라인/오프라인 상태
- 내전 참가자 업데이트
- 타이핑 표시

## 보안

- JWT 토큰 인증
- 비밀번호 해싱 (bcrypt)
- Rate limiting
- CORS 설정
- Helmet 보안 헤더
- 입력 검증 (Joi)

## 개발 가이드

### 새로운 라우트 추가

1. `src/routes/` 디렉토리에 새 라우트 파일 생성
2. `src/server.js`에 라우트 등록
3. 필요한 미들웨어 추가

### 데이터베이스 마이그레이션

1. `src/database/migrate.js` 수정
2. `npm run migrate` 실행

### 테스트

```bash
npm test
```

## 배포

### 환경 변수

프로덕션 환경에서는 다음 환경 변수를 설정해야 합니다:

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `RIOT_API_KEY`
- OAuth 클라이언트 정보

### Docker 배포

```bash
docker build -t nexus-backend .
docker run -p 5000:5000 nexus-backend
```

## 라이센스

MIT License
