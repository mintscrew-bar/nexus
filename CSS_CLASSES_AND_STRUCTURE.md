# 🎨 NEXUS 프로젝트 CSS 클래스 및 구조 가이드

## 📋 개요

NEXUS 프로젝트의 CSS 클래스, ID, 컴포넌트 구조, 스타일링 가이드라인을 정리한 문서입니다.

---

## 🎨 CSS 클래스 시스템

### 🌙 테마 관련 클래스

#### 다크 테마 클래스

```css
/* 기본 테마 클래스 */
.bg-theme-bg          /* 배경색 */
/* 배경색 */
.text-theme-text      /* 텍스트 색상 */
.border-theme-border  /* 테두리 색상 */

/* Nexus 브랜드 컬러 */
.bg-nexus-dark        /* Nexus 다크 배경 */
.bg-nexus-blue        /* Nexus 블루 */
.bg-nexus-purple      /* Nexus 퍼플 */
.text-nexus-gold      /* Nexus 골드 텍스트 */

/* 상태별 색상 */
.bg-success           /* 성공 상태 */
.bg-warning           /* 경고 상태 */
.bg-error             /* 에러 상태 */
.bg-info; /* 정보 상태 */
```

#### 컴포넌트별 테마 클래스

```css
/* 카드 컴포넌트 */
.card-bg              /* 카드 배경 */
/* 카드 배경 */
.card-border          /* 카드 테두리 */
.card-shadow          /* 카드 그림자 */

/* 버튼 컴포넌트 */
.btn-primary          /* 기본 버튼 */
.btn-secondary        /* 보조 버튼 */
.btn-danger           /* 위험 버튼 */
.btn-success          /* 성공 버튼 */
.btn-ghost            /* 고스트 버튼 */

/* 입력 필드 */
.input-bg             /* 입력 필드 배경 */
.input-border         /* 입력 필드 테두리 */
.input-focus; /* 입력 필드 포커스 */
```

### 📱 레이아웃 클래스

#### 그리드 시스템

```css
/* 컨테이너 */
.container            /* 기본 컨테이너 */
/* 기본 컨테이너 */
.container-fluid      /* 전체 너비 컨테이너 */
.container-sm         /* 작은 컨테이너 */
.container-lg         /* 큰 컨테이너 */

/* 그리드 */
.grid                 /* 그리드 컨테이너 */
.grid-cols-1          /* 1열 그리드 */
.grid-cols-2          /* 2열 그리드 */
.grid-cols-3          /* 3열 그리드 */
.grid-cols-4          /* 4열 그리드 */
.grid-cols-5          /* 5열 그리드 */
.grid-cols-6          /* 6열 그리드 */

/* 반응형 그리드 */
.grid-cols-1-md       /* 중간 화면 1열 */
.grid-cols-2-md       /* 중간 화면 2열 */
.grid-cols-3-md       /* 중간 화면 3열 */
.grid-cols-1-lg       /* 큰 화면 1열 */
.grid-cols-2-lg       /* 큰 화면 2열 */
.grid-cols-3-lg; /* 큰 화면 3열 */
```

#### 플렉스박스

```css
/* 플렉스 컨테이너 */
.flex                 /* 플렉스 컨테이너 */
/* 플렉스 컨테이너 */
.flex-row             /* 가로 방향 */
.flex-col             /* 세로 방향 */
.flex-wrap            /* 줄바꿈 */
.flex-nowrap          /* 줄바꿈 없음 */

/* 정렬 */
.justify-start        /* 시작 정렬 */
.justify-center       /* 중앙 정렬 */
.justify-end          /* 끝 정렬 */
.justify-between      /* 양끝 정렬 */
.justify-around       /* 균등 정렬 */

/* 세로 정렬 */
.items-start          /* 시작 정렬 */
.items-center         /* 중앙 정렬 */
.items-end            /* 끝 정렬 */
.items-stretch; /* 늘리기 */
```

### 🎯 컴포넌트별 클래스

#### 네비게이션

```css
/* 사이드바 */
.sidebar              /* 사이드바 컨테이너 */
/* 사이드바 컨테이너 */
.sidebar-item         /* 사이드바 아이템 */
.sidebar-item-active  /* 활성 아이템 */
.sidebar-icon         /* 사이드바 아이콘 */
.sidebar-text         /* 사이드바 텍스트 */

/* 상단 네비게이션 */
.navbar               /* 네비게이션 바 */
.navbar-brand         /* 브랜드 로고 */
.navbar-menu          /* 메뉴 컨테이너 */
.navbar-item          /* 메뉴 아이템 */
.navbar-dropdown; /* 드롭다운 */
```

#### 카드 컴포넌트

```css
/* 기본 카드 */
.card                 /* 카드 컨테이너 */
/* 카드 컨테이너 */
.card-header          /* 카드 헤더 */
.card-body            /* 카드 본문 */
.card-footer          /* 카드 푸터 */
.card-title           /* 카드 제목 */
.card-subtitle        /* 카드 부제목 */

/* 특수 카드 */
.match-card           /* 매치 카드 */
.user-card            /* 사용자 카드 */
.game-card            /* 게임 카드 */
.streamer-card        /* 스트리머 카드 */
.tournament-card; /* 토너먼트 카드 */
```

#### 폼 컴포넌트

```css
/* 입력 필드 */
.form-group           /* 폼 그룹 */
/* 폼 그룹 */
.form-label           /* 폼 라벨 */
.form-input           /* 폼 입력 */
.form-textarea        /* 폼 텍스트 영역 */
.form-select          /* 폼 선택 */
.form-checkbox        /* 폼 체크박스 */
.form-radio           /* 폼 라디오 */

/* 버튼 */
.btn                  /* 기본 버튼 */
.btn-sm               /* 작은 버튼 */
.btn-lg               /* 큰 버튼 */
.btn-block            /* 블록 버튼 */
.btn-loading; /* 로딩 버튼 */
```

#### 모달 컴포넌트

```css
/* 모달 */
.modal                /* 모달 컨테이너 */
/* 모달 컨테이너 */
.modal-backdrop       /* 모달 배경 */
.modal-dialog         /* 모달 다이얼로그 */
.modal-header         /* 모달 헤더 */
.modal-body           /* 모달 본문 */
.modal-footer         /* 모달 푸터 */
.modal-close; /* 모달 닫기 버튼 */
```

### 🎮 게임 관련 클래스

#### 내전 시스템

```css
/* 내전방 */
.custom-game-room     /* 내전방 컨테이너 */
/* 내전방 컨테이너 */
.game-info            /* 게임 정보 */
.game-participants    /* 참가자 목록 */
.game-teams           /* 팀 정보 */
.game-status          /* 게임 상태 */

/* 팀 구성 */
.team-formation       /* 팀 구성 */
.team-blue            /* 블루팀 */
.team-red             /* 레드팀 */
.team-leader          /* 팀장 */
.team-member          /* 팀원 */

/* 라인 선택 */
.line-selection       /* 라인 선택 */
.line-top             /* 탑 라인 */
.line-jungle          /* 정글 라인 */
.line-mid             /* 미드 라인 */
.line-adc             /* 원딜 라인 */
.line-support; /* 서폿 라인 */
```

#### 전적 시스템

```css
/* 전적 카드 */
.match-history        /* 전적 히스토리 */
/* 전적 히스토리 */
.match-card           /* 매치 카드 */
.match-expanded       /* 확장된 매치 */
.match-stats          /* 매치 통계 */
.match-participants   /* 매치 참가자 */

/* 통계 */
.stats-container      /* 통계 컨테이너 */
.stats-item           /* 통계 아이템 */
.stats-value          /* 통계 값 */
.stats-label          /* 통계 라벨 */
.stats-chart; /* 통계 차트 */
```

### 💬 커뮤니티 클래스

#### 채팅 시스템

```css
/* 채팅 */
.chat-container       /* 채팅 컨테이너 */
/* 채팅 컨테이너 */
.chat-messages        /* 메시지 목록 */
.chat-message         /* 개별 메시지 */
.chat-input           /* 채팅 입력 */
.chat-send            /* 전송 버튼 */

/* 메시지 타입 */
.message-sent         /* 보낸 메시지 */
.message-received     /* 받은 메시지 */
.message-system       /* 시스템 메시지 */
.message-timestamp; /* 메시지 시간 */
```

#### 친구 시스템

```css
/* 친구 목록 */
.friends-list         /* 친구 목록 */
/* 친구 목록 */
.friend-item          /* 친구 아이템 */
.friend-avatar        /* 친구 아바타 */
.friend-status        /* 친구 상태 */
.friend-online        /* 온라인 상태 */
.friend-offline; /* 오프라인 상태 */
```

### 📺 스트리머 클래스

#### 스트리머 정보

```css
/* 스트리머 카드 */
.streamer-card        /* 스트리머 카드 */
/* 스트리머 카드 */
.streamer-info        /* 스트리머 정보 */
.streamer-avatar      /* 스트리머 아바타 */
.streamer-stats       /* 스트리머 통계 */
.streamer-live; /* 라이브 상태 */
```

---

## 🆔 ID 시스템

### 🏠 레이아웃 ID

```html
<!-- 메인 레이아웃 -->
<div id="app">
  <!-- 앱 루트 -->
  <div id="sidebar">
    <!-- 사이드바 -->
    <div id="main-content">
      <!-- 메인 콘텐츠 -->
      <div id="friends-panel">
        <!-- 친구 패널 -->
        <div id="dm-panel">
          <!-- DM 패널 -->
          <div id="header">
            <!-- 헤더 -->
            <div id="footer"><!-- 푸터 --></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### 🔐 인증 관련 ID

```html
<!-- 로그인 폼 -->
<form id="login-form">
  <!-- 로그인 폼 -->
  <input id="email-input" />
  <!-- 이메일 입력 -->
  <input id="password-input" />
  <!-- 비밀번호 입력 -->
  <button id="login-button">
    <!-- 로그인 버튼 -->

    <!-- 회원가입 폼 -->
    <form id="register-form">
      <!-- 회원가입 폼 -->
      <input id="username-input" />
      <!-- 사용자명 입력 -->
      <input id="confirm-password" />
      <!-- 비밀번호 확인 -->
      <button id="register-button"><!-- 회원가입 버튼 --></button>
    </form>
  </button>
</form>
```

### 🎮 게임 관련 ID

```html
<!-- 내전방 -->
<div id="custom-game-list">
  <!-- 내전 목록 -->
  <div id="game-room-{id}">
    <!-- 개별 내전방 -->
    <div id="team-blue">
      <!-- 블루팀 -->
      <div id="team-red">
        <!-- 레드팀 -->
        <div id="game-chat">
          <!-- 게임 채팅 -->

          <!-- 팀 구성 -->
          <div id="team-formation">
            <!-- 팀 구성 -->
            <div id="auction-system">
              <!-- 경매 시스템 -->
              <div id="line-selection">
                <!-- 라인 선택 -->
                <div id="ban-pick"><!-- 밴픽 --></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### 📊 전적 관련 ID

```html
<!-- 전적 시스템 -->
<div id="match-history">
  <!-- 전적 히스토리 -->
  <div id="match-{id}">
    <!-- 개별 매치 -->
    <div id="stats-container">
      <!-- 통계 컨테이너 -->
      <div id="champion-stats">
        <!-- 챔피언 통계 -->
        <div id="rank-info"><!-- 랭크 정보 --></div>
      </div>
    </div>
  </div>
</div>
```

### 💬 커뮤니티 ID

```html
<!-- 채팅 -->
<div id="chat-container">
  <!-- 채팅 컨테이너 -->
  <div id="message-list">
    <!-- 메시지 목록 -->
    <div id="chat-input">
      <!-- 채팅 입력 -->
      <div id="send-button">
        <!-- 전송 버튼 -->

        <!-- 친구 -->
        <div id="friends-list">
          <!-- 친구 목록 -->
          <div id="friend-{id}">
            <!-- 개별 친구 -->
            <div id="friend-requests"><!-- 친구 요청 --></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## 🧩 컴포넌트 구조

### 📁 컴포넌트 폴더 구조

```
src/components/
├── Auth/                    # 인증 관련
│   ├── Login.tsx           # 로그인 컴포넌트
│   ├── Register.tsx        # 회원가입 컴포넌트
│   ├── OAuthCallback.tsx   # OAuth 콜백
│   └── AuthCallback.tsx    # 인증 콜백
├── CustomGame/             # 내전 관련
│   ├── CustomGameList.tsx  # 내전 목록
│   ├── CustomGameDetail.tsx # 내전 상세
│   ├── CreateCustomGameModal.tsx # 내전 생성 모달
│   ├── TeamFormation.tsx   # 팀 구성
│   ├── AuctionSystem.tsx   # 경매 시스템
│   ├── RockPaperScissors.tsx # 가위바위보
│   ├── LineSelection.tsx   # 라인 선택
│   ├── TeamLeaderElection.tsx # 팀장 선출
│   ├── TournamentBracket.tsx # 토너먼트 브라켓
│   └── GameChat.tsx        # 게임 채팅
├── MyPage/                 # 마이페이지
│   ├── MyPage.tsx          # 마이페이지 메인
│   ├── UserProfile.tsx     # 사용자 프로필
│   ├── MatchHistory.tsx    # 전적 히스토리
│   ├── MatchCard.tsx       # 매치 카드
│   ├── FriendList.tsx      # 친구 목록
│   ├── MessagePanel.tsx    # 메시지 패널
│   └── StreamerInfo.tsx    # 스트리머 정보
├── Layout/                 # 레이아웃
│   ├── Sidebar.tsx         # 사이드바
│   ├── FriendsPanel.tsx    # 친구 패널
│   └── DMPanel.tsx         # DM 패널
├── Community/              # 커뮤니티
│   └── CommunityPage.tsx   # 커뮤니티 페이지
├── Streamer/               # 스트리머
│   ├── StreamerList.tsx    # 스트리머 목록
│   ├── StreamerProfile.tsx # 스트리머 프로필
│   └── RegisterStreamerModal.tsx # 스트리머 등록
├── Home/                   # 홈
│   └── HomePage.tsx        # 홈페이지
├── Search/                 # 검색
│   └── SearchPage.tsx      # 검색 페이지
├── Messages/               # 메시지
│   └── MessagesPage.tsx    # 메시지 페이지
├── Friends/                # 친구
│   └── FriendsList.tsx     # 친구 목록
├── Feedback/               # 피드백
│   └── FeedbackModal.tsx   # 피드백 모달
├── UserEvaluation/         # 사용자 평가
│   └── UserEvaluationModal.tsx # 사용자 평가 모달
└── common/                 # 공통 컴포넌트
    ├── Avatar.tsx          # 아바타
    ├── ThemeProvider.tsx   # 테마 프로바이더
    └── ThemeToggle.tsx     # 테마 토글
```

### 🎨 컴포넌트별 CSS 클래스

#### Auth 컴포넌트

```typescript
// Login.tsx
<div className="auth-container">
  <div className="auth-card">
    <h2 className="auth-title">로그인</h2>
    <form className="auth-form">
      <div className="form-group">
        <label className="form-label">이메일</label>
        <input className="form-input" type="email" />
      </div>
      <div className="form-group">
        <label className="form-label">비밀번호</label>
        <input className="form-input" type="password" />
      </div>
      <button className="btn btn-primary btn-block">로그인</button>
    </form>
  </div>
</div>
```

#### CustomGame 컴포넌트

```typescript
// CustomGameList.tsx
<div className="custom-game-list">
  <div className="game-filters">
    <button className="btn btn-secondary">필터</button>
  </div>
  <div className="game-grid">
    {games.map((game) => (
      <div key={game.id} className="game-card">
        <div className="game-header">
          <h3 className="game-title">{game.title}</h3>
          <span className="game-status">{game.status}</span>
        </div>
        <div className="game-body">
          <p className="game-description">{game.description}</p>
          <div className="game-participants">
            <span>
              {game.currentPlayers}/{game.maxPlayers}
            </span>
          </div>
        </div>
        <div className="game-footer">
          <button className="btn btn-primary">참가</button>
        </div>
      </div>
    ))}
  </div>
</div>
```

#### MyPage 컴포넌트

```typescript
// UserProfile.tsx
<div className="user-profile">
  <div className="profile-header">
    <div className="profile-avatar">
      <img src={user.avatarUrl} alt="프로필" />
    </div>
    <div className="profile-info">
      <h2 className="profile-name">{user.nexusNickname}</h2>
      <p className="profile-riot-id">
        {user.riotNickname}#{user.riotTag}
      </p>
    </div>
  </div>
  <div className="profile-stats">
    <div className="stat-item">
      <span className="stat-label">티어</span>
      <span className="stat-value">{user.tier?.soloRank?.tier}</span>
    </div>
  </div>
</div>
```

#### Layout 컴포넌트

```typescript
// Sidebar.tsx
<nav className="sidebar">
  <div className="sidebar-header">
    <div className="sidebar-logo">NEXUS</div>
  </div>
  <div className="sidebar-menu">
    <a href="/" className="sidebar-item">
      <span className="sidebar-icon">🏠</span>
      <span className="sidebar-text">홈</span>
    </a>
    <a href="/custom-games" className="sidebar-item">
      <span className="sidebar-icon">🎮</span>
      <span className="sidebar-text">내전</span>
    </a>
    <a href="/mypage" className="sidebar-item">
      <span className="sidebar-icon">👤</span>
      <span className="sidebar-text">마이페이지</span>
    </a>
  </div>
</nav>
```

---

## 🎨 스타일링 가이드라인

### 📏 크기 시스템

```css
/* 간격 */
.spacing-xs {
  margin: 0.25rem;
} /* 4px */
.spacing-sm {
  margin: 0.5rem;
} /* 8px */
.spacing-md {
  margin: 1rem;
} /* 16px */
.spacing-lg {
  margin: 1.5rem;
} /* 24px */
.spacing-xl {
  margin: 2rem;
} /* 32px */

/* 패딩 */
.padding-xs {
  padding: 0.25rem;
} /* 4px */
.padding-sm {
  padding: 0.5rem;
} /* 8px */
.padding-md {
  padding: 1rem;
} /* 16px */
.padding-lg {
  padding: 1.5rem;
} /* 24px */
.padding-xl {
  padding: 2rem;
} /* 32px */

/* 폰트 크기 */
.text-xs {
  font-size: 0.75rem;
} /* 12px */
.text-sm {
  font-size: 0.875rem;
} /* 14px */
.text-base {
  font-size: 1rem;
} /* 16px */
.text-lg {
  font-size: 1.125rem;
} /* 18px */
.text-xl {
  font-size: 1.25rem;
} /* 20px */
.text-2xl {
  font-size: 1.5rem;
} /* 24px */
```

### 🎨 색상 팔레트

```css
/* Nexus 브랜드 컬러 */
:root {
  --nexus-dark: #1a1a2e;
  --nexus-blue: #16213e;
  --nexus-purple: #0f3460;
  --nexus-gold: #e94560;
  --nexus-light: #f8f9fa;
}

/* 상태별 색상 */
:root {
  --success: #28a745;
  --warning: #ffc107;
  --error: #dc3545;
  --info: #17a2b8;
}

/* 그레이스케일 */
:root {
  --gray-100: #f8f9fa;
  --gray-200: #e9ecef;
  --gray-300: #dee2e6;
  --gray-400: #ced4da;
  --gray-500: #adb5bd;
  --gray-600: #6c757d;
  --gray-700: #495057;
  --gray-800: #343a40;
  --gray-900: #212529;
}
```

### 🔄 애니메이션

```css
/* 기본 트랜지션 */
.transition {
  transition: all 0.3s ease;
}

/* 호버 효과 */
.hover-scale:hover {
  transform: scale(1.05);
}

.hover-shadow:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* 로딩 애니메이션 */
.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 페이드 인 */
.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

### 📱 반응형 디자인

```css
/* 모바일 우선 */
.container {
  width: 100%;
  padding: 0 1rem;
}

/* 태블릿 */
@media (min-width: 768px) {
  .container {
    max-width: 750px;
    margin: 0 auto;
  }
}

/* 데스크톱 */
@media (min-width: 1024px) {
  .container {
    max-width: 1000px;
  }
}

/* 큰 화면 */
@media (min-width: 1280px) {
  .container {
    max-width: 1200px;
  }
}
```

---

## 🛠️ 유틸리티 클래스

### 🔧 레이아웃 유틸리티

```css
/* 디스플레이 */
.d-block {
  display: block;
}
.d-inline {
  display: inline;
}
.d-inline-block {
  display: inline-block;
}
.d-flex {
  display: flex;
}
.d-grid {
  display: grid;
}
.d-none {
  display: none;
}

/* 포지션 */
.position-static {
  position: static;
}
.position-relative {
  position: relative;
}
.position-absolute {
  position: absolute;
}
.position-fixed {
  position: fixed;
}
.position-sticky {
  position: sticky;
}

/* 오버플로우 */
.overflow-auto {
  overflow: auto;
}
.overflow-hidden {
  overflow: hidden;
}
.overflow-scroll {
  overflow: scroll;
}
.overflow-x-auto {
  overflow-x: auto;
}
.overflow-y-auto {
  overflow-y: auto;
}
```

### 📐 크기 유틸리티

```css
/* 너비 */
.w-auto {
  width: auto;
}
.w-full {
  width: 100%;
}
.w-screen {
  width: 100vw;
}
.w-1/2 {
  width: 50%;
}
.w-1/3 {
  width: 33.333333%;
}
.w-1/4 {
  width: 25%;
}

/* 높이 */
.h-auto {
  height: auto;
}
.h-full {
  height: 100%;
}
.h-screen {
  height: 100vh;
}
.h-1/2 {
  height: 50%;
}
.h-1/3 {
  height: 33.333333%;
}
.h-1/4 {
  height: 25%;
}
```

### 🎨 색상 유틸리티

```css
/* 배경색 */
.bg-transparent {
  background-color: transparent;
}
.bg-current {
  background-color: currentColor;
}
.bg-black {
  background-color: #000;
}
.bg-white {
  background-color: #fff;
}

/* 텍스트 색상 */
.text-transparent {
  color: transparent;
}
.text-current {
  color: currentColor;
}
.text-black {
  color: #000;
}
.text-white {
  color: #fff;
}
```

---

## 📋 CSS 네이밍 규칙

### 🎯 BEM 방법론

```css
/* 블록 */
.card {
}
.button {
}
.form {
}

/* 요소 */
.card__header {
}
.card__body {
}
.card__footer {
}
.button__icon {
}
.button__text {
}

/* 수정자 */
.card--featured {
}
.button--primary {
}
.button--large {
}
.form--inline {
}
```

### 📝 클래스 명명 규칙

```css
/* 컴포넌트 */
.component-name {
}
.component-name--variant {
}
.component-name__element {
}
.component-name__element--variant {
}

/* 유틸리티 */
.utility-name {
}
.utility-name--variant {
}

/* 상태 */
.is-active {
}
.is-disabled {
}
.is-loading {
}
.has-error {
}
```

---

## 🔧 TailwindCSS 설정

### 🎨 커스텀 테마

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        nexus: {
          dark: "#1a1a2e",
          blue: "#16213e",
          purple: "#0f3460",
          gold: "#e94560",
          light: "#f8f9fa",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["Fira Code", "monospace"],
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
    },
  },
  plugins: [],
};
```

### 🎯 커스텀 컴포넌트

```css
/* components.css */
@layer components {
  .btn {
    @apply px-4 py-2 rounded font-medium transition-colors;
  }

  .btn-primary {
    @apply bg-nexus-gold text-white hover:bg-red-600;
  }

  .btn-secondary {
    @apply bg-gray-200 text-gray-800 hover:bg-gray-300;
  }

  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }

  .form-input {
    @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nexus-gold;
  }
}
```

---

**NEXUS** - 체계적인 CSS 클래스 및 구조 가이드 🎨
