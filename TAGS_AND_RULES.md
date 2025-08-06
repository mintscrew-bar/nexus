# 🏷️ NEXUS 프로젝트 태그 시스템 및 개발 규칙

## 📋 태그 시스템

### 🎯 기능별 태그

#### 🔐 인증 관련

- `#인증` - 로그인/회원가입/OAuth
- `#OAuth` - 소셜 로그인 (Discord, Google)
- `#JWT` - 토큰 기반 인증
- `#보안` - 보안 관련 기능

#### 🎮 내전 관련

- `#내전` - 커스텀 게임 관리
- `#팀구성` - 팀 구성 시스템
- `#경매` - 경매 방식 팀 구성
- `#가위바위보` - 가위바위보 방식 팀 구성
- `#라인선택` - 라인 선택 시스템
- `#밴픽` - 밴픽 시스템
- `#토너먼트` - 토너먼트 관리

#### 📊 전적 관련

- `#전적` - Riot API 연동 및 전적 분석
- `#RiotAPI` - Riot Games API 연동
- `#매치` - 매치 데이터 처리
- `#통계` - 전적 통계 분석
- `#KDA` - KDA 계산 및 표시

#### 💬 커뮤니티 관련

- `#커뮤니티` - 친구/채팅/게시판
- `#친구` - 친구 시스템
- `#채팅` - 실시간 채팅
- `#DM` - 다이렉트 메시지
- `#게시판` - 커뮤니티 게시판
- `#평가` - 사용자 평가 시스템

#### 📺 스트리머 관련

- `#스트리머` - 스트리머 관리
- `#방송` - 방송 정보 표시
- `#Twitch` - Twitch 연동
- `#YouTube` - YouTube 연동
- `#Afreeca` - Afreeca 연동

#### 🔍 검색 관련

- `#검색` - 사용자 검색
- `#프로필` - 사용자 프로필 관리
- `#티어` - 티어 정보 연동
- `#챔피언` - 챔피언 정보

### 🛠️ 기술별 태그

#### Frontend

- `#React` - React 프레임워크
- `#TypeScript` - TypeScript 타입 안전성
- `#Zustand` - 상태 관리
- `#TailwindCSS` - 스타일링
- `#Router` - React Router DOM
- `#Socket.IO` - 실시간 통신 (클라이언트)
- `#Axios` - HTTP 클라이언트
- `#Lucide` - 아이콘 라이브러리

#### Backend

- `#Node.js` - Node.js 런타임
- `#Express` - Express 웹 프레임워크
- `#PostgreSQL` - PostgreSQL 데이터베이스
- `#Redis` - Redis 캐싱
- `#Passport` - Passport.js 인증
- `#JWT` - JSON Web Token
- `#Socket.IO` - 실시간 통신 (서버)

#### DevOps

- `#Docker` - Docker 컨테이너
- `#배포` - 배포 관련
- `#환경변수` - 환경 변수 관리
- `#로깅` - 로그 관리

### 📊 상태별 태그

#### 개발 상태

- `#개발중` - 개발 진행 중
- `#완료` - 기능 완료
- `#테스트중` - 테스트 진행 중
- `#검토중` - 코드 리뷰 중

#### 이슈 상태

- `#버그` - 버그 수정 필요
- `#개선` - 성능/UI 개선 필요
- `#리팩토링` - 코드 리팩토링 필요
- `#최적화` - 성능 최적화 필요

#### 우선순위

- `#긴급` - 긴급 수정 필요
- `#높음` - 높은 우선순위
- `#보통` - 보통 우선순위
- `#낮음` - 낮은 우선순위

---

## 📋 개발 규칙

### 🎨 코드 스타일 규칙

#### TypeScript 규칙

```typescript
// ✅ 좋은 예
interface User {
  id: number;
  email: string;
  nexusNickname: string;
}

const getUserData = async (userId: number): Promise<User> => {
  // 함수 구현
};

// ❌ 나쁜 예
interface user {
  id: any;
  email: any;
  nexusNickname: any;
}

const getUserData = async (userId: any): Promise<any> => {
  // 함수 구현
};
```

#### React 컴포넌트 규칙

```typescript
// ✅ 좋은 예
interface UserProfileProps {
  user: User;
  onEdit: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);

  return <div className="user-profile">{/* 컴포넌트 내용 */}</div>;
};

// ❌ 나쁜 예
const UserProfile = (props: any) => {
  const [isEditing, setIsEditing] = useState(false);

  return <div>{/* 컴포넌트 내용 */}</div>;
};
```

### 📝 네이밍 규칙

#### 파일명 규칙

- **컴포넌트**: PascalCase (예: `UserProfile.tsx`)
- **유틸리티**: camelCase (예: `apiUtils.ts`)
- **상수**: UPPER_SNAKE_CASE (예: `constants.ts`)
- **타입**: kebab-case (예: `user-types.ts`)

#### 변수/함수명 규칙

```typescript
// ✅ 좋은 예
const getUserData = async (userId: number) => {};
const isAuthenticated = true;
const API_BASE_URL = "http://localhost:5000";

// ❌ 나쁜 예
const get_user_data = async (user_id: number) => {};
const is_authenticated = true;
const apiBaseUrl = "http://localhost:5000";
```

#### 컴포넌트명 규칙

```typescript
// ✅ 좋은 예
const UserProfile = () => {};
const CustomGameList = () => {};
const MatchHistory = () => {};

// ❌ 나쁜 예
const userProfile = () => {};
const customGameList = () => {};
const matchHistory = () => {};
```

### 🗂️ 폴더 구조 규칙

#### Frontend 폴더 구조

```
src/
├── components/          # 컴포넌트
│   ├── Auth/           # 인증 관련
│   ├── CustomGame/     # 내전 관련
│   ├── MyPage/         # 마이페이지
│   ├── Community/      # 커뮤니티
│   ├── Streamer/       # 스트리머
│   ├── Layout/         # 레이아웃
│   └── common/         # 공통 컴포넌트
├── services/           # API 서비스
├── store/              # 상태 관리
├── types/              # 타입 정의
├── hooks/              # 커스텀 훅
└── utils/              # 유틸리티 함수
```

#### Backend 폴더 구조

```
backend/src/
├── routes/             # API 라우트
├── config/             # 설정 파일
├── database/           # DB 관련
├── middleware/         # 미들웨어
├── utils/              # 유틸리티 함수
└── types/              # 타입 정의
```

### 🔄 상태 관리 규칙

#### Zustand 스토어 규칙

```typescript
// ✅ 좋은 예
interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AppActions {
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuth: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const useAppStore = create<AppState & AppActions>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  setUser: (user) => set({ user }),
  setAuthenticated: (isAuth) => set({ isAuthenticated: isAuth }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
```

#### 로컬 상태 규칙

```typescript
// ✅ 좋은 예
const [isEditing, setIsEditing] = useState(false);
const [formData, setFormData] = useState<FormData>({
  title: "",
  description: "",
});

// ❌ 나쁜 예
const [state, setState] = useState({
  isEditing: false,
  formData: { title: "", description: "" },
});
```

### 🌐 API 통신 규칙

#### Axios 인터셉터 규칙

```typescript
// ✅ 좋은 예
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

#### API 호출 규칙

```typescript
// ✅ 좋은 예
const getUserData = async (userId: number): Promise<User> => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    throw error;
  }
};

// ❌ 나쁜 예
const getUserData = async (userId: number) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};
```

### 🔒 보안 규칙

#### 인증 규칙

```typescript
// ✅ 좋은 예
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAppStore();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// ❌ 나쁜 예
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};
```

#### 입력 검증 규칙

```typescript
// ✅ 좋은 예
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const handleSubmit = (data: FormData) => {
  if (!validateEmail(data.email)) {
    setError("올바른 이메일 형식을 입력해주세요.");
    return;
  }
  // 제출 로직
};

// ❌ 나쁜 예
const handleSubmit = (data: FormData) => {
  // 검증 없이 바로 제출
  submitData(data);
};
```

### ⚡ 성능 최적화 규칙

#### React 최적화 규칙

```typescript
// ✅ 좋은 예
const UserList = React.memo<UserListProps>(({ users, onUserClick }) => {
  return (
    <div>
      {users.map((user) => (
        <UserCard key={user.id} user={user} onClick={onUserClick} />
      ))}
    </div>
  );
});

const UserCard = React.memo<UserCardProps>(({ user, onClick }) => {
  const handleClick = useCallback(() => {
    onClick(user.id);
  }, [onClick, user.id]);

  return <div onClick={handleClick}>{user.name}</div>;
});

// ❌ 나쁜 예
const UserList = ({ users, onUserClick }) => {
  return (
    <div>
      {users.map((user) => (
        <div key={user.id} onClick={() => onUserClick(user.id)}>
          {user.name}
        </div>
      ))}
    </div>
  );
};
```

#### 메모이제이션 규칙

```typescript
// ✅ 좋은 예
const expensiveCalculation = useMemo(() => {
  return data.filter((item) => item.active).map((item) => item.value);
}, [data]);

const handleClick = useCallback(
  (id: number) => {
    onItemClick(id);
  },
  [onItemClick]
);

// ❌ 나쁜 예
const expensiveCalculation = data
  .filter((item) => item.active)
  .map((item) => item.value);

const handleClick = (id: number) => {
  onItemClick(id);
};
```

### 🧪 테스트 규칙

#### 단위 테스트 규칙

```typescript
// ✅ 좋은 예
describe("UserProfile", () => {
  it("should display user information correctly", () => {
    const mockUser: User = {
      id: 1,
      email: "test@example.com",
      nexusNickname: "TestUser",
      isStreamer: false,
      isVerified: false,
    };

    render(<UserProfile user={mockUser} onEdit={jest.fn()} />);

    expect(screen.getByText("TestUser")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });
});
```

#### 통합 테스트 규칙

```typescript
// ✅ 좋은 예
describe("Authentication Flow", () => {
  it("should login user successfully", async () => {
    const mockResponse = { data: { token: "test-token", user: mockUser } };
    api.post.mockResolvedValue(mockResponse);

    render(<Login />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText("로그인"));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/login", {
        email: "test@example.com",
        password: "password123",
      });
    });
  });
});
```

### 📝 커밋 메시지 규칙

#### 커밋 타입

- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 스타일 수정
- `refactor`: 코드 리팩토링
- `test`: 테스트 코드 추가/수정
- `chore`: 빌드 프로세스 또는 보조 도구 변경

#### 커밋 메시지 형식

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### 예시

```
feat(auth): OAuth 로그인 기능 추가

- Discord OAuth 연동 구현
- Google OAuth 연동 구현
- JWT 토큰 발급 로직 추가

Closes #123
```

### 🔄 Git 브랜치 규칙

#### 브랜치 명명 규칙

- `main`: 메인 브랜치
- `develop`: 개발 브랜치
- `feature/기능명`: 기능 개발 브랜치
- `fix/버그명`: 버그 수정 브랜치
- `hotfix/긴급수정`: 긴급 수정 브랜치
- `release/버전`: 릴리즈 브랜치

#### 브랜치 예시

```
feature/user-profile
feature/custom-game-creation
fix/login-error
hotfix/security-vulnerability
release/v1.0.0
```

---

## 📋 코드 리뷰 체크리스트

### 기능적 검토

- [ ] 요구사항을 정확히 구현했는가?
- [ ] 에러 처리가 적절한가?
- [ ] 입력 검증이 충분한가?
- [ ] 보안 취약점은 없는가?

### 코드 품질

- [ ] 코드가 읽기 쉬운가?
- [ ] 중복 코드가 없는가?
- [ ] 적절한 네이밍을 사용했는가?
- [ ] 주석이 필요한 곳에 작성되었는가?

### 성능

- [ ] 불필요한 리렌더링이 없는가?
- [ ] 메모리 누수는 없는가?
- [ ] API 호출이 최적화되었는가?

### 테스트

- [ ] 단위 테스트가 작성되었는가?
- [ ] 테스트 커버리지가 충분한가?
- [ ] 테스트가 실제로 동작하는가?

---

**NEXUS** - 체계적인 개발을 위한 규칙과 태그 시스템 📋
