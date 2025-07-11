// 앱 기본 설정
export const APP_CONFIG = {
  APP_NAME: "NEXUS",
  APP_VERSION: "1.0.0",
  APP_DESCRIPTION: "리그 오브 레전드 내전 플랫폼",
  APP_URL: "https://nexus.com",
  CONTACT_EMAIL: "support@nexus.com",
  SUPPORT_PHONE: "02-1234-5678",
  OFFICE_HOURS: "평일 09:00 - 18:00",
  COPYRIGHT: "© 2024 NEXUS. All rights reserved.",
} as const;

// 라우트 설정
export const ROUTES = {
  HOME: "/",
  BATTLES: "/battles",
  CREATE: "/create",
  COMMUNITY: "/community",
  USERS: "/users",
  RANKING: "/ranking",
  PROFILE: "/profile",
  FRIENDS: "/friends",
  HISTORY: "/history",
  SETTINGS: "/settings",
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
} as const;

// 네비게이션 설정
export const NAVIGATION_CONFIG = {
  main: [
    { name: "내전 목록", path: ROUTES.HOME, icon: "🏠" },
    { name: "내전 참가", path: ROUTES.BATTLES, icon: "⚔️" },
    { name: "내전 모집", path: ROUTES.CREATE, icon: "➕" },
    { name: "자유게시판", path: ROUTES.COMMUNITY, icon: "💬" },
    { name: "유저 DB", path: ROUTES.USERS, icon: "👥" },
    { name: "랭킹", path: ROUTES.RANKING, icon: "🏆" },
  ],
  user: [
    { name: "프로필", path: ROUTES.PROFILE, icon: "👤" },
    { name: "친구 목록", path: ROUTES.FRIENDS, icon: "👥" },
    { name: "전적 기록", path: ROUTES.HISTORY, icon: "📊" },
    { name: "설정", path: ROUTES.SETTINGS, icon: "⚙️" },
  ],
} as const;

// 푸터 설정
export const FOOTER_CONFIG = {
  sections: [
    {
      title: "서비스",
      links: [
        { text: "내전 목록", url: ROUTES.HOME },
        { text: "내전 참가", url: ROUTES.BATTLES },
        { text: "내전 모집", url: ROUTES.CREATE },
        { text: "랭킹", url: ROUTES.RANKING },
      ],
    },
    {
      title: "커뮤니티",
      links: [
        { text: "자유게시판", url: ROUTES.COMMUNITY },
        { text: "유저 DB", url: ROUTES.USERS },
        { text: "친구 목록", url: ROUTES.FRIENDS },
        { text: "전적 기록", url: ROUTES.HISTORY },
      ],
    },
    {
      title: "고객지원",
      links: [
        { text: "문의하기", url: "/contact" },
        { text: "FAQ", url: "/faq" },
        { text: "이용약관", url: "/terms" },
        { text: "개인정보처리방침", url: "/privacy" },
      ],
    },
  ],
  stats: [
    { label: "총 내전 수", value: "1,234" },
    { label: "활성 유저", value: "5,678" },
    { label: "완료된 매치", value: "9,012" },
  ],
  socialLinks: [
    { name: "Discord", url: "https://discord.gg/nexus", icon: "discord" },
    {
      name: "Instagram",
      url: "https://instagram.com/nexus",
      icon: "instagram",
    },
  ],
} as const;

// 테마 설정
export const THEME_CONFIG = {
  colors: {
    primary: {
      50: "#f0f2ff",
      100: "#e6e9ff",
      200: "#d1d5ff",
      300: "#b3b8ff",
      400: "#8b8fff",
      500: "#667eea",
      600: "#5a67d8",
      700: "#4c51bf",
      800: "#434190",
      900: "#3c366b",
    },
    secondary: {
      50: "#fdf2f8",
      100: "#fce7f3",
      200: "#fbcfe8",
      300: "#f9a8d4",
      400: "#f472b6",
      500: "#ec4899",
      600: "#db2777",
      700: "#be185d",
      800: "#9d174d",
      900: "#831843",
    },
    gray: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",
    },
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
  },
  borderRadius: {
    sm: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    full: "9999px",
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  },
} as const;

// API 설정
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      LOGOUT: "/auth/logout",
      REGISTER: "/auth/register",
      REFRESH: "/auth/refresh",
      FORGOT_PASSWORD: "/auth/forgot-password",
      RESET_PASSWORD: "/auth/reset-password",
    },
    USER: {
      PROFILE: "/user/profile",
      UPDATE: "/user/update",
      DELETE: "/user/delete",
      FRIENDS: "/user/friends",
      HISTORY: "/user/history",
    },
    BATTLE: {
      LIST: "/battles",
      CREATE: "/battles/create",
      JOIN: "/battles/join",
      LEAVE: "/battles/leave",
      DETAIL: "/battles/:id",
      UPDATE: "/battles/:id",
      DELETE: "/battles/:id",
    },
    COMMUNITY: {
      POSTS: "/community/posts",
      CREATE_POST: "/community/posts",
      POST_DETAIL: "/community/posts/:id",
      UPDATE_POST: "/community/posts/:id",
      DELETE_POST: "/community/posts/:id",
      COMMENTS: "/community/posts/:id/comments",
      CREATE_COMMENT: "/community/posts/:id/comments",
    },
  },
} as const;

// 검색 설정
export const SEARCH_CONFIG = {
  DEBOUNCE_DELAY: 300,
  MIN_SEARCH_LENGTH: 2,
  MAX_RESULTS: 10,
  SEARCH_TYPES: {
    BATTLES: "battles",
    USERS: "users",
    POSTS: "posts",
  },
} as const;

// 알림 설정
export const NOTIFICATION_CONFIG = {
  TYPES: {
    BATTLE_INVITE: "battle_invite",
    BATTLE_UPDATE: "battle_update",
    FRIEND_REQUEST: "friend_request",
    SYSTEM: "system",
  },
  DURATION: 5000,
  POSITION: "top-right",
} as const;

// 게임 설정
export const GAME_CONFIG = {
  ROLES: {
    TOP: "top",
    JUNGLE: "jungle",
    MID: "mid",
    ADC: "adc",
    SUPPORT: "support",
  },
  RANKS: {
    IRON: "iron",
    BRONZE: "bronze",
    SILVER: "silver",
    GOLD: "gold",
    PLATINUM: "platinum",
    DIAMOND: "diamond",
    MASTER: "master",
    GRANDMASTER: "grandmaster",
    CHALLENGER: "challenger",
  },
  TEAM_SIZES: [1, 2, 3, 4, 5],
  MAX_PLAYERS: 10,
  MIN_PLAYERS: 2,
} as const;

// 파일 업로드 설정
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/gif"],
  MAX_FILES: 5,
} as const;

// 캐시 설정
export const CACHE_CONFIG = {
  USER_PROFILE: 5 * 60 * 1000, // 5분
  BATTLE_LIST: 2 * 60 * 1000, // 2분
  USER_LIST: 10 * 60 * 1000, // 10분
} as const;
