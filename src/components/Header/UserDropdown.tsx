import React, { useRef, useState } from "react";
import {
  FaCog,
  FaHistory,
  FaSignOutAlt,
  FaUser,
  FaUserFriends,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useClickOutside } from "../../hooks";
import { ROUTES } from "../common/config";

interface UserDropdownProps {
  className?: string;
  user?: {
    username: string;
    profileImage?: string;
  };
}

const UserDropdown: React.FC<UserDropdownProps> = ({
  className = "",
  user = { username: "사용자" },
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useClickOutside(dropdownRef, () => setIsOpen(false));

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    // 로그아웃 로직 구현
    console.log("로그아웃");
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className={`user-menu ${className}`} ref={dropdownRef}>
      <button
        className="user-menu-btn"
        onClick={handleToggle}
        type="button"
        aria-label="사용자 메뉴"
      >
        {user.profileImage ? (
          <img
            src={user.profileImage}
            alt={user.username}
            className="user-avatar"
          />
        ) : (
          <div className="user-avatar-placeholder">
            <FaUser />
          </div>
        )}
        <span className="username">{user.username}</span>
      </button>

      {isOpen && (
        <div className="user-dropdown user-dropdown-animate user-dropdown-animate-in">
          <div className="user-dropdown-list">
            <Link to={ROUTES.PROFILE} className="menu-item">
              <FaUser />
              <span>프로필</span>
            </Link>

            <Link to={ROUTES.FRIENDS} className="menu-item">
              <FaUserFriends />
              <span>친구 목록</span>
            </Link>

            <Link to={ROUTES.HISTORY} className="menu-item">
              <FaHistory />
              <span>전적 기록</span>
            </Link>

            <Link to={ROUTES.SETTINGS} className="menu-item">
              <FaCog />
              <span>설정</span>
            </Link>

            <li className="divider" />

            <button
              className="menu-item logout"
              onClick={handleLogout}
              type="button"
            >
              <FaSignOutAlt />
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
