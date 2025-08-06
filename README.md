# 🧠 NEXUS - 리그 오브 레전드 커뮤니티 플랫폼

NEXUS는 리그 오브 레전드(LoL) 사용자들을 위한 내전 관리 및 전적 분석 플랫폼입니다. 사용자 설정 게임을 Riot 토너먼트 API를 통해 생성하고, 전적을 수집하여 사용자에게 시각적으로 제공하는 기능을 포함합니다.

## 🚀 주요 기능

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

## 🧱 마이페이지 기능

### 사용자 정보

- Nexus 닉네임
- Riot 닉네임 + 태그
- 티어 정보 (솔로랭크, 자유랭크)
- 주 라인 / 모스트 챔피언
- Riot ID 연동 상태

### 전적 표시

- 일반 게임 전적
- 사용자 설정 게임 전적
- 승률, 평균 KDA, 라인별 성과, 모스트 챔피언
- op.gg 스타일 카드 UI
- 클릭 시 확장되는 세부 정보

### 친구 기능

- 친구 목록
- 친구 상태 표시
- DM 채팅창

### 메시지 기능

- 실시간 메시지 (WebSocket 기반)

### 스트리머 정보

- 방송 링크, 최근 방송 기록, 시청자 수

## 🖼️ UI 구성

### 마이페이지 와이어프레임

- Riot ID 연동 영역
- 사용자 정보 카드
- 전적 표시 영역 (일반 / 사용자 설정 게임)
- 친구 목록 및 메시지 영역
- 스트리머 정보 영역
- 정보 수정 버튼

### 전적 표시 레이아웃

- op.gg 스타일 전적 카드
- 클릭 시 확장되는 세부 정보
- 필터링 및 정렬 기능

## 🔧 기술 스택

| 영역            | 기술                  |
| --------------- | --------------------- |
| 프론트엔드      | React 19 + TypeScript |
| 상태 관리       | Zustand               |
| 스타일링        | TailwindCSS           |
| 라우팅          | React Router DOM      |
| 아이콘          | Lucide React          |
| 날짜 처리       | date-fns              |
| HTTP 클라이언트 | Axios                 |
| 실시간 통신     | Socket.IO Client      |

## 🗂️ 프로젝트 구조

```
nexus/
├── src/
│   ├── components/
│   │   └── MyPage/
│   │       ├── MyPage.tsx          # 마이페이지 메인 컴포넌트
│   │       ├── UserProfile.tsx      # 사용자 프로필 컴포넌트
│   │       ├── MatchHistory.tsx     # 전적 표시 컴포넌트
│   │       ├── MatchCard.tsx        # 매치 카드 컴포넌트
│   │       ├── FriendList.tsx       # 친구 목록 컴포넌트
│   │       ├── MessagePanel.tsx     # 메시지 패널 컴포넌트
│   │       └── StreamerInfo.tsx     # 스트리머 정보 컴포넌트
│   ├── store/
│   │   └── useAppStore.ts           # Zustand 상태 관리
│   ├── services/
│   │   └── riotApi.ts               # Riot API 서비스
│   ├── types/
│   │   └── index.ts                 # TypeScript 타입 정의
│   └── App.tsx                      # 메인 앱 컴포넌트
├── tailwind.config.js               # TailwindCSS 설정
└── package.json                     # 프로젝트 의존성
```

## 🚀 시작하기

### 필수 요구사항

- Node.js 18+
- npm 또는 yarn

### 설치 및 실행

1. 의존성 설치:

```bash
npm install --legacy-peer-deps
```

2. 개발 서버 실행:

```bash
npm start
```

3. 브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 🔧 환경 변수 설정

`.env` 파일을 생성하고 다음 변수를 설정하세요:

```env
REACT_APP_RIOT_API_KEY=your_riot_api_key_here
```

## 📌 주요 컴포넌트 설명

### MyPage.tsx

마이페이지의 메인 컴포넌트로, 탭 네비게이션을 통해 프로필, 전적, 친구, 메시지 기능을 제공합니다.

### UserProfile.tsx

사용자 정보를 표시하고 편집할 수 있는 컴포넌트입니다. Riot ID 연동 상태, 티어 정보, 주 라인 등을 관리합니다.

### MatchHistory.tsx

전적 기록을 표시하는 컴포넌트입니다. 필터링, 정렬 기능과 함께 통계 정보를 제공합니다.

### MatchCard.tsx

op.gg 스타일의 매치 카드 컴포넌트입니다. 클릭 시 확장되어 상세 정보를 표시합니다.

### FriendList.tsx

친구 목록을 관리하는 컴포넌트입니다. 친구 추가, 삭제, 차단 기능을 제공합니다.

### MessagePanel.tsx

실시간 메시지 기능을 제공하는 컴포넌트입니다. 친구와의 DM 채팅을 지원합니다.

## 🔄 Riot API 연동

### API 엔드포인트

- **소환사 정보**: `/lol/summoner/v4/summoners/by-name/{summonerName}`
- **리그 정보**: `/lol/league/v4/entries/by-summoner/{summonerId}`
- **매치 목록**: `/lol/match/v5/matches/by-puuid/{puuid}/ids`
- **매치 상세**: `/lol/match/v5/matches/{matchId}`

### 데이터 흐름

1. 사용자 입력: Riot 닉네임 + 태그
2. Summoner-V4 API → `puuid` 획득
3. Match-V5 API → 최근 경기 Match ID 획득
4. Match-V5 API → Match ID 기반 전적 정보 획득
5. 사용자 설정 게임은 토너먼트 코드 기반 Match ID 추적

## 🎨 UI/UX 특징

### 다크 테마

- Nexus 브랜드 컬러를 활용한 다크 테마
- 가독성과 시각적 편안함을 고려한 색상 구성

### 반응형 디자인

- 모바일, 태블릿, 데스크톱 모든 디바이스 지원
- TailwindCSS를 활용한 유연한 레이아웃

### 인터랙티브 요소

- 호버 효과, 트랜지션 애니메이션
- 로딩 상태, 에러 처리
- 실시간 업데이트

## 🔮 향후 계획

### 단기 계획

- [ ] 실시간 채팅 기능 구현 (WebSocket)
- [ ] 내전방 생성 및 관리 기능
- [ ] 팀 구성 시스템 구현
- [ ] Riot API 연동 완성

### 장기 계획

- [ ] 백엔드 API 개발
- [ ] 데이터베이스 설계 및 구현
- [ ] 실시간 알림 시스템
- [ ] 모바일 앱 개발

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 연락처

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.

---

**NEXUS** - 리그 오브 레전드 커뮤니티의 새로운 시작 🚀
