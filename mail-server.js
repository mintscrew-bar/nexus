const express = require("express");
const nodemailer = require("nodemailer");
const Redis = require("ioredis");
const redis = new Redis(); // Redis 클라이언트 연결 (기본 설정)

const app = express();
app.use(express.json());

// 이메일 인증번호 발송 API
app.post("/api/send-email-code", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "이메일이 필요합니다." });
  }

  // 6자리 랜덤 인증번호 생성
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "[NEXUS] 회원가입 인증번호",
      text: `인증번호: ${code}\n인증번호는 3분간 유효합니다.`,
    });

    // Redis에 인증번호 저장 (3분 후 만료)
    await redis.set(`email-code:${email}`, code, "EX", 180);

    res.json({ success: true, message: "인증번호가 발송되었습니다." });
  } catch (err) {
    if (err.code === 'EAUTH') {
        res.status(401).json({ error: "이메일 인증에 실패했습니다. SMTP 설정(GMAIL_USER, GMAIL_APP_PASSWORD)을 확인해주세요." });
    } else {
        res.status(500).json({ error: "이메일 발송 실패" });
    }
  }
});

// 이메일 인증번호 확인 API
app.post("/api/verify-email-code", async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: "이메일과 인증번호를 모두 입력하세요." });
  }

  // Redis에서 인증번호 가져오기
  const storedCode = await redis.get(`email-code:${email}`);

  if (storedCode && storedCode === code) {
    // 인증 성공 시 Redis에서 인증번호 삭제
    await redis.del(`email-code:${email}`);
    res.json({ success: true, message: "이메일 인증이 완료되었습니다." });
  } else {
    res.status(400).json({ error: "인증번호가 올바르지 않거나 만료되었습니다." });
  }
});

// 서버 시작
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Mail server is running on port ${PORT}`);
});
