import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";
import Footer from "./components/layouts/footer";
import Header from "./components/layouts/header";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ContactPage from "./pages/ContactPage";
import FindAccountPage from "./pages/FindAccountPage";
import FindIdPage from "./pages/FindIdPage";
import FindPasswordPage from "./pages/FindPasswordPage";
import LoginPage from "./pages/LoginPage";
import PrivacyPage from "./pages/PrivacyPage";
import SignupPage from "./pages/SignupPage";
import TermsPage from "./pages/TermsPage";
import "./styles/App.css";

// 페이지 컴포넌트들 (임시)
const Home = () => (
  <div className="page-container">
    <h1>🏠 내전 목록</h1>
    <p>진행 중인 내전들을 확인하세요!</p>
  </div>
);

const Battles = () => (
  <div className="page-container">
    <h1>⚔️ 내전 참가</h1>
    <p>참가 가능한 내전을 찾아보세요!</p>
  </div>
);

const Create = () => (
  <div className="page-container">
    <h1>➕ 내전 모집</h1>
    <p>새로운 내전을 만들어보세요!</p>
  </div>
);

const Community = () => (
  <div className="page-container">
    <h1>💬 자유게시판</h1>
    <p>커뮤니티와 소통해보세요!</p>
  </div>
);

const Users = () => (
  <div className="page-container">
    <h1>👥 유저 DB</h1>
    <p>다른 플레이어들의 정보를 확인하세요!</p>
  </div>
);

const Ranking = () => (
  <div className="page-container">
    <h1>🏆 랭킹</h1>
    <p>플레이어들의 순위를 확인하세요!</p>
  </div>
);

const Profile = () => (
  <div className="page-container">
    <h1>👤 프로필</h1>
    <p>내 정보를 관리하세요!</p>
  </div>
);

const Friends = () => (
  <div className="page-container">
    <h1>👥 친구 목록</h1>
    <p>친구들을 관리하세요!</p>
  </div>
);

const History = () => (
  <div className="page-container">
    <h1>📊 전적 기록</h1>
    <p>나의 전적을 확인하세요!</p>
  </div>
);

const Settings = () => (
  <div className="page-container">
    <h1>⚙️ 설정</h1>
    <p>계정 설정을 관리하세요!</p>
  </div>
);

// 메인 앱 컴포넌트
const AppContent = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="App">
      {!isLoginPage && <Header />}
      <main className={`main-content ${isLoginPage ? "login-page-main" : ""}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/battles" element={<Battles />} />
          <Route path="/create" element={<Create />} />
          <Route path="/community" element={<Community />} />
          <Route path="/users" element={<Users />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/find-account" element={<FindAccountPage />} />
          <Route path="/find-id" element={<FindIdPage />} />
          <Route path="/find-password" element={<FindPasswordPage />} />
        </Routes>
      </main>
      {!isLoginPage && <Footer />}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
