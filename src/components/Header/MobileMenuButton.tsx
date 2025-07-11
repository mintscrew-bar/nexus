import React from "react";

interface MobileMenuButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({
  isOpen,
  onToggle,
  className = "",
}) => {
  return (
    <button
      className={`mobile-menu-btn ${className} ${isOpen ? "active" : ""}`}
      onClick={onToggle}
      type="button"
      aria-label={isOpen ? "메뉴 닫기" : "메뉴 열기"}
    >
      <span></span>
      <span></span>
      <span></span>
    </button>
  );
};

export default MobileMenuButton;
