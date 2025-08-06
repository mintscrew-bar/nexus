const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const DiscordStrategy = require("passport-discord").Strategy;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// JWT 설정 - 기본값 강제 설정
const JWT_SECRET = process.env.JWT_SECRET || "nexus-super-secret-jwt-key-2024";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// OAuth 설정 (기본값 설정)
const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID || "your-google-client-id";
const GOOGLE_CLIENT_SECRET =
  process.env.GOOGLE_CLIENT_SECRET || "your-google-client-secret";
const DISCORD_CLIENT_ID =
  process.env.DISCORD_CLIENT_ID || "your-discord-client-id";
const DISCORD_CLIENT_SECRET =
  process.env.DISCORD_CLIENT_SECRET || "your-discord-client-secret";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// JWT Strategy - secret이 확실히 설정되도록
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },
    async (payload, done) => {
      try {
        // 여기서는 payload에 사용자 정보가 포함되어 있다고 가정
        return done(null, payload);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${
        process.env.BACKEND_URL || "http://localhost:5000"
      }/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Google 프로필에서 사용자 정보 추출
        const user = {
          id: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          avatar: profile.photos[0].value,
          provider: "google",
        };
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Discord OAuth Strategy
passport.use(
  new DiscordStrategy(
    {
      clientID: DISCORD_CLIENT_ID,
      clientSecret: DISCORD_CLIENT_SECRET,
      callbackURL: `${
        process.env.BACKEND_URL || "http://localhost:5000"
      }/api/auth/discord/callback`,
      scope: ["identify", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Discord 프로필에서 사용자 정보 추출
        const user = {
          id: profile.id,
          email: profile.email,
          name: profile.username,
          avatar: profile.avatar,
          provider: "discord",
        };
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user
passport.deserializeUser((user, done) => {
  done(null, user);
});

// JWT 토큰 생성
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// 비밀번호 해싱
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// 비밀번호 비교
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// 인증 미들웨어
const isAuthenticated = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: "Authentication error" });
    }
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = user;
    next();
  })(req, res, next);
};

// 인증된 사용자만 접근 가능 (선택적)
const isVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!req.user.isVerified) {
    return res.status(403).json({ error: "Email verification required" });
  }
  next();
};

// 스트리머만 접근 가능
const isStreamer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!req.user.isStreamer) {
    return res.status(403).json({ error: "Streamer access required" });
  }
  next();
};

// Passport 초기화 함수
const setupPassport = () => {
  console.log(
    "✅ Passport configured with JWT_SECRET:",
    JWT_SECRET ? "SET" : "NOT SET"
  );
  if (GOOGLE_CLIENT_ID === "your-google-client-id") {
    console.log("⚠️  Google OAuth not configured");
  }
  if (DISCORD_CLIENT_ID === "your-discord-client-id") {
    console.log("⚠️  Discord OAuth not configured");
  }
};

module.exports = {
  passport,
  generateToken,
  hashPassword,
  comparePassword,
  isAuthenticated,
  isVerified,
  isStreamer,
  setupPassport,
};
