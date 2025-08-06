import {
  Home,
  LogOut,
  Search,
  Settings,
  Trophy,
  User,
  Users,
  Video,
} from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import ThemeToggle from "../common/ThemeToggle";

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const location = useLocation();
  const { user, logout } = useAppStore();

  const navigation = [
    { name: "홈", href: "/", icon: Home },
    { name: "내전", href: "/custom-games", icon: Trophy },
    { name: "커뮤니티", href: "/community", icon: Users },
    { name: "스트리머", href: "/streamers", icon: Video },
    { name: "검색", href: "/search", icon: Search },
    { name: "마이페이지", href: "/mypage", icon: User },
  ];

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
  };

  return (
    <div className="h-full flex flex-col bg-bg-secondary">
      {/* 헤더 */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-text-inverse font-bold text-sm">N</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">NEXUS</h1>
            <p className="text-xs text-text-muted">LoL 커뮤니티</p>
          </div>
        </div>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={`group flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-bg-tertiary text-text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary"
              }`}
            >
              <item.icon
                className={`w-5 h-5 ${
                  isActive
                    ? "text-text-primary"
                    : "text-text-muted group-hover:text-text-secondary"
                }`}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* 사용자 정보 */}
      <div className="p-4 border-t border-border space-y-4">
        {user && (
          <div className="flex items-center space-x-3 p-3 bg-bg-tertiary rounded-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
              <span className="text-text-inverse font-bold text-xs">
                {user.nexusNickname?.charAt(0) || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {user.nexusNickname || "사용자"}
              </p>
              <p className="text-xs text-text-muted truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* 설정 및 로그아웃 */}
        <div className="space-y-2">
          <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
            <span>설정</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>로그아웃</span>
          </button>
        </div>

        {/* 테마 토글 */}
        <div className="pt-2">
          <ThemeToggle variant="button" size="sm" className="w-full" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
