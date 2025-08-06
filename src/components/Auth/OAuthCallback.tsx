import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiService from "../../services/api";
import { useAppStore } from "../../store/useAppStore";

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, setAuthenticated } = useAppStore();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError("OAuth 인증에 실패했습니다. 다시 시도해주세요.");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      return;
    }

    if (token) {
      // 토큰 저장
      localStorage.setItem("token", token);
      apiService.setToken(token);

      // 사용자 정보 설정 (토큰에서 추출하거나 API 호출)
      apiService
        .getCurrentUser()
        .then((user) => {
          console.log("✅ 사용자 정보 가져오기 성공:", user);
          setUser(user);
          setAuthenticated(true);
          navigate("/");
        })
        .catch((err) => {
          console.error("❌ 사용자 정보 가져오기 오류:", err);

          // 토큰이 있지만 사용자 정보를 가져올 수 없는 경우
          if (err.response?.status === 401) {
            setError("인증 토큰이 만료되었습니다. 다시 로그인해주세요.");
            localStorage.removeItem("token");
            apiService.clearToken();
          } else {
            setError(
              "사용자 정보를 가져오는데 실패했습니다. 다시 시도해주세요."
            );
          }

          setTimeout(() => {
            navigate("/login");
          }, 3000);
        });
    } else {
      setError("인증 토큰을 받지 못했습니다.");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }
  }, [searchParams, navigate, setUser, setAuthenticated]);

  if (error) {
    return (
      <div className="min-h-screen bg-nexus-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">인증 실패</h2>
          <p className="text-nexus-light-gray">{error}</p>
          <p className="text-nexus-light-gray text-sm mt-2">
            로그인 페이지로 이동합니다...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nexus-dark flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nexus-blue mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-white mb-2">인증 중...</h2>
        <p className="text-nexus-light-gray">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
