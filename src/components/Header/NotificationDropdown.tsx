import React, { useRef, useState } from "react";
import { FaBell, FaTimes } from "react-icons/fa";
import { useClickOutside } from "../../hooks";

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

interface NotificationDropdownProps {
  className?: string;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "새로운 내전 초대",
      message: "홍길동님이 내전에 초대했습니다.",
      isRead: false,
      createdAt: new Date(),
    },
    {
      id: "2",
      title: "내전 시작 알림",
      message: "참가한 내전이 곧 시작됩니다.",
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30분 전
    },
  ]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  };

  return (
    <div className={`notification-menu ${className}`} ref={dropdownRef}>
      <button
        className="notification-btn"
        onClick={handleToggle}
        type="button"
        aria-label="알림"
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown notification-dropdown-youtube">
          <div className="notification-youtube-header">
            <h3>알림</h3>
            {unreadCount > 0 && (
              <button
                className="notification-youtube-close"
                onClick={handleMarkAllAsRead}
                type="button"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <div className="notification-list-youtube">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <p>새로운 알림이 없습니다.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item-youtube ${
                    !notification.isRead ? "unread" : ""
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
