const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const nodemailer = require("nodemailer");

// 메모리 임시 저장 (실서비스는 Redis 등 사용 권장)
const emailCodes = {};

// 회원가입
router.post("/signup", async (req, res) => {
  try {
    const {
      email,
      password,
      username,
      phone,
      postcode,
      address,
      detailAddress,
      birthYear,
      birthMonth,
      birthDay,
    } = req.body;
    if (!email || !password || !username)
      return res.status(400).json({ error: "필수 정보를 입력하세요." });
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ error: "이미 가입된 이메일입니다." });
    const user = new User({
      email,
      password,
      username,
      phone,
      postcode,
      address,
      detailAddress,
      birthYear,
      birthMonth,
      birthDay,
    });
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "서버 오류" });
  }
});

// 로그인
router.post("/login", async (req, res) => {
  try {
    const { email, password, autoLogin } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(401)
        .json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." });
    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res
        .status(401)
        .json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: autoLogin ? "30d" : "1d",
    });
    if (autoLogin) {
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    }
    res.json({ token, user: { email: user.email } });
  } catch (err) {
    res.status(500).json({ error: "서버 오류" });
  }
});

// 로그아웃
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});

// 이메일 인증번호 발송
router.post("/send-email-code", async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code)
    return res.status(400).json({ error: "이메일과 코드가 필요합니다." });
  // 실제 서비스에서는 이메일 중복 체크 등 추가 가능
  // 메일 발송
  try {
    // Gmail 등 SMTP 설정 필요 (아래는 예시)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "NEXUS 회원가입 인증번호",
      text: `인증번호: ${code}`,
    });
    emailCodes[email] = code;
    setTimeout(() => {
      delete emailCodes[email];
    }, 180 * 1000); // 3분 후 만료
    res.json({ success: true, message: "인증번호가 발송되었습니다." });
  } catch (err) {
    res.status(500).json({ error: "이메일 발송 실패" });
  }
});

// 이메일 인증번호 확인
router.post("/verify-email-code", (req, res) => {
  const { email, code } = req.body;
  if (!email || !code)
    return res.status(400).json({ error: "이메일과 코드가 필요합니다." });
  if (emailCodes[email] && emailCodes[email] === code) {
    delete emailCodes[email];
    return res.json({ success: true });
  }
  res.status(400).json({ error: "인증번호가 올바르지 않거나 만료되었습니다." });
});

// 비밀번호 찾기(임시 비밀번호 발송)
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "이메일이 필요합니다." });
  const user = await User.findOne({ email });
  if (!user)
    return res.status(404).json({ error: "가입된 이메일이 없습니다." });
  // 임시 비밀번호 생성
  const tempPassword = Math.random().toString(36).slice(-10);
  user.password = tempPassword;
  await user.save();
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "NEXUS 임시 비밀번호 안내",
      text: `임시 비밀번호: ${tempPassword}\n로그인 후 반드시 비밀번호를 변경하세요.`,
    });
    res.json({ success: true, message: "임시 비밀번호가 발송되었습니다." });
  } catch (err) {
    res.status(500).json({ error: "이메일 발송 실패" });
  }
});

// 비밀번호 재설정
router.post("/reset-password", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ error: "이메일과 새 비밀번호가 필요합니다." });
  const user = await User.findOne({ email });
  if (!user)
    return res.status(404).json({ error: "가입된 이메일이 없습니다." });
  user.password = password;
  await user.save();
  res.json({ success: true });
});

// 아이디(이메일) 찾기
router.post("/find-id", async (req, res) => {
  const { username, phone } = req.body;
  if (!username || !phone)
    return res.status(400).json({ error: "이름과 전화번호가 필요합니다." });
  const user = await User.findOne({ username, phone });
  if (!user)
    return res.status(404).json({ error: "일치하는 회원이 없습니다." });
  res.json({ email: user.email });
});

module.exports = router;
