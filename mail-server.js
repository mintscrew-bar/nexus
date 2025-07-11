import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import nodemailer from "nodemailer";

// 환경 변수 로드
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Gmail SMTP 설정 (환경 변수 사용)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER || "YOUR_GMAIL@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD || "YOUR_APP_PASSWORD",
  },
});

// 서버 상태 확인
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "메일 서버가 정상 작동 중입니다." });
});

// 이메일 인증번호 발송
app.post("/api/send-email-code", async (req, res) => {
  const { email, code } = req.body;

  // 입력값 검증
  if (!email || !code) {
    return res.status(400).json({
      success: false,
      error: "이메일과 인증번호가 필요합니다.",
    });
  }

  // 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: "올바른 이메일 형식이 아닙니다.",
    });
  }

  try {
    // 메일 발송
    const mailOptions = {
      from: `"NEXUS" <${process.env.GMAIL_USER || "YOUR_GMAIL@gmail.com"}>`,
      to: email,
      subject: "NEXUS 인증번호",
      html: `
        <div style="font-family: 'Noto Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">NEXUS</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">리그 오브 레전드 내전 플랫폼</p>
          </div>
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">이메일 인증번호</h2>
            <p style="color: #666; margin-bottom: 25px;">
              아래의 인증번호를 입력하여 이메일 인증을 완료해주세요.
            </p>
            <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: 700; color: #667eea; letter-spacing: 5px;">${code}</span>
            </div>
            <p style="color: #999; font-size: 14px; margin-top: 20px;">
              이 인증번호는 3분 후에 만료됩니다.<br>
              본인이 요청하지 않은 경우 이 메일을 무시하세요.
            </p>
          </div>
        </div>
      `,
      text: `NEXUS 인증번호: ${code}\n\n이 인증번호는 3분 후에 만료됩니다.`,
    };

    await transporter.sendMail(mailOptions);

    console.log(`인증번호 발송 성공: ${email}`);
    res.json({
      success: true,
      message: "인증번호가 성공적으로 발송되었습니다.",
    });
  } catch (err) {
    console.error("메일 발송 오류:", err);

    // Gmail 인증 오류인 경우
    if (err.code === "EAUTH") {
      return res.status(500).json({
        success: false,
        error: "Gmail 인증에 실패했습니다. 앱 비밀번호를 확인해주세요.",
      });
    }

    res.status(500).json({
      success: false,
      error: "메일 발송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`메일 서버가 ${PORT}번 포트에서 실행 중`);
  console.log(`Gmail 사용자: ${process.env.GMAIL_USER || "설정되지 않음"}`);
  console.log(
    `앱 비밀번호: ${
      process.env.GMAIL_APP_PASSWORD ? "설정됨" : "설정되지 않음"
    }`
  );
});
