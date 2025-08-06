import React, { useState } from "react";
import ThemeToggle from "../common/ThemeToggle";
import FriendsPanel from "./FriendsPanel";
import Sidebar from "./Sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col lg:flex-row">
      {/* 모바일 헤더 */}
      <div className="lg:hidden bg-bg-secondary border-b border-border p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-text-primary">NEXUS</h1>
            <p className="text-xs text-text-muted">LoL 커뮤니티</p>
          </div>
        </div>
        <ThemeToggle variant="icon" size="sm" />
      </div>

      {/* 모바일 사이드바 */}
      {sidebarOpen && (
        <div className="fixed inset-y-0 left-0 w-64 bg-bg-secondary border-r border-border shadow-xl z-50">
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* 데스크톱 사이드바 */}
      <div className="hidden lg:block w-64 bg-bg-secondary border-r border-border flex-shrink-0 shadow-sm">
        <Sidebar />
      </div>

      {/* 메인 콘텐츠 - 데스크톱에서는 친구창 공간 고려 */}
      <main className="flex-1 overflow-y-auto bg-bg-primary lg:mr-80">
        {children}
      </main>

      {/* 친구 패널 - 모든 화면에서 렌더링 */}
      <FriendsPanel />
    </div>
  );
};

export default MainLayout;
