const rateLimit = require("express-rate-limit");

// Google OAuth 콜백에 대한 rate limiting
const googleCallbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 15분당 3회로 제한
  message: {
    error: "Too many Google OAuth requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  googleCallbackLimiter,
};
