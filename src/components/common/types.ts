// 기본 타입 정의

// 사용자 관련 타입
export interface User {
  id: string;
  username: string;
  email: string;
  profileImage?: string;
  rank?: Rank;
  level?: number;
  joinDate: Date;
  lastActive: Date;
  isOnline: boolean;
  bio?: string;
  preferredRoles?: Role[];
  winRate?: number;
  totalGames?: number;
  friends?: string[];
}

// 게임 관련 타입
export interface Battle {
  id: string;
  title: string;
  description?: string;
  creator: User;
  participants: BattleParticipant[];
  maxPlayers: number;
  currentPlayers: number;
  status: BattleStatus;
  gameType: GameType;
  rankRestriction?: RankRestriction;
  startTime: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  isPrivate: boolean;
  password?: string;
}

export interface BattleParticipant {
  user: User;
  role: Role;
  team: number;
  joinedAt: Date;
  status: ParticipantStatus;
}

export type BattleStatus =
  | "recruiting"
  | "full"
  | "in_progress"
  | "completed"
  | "cancelled";
export type ParticipantStatus = "waiting" | "ready" | "in_game" | "left";
export type GameType = "5v5" | "3v3" | "1v1" | "custom";
export type Role = "top" | "jungle" | "mid" | "adc" | "support" | "fill";
export type Rank =
  | "iron"
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "master"
  | "grandmaster"
  | "challenger"
  | "unranked";

export interface RankRestriction {
  minRank: Rank;
  maxRank: Rank;
}

// 커뮤니티 관련 타입
export interface Post {
  id: string;
  title: string;
  content: string;
  author: User;
  category: PostCategory;
  tags?: string[];
  likes: number;
  dislikes: number;
  views: number;
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  isLocked: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  postId: string;
  parentId?: string;
  likes: number;
  dislikes: number;
  createdAt: Date;
  updatedAt: Date;
  replies?: Comment[];
}

export type PostCategory =
  | "general"
  | "strategy"
  | "humor"
  | "news"
  | "question"
  | "recruitment";

// 알림 관련 타입
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  recipient: string;
  sender?: User;
  relatedId?: string;
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export type NotificationType =
  | "battle_invite"
  | "battle_update"
  | "friend_request"
  | "comment"
  | "like"
  | "system";

// 검색 관련 타입
export interface SearchResult {
  type: SearchType;
  id: string;
  title: string;
  description?: string;
  url: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export type SearchType = "battles" | "users" | "posts";

// API 응답 타입
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 폼 관련 타입
export interface FormField {
  name: string;
  value: unknown;
  error?: string;
  touched: boolean;
  required?: boolean;
}

export interface FormState<T = Record<string, unknown>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
}

// 테마 관련 타입
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
  fonts: {
    primary: string;
    secondary: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// 설정 관련 타입
export interface UserSettings {
  theme: "light" | "dark" | "auto";
  language: "ko" | "en";
  notifications: {
    email: boolean;
    push: boolean;
    battleInvites: boolean;
    friendRequests: boolean;
    comments: boolean;
  };
  privacy: {
    profileVisibility: "public" | "friends" | "private";
    showOnlineStatus: boolean;
    showLastActive: boolean;
    allowFriendRequests: boolean;
  };
  game: {
    preferredRoles: Role[];
    autoAcceptInvites: boolean;
    showRankInProfile: boolean;
  };
}

// 파일 업로드 관련 타입
export interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

// 통계 관련 타입
export interface UserStats {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  averageKDA: number;
  preferredRoles: {
    role: Role;
    games: number;
    winRate: number;
  }[];
  recentPerformance: {
    date: Date;
    wins: number;
    losses: number;
  }[];
}

export interface BattleStats {
  totalBattles: number;
  completedBattles: number;
  cancelledBattles: number;
  averageParticipants: number;
  popularGameTypes: {
    type: GameType;
    count: number;
  }[];
  recentActivity: {
    date: Date;
    battles: number;
  }[];
}

// 이벤트 관련 타입
export interface AppEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  participants?: string[];
  rewards?: EventReward[];
}

export type EventType = "tournament" | "challenge" | "seasonal" | "special";

export interface EventReward {
  type: "badge" | "title" | "points" | "item";
  name: string;
  description: string;
  icon?: string;
}

// 소셜 관련 타입
export interface FriendRequest {
  id: string;
  from: User;
  to: string;
  message?: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

export interface Friendship {
  id: string;
  user1: string;
  user2: string;
  status: "active" | "blocked";
  createdAt: Date;
}

// 실시간 관련 타입
export interface WebSocketMessage {
  type: string;
  data: unknown;
  timestamp: Date;
  id?: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  sender: User;
  content: string;
  type: "text" | "image" | "file" | "system";
  createdAt: Date;
  editedAt?: Date;
}

// 필터 및 정렬 관렬 타입
export interface FilterOptions {
  search?: string;
  category?: string;
  status?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  [key: string]: unknown;
}

export interface SortOptions {
  field: string;
  direction: "asc" | "desc";
}

// 페이지네이션 관렬 타입
export interface PaginationOptions {
  page: number;
  limit: number;
  sort?: SortOptions;
  filter?: FilterOptions;
}

// 에러 관련 타입
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: Date;
  stack?: string;
}

// 로깅 관렬 타입
export interface LogEntry {
  level: "debug" | "info" | "warn" | "error";
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
}

// 캐시 관렬 타입
export interface CacheEntry<T = unknown> {
  key: string;
  value: T;
  expiresAt: Date;
  createdAt: Date;
  accessedAt: Date;
  accessCount: number;
}

// 권한 관렬 타입
export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, unknown>;
}

export interface UserRole {
  name: string;
  permissions: Permission[];
  description?: string;
}

// 감사 로그 관렬 타입
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

// 백업 관렬 타입
export interface Backup {
  id: string;
  name: string;
  type: "full" | "incremental";
  size: number;
  status: "pending" | "in_progress" | "completed" | "failed";
  createdAt: Date;
  completedAt?: Date;
  expiresAt: Date;
  downloadUrl?: string;
}
