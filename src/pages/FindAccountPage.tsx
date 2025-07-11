import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SignupPage.css";

const FindAccountPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="signup-page">
      <div className="signup-container">
        <h2 style={{ textAlign: "center", marginBottom: 32 }}>
          아이디/비밀번호 찾기
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <button className="signup-btn" onClick={() => navigate("/find-id")}>
            아이디 찾기
          </button>
          <button
            className="signup-btn"
            onClick={() => navigate("/find-password")}
          >
            비밀번호 찾기
          </button>
        </div>
      </div>
    </div>
  );
};
export default FindAccountPage;
