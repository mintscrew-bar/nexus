const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const { createServer } = require("http");

// 환경 변수 설정 (dotenv가 없을 경우를 대비)
try {
  require("dotenv").config();
} catch (error) {
  console.log("dotenv not found, using default values");
}

if (!process.env.NODE_ENV) process.env.NODE_ENV = "development";
if (!process.env.PORT) process.env.PORT = 5000;
if (!process.env.JWT_SECRET)
  process.env.JWT_SECRET = "nexus-super-secret-jwt-key-2024";
if (!process.env.FRONTEND_URL)
  process.env.FRONTEND_URL = "http://localhost:3000";

// 데이터베이스 환경 변수 강제 설정
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    "postgresql://nexus_user:justgamo1226.@localhost:5432/nexus_db";
}
if (!process.env.DB_USER) process.env.DB_USER = "nexus_user";
if (!process.env.DB_PASSWORD) process.env.DB_PASSWORD = "justgamo1226.";
if (!process.env.DB_HOST) process.env.DB_HOST = "localhost";
if (!process.env.DB_PORT) process.env.DB_PORT = "5432";
if (!process.env.DB_NAME) process.env.DB_NAME = "nexus_db";

const { connectDB } = require("./config/database");
const DatabaseMonitor = require("./config/database-monitor");
const connectRedis = require("./config/redis");
const { setupPassport } = require("./config/passport");
const setupSocketIO = require("./config/socket");

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const customGameRoutes = require("./routes/customGames");
const matchRoutes = require("./routes/matches");
const communityRoutes = require("./routes/community");
const streamerRoutes = require("./routes/streamers");
const riotApiRoutes = require("./routes/riotApi");
const feedbackRoutes = require("./routes/feedback");
const tournamentRoutes = require("./routes/tournaments");
const chatRoutes = require("./routes/chat");
const friendsRoutes = require("./routes/friends");

const app = express();
const server = createServer(app);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
      },
    },
  })
);

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // limit each IP to 1000 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // 개발 환경에서는 rate limiting을 완화
  skip: (req) => {
    return process.env.NODE_ENV === "development" && req.path === "/health";
  },
});

app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Health check endpoint
app.get("/health", (req, res) => {
  const DatabaseMonitor = require("./config/database-monitor");
  const dbMonitor = new DatabaseMonitor();

  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: dbMonitor.getStatus(),
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/friends", friendsRoutes);
app.use("/api/messages", chatRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/conversations", chatRoutes); // conversations도 chat 라우터 사용
app.use("/api/custom-games", customGameRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/streamers", streamerRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/riot", riotApiRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/tournaments", tournamentRoutes);

const errorHandler = require("./middleware/errorHandler");

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Socket.IO setup
setupSocketIO(server);

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    // 데이터베이스 매니저 초기화
    console.log("🔄 Initializing database manager...");
    try {
      const success = await connectDB();
      if (success) {
        console.log("✅ Database manager initialized successfully");

        // 테이블 존재 확인
        const { simpleInit } = require("./database/simple-init");
        const tableCheck = await simpleInit();
        if (tableCheck) {
          console.log("✅ Database tables verified");
        } else {
          console.log("⚠️  Database tables not found, but continuing...");
        }
      } else {
        console.log(
          "⚠️  Database manager initialization failed, but continuing..."
        );
      }
    } catch (error) {
      console.log(
        "⚠️  Database initialization failed, continuing without database"
      );
      console.error("Database error details:", error.message);
    }

    // Redis 연결 (선택사항)
    try {
      await connectRedis();
      console.log("✅ Redis connected");
    } catch (error) {
      console.log("⚠️  Redis connection failed, continuing without Redis");
    }

    // Setup Passport
    setupPassport();

    // 데이터베이스 모니터링 시작
    const dbMonitor = new DatabaseMonitor();
    dbMonitor.startMonitoring(60000); // 1분마다 체크

    server.listen(PORT, () => {
      console.log(`🚀 NEXUS Backend Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(
        `🔗 Frontend URL: ${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }`
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
