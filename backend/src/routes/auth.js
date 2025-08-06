const nodemailer = require("nodemailer");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const { getOne, getMany, execute } = require("../config/database");
// const { googleCallbackLimiter } = require("../middleware/rateLimit");

const router = express.Router();

// 회원가입 API
router.post("/register", async (req, res) => {
  try {
    const { email, password, nexusNickname } = req.body;

    // 입력값 검증
    if (!email || !password || !nexusNickname) {
      return res.status(400).json({
        success: false,
        message: "이메일, 비밀번호, 닉네임을 모두 입력해주세요.",
      });
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "올바른 이메일 형식을 입력해주세요.",
      });
    }

    // 비밀번호 길이 검증
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "비밀번호는 최소 6자 이상이어야 합니다.",
      });
    }

    // 닉네임 길이 검증
    if (nexusNickname.length < 2 || nexusNickname.length > 20) {
      return res.status(400).json({
        success: false,
        message: "닉네임은 2자 이상 20자 이하여야 합니다.",
      });
    }

    // 이메일 중복 확인
    const emailCheck = await getOne("SELECT id FROM users WHERE email = $1", [
      email,
    ]);

    if (emailCheck) {
      return res.status(400).json({
        success: false,
        message: "이미 사용 중인 이메일입니다.",
      });
    }

    // 닉네임 중복 확인
    const nicknameCheck = await getOne(
      "SELECT id FROM users WHERE nexus_nickname = $1",
      [nexusNickname]
    );

    if (nicknameCheck) {
      return res.status(400).json({
        success: false,
        message: "이미 사용 중인 닉네임입니다.",
      });
    }

    // 비밀번호 해싱
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 사용자 생성
    const newUser = await getOne(
      `INSERT INTO users (email, password_hash, nexus_nickname, auth_provider, is_verified, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, email, nexus_nickname, is_verified, is_streamer, created_at`,
      [email, hashedPassword, nexusNickname, "local", true]
    );

    const user = newUser;

    // JWT 토큰 생성
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "회원가입이 완료되었습니다.",
      data: {
        user: {
          id: user.id,
          email: user.email,
          nexusNickname: user.nexus_nickname,
          isVerified: user.is_verified,
          isStreamer: user.is_streamer,
        },
        token,
      },
    });
  } catch (error) {
    console.error("회원가입 오류:", error);
    res.status(500).json({
      success: false,
      message: "회원가입 중 오류가 발생했습니다.",
    });
  }
});

// 로그인 API
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 입력값 검증
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "이메일과 비밀번호를 입력해주세요.",
      });
    }

    // 사용자 조회
    const userResult = await getOne("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (!userResult) {
      return res.status(401).json({
        success: false,
        message: "이메일 또는 비밀번호가 올바르지 않습니다.",
      });
    }

    const user = userResult;

    // OAuth 사용자인지 확인 (password_hash가 null인 경우)
    if (!user.password_hash) {
      return res.status(401).json({
        success: false,
        message:
          "이 계정은 소셜 로그인으로 가입되었습니다. Google 또는 Discord로 로그인해주세요.",
      });
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "이메일 또는 비밀번호가 올바르지 않습니다.",
      });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "로그인이 완료되었습니다.",
      data: {
        user: {
          id: user.id,
          email: user.email,
          nexusNickname: user.nexus_nickname,
          isVerified: user.is_verified,
          isStreamer: user.is_streamer,
        },
        token: token,
      },
    });
  } catch (error) {
    console.error("로그인 오류:", error);
    res.status(500).json({
      success: false,
      message: "로그인 중 오류가 발생했습니다.",
    });
  }
});

// Google OAuth 콜백
router.get("/google/callback", async (req, res) => {
  passport.authenticate(
    "google",
    { session: false },
    async (err, user, info) => {
      try {
        if (err) {
          console.error("Google OAuth 오류:", err);
          return res.redirect(
            `${
              process.env.FRONTEND_URL || "http://localhost:3000"
            }/login?error=oauth_failed`
          );
        }

        if (!user) {
          return res.redirect(
            `${
              process.env.FRONTEND_URL || "http://localhost:3000"
            }/login?error=oauth_failed`
          );
        }

        // 기존 사용자 확인
        let existingUser = await getOne(
          "SELECT * FROM users WHERE google_id = $1 OR email = $2",
          [user.id, user.email]
        );

        if (!existingUser) {
          // 새 사용자 생성
          const newUser = await getOne(
            `INSERT INTO users (google_id, email, nexus_nickname, avatar_url, auth_provider, is_verified, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
           RETURNING id, email, nexus_nickname, avatar_url, is_verified, is_streamer`,
            [user.id, user.email, user.name, user.avatar, "google", true]
          );
          existingUser = newUser;
        } else {
          // 기존 사용자 정보 업데이트
          await execute(
            `UPDATE users SET 
           google_id = $1, 
           nexus_nickname = $2, 
           avatar_url = $3, 
           auth_provider = $4, 
           updated_at = NOW()
           WHERE id = $5`,
            [user.id, user.name, user.avatar, "google", existingUser.id]
          );
        }

        // JWT 토큰 생성
        const token = jwt.sign(
          { userId: existingUser.id, email: existingUser.email },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        // 프론트엔드로 리다이렉트 (토큰 포함)
        res.redirect(
          `${
            process.env.FRONTEND_URL || "http://localhost:3000"
          }/oauth-callback?token=${token}`
        );
      } catch (error) {
        console.error("Google OAuth 콜백 오류:", error);
        res.redirect(
          `${
            process.env.FRONTEND_URL || "http://localhost:3000"
          }/login?error=oauth_failed`
        );
      }
    }
  )(req, res);
});

// Google OAuth 시작
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Discord OAuth 콜백
router.get("/discord/callback", async (req, res) => {
  passport.authenticate(
    "discord",
    { session: false },
    async (err, user, info) => {
      try {
        if (err) {
          console.error("Discord OAuth 오류:", err);
          return res.redirect(
            `${
              process.env.FRONTEND_URL || "http://localhost:3000"
            }/login?error=oauth_failed`
          );
        }

        if (!user) {
          return res.redirect(
            `${
              process.env.FRONTEND_URL || "http://localhost:3000"
            }/login?error=oauth_failed`
          );
        }

        // 기존 사용자 확인
        let existingUser = await getOne(
          "SELECT * FROM users WHERE discord_id = $1 OR email = $2",
          [user.id, user.email]
        );

        if (!existingUser) {
          // 새 사용자 생성
          const newUser = await getOne(
            `INSERT INTO users (discord_id, email, nexus_nickname, avatar_url, auth_provider, is_verified, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
           RETURNING id, email, nexus_nickname, avatar_url, is_verified, is_streamer`,
            [user.id, user.email, user.name, user.avatar, "discord", true]
          );
          existingUser = newUser;
        } else {
          // 기존 사용자 정보 업데이트
          await execute(
            `UPDATE users SET 
           discord_id = $1, 
           nexus_nickname = $2, 
           avatar_url = $3, 
           auth_provider = $4, 
           updated_at = NOW()
           WHERE id = $5`,
            [user.id, user.name, user.avatar, "discord", existingUser.id]
          );
        }

        // JWT 토큰 생성
        const token = jwt.sign(
          { userId: existingUser.id, email: existingUser.email },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        // 프론트엔드로 리다이렉트 (토큰 포함)
        res.redirect(
          `${
            process.env.FRONTEND_URL || "http://localhost:3000"
          }/oauth-callback?token=${token}`
        );
      } catch (error) {
        console.error("Discord OAuth 콜백 오류:", error);
        res.redirect(
          `${
            process.env.FRONTEND_URL || "http://localhost:3000"
          }/login?error=oauth_failed`
        );
      }
    }
  )(req, res);
});

// Discord OAuth 시작
router.get(
  "/discord",
  passport.authenticate("discord", {
    scope: ["identify", "email"],
  })
);

// 현재 사용자 정보 가져오기
router.get("/me", async (req, res) => {
  try {
    // JWT 토큰에서 사용자 ID 추출
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "인증 토큰이 필요합니다.",
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 사용자 정보 조회
    const user = await getOne(
      "SELECT id, email, nexus_nickname, avatar_url, is_verified, is_streamer, created_at FROM users WHERE id = $1",
      [decoded.userId]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "사용자를 찾을 수 없습니다.",
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        nexusNickname: user.nexus_nickname,
        avatarUrl: user.avatar_url,
        isVerified: user.is_verified,
        isStreamer: user.is_streamer,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error("사용자 정보 가져오기 오류:", error);
    res.status(500).json({
      success: false,
      message: "사용자 정보를 가져오는 중 오류가 발생했습니다.",
    });
  }
});

module.exports = router;

// Reset password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Token and password are required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const hashedPassword = await bcrypt.hash(password, 10);

    await execute("UPDATE users SET password_hash = $1 WHERE id = $2", [
      hashedPassword,
      decoded.userId,
    ]);

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Forgot password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await getOne("SELECT * FROM users WHERE email = $1", [email]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a reset token
    const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Send the reset token to the user's email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset",
      text: `Click this link to reset your password: ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
