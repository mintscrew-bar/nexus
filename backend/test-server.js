const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

// CORS 설정
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// JSON 파싱
app.use(express.json());

// 헬스 체크
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    message: "NEXUS Backend is running!",
  });
});

// 테스트 API
app.get("/api/test", (req, res) => {
  res.json({
    message: "NEXUS API is working!",
    data: {
      version: "1.0.0",
      features: ["auth", "community", "custom-games", "feedback"],
    },
  });
});

// 인증 테스트 API
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  // 간단한 테스트 로그인
  if (email === "test@nexus.com" && password === "password") {
    res.json({
      user: {
        id: 1,
        email: "test@nexus.com",
        nexusNickname: "TestUser",
        isVerified: true,
        isStreamer: false,
        isOnline: true,
      },
      token: "test-jwt-token-123",
    });
  } else {
    res.status(401).json({
      error: "Invalid credentials",
    });
  }
});

// 회원가입 테스트 API
app.post("/api/auth/register", (req, res) => {
  const { email, password, nexusNickname } = req.body;

  res.json({
    user: {
      id: 2,
      email,
      nexusNickname,
      isVerified: true,
      isStreamer: false,
      isOnline: true,
    },
    token: "test-jwt-token-456",
  });
});

// 커뮤니티 테스트 API
app.get("/api/community/posts", (req, res) => {
  res.json([
    {
      id: 1,
      title: "첫 번째 게시글",
      content: "안녕하세요! NEXUS 커뮤니티입니다.",
      category: "general",
      like_count: 5,
      dislike_count: 0,
      view_count: 10,
      created_at: new Date().toISOString(),
      nexus_nickname: "TestUser",
      comment_count: 2,
    },
    {
      id: 2,
      title: "게임 전략 공유",
      content: "리그 오브 레전드 전략을 공유해보세요.",
      category: "strategy",
      like_count: 8,
      dislike_count: 1,
      view_count: 15,
      created_at: new Date().toISOString(),
      nexus_nickname: "StrategyMaster",
      comment_count: 5,
    },
  ]);
});

// 피드백 테스트 API
app.post("/api/feedback", (req, res) => {
  res.json({
    message: "피드백이 성공적으로 제출되었습니다.",
    id: 1,
  });
});

// 사용자 평가 테스트 API
app.post("/api/feedback/evaluate-user", (req, res) => {
  res.json({
    message: "사용자 평가가 완료되었습니다.",
  });
});

// 404 핸들러
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 NEXUS Test Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Frontend URL: http://localhost:3000`);
  console.log(`📝 Test credentials: test@nexus.com / password`);
});
