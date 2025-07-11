import React from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../common/config";

interface QuickMatchButtonProps {
  className?: string;
}

const QuickMatchButton: React.FC<QuickMatchButtonProps> = ({ className = "" }) => {
  const navigate = useNavigate();

  const handleQuickMatchClick = () => {
    navigate(ROUTES.BATTLES);
  };

  return (
    <button
      className={`quick-match-btn ${className}`}
      onClick={handleQuickMatchClick}
      type="button"
    >
      빠른 매칭
    </button>
  );
};

export default QuickMatchButton;
