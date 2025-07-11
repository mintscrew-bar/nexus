import React, { useState } from "react";
import "../styles/SignupPage.css";

const FindIdPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult("");
    setError("");
    try {
      // 실제 연동 시 fetch로 백엔드에 요청
      const res = await fetch("http://localhost:4000/api/auth/find-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "아이디 찾기 실패");
      setResult(`가입된 이메일: ${data.email}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h2 style={{ textAlign: "center", marginBottom: 32 }}>
          아이디(이메일) 찾기
        </h2>
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label>이름</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>전화번호</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <button className="signup-btn" type="submit">
            아이디(이메일) 찾기
          </button>
          {result && (
            <div className="password-rule-success" style={{ marginTop: 16 }}>
              {result}
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
export default FindIdPage;
