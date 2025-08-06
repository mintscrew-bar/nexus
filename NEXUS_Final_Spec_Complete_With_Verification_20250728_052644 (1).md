---

## 📄 NEXUS_Mypage_and_MatchHistory.md

# 🧠 NEXUS 웹 앱 기획서

## 📌 개요

**NEXUS**는 리그 오브 레전드(LoL) 사용자들을 위한 커뮤니티 기반 웹 애플리케이션입니다. 내전 참여자 모집, 팀 구성, 사용자 설정 게임 생성 및 전적 기록 제공을 중심으로 다양한 기능을 제공합니다.

---

## 🧩 주요 기능 설명

### 🎮 내전 기능
- 내전 목록: 생성된 내전방 표시 (진행 중 / 모집 중 / 비밀번호 여부)
- 내전 모집: 모달을 통해 내전방 생성 후 입장
- 팀 구성 방식: 경매 / 가위바위보 / 없음
- 밴픽 방식: LoL에 맞는 모든 모드 제공
- 참가 인원: 자유 / 인원 설정 (5단위)
- 관전 여부 설정
- 비밀번호 설정 가능

### 🧠 팀 구성 단계
- 팀장 선출: 지원 → 부족 시 방장이 선출 또는 랜덤
- 경매 방식: 포인트 기반 입찰, 유찰 시 재등장
- 라인 선택: 팀별 라인 선택 후 대진표 생성
- 토너먼트 API로 사용자 설정 게임 생성 및 코드 제공

### 🧾 전적 기록
- Riot API를 통해 일반 게임 및 사용자 설정 게임 전적 수집
- 사용자 설정 게임은 토너먼트 코드 기반으로 Match ID 추적
- 승/패, KDA, 라인, 챔피언 등 기록

### 💬 커뮤니티
- 실시간 채팅
- 게시판 (네이버, 디시인사이드 참고)

### 🔍 전적 검색
- 검색창: Riot API 기반 사용자 검색
- 전적 표시: 일반 게임 + 사용자 설정 게임

### 📺 스트리머
- 스트리머 등록 배너 → 폼 제출
- 스트리머 목록 및 방송 정보 표시

### 🎨 테마 및 UI
- 다크모드 / 라이트모드 전환
- 친구창: 접었다 폈다 가능, 상태 표시
- 메시지: 실시간 DM (인스타 DM 스타일)

---

## 🧱 마이페이지 기능

### 사용자 정보
- Nexus 닉네임
- Riot 닉네임 + 태그
- 티어 정보
- 주 라인 / 모스트 챔피언
- Riot ID 연동 상태

### 전적 표시
- 일반 게임 전적
- 사용자 설정 게임 전적
- 승률, 평균 KDA, 라인별 성과, 모스트 챔피언

### 친구 기능
- 친구 목록
- 친구 상태 표시
- DM 채팅창

### 메시지 기능
- 실시간 메시지 (WebSocket 기반)

### 스트리머 정보
- 방송 링크, 최근 방송 기록, 시청자 수

---

## 🖼️ UI 레이아웃

### Riot API 연동 흐름도
![Riot API 연동 흐름도](riot_api_flowchart.png)

### 전적 표시 레이아웃
![전적 표시 레이아웃](전적_표시_레이아웃.png)

### op.gg 스타일 전적 카드
![NEXUS 전적 카드](nexus_match_history_style.png)

### 클릭 시 확장되는 전적 카드
![확장된 전적 카드](nexus_match_history_expanded.png)

---

## 🔧 기술 스택 제안

| 기능 | 기술 |
|------|------|
| 프론트엔드 | React + TailwindCSS / Styled Components |
| 상태 관리 | Zustand / Redux |
| 실시간 통신 | WebSocket / Socket.IO |
| 백엔드 | Node.js (Express) or Python (FastAPI) |
| 데이터베이스 | PostgreSQL or MongoDB + Redis |
| Riot API 연동 | Summoner-V4, Match-V5, League-V4 |
| 인증 | JWT + Riot ID 입력 기반 |

---

## 🗂️ DB 설계 요약

### 주요 테이블

#### `users`
- `id`, `nexus_nickname`, `riot_nickname`, `riot_tag`, `puuid`
- `tier`, `main_lane`, `most_champions`
- `is_streamer`, `streamer_info_id`

#### `custom_matches`
- `id`, `match_id`, `tournament_code`, `result`, `stats`, `user_id`

#### `friends`
- `id`, `user_id`, `friend_user_id`, `status`

#### `messages`
- `id`, `sender_id`, `receiver_id`, `content`, `timestamp`

#### `streamer_info`
- `id`, `user_id`, `stream_link`, `viewer_count`, `recent_broadcast`

---

## 📌 구현 시 고려사항

- Riot API는 실시간 푸시를 지원하지 않으므로, Polling 또는 비동기 작업 큐로 전적 수집
- 사용자 설정 게임은 토너먼트 코드 기반 Match ID 추적 필요
- 실시간 기능은 WebSocket 기반 룸 시스템으로 구성

---

## ✅ 요약

NEXUS는 Riot API와 실시간 기술을 활용하여 내전 중심의 커뮤니티 플랫폼을 구축합니다. 사용자 설정 게임을 포함한 전적 분석, 팀 구성, 실시간 채팅, 스트리머 기능까지 통합된 경험을 제공합니다.


---

## 📄 nexus_match_history_spec.md


# 🧠 NEXUS 웹 앱 마이페이지 및 전적 표시 기능 기획서

## 📌 개요
NEXUS는 리그 오브 레전드(LoL) 사용자들을 위한 내전 관리 및 전적 분석 플랫폼입니다. 사용자 설정 게임을 Riot 토너먼트 API를 통해 생성하고, 전적을 수집하여 사용자에게 시각적으로 제공하는 기능을 포함합니다.

---

## 🧱 주요 기능 요약

### 1. 마이페이지
- Nexus 닉네임
- Riot 닉네임 + 태그
- 티어 정보 (솔랭, 자유랭크)
- 주 라인 / 모스트 챔피언
- Riot ID 연동 상태 표시
- 내전 참여 기록
- 친구 목록 및 상태 표시
- 실시간 메시지 기능
- 스트리머 정보

### 2. 전적 표시
- 일반 게임 전적
- 사용자 설정 게임 전적
- 승률, 평균 KDA, 라인별 성과, 모스트 챔피언
- op.gg 스타일 카드 UI
- 클릭 시 확장되는 세부 정보

---

## 🖼️ UI 구성

### 마이페이지 와이어프레임
- Riot ID 연동 영역
- 사용자 정보 카드
- 전적 표시 영역 (일반 / 사용자 설정 게임)
- 친구 목록 및 메시지 영역
- 스트리머 정보 영역
- 정보 수정 버튼

### 전적 표시 레이아웃

![전적 표시 레이아웃](전적_표시_레이아웃.png)

### op.gg 스타일 전적 카드

![op.gg 스타일 전적 카드](nexus_match_history_style.png)

### 클릭 시 확장되는 카드

![확장형 카드](nexus_match_history_expanded.png)

---

## 🔧 Riot API 연동 흐름

![Riot API 연동 흐름도](riot_api_flowchart.png)

1. 사용자 입력: Riot 닉네임 + 태그
2. Summoner-V4 API → `puuid` 획득
3. Match-V5 API → 최근 경기 Match ID 획득
4. Match-V5 API → Match ID 기반 전적 정보 획득
5. 사용자 설정 게임은 토너먼트 코드 기반 Match ID 추적

---

## 🗂️ DB 설계 요약

### 주요 테이블

#### `users`
- `id`, `nexus_nickname`, `riot_nickname`, `riot_tag`, `puuid`
- `tier`, `main_lane`, `most_champions`
- `is_streamer`, `streamer_info_id`

#### `custom_matches`
- `id`, `match_id`, `tournament_code`, `result`, `stats`, `user_id`

#### `friends`
- `id`, `user_id`, `friend_user_id`, `status`

#### `messages`
- `id`, `sender_id`, `receiver_id`, `content`, `timestamp`

#### `streamer_info`
- `id`, `user_id`, `stream_link`, `viewer_count`, `recent_broadcast`

---

## 🔄 실시간 기능 구현

### 실시간 채팅 / 메시지
- WebSocket / Socket.IO
- 친구 간 DM, 내전방 채팅

### 친구 상태 표시
- Redis Pub/Sub
- Presence 시스템

### 내전방 실시간 구성
- WebSocket 기반 룸 시스템
- 경매, 팀 구성, 가위바위보 등 실시간 이벤트 처리

### 사용자 설정 게임 전적 반영
- Riot API Polling
- 비동기 작업 큐 (Celery, Bull 등)

---

## 🧱 기술 스택 제안

| 영역 | 기술 |
|------|------|
| 프론트엔드 | React + Zustand/Redux + TailwindCSS |
| 백엔드 | Node.js (Express) or Python (FastAPI) |
| 실시간 통신 | WebSocket / Socket.IO |
| 데이터베이스 | PostgreSQL or MongoDB + Redis |
| Riot API 연동 | Summoner-V4, Match-V5, League-V4 |
| 인증 | JWT + Riot ID 입력 기반 |
| 배포 | Vercel (프론트), Render/Heroku/AWS (백엔드) |

---

## 📌 구현 시 고려사항
- Riot API는 실시간 푸시를 지원하지 않으므로, Polling 또는 비동기 작업 큐로 전적 수집
- 사용자 설정 게임은 토너먼트 코드 기반 Match ID 추적 필요
- 실시간 기능은 WebSocket 기반 룸 시스템으로 구성

---

이 문서는 Cursor 개발자에게 전달하여 NEXUS의 마이페이지 및 전적 기능을 구현하기 위한 상세 가이드로 사용할 수 있습니다.


---

## 🖼️ 관련 이미지

![riot_api_flowchart.png](./riot_api_flowchart.png)

![전적_표시_레이아웃.png](./전적_표시_레이아웃.png)

![nexus_match_history_style.png](./nexus_match_history_style.png)

![nexus_match_history_expanded.png](./nexus_match_history_expanded.png)

---

## 🔐 사용자 인증 및 로그인 기능

### 1. 로그인 흐름
- 사용자는 Nexus 웹 앱에 접속 후 상단 우측의 로그인 버튼을 클릭
- Riot ID 기반으로 닉네임과 태그를 입력하여 로그인 시도
- 서버는 Riot API를 통해 해당 Riot ID의 존재 여부를 확인
- 인증 성공 시 JWT(Json Web Token)를 발급하여 클라이언트에 저장 (예: localStorage)

### 2. JWT 기반 인증
- 로그인 후 모든 요청은 JWT를 포함하여 사용자 인증을 유지
- JWT에는 사용자 ID, Riot ID, 닉네임, 권한 정보 등이 포함됨
- 토큰 만료 시 자동 로그아웃 처리 또는 갱신 로직 구현

### 3. Riot ID 연동
- 로그인 시 Riot 닉네임과 태그를 입력받아 Riot API로 PUUID를 조회
- PUUID는 사용자 고유 식별자로 DB에 저장되어 전적 추적에 사용됨
- Riot 계정 인증은 OAuth 미지원이므로 수동 입력 방식 사용

### 4. 로그인 상태에 따른 UI 변화
- 로그인 전: 테마 버튼, 로그인 버튼만 표시
- 로그인 후:
  - 테마 버튼
  - 메시지 아이콘 (실시간 DM 기능)
  - 사용자 아바타 및 Nexus 닉네임 표시
  - 친구창 활성화 (우측 슬라이드 방식)
  - 내전 참여, 생성, 메시지 전송 등 기능 사용 가능

### 5. 로그아웃
- 사용자 아바타 클릭 시 로그아웃 버튼 제공
- 로그아웃 시 JWT 삭제 및 상태 초기화

---

## 🧾 상세 전적 보기 기능 (op.gg / fow.kr / deeplol.gg 스타일)

사용자가 마이페이지 또는 전적 검색에서 특정 매치를 클릭하면, 해당 경기의 전체 팀 정보를 상세하게 보여주는 기능입니다.

### 📌 표시되는 정보
- **아군 팀 / 적군 팀 전체 구성**
  - 소환사 이름 (Riot ID)
  - 챔피언 이름 및 아이콘
  - KDA (킬 / 데스 / 어시스트)
  - 아이템 빌드 (6개 아이템 + 와드)
  - 스펠 (소환사 주문)
  - 룬 정보
  - 라인 포지션
  - 골드 획득량
  - 딜량 (챔피언 피해량, 받은 피해량)
  - 시야 점수
  - CS (미니언 처치 수)
  - 경기 시간

### 🖼️ UI 구성
- 매치 카드 클릭 시 **모달 또는 확장 영역**으로 상세 정보 표시
- 아군 팀과 적군 팀을 **좌우로 나란히 배치**
- 각 플레이어의 정보는 카드 형태로 구성
- 딜량, 골드, 시야 점수 등은 **막대 그래프 또는 숫자**로 시각화

### 🔍 데이터 수집 방식
- Riot Match-V5 API를 통해 Match ID 기반으로 전체 참가자 정보 수집
- 각 참가자의 챔피언, 아이템, 스펠, 룬, 포지션 등은 `info.participants` 배열에서 추출
- 팀 구분은 `teamId` (100: 블루팀, 200: 레드팀) 기준으로 분리

### 💡 활용 예시
- 사용자가 자신의 경기뿐 아니라 팀원과 적팀의 성과를 함께 분석 가능
- 팀원 간 라인별 성과 비교, 아이템 빌드 분석 등 전략적 피드백 제공
- 내전 경기에서도 전체 팀 구성과 성과를 기록하여 커뮤니티 공유 가능

## 📦 Match History Retrieval from Tournament API

In addition to using the Match-V5 API for retrieving standard match history, NEXUS also supports tracking custom games created via Riot's Tournament API. These games are initiated using Tournament Codes and must be handled differently.

### 🔄 Tournament Code Workflow

1. **Tournament Code Generation**:
   - When a custom game is created via the Tournament API, a unique Tournament Code is generated.
   - This code includes metadata such as map type, pick type, team size, and allowed summoners.

2. **Game Launch and Completion**:
   - Players use the Tournament Code to join the custom game.
   - Once the game is completed, Riot assigns a Match ID to the game, just like standard games.

3. **Match ID Retrieval**:
   - The backend stores the Tournament Code and maps it to the resulting Match ID.
   - This Match ID is then used to query full match details via the Match-V5 API.

### 📊 Data Storage and Querying

- All Tournament Codes and their resulting Match IDs are stored in the `custom_matches` table.
- Each match record includes:
  - `match_id`
  - `tournament_code`
  - `participants` (PUUIDs)
  - `result`, `stats`, and full team compositions

### 🖱️ Full Team Data Display

When a user clicks on a match card (whether standard or custom), the UI expands to show:
- All 10 players (5 per team)
- Champion played, KDA, items, summoner spells, runes
- Damage dealt, gold earned, vision score
- Team composition and win/loss outcome

This ensures that custom games are treated with the same level of detail and visibility as standard ranked or normal games.
---

## 🔐 사용자 인증 및 로그인 기능

### ✅ 지원 로그인 방식
- **Google 로그인**: OAuth2 기반, 사용자 이메일 및 프로필 정보 획득
- **Discord 로그인**: OAuth2 기반, 사용자 ID 및 닉네임 획득
- **자체 회원가입**: Nexus 전용 계정 생성 (아이디 + 비밀번호)

### 🧩 회원가입 기능
- 이메일 인증 또는 CAPTCHA 적용 가능
- Riot ID 연동은 회원가입 후 별도로 진행

### 🔄 아이디/비밀번호 찾기
- 이메일 기반 비밀번호 재설정 링크 발송
- 아이디 찾기: 가입 시 입력한 이메일로 조회

### 🧠 로그인 상태에 따른 UI 변화
- 로그인 전: 테마 버튼, 로그인 버튼
- 로그인 후: 테마 버튼, 메시지, 아바타 및 사용자 닉네임 표시

---

## 🏠 홈페이지 구성

사이트에 처음 접속하면 다음 요소들이 표시됩니다:

### 🎯 상단 배너
- Nexus 로고 및 소개 이미지
- 내전 참여 유도 문구

### 🏷️ 모집 중인 내전방 리스트 (일부)
- 현재 모집 중인 내전방 3~5개 표시
- 방 제목, 팀 구성 방식, 인원 수, 비밀번호 여부, 진행 상태 표시

### 🗣️ 커뮤니티 최신 글
- 최근 작성된 커뮤니티 글 5개 표시
- 제목, 작성자, 댓글 수, 작성 시간 표시

---

## 🧑‍🤝‍🧑 커뮤니티 (게시판) 기능

### 🧭 벤치마킹
- **네이버 카페**: 카테고리별 게시판, 댓글, 추천, 신고 기능
- **디시인사이드**: 실시간 인기글, 익명 게시글, 반응형 UI

### 📌 주요 기능
- 게시판 카테고리: 자유게시판, 질문답변, 팀원 모집, 스트리머 홍보 등
- 글 작성: 제목, 내용, 이미지 첨부, 태그
- 댓글: 실시간 댓글, 대댓글, 좋아요
- 추천/비추천 기능
- 신고 및 삭제 요청 기능
- 인기글 자동 노출 (조회수 + 추천수 기준)

### 🧠 UI 구성
- 좌측: 게시판 카테고리 목록
- 중앙: 게시글 리스트 및 페이징
- 우측: 인기글, 실시간 댓글, 스트리머 배너 등

---

## 🔐 스트리머 인증 및 계정 인증 기능

### ✅ 스트리머 인증
- 마이페이지에서 스트리머 인증을 받은 사용자만 다음 기능을 사용할 수 있습니다:
  - 마이페이지 내 '스트리머 탭' 노출
  - 닉네임 옆에 스트리머 배지 표시
  - 스트리머 활동 내역 및 방송 링크 표시

- 인증 방식:
  - 스트리머 등록 폼 제출
  - 관리자 승인 또는 자동 인증 로직
  - 인증 완료 시 사용자 DB에 `is_streamer = true` 저장

### ✅ 계정 인증
- 마이페이지에 '계정 인증' 버튼 노출
- 인증을 완료하지 않으면 다음 기능이 제한됩니다:
  - 내전방 생성
  - 내전 참여
  - 팀 구성 및 게임 시작

- 인증 방식:
  - 이메일 인증 또는 Riot ID 기반 인증
  - 인증 완료 시 사용자 DB에 `is_verified = true` 저장

- UI 구성:
  - 인증 전: 마이페이지에 '계정 인증하기' 버튼 표시
  - 인증 후: 인증 상태 아이콘 표시 및 내전 기능 활성화
