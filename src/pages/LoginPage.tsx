import React, { useState } from "react";
import { FaDiscord, FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Logo from "../components/common/Logo";
import { useAuth } from "../contexts/AuthContext";
import { useForm } from "../hooks";
import "../styles/LoginPage.css";
import { validationUtils } from "../utils";

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [autoLogin, setAutoLogin] = useState(false);

  const { values, errors, touched, handleChange, handleBlur } =
    useForm<LoginFormData>({
      email: "",
      password: "",
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // 폼 유효성 검사
    const newErrors: Partial<Record<keyof LoginFormData, string>> = {};

    if (!values.email) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!validationUtils.isEmail(values.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다.";
    }

    if (!values.password) {
      newErrors.password = "비밀번호를 입력해주세요.";
    } else if (values.password.length < 6) {
      newErrors.password = "비밀번호는 6자 이상이어야 합니다.";
    }

    if (Object.keys(newErrors).length > 0) {
      // 에러가 있으면 처리하지 않음
      return;
    }

    try {
      const success = await login(values.email, values.password, autoLogin);
      if (success) {
        navigate("/");
      } else {
        setErrorMessage("이메일 또는 비밀번호가 올바르지 않습니다.");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setErrorMessage("로그인 중 오류가 발생했습니다.");
    }
  };

  const handleGoogleLogin = () => {
    // Google OAuth 로그인 구현
    console.log("Google 로그인 시도");
    // 실제 구현에서는 Google OAuth API 호출
  };

  const handleDiscordLogin = () => {
    // Discord OAuth 로그인 구현
    console.log("Discord 로그인 시도");
    // 실제 구현에서는 Discord OAuth API 호출
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <Logo text="NEXUS" to="/" />
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              이메일
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={values.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              className={`form-input ${
                errors.email && touched.email ? "error" : ""
              }`}
              placeholder="이메일을 입력해주세요"
              disabled={isLoading}
              autoComplete="email"
            />
            {errors.email && touched.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              비밀번호
            </label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={values.password}
                onChange={(e) => handleChange("password", e.target.value)}
                onBlur={() => handleBlur("password")}
                className={`form-input ${
                  errors.password && touched.password ? "error" : ""
                }`}
                placeholder="비밀번호를 입력해주세요"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && touched.password && (
              <span className="error-message">{errors.password}</span>
            )}
            <div className="auto-login-group">
              <label className="auto-login-label">
                <input
                  type="checkbox"
                  checked={autoLogin}
                  onChange={(e) => setAutoLogin(e.target.checked)}
                  disabled={isLoading}
                />
                자동 로그인
              </label>
            </div>
          </div>

          {errorMessage && (
            <div className="error-container">
              <span className="error-message">{errorMessage}</span>
            </div>
          )}

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="divider">
          <span>또는</span>
        </div>

        <div className="social-login">
          <button
            type="button"
            className="social-button google"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <FaGoogle className="social-icon" />
            <span>Google로 로그인</span>
          </button>

          <button
            type="button"
            className="social-button discord"
            onClick={handleDiscordLogin}
            disabled={isLoading}
          >
            <FaDiscord className="social-icon" />
            <span>Discord로 로그인</span>
          </button>
        </div>

        <div className="login-footer">
          <p>
            계정이 없으신가요?{" "}
            <button
              type="button"
              className="link-button"
              onClick={() => navigate("/signup")}
            >
              회원가입
            </button>
          </p>
          <button
            type="button"
            className="link-button"
            onClick={() => navigate("/find-account")}
          >
            비밀번호를 잊으셨나요?
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
