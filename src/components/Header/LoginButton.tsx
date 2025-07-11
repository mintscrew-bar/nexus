import React from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../common/config";

interface LoginButtonProps {
  className?: string;
}

const LoginButton: React.FC<LoginButtonProps> = ({ className = "" }) => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate(ROUTES.LOGIN);
  };

  return (
    <button
      className={`login-btn ${className}`}
      onClick={handleLoginClick}
      type="button"
    >
      로그인
    </button>
  );
};

export default LoginButton;
