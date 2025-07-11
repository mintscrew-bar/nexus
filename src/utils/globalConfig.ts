// 전역 설정 파일

// 앱 기본 정보
export const APP_INFO = {
  name: "NEXUS",
  version: "1.0.0",
  description: "리그 오브 레전드 내전 플랫폼",
  author: "NEXUS Team",
  repository: "https://github.com/nexus-team/nexus-app",
} as const;

// 환경 설정
export const ENV_CONFIG = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  wsUrl: import.meta.env.VITE_WS_URL || "ws://localhost:3001",
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  discordClientId: import.meta.env.VITE_DISCORD_CLIENT_ID,
} as const;

// 기능 플래그
export const FEATURE_FLAGS = {
  enableAnalytics: import.meta.env.PROD,
  enableErrorReporting: import.meta.env.PROD,
  enablePerformanceMonitoring: import.meta.env.PROD,
  enableSocialLogin: true,
  enableNotifications: true,
  enableRealTimeChat: true,
} as const;

// 성능 설정
export const PERFORMANCE_CONFIG = {
  debounceDelay: 300,
  throttleDelay: 100,
  cacheTimeout: 5 * 60 * 1000, // 5분
  maxRetryAttempts: 3,
  retryDelay: 1000,
} as const;

// UI 설정
export const UI_CONFIG = {
  theme: {
    default: "light",
    storageKey: "nexus-theme",
  },
  language: {
    default: "ko",
    storageKey: "nexus-language",
  },
  animation: {
    duration: 300,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
} as const;

// 게임 설정
export const GAME_CONFIG = {
  maxPlayers: 10,
  minPlayers: 2,
  maxTeamSize: 5,
  matchTimeout: 30 * 60 * 1000, // 30분
  autoStartDelay: 60 * 1000, // 1분
} as const;

// 보안 설정
export const SECURITY_CONFIG = {
  passwordMinLength: 8,
  sessionTimeout: 24 * 60 * 60 * 1000, // 24시간
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15분
} as const;

// API 설정
export const API_CONFIG = {
  baseUrl: ENV_CONFIG.apiUrl,
  timeout: 10000,
  retryAttempts: 3,
  endpoints: {
    auth: {
      login: "/auth/login",
      logout: "/auth/logout",
      register: "/auth/register",
      refresh: "/auth/refresh",
    },
    user: {
      profile: "/user/profile",
      update: "/user/update",
    },
    battle: {
      list: "/battles",
      create: "/battles/create",
      join: "/battles/join",
    },
  },
} as const;

// 로깅 설정
export const LOGGING_CONFIG = {
  level: import.meta.env.DEV ? "debug" : "info",
  enableConsole: true,
  enableRemote: import.meta.env.PROD,
  maxLogSize: 1024 * 1024, // 1MB
} as const;

// 캐시 설정
export const CACHE_CONFIG = {
  userProfile: 5 * 60 * 1000, // 5분
  battleList: 2 * 60 * 1000, // 2분
  userList: 10 * 60 * 1000, // 10분
  staticData: 24 * 60 * 60 * 1000, // 24시간
} as const;

// 파일 업로드 설정
export const UPLOAD_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ["image/jpeg", "image/png", "image/gif"],
  maxFiles: 5,
} as const;

// 알림 설정
export const NOTIFICATION_CONFIG = {
  duration: 5000,
  position: "top-right",
  maxVisible: 5,
} as const;

// 검색 설정
export const SEARCH_CONFIG = {
  debounceDelay: 300,
  minQueryLength: 2,
  maxResults: 10,
} as const;

// 실시간 설정
export const REALTIME_CONFIG = {
  reconnectAttempts: 5,
  reconnectDelay: 1000,
  heartbeatInterval: 30000, // 30초
} as const;

// 개발 도구 설정
export const DEV_TOOLS_CONFIG = {
  enableReactDevTools: import.meta.env.DEV,
  enableReduxDevTools: import.meta.env.DEV,
  enablePerformanceProfiler: import.meta.env.DEV,
} as const;

// 전역 설정 객체
export const GLOBAL_CONFIG = {
  app: APP_INFO,
  env: ENV_CONFIG,
  features: FEATURE_FLAGS,
  performance: PERFORMANCE_CONFIG,
  ui: UI_CONFIG,
  game: GAME_CONFIG,
  security: SECURITY_CONFIG,
  api: API_CONFIG,
  logging: LOGGING_CONFIG,
  cache: CACHE_CONFIG,
  upload: UPLOAD_CONFIG,
  notification: NOTIFICATION_CONFIG,
  search: SEARCH_CONFIG,
  realtime: REALTIME_CONFIG,
  devTools: DEV_TOOLS_CONFIG,
} as const;

// 타입 정의
export type GlobalConfig = typeof GLOBAL_CONFIG;

// 기본 export
export default GLOBAL_CONFIG;
