import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiService from "../../services/api";
import { useAppStore } from "../../store/useAppStore";

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, setAuthenticated } = useAppStore();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // 토큰을 localStorage에 저장
      localStorage.setItem("token", token);

      // API 서비스에 토큰 설정
      apiService.setToken(token);

      // 사용자 정보 가져오기
      apiService
        .getCurrentUser()
        .then((userData) => {
          setUser(userData);
          setAuthenticated(true);

          // 성공적으로 로그인되면 홈페이지로 리다이렉트
          navigate("/", { replace: true });
        })
        .catch((error) => {
          console.error("Failed to get user info:", error);
          // 에러 발생 시 토큰 제거하고 로그인 페이지로 리다이렉트
          localStorage.removeItem("token");
          apiService.clearToken();
          setAuthenticated(false);
          navigate("/login", { replace: true });
        });
    } else {
      // 토큰이 없으면 로그인 페이지로 리다이렉트
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate, setUser, setAuthenticated]);

  return (
    <div className="min-h-screen bg-nexus-dark flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">로그인 처리 중...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
