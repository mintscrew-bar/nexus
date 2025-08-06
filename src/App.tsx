import { useEffect } from "react";
import {
  Navigate,
  Outlet,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import ForgotPassword from "./components/Auth/ForgotPassword";
import Login from "./components/Auth/Login";
import OAuthCallback from "./components/Auth/OAuthCallback";
import Register from "./components/Auth/Register";
import ResetPassword from "./components/Auth/ResetPassword";
import { ThemeProvider } from "./components/common/ThemeProvider";
import CommunityPage from "./components/Community/CommunityPage";
import CustomGameDetail from "./components/CustomGame/CustomGameDetail";
import CustomGameList from "./components/CustomGame/CustomGameList";
import TeamFormationTest from "./components/CustomGame/TeamFormationTest";
import HomePage from "./components/Home/HomePage";
import MainLayout from "./components/Layout/MainLayout";
import MessagesPage from "./components/Messages/MessagesPage";
import MyPage from "./components/MyPage/MyPage";
import SearchPage from "./components/Search/SearchPage";
import StreamerList from "./components/Streamer/StreamerList";
import { useAppStore } from "./store/useAppStore";

// 보호된 라우트 컴포넌트
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading, user } = useAppStore();

  // 로딩 중이면 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-theme-bg flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-pulse-slow mb-4">
            <div className="w-16 h-16 bg-nexus-gold rounded-full mx-auto flex items-center justify-center">
              <span className="text-white text-2xl font-bold">N</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-theme-text mb-2">NEXUS</h1>
          <p className="text-theme-text-secondary mb-4">
            League of Legends 커뮤니티
          </p>
          <div className="flex space-x-1 justify-center">
            <div className="w-2 h-2 bg-nexus-gold rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-nexus-gold rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-nexus-gold rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
          <p className="text-sm text-theme-text-secondary mt-4">
            인증 상태를 확인하는 중...
          </p>
        </div>
      </div>
    );
  }

  // 인증되지 않았으면 로그인 페이지로 리다이렉트
  if (!isAuthenticated || !user) {
    console.log("🔒 인증되지 않은 사용자 - 로그인 페이지로 리다이렉트");
    return <Navigate to="/login" replace />;
  }

  // 인증된 사용자는 요청된 컴포넌트 렌더링
  return <>{children}</>;
};

// 인증 페이지용 컴포넌트 (이미 로그인된 사용자는 홈으로 리다이렉트)
const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAppStore();

  // 로딩 중이면 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-theme-bg flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-pulse-slow mb-4">
            <div className="w-16 h-16 bg-nexus-gold rounded-full mx-auto flex items-center justify-center">
              <span className="text-white text-2xl font-bold">N</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-theme-text mb-2">NEXUS</h1>
          <p className="text-theme-text-secondary mb-4">
            League of Legends 커뮤니티
          </p>
          <div className="flex space-x-1 justify-center">
            <div className="w-2 h-2 bg-nexus-gold rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-nexus-gold rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-nexus-gold rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
          <p className="text-sm text-theme-text-secondary mt-4">
            인증 상태를 확인하는 중...
          </p>
        </div>
      </div>
    );
  }

  // 이미 인증된 사용자는 홈으로 리다이렉트
  if (isAuthenticated && user) {
    console.log("🔒 이미 인증된 사용자 - 홈으로 리다이렉트");
    return <Navigate to="/" replace />;
  }

  // 인증되지 않은 사용자는 요청된 인증 컴포넌트 렌더링
  return <>{children}</>;
};

function App() {
  const {
    setLoading,
    setError,
    initializeAuth,
    checkConnection,
    user,
    initializeSocket,
    disconnectSocket,
    socketStatus,
    isLoading,
    error,
    theme,
  } = useAppStore();

  // 앱 시작 시 토큰 확인 및 사용자 정보 로드
  useEffect(() => {
    const initializeApp = async () => {
      console.log("🚀 앱 초기화 시작");
      setLoading(true);
      setError(null);

      try {
        console.log("🔍 서버 연결 상태 확인 중...");
        // 서버 연결 상태 확인 (타임아웃 설정)
        const connectionPromise = checkConnection();
        const timeoutPromise = new Promise<boolean>(
          (resolve) => setTimeout(() => resolve(false), 5000) // 5초 타임아웃
        );

        const isConnected = await Promise.race([
          connectionPromise,
          timeoutPromise,
        ]);

        console.log("📡 서버 연결 상태:", isConnected);

        if (!isConnected) {
          console.warn("⚠️ 서버 연결 실패, 오프라인 모드로 진행");
          setError("서버에 연결할 수 없습니다. 오프라인 모드로 진행합니다.");
        }

        // 인증 상태 초기화 (서버 연결 실패해도 시도)
        try {
          console.log("🔐 인증 상태 초기화 중...");
          await initializeAuth();
          console.log("✅ 인증 초기화 완료");
        } catch (authError) {
          console.warn("⚠️ 인증 초기화 실패:", authError);
          // 인증 실패해도 앱은 계속 진행
        }

        // Socket.IO 연결 초기화 (서버 연결 실패해도 시도)
        try {
          console.log("🔌 Socket.IO 초기화 중...");
          initializeSocket();
          console.log("✅ Socket.IO 초기화 완료");
        } catch (socketError) {
          console.warn("⚠️ Socket.IO 초기화 실패:", socketError);
          // Socket.IO 실패해도 앱은 계속 진행
        }

        console.log("✅ 앱 초기화 완료");
      } catch (error) {
        console.error("❌ 앱 초기화 실패:", error);
        setError(
          "앱 초기화 중 오류가 발생했습니다. 오프라인 모드로 진행합니다."
        );
      } finally {
        console.log("🏁 로딩 상태 해제");
        setLoading(false);
      }
    };

    initializeApp();
  }, [initializeAuth, setLoading, setError, checkConnection, initializeSocket]);

  // 테마 초기화
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
  }, [theme]);

  // 사용자 인증 상태 변경 시 Socket.IO 연결 관리
  useEffect(() => {
    const token = localStorage.getItem("token");
    const { isAuthenticated } = useAppStore.getState();

    if (token && user && isAuthenticated) {
      // 사용자가 로그인된 경우 Socket.IO 연결
      console.log("🔌 사용자 인증됨 - Socket.IO 연결 시도");
      initializeSocket();
    } else if (!token) {
      // 사용자가 로그아웃된 경우 Socket.IO 연결 해제
      console.log("🔌 사용자 로그아웃됨 - Socket.IO 연결 해제");
      disconnectSocket();
    }
  }, [user, initializeSocket, disconnectSocket]);

  // 주기적으로 연결 상태 확인
  useEffect(() => {
    const connectionCheckInterval = setInterval(async () => {
      try {
        await checkConnection();

        // Socket.IO 연결 상태도 확인
        const { isAuthenticated } = useAppStore.getState();
        if (
          !socketStatus.isConnected &&
          localStorage.getItem("token") &&
          user &&
          isAuthenticated
        ) {
          console.log("Socket.IO 재연결 시도...");
          initializeSocket();
        }
      } catch (error) {
        console.error("연결 상태 확인 실패:", error);
      }
    }, 120000); // 2분마다 확인 (rate limiting 방지)

    return () => clearInterval(connectionCheckInterval);
  }, [checkConnection, socketStatus.isConnected, initializeSocket, user]);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
        <div className="min-h-screen bg-theme-bg">
          {/* 에러 상태 표시 */}
          {error && (
            <div className="fixed inset-0 bg-theme-bg flex items-center justify-center z-50">
              <div className="text-center max-w-md mx-4">
                <div className="w-16 h-16 bg-danger rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl">⚠️</span>
                </div>
                <h1 className="text-xl font-bold text-theme-text mb-2">
                  연결 오류
                </h1>
                <p className="text-theme-text-secondary mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn btn-primary"
                >
                  다시 시도
                </button>
              </div>
            </div>
          )}

          {/* 메인 앱 콘텐츠 */}
          {!error && (
            <Routes>
              {/* 인증 페이지들 (사이드바 없음) */}
              <Route
                path="/reset-password"
                element={
                  <AuthRoute>
                    <ResetPassword />
                  </AuthRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <AuthRoute>
                    <ForgotPassword />
                  </AuthRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <AuthRoute>
                    <Login />
                  </AuthRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <AuthRoute>
                    <Register />
                  </AuthRoute>
                }
              />
              <Route path="/oauth-callback" element={<OAuthCallback />} />

              {/* 보호된 라우트들 (사이드바 포함) */}
              <Route
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Outlet />
                    </MainLayout>
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<HomePage />} />
                <Route path="/mypage" element={<MyPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/custom-games" element={<CustomGameList />} />
                <Route
                  path="/custom-games/:id"
                  element={<CustomGameDetail />}
                />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/streamers" element={<StreamerList />} />
                <Route
                  path="/team-formation-test"
                  element={<TeamFormationTest />}
                />
              </Route>

              {/* 기본 경로 - 로그인되지 않은 사용자는 로그인 페이지로 */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          )}
        </div>
      </ThemeProvider>
    </Router>
  );
}

export default App;
