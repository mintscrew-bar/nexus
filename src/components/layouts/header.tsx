import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import "../../styles/header.css";
import Logo from "../common/Logo";

const Header: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogin = () => {
    window.location.href = "/login";
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    if (isNotificationOpen) setIsNotificationOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // 검색 로직
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleSearchButtonClick = () => {
    if (isSearchOpen) {
      setIsSearchOpen(false);
      setSearchQuery("");
    } else {
      setIsSearchOpen(true);
    }
  };

  // 알림 예시 데이터
  const notifications = [
    {
      userImg: "https://randomuser.me/api/portraits/men/32.jpg",
      userName: "김내전",
      roomTitle: "실버 5:5 내전방",
      time: "5분 전",
      unread: true,
    },
    {
      userImg: "https://randomuser.me/api/portraits/women/44.jpg",
      userName: "박매치",
      roomTitle: "골드 랭크전",
      time: "10분 전",
      unread: true,
    },
    {
      userImg: "https://randomuser.me/api/portraits/men/12.jpg",
      userName: "이랭킹",
      roomTitle: "플래티넘 3:3",
      time: "1시간 전",
      unread: false,
    },
  ];

  return (
    <header className="header">
      <div className="header-container">
        {/* 로고 */}
        <Logo text="NEXUS" to="/" variant="header" showIcon={true} />

        {/* 네비게이션 */}
        <nav className={`header-nav ${isMobileMenuOpen ? "nav-open" : ""}`}>
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/battles" onClick={() => setIsMobileMenuOpen(false)}>
                내전 참가
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/create" onClick={() => setIsMobileMenuOpen(false)}>
                내전 모집
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/community" onClick={() => setIsMobileMenuOpen(false)}>
                자유게시판
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/users" onClick={() => setIsMobileMenuOpen(false)}>
                유저 DB
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/ranking" onClick={() => setIsMobileMenuOpen(false)}>
                랭킹
              </Link>
            </li>
          </ul>
        </nav>

        {/* 우측 유틸리티 영역 */}
        <div className="header-utils">
          {/* 빠른 매칭 버튼 */}
          <button className="quick-match-btn">빠른 매칭</button>

          {/* 검색창 */}
          <form
            className={`search-form-outer${
              isSearchOpen ? " search-form-outer-open" : ""
            }`}
            onSubmit={handleSearchSubmit}
            style={{ marginRight: "8px" }}
          >
            <input
              type="text"
              placeholder="검색어를 입력하세요..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              style={{ borderRadius: 0 }}
              autoComplete="off"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="search-clear-btn"
                title="검색어 지우기"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </form>

          {/* 검색 버튼 */}
          <button
            className="search-btn"
            onClick={handleSearchButtonClick}
            title="검색"
            aria-label="검색"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>

          {/* 다크모드 토글 */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={isDarkMode ? "라이트 모드" : "다크 모드"}
            data-dark={isDarkMode}
            style={{
              position: "relative",
              width: 32,
              height: 32,
              perspective: 120,
            }}
          >
            <span
              className="theme-icon-carousel"
              style={{
                width: 16,
                height: 16,
                position: "relative",
                display: "block",
              }}
            >
              <span
                className="carousel-face sun-face"
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: 16,
                  height: 16,
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              </span>
              <span
                className="carousel-face moon-face"
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: 16,
                  height: 16,
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
                </svg>
              </span>
            </span>
          </button>

          {/* 알림/사용자 버튼 */}
          {isAuthenticated ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* 알림 버튼 */}
              <button
                className="notification-btn"
                onClick={() => setIsNotificationOpen((prev) => !prev)}
                aria-label="알림"
              >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6V11c0-3.07-1.63-5.64-5-6.32V4a1 1 0 10-2 0v.68C7.63 5.36 6 7.92 6 11v5l-1.29 1.29A1 1 0 006 19h12a1 1 0 00.71-1.71L18 16z"
                    fill="currentColor"
                  />
                </svg>
                {notifications.some((n) => n.unread) && (
                  <span className="notification-badge" />
                )}
              </button>
              {/* 사용자 아바타/메뉴 */}
              <button
                className="user-menu-btn"
                onClick={toggleUserMenu}
                aria-label="사용자 메뉴"
              >
                <img
                  src={user?.avatar}
                  alt="user avatar"
                  className="user-avatar"
                />
              </button>
            </div>
          ) : (
            <button className="login-btn" onClick={handleLogin}>
              로그인
            </button>
          )}

          {/* 알림 드롭다운 메뉴 */}
          {isAuthenticated && isNotificationOpen && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>알림</h3>
                <button
                  className="notification-close"
                  onClick={() => setIsNotificationOpen(false)}
                >
                  ✕
                </button>
              </div>
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="no-notifications">
                    <p>새로운 알림이 없습니다.</p>
                  </div>
                ) : (
                  notifications.map((n, i) => (
                    <div
                      key={i}
                      className={`notification-item ${
                        n.unread ? "unread" : ""
                      }`}
                    >
                      <div className="notification-content">
                        <div className="notification-title">{n.roomTitle}</div>
                        <div className="notification-message">
                          {n.userName}님이 새로운 소식을 보냈습니다.
                        </div>
                        <div className="notification-time">{n.time}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 사용자 드롭다운 메뉴 */}
          {isUserMenuOpen && (
            <div className="user-dropdown">
              <div className="user-dropdown-list">
                <div className="user-dropdown-item">
                  <button>마이페이지</button>
                </div>
                <div className="user-dropdown-item">
                  <button>계정전환</button>
                </div>
                <div className="user-dropdown-item">
                  <button onClick={handleLogout}>로그아웃</button>
                </div>
                <div className="user-dropdown-divider" />
                <div className="user-dropdown-item">
                  <button>설정</button>
                </div>
                <div className="user-dropdown-item">
                  <button>문의하기</button>
                </div>
              </div>
            </div>
          )}

          {/* 모바일 메뉴 버튼 */}
          <button
            className={`mobile-menu-btn ${isMobileMenuOpen ? "active" : ""}`}
            onClick={toggleMobileMenu}
            aria-label="메뉴"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
