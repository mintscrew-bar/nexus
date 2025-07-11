import React, { useState } from "react";
import "../styles/SignupPage.css";

const FindPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await fetch(
        "http://localhost:4000/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "임시 비밀번호 발송 실패");
      setMessage("임시 비밀번호가 이메일로 발송되었습니다.");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h2 style={{ textAlign: "center", marginBottom: 32 }}>비밀번호 찾기</h2>
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label>이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button className="signup-btn" type="submit">
            임시 비밀번호 발송
          </button>
          {message && (
            <div className="password-rule-success" style={{ marginTop: 16 }}>
              {message}
            </div>
          )}
          {error && (
            <div className="password-rule-error" style={{ marginTop: 16 }}>
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
export default FindPasswordPage;
