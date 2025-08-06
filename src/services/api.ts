import axios, { AxiosError, AxiosInstance } from "axios";
import { Friend } from "../types";

// API 응답 타입
interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

// 인증 관련 타입
interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: number;
      email: string;
      nexusNickname: string;
      isVerified: boolean;
      isStreamer: boolean;
      avatarUrl?: string;
    };
    token: string;
  };
}

// 사용자 타입
interface User {
  id: number;
  email: string;
  nexusNickname: string;
  riotNickname?: string;
  riotTag?: string;
  puuid?: string;
  avatarUrl?: string;
  isVerified: boolean;
  isStreamer: boolean;
  isOnline: boolean;
  lastSeen?: string;
  tierInfo?: any;
  mainLane?: string;
  mostChampions?: string[];
  createdAt: string;
}

// 친구 타입

// 메시지 타입
interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  is_read: boolean;
  timestamp: string;
  sender_nickname: string;
  sender_avatar?: string;
  receiver_nickname: string;
  receiver_avatar?: string;
}

// 내전 타입
interface CustomGame {
  id: number;
  title: string;
  description?: string;
  password?: string;
  max_players: number;
  current_players: number;
  status: "recruiting" | "in-progress" | "completed";
  team_composition: "none" | "auction" | "rock-paper-scissors";
  ban_pick_mode: string;
  allow_spectators: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  creator_nickname: string;
  creator_avatar?: string;
  participants?: any[];
}

// 커뮤니티 게시글 타입
interface CommunityPost {
  id: number;
  user_id: number;
  category: string;
  title: string;
  content: string;
  likes_count: number;
  like_count?: number;
  dislike_count?: number;
  view_count?: number;
  is_anonymous?: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
  nexus_nickname: string;
  avatar_url?: string;
  comment_count?: number;
}

// 스트리머 타입
interface Streamer {
  id: number;
  user_id: number;
  stream_link: string;
  platform: "twitch" | "youtube" | "afreeca";
  recent_broadcast?: string;
  viewer_count: number;
  is_live: boolean;
  created_at: string;
  updated_at: string;
  nexus_nickname: string;
  avatar_url?: string;
  is_online: boolean;
  last_seen?: string;
}

// 매치 타입
interface Match {
  id: number;
  game_id: number;
  match_data: any;
  winner_team?: number;
  duration?: number;
  created_at: string;
}

// 연결 상태 타입
interface ConnectionStatus {
  isConnected: boolean;
  lastCheck: Date | null;
  errorCount: number;
  retryAttempts: number;
}

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;
  private connectionStatus: ConnectionStatus = {
    isConnected: true,
    lastCheck: null,
    errorCount: 0,
    retryAttempts: 0,
  };
  private maxRetries = 3;
  private retryDelay = 1000; // 1초

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:5000",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // 요청 인터셉터
    this.api.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터 - 에러 처리 및 재시도 로직
    this.api.interceptors.response.use(
      (response) => {
        // 성공 시 연결 상태 업데이트
        this.connectionStatus.isConnected = true;
        this.connectionStatus.errorCount = 0;
        this.connectionStatus.lastCheck = new Date();
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // 429 오류 (Rate Limiting) 처리
        if (error.response?.status === 429) {
          console.warn("⚠️ API Rate Limiting 발생, 재시도 대기 중...");

          // Rate Limiting 헤더 확인
          const retryAfter = error.response.headers["retry-after"];
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 5000; // 기본 5초 대기

          await this.delay(waitTime);

          // 재시도 (최대 2회)
          if (
            !originalRequest._retry &&
            this.connectionStatus.retryAttempts < 2
          ) {
            originalRequest._retry = true;
            this.connectionStatus.retryAttempts++;

            console.log(
              `🔄 Rate Limiting 후 재시도 중... (${this.connectionStatus.retryAttempts}/2)`
            );
            return this.api.request(originalRequest);
          }

          console.error("❌ Rate Limiting 재시도 실패");
          return Promise.reject(
            new Error("요청이 너무 많습니다. 잠시 후 다시 시도해주세요.")
          );
        }

        // 연결 오류 처리
        if (error.code === "ECONNABORTED" || error.code === "ERR_NETWORK") {
          this.connectionStatus.isConnected = false;
          this.connectionStatus.errorCount++;

          // 재시도 로직
          if (this.connectionStatus.retryAttempts < this.maxRetries) {
            this.connectionStatus.retryAttempts++;
            await this.delay(
              this.retryDelay * this.connectionStatus.retryAttempts
            );

            console.log(
              `🔄 API 재시도 중... (${this.connectionStatus.retryAttempts}/${this.maxRetries})`
            );
            return this.api.request(originalRequest);
          }
        }

        // 401 오류 시 토큰 제거
        if (error.response?.status === 401) {
          this.clearToken();
          localStorage.removeItem("token");
        }

        // 500 오류 시 데이터베이스 연결 문제로 간주
        if (error.response?.status === 500) {
          this.connectionStatus.errorCount++;
          console.error("❌ 서버 오류:", error.response?.data);
        }

        return Promise.reject(error);
      }
    );
  }

  // 지연 함수
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // 연결 상태 확인
  async checkConnection(): Promise<boolean> {
    console.log("🔍 API 서비스: 연결 상태 확인 시작");
    try {
      // 타임아웃 설정 (3초)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log("⏰ API 서비스: 연결 타임아웃 발생");
        controller.abort();
      }, 3000);

      console.log("🌐 API 서비스: /health 엔드포인트 호출");
      await this.api.get("/health", { signal: controller.signal });
      clearTimeout(timeoutId);

      console.log("✅ API 서비스: 연결 성공");
      this.connectionStatus.isConnected = true;
      this.connectionStatus.lastCheck = new Date();
      this.connectionStatus.errorCount = 0;
      this.connectionStatus.retryAttempts = 0;
      return true;
    } catch (error: any) {
      // CanceledError는 요청이 취소된 경우이므로 무시
      if (error.code === "ERR_CANCELED" || error.name === "CanceledError") {
        console.log("⏸️ API 서비스: 요청이 취소됨");
        return false;
      }

      console.error("❌ API 서비스: 연결 실패", error);
      this.connectionStatus.isConnected = false;
      this.connectionStatus.errorCount++;
      this.connectionStatus.lastCheck = new Date();

      // Rate limiting 에러 처리
      if (error.response?.status === 429) {
        console.warn("⚠️ API 서비스: Rate limiting 발생, 재시도 중단");
        return false;
      }

      // 연결 오류 시 자동 재연결 시도 (최대 3회, 5초 간격)
      if (this.connectionStatus.errorCount <= this.maxRetries) {
        console.log(
          `🔄 API 서비스: 재연결 시도 중... (${this.connectionStatus.errorCount}/${this.maxRetries})`
        );
        // 재연결 시도 간격을 늘려서 rate limiting 방지
        setTimeout(() => {
          this.checkConnection();
        }, 5000 * this.connectionStatus.errorCount);
      } else {
        console.warn("⚠️ API 서비스: 서버 연결 실패, 오프라인 모드로 전환");
      }

      return false;
    }
  }

  // 연결 상태 리셋
  resetConnectionStatus() {
    this.connectionStatus = {
      isConnected: true,
      lastCheck: null,
      errorCount: 0,
      retryAttempts: 0,
    };
  }

  // 연결 상태 가져오기
  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  // 연결 상태 모니터링 시작
  startConnectionMonitoring(intervalMs: number = 30000) {
    console.log(
      `🔍 Starting connection monitoring (check every ${intervalMs}ms)`
    );

    setInterval(async () => {
      await this.checkConnection();
    }, intervalMs);
  }

  // 토큰 설정
  setToken(token: string) {
    this.token = token;
    this.api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  // 토큰 제거
  clearToken() {
    this.token = null;
    delete this.api.defaults.headers.common["Authorization"];
  }

  // 회원가입
  async register(
    email: string,
    password: string,
    nexusNickname: string
  ): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>("/api/auth/register", {
        email,
        password,
        nexusNickname,
      });
      return response.data;
    } catch (error) {
      console.error("회원가입 오류:", error);
      throw error;
    }
  }

  // 로그인
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>("/api/auth/login", {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      console.error("로그인 오류:", error);
      throw error;
    }
  }

  // Riot ID 연결
  async linkRiotId(riotNickname: string, riotTag: string): Promise<any> {
    try {
      const response = await this.api.post("/api/users/link-riot-id", {
        riotNickname,
        riotTag,
      });
      return response.data;
    } catch (error) {
      console.error("Riot ID 연결 오류:", error);
      throw error;
    }
  }

  // 현재 사용자 정보 가져오기
  async getCurrentUser(): Promise<User> {
    try {
      // 토큰이 없으면 오류 발생
      if (!this.token) {
        throw new Error("토큰이 없습니다. 로그인이 필요합니다.");
      }

      const response = await this.api.get<ApiResponse<User>>("/api/auth/me");
      return response.data.data!;
    } catch (error) {
      console.error("사용자 정보 가져오기 오류:", error);
      throw error;
    }
  }

  // 프로필 업데이트
  async updateProfile(data: {
    nexusNickname?: string;
    mainLane?: string;
    mostChampions?: string[];
  }): Promise<any> {
    try {
      const response = await this.api.put("/api/users/profile", data);
      return response.data;
    } catch (error) {
      console.error("프로필 업데이트 오류:", error);
      throw error;
    }
  }

  // 사용자 정보 가져오기
  async getUser(userId: number): Promise<User> {
    try {
      const response = await this.api.get<ApiResponse<User>>(
        `/api/users/${userId}`
      );
      return response.data.data!;
    } catch (error) {
      console.error("사용자 정보 가져오기 오류:", error);
      throw error;
    }
  }

  // 친구 목록 가져오기
  async getFriends(): Promise<Friend[]> {
    try {
      const response = await this.api.get<ApiResponse<{ friends: Friend[] }>>(
        "/api/friends"
      );
      return response.data.data?.friends || [];
    } catch (error: any) {
      console.error("친구 목록 가져오기 오류:", error);

      // 429 오류인 경우 사용자에게 알림
      if (error.response?.status === 429) {
        console.warn("⚠️ 친구 목록 요청이 Rate Limiting에 걸렸습니다.");
        throw new Error("요청이 너무 많습니다. 잠시 후 다시 시도해주세요.");
      }

      // 네트워크 오류인 경우
      if (error.code === "ERR_NETWORK" || error.code === "ECONNABORTED") {
        console.error("❌ 네트워크 오류로 친구 목록을 가져올 수 없습니다.");
        throw new Error("네트워크 연결을 확인해주세요.");
      }

      // 기타 오류
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "친구 목록을 가져오는데 실패했습니다.";
      throw new Error(errorMessage);
    }
  }

  // 친구 요청 보내기
  async sendFriendRequest(friendUserId: number): Promise<any> {
    try {
      const response = await this.api.post("/api/friends/request", {
        friendUserId,
      });
      return response.data;
    } catch (error) {
      console.error("친구 요청 오류:", error);
      throw error;
    }
  }

  // 친구 요청 수락
  async acceptFriendRequest(friendUserId: number): Promise<any> {
    try {
      const response = await this.api.put("/api/friends/accept", {
        friendUserId,
      });
      return response.data;
    } catch (error) {
      console.error("친구 요청 수락 오류:", error);
      throw error;
    }
  }

  // 친구 요청 거절
  async rejectFriendRequest(friendUserId: number): Promise<any> {
    try {
      const response = await this.api.put("/api/friends/reject", {
        friendUserId,
      });
      return response.data;
    } catch (error) {
      console.error("친구 요청 거절 오류:", error);
      throw error;
    }
  }

  // 친구 삭제
  async removeFriend(friendUserId: number): Promise<any> {
    try {
      const response = await this.api.delete(`/api/friends/${friendUserId}`);
      return response.data;
    } catch (error) {
      console.error("친구 삭제 오류:", error);
      throw error;
    }
  }

  // 친구 요청 목록 가져오기
  async getFriendRequests(): Promise<any> {
    try {
      const response = await this.api.get("/api/friends/requests");
      return response.data;
    } catch (error) {
      console.error("친구 요청 목록 가져오기 오류:", error);
      throw error;
    }
  }

  // 메시지 목록 가져오기
  async getMessages(limit?: number, offset?: number): Promise<Message[]> {
    try {
      const params = new URLSearchParams();
      if (limit) params.append("limit", limit.toString());
      if (offset) params.append("offset", offset.toString());

      const response = await this.api.get<ApiResponse<Message[]>>(
        `/api/chat?${params.toString()}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error("메시지 목록 가져오기 오류:", error);
      throw error;
    }
  }

  // 특정 사용자와의 대화 가져오기
  async getConversation(
    otherUserId: number,
    limit?: number,
    offset?: number
  ): Promise<Message[]> {
    try {
      const params = new URLSearchParams();
      if (limit) params.append("limit", limit.toString());
      if (offset) params.append("offset", offset.toString());

      const response = await this.api.get<ApiResponse<Message[]>>(
        `/api/chat/conversation/${otherUserId}?${params.toString()}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error("대화 가져오기 오류:", error);
      throw error;
    }
  }

  // 메시지 보내기
  async sendMessage(receiverId: number, content: string): Promise<any> {
    try {
      const response = await this.api.post("/api/chat/send", {
        receiverId,
        content,
      });
      return response.data;
    } catch (error) {
      console.error("메시지 보내기 오류:", error);
      throw error;
    }
  }

  // 읽지 않은 메시지 수 가져오기
  async getUnreadMessageCount(): Promise<number> {
    try {
      const response = await this.api.get<ApiResponse<{ count: number }>>(
        "/api/chat/unread-count"
      );
      return response.data.data?.count || 0;
    } catch (error) {
      console.error("읽지 않은 메시지 수 가져오기 오류:", error);
      throw error;
    }
  }

  // 대화 목록 가져오기
  async getConversations(): Promise<any[]> {
    try {
      const response = await this.api.get<ApiResponse<any[]>>(
        "/api/conversations"
      );
      return response.data.data || [];
    } catch (error) {
      console.error("대화 목록 가져오기 오류:", error);
      return [];
    }
  }

  // 메시지 읽음 처리
  async markMessagesAsRead(userId: number): Promise<any> {
    try {
      const response = await this.api.post(`/api/chat/mark-read/${userId}`);
      return response.data;
    } catch (error) {
      console.error("메시지 읽음 처리 오류:", error);
      throw error;
    }
  }

  // 사용자 검색
  async searchUsers(query: string, limit?: number): Promise<User[]> {
    try {
      const params = new URLSearchParams({ query });
      if (limit) params.append("limit", limit.toString());

      const response = await this.api.get<ApiResponse<User[]>>(
        `/api/users/search?${params.toString()}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error("사용자 검색 오류:", error);
      throw error;
    }
  }

  // 커스텀 게임 목록 가져오기
  async getCustomGames(params?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<CustomGame[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append("status", params.status);
      if (params?.search) queryParams.append("search", params.search);
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.offset)
        queryParams.append("offset", params.offset.toString());

      const response = await this.api.get<ApiResponse<{ games: CustomGame[] }>>(
        `/api/custom-games?${queryParams.toString()}`
      );

      // 백엔드 응답 구조: { data: { games: [...] } }
      const games = response.data.data?.games;
      return Array.isArray(games) ? games : [];
    } catch (error) {
      console.error("커스텀 게임 목록 가져오기 오류:", error);
      return [];
    }
  }

  // 커스텀 게임 상세 정보 가져오기
  async getCustomGame(gameId: number): Promise<CustomGame> {
    try {
      const response = await this.api.get<ApiResponse<CustomGame>>(
        `/api/custom-games/${gameId}`
      );
      return response.data.data!;
    } catch (error) {
      console.error("커스텀 게임 상세 정보 가져오기 오류:", error);
      throw error;
    }
  }

  // 커스텀 게임 생성
  async createCustomGame(data: {
    title: string;
    description?: string;
    password?: string;
    maxPlayers: number;
    teamComposition: "none" | "auction" | "rock-paper-scissors";
    banPickMode: string;
    allowSpectators: boolean;
  }): Promise<any> {
    try {
      const response = await this.api.post("/api/custom-games", data);
      return response.data;
    } catch (error) {
      console.error("커스텀 게임 생성 오류:", error);
      throw error;
    }
  }

  // 커스텀 게임 참가
  async joinCustomGame(gameId: number, password?: string): Promise<any> {
    try {
      console.log("내전 입장 시도:", {
        gameId,
        password,
        token: this.token ? "존재함" : "없음",
      });

      const response = await this.api.post(`/api/custom-games/${gameId}/join`, {
        password,
      });

      console.log("내전 입장 성공:", response.data);
      return response.data;
    } catch (error) {
      console.error("커스텀 게임 참가 오류:", error);
      throw error;
    }
  }

  // 커스텀 게임 나가기
  async leaveCustomGame(gameId: number): Promise<any> {
    try {
      const response = await this.api.delete(
        `/api/custom-games/${gameId}/leave`
      );
      return response.data;
    } catch (error) {
      console.error("커스텀 게임 나가기 오류:", error);
      throw error;
    }
  }

  // 커스텀 게임 시작
  async startCustomGame(gameId: number): Promise<any> {
    try {
      const response = await this.api.post(`/api/custom-games/${gameId}/start`);
      return response.data;
    } catch (error) {
      console.error("커스텀 게임 시작 오류:", error);
      throw error;
    }
  }

  // 커스텀 게임 종료
  async endCustomGame(gameId: number): Promise<any> {
    try {
      const response = await this.api.post(`/api/custom-games/${gameId}/end`);
      return response.data;
    } catch (error) {
      console.error("커스텀 게임 종료 오류:", error);
      throw error;
    }
  }

  // 커스텀 게임 삭제
  async deleteCustomGame(gameId: number): Promise<any> {
    try {
      const response = await this.api.delete(`/api/custom-games/${gameId}`);
      return response.data;
    } catch (error) {
      console.error("커스텀 게임 삭제 오류:", error);
      throw error;
    }
  }

  // 사용자의 커스텀 게임 목록 가져오기
  async getUserCustomGames(
    userId: number,
    limit?: number,
    offset?: number
  ): Promise<CustomGame[]> {
    try {
      const params = new URLSearchParams();
      if (limit) params.append("limit", limit.toString());
      if (offset) params.append("offset", offset.toString());

      const response = await this.api.get<ApiResponse<CustomGame[]>>(
        `/api/users/${userId}/custom-games?${params.toString()}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error("사용자 커스텀 게임 목록 가져오기 오류:", error);
      throw error;
    }
  }

  // 커뮤니티 게시글 목록 가져오기
  async getCommunityPosts(params?: {
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<CommunityPost[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.category) queryParams.append("category", params.category);
      if (params?.search) queryParams.append("search", params.search);
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.offset)
        queryParams.append("offset", params.offset.toString());

      const response = await this.api.get<ApiResponse<CommunityPost[]>>(
        `/api/community/posts?${queryParams.toString()}`
      );
      const data = response.data.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("커뮤니티 게시글 목록 가져오기 오류:", error);
      throw error;
    }
  }

  // 커뮤니티 게시글 상세 정보 가져오기
  async getCommunityPost(postId: number): Promise<CommunityPost> {
    try {
      const response = await this.api.get<ApiResponse<CommunityPost>>(
        `/api/community/posts/${postId}`
      );
      return response.data.data!;
    } catch (error) {
      console.error("커뮤니티 게시글 상세 정보 가져오기 오류:", error);
      throw error;
    }
  }

  // 커뮤니티 게시글 생성
  async createCommunityPost(data: {
    category: string;
    title: string;
    content: string;
    tags?: string[];
    isAnonymous?: boolean;
  }): Promise<any> {
    try {
      const response = await this.api.post("/api/community/posts", data);
      return response.data;
    } catch (error) {
      console.error("커뮤니티 게시글 생성 오류:", error);
      throw error;
    }
  }

  // 커뮤니티 게시글 수정
  async updateCommunityPost(
    postId: number,
    data: {
      title?: string;
      content?: string;
      tags?: string[];
    }
  ): Promise<any> {
    try {
      const response = await this.api.put(
        `/api/community/posts/${postId}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("커뮤니티 게시글 수정 오류:", error);
      throw error;
    }
  }

  // 커뮤니티 게시글 삭제
  async deleteCommunityPost(postId: number): Promise<any> {
    try {
      const response = await this.api.delete(`/api/community/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error("커뮤니티 게시글 삭제 오류:", error);
      throw error;
    }
  }

  // 게시글 좋아요
  async likePost(postId: number): Promise<any> {
    try {
      const response = await this.api.post(
        `/api/community/posts/${postId}/like`
      );
      return response.data;
    } catch (error) {
      console.error("게시글 좋아요 오류:", error);
      throw error;
    }
  }

  // 게시글 싫어요
  async dislikePost(postId: number): Promise<any> {
    try {
      const response = await this.api.post(
        `/api/community/posts/${postId}/dislike`
      );
      return response.data;
    } catch (error) {
      console.error("게시글 싫어요 오류:", error);
      throw error;
    }
  }

  // 댓글 생성
  async createComment(
    postId: number,
    data: {
      content: string;
      parentCommentId?: number;
      isAnonymous?: boolean;
    }
  ): Promise<any> {
    try {
      const response = await this.api.post(
        `/api/community/posts/${postId}/comments`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("댓글 생성 오류:", error);
      throw error;
    }
  }

  // 댓글 좋아요
  async likeComment(commentId: number): Promise<any> {
    try {
      const response = await this.api.post(
        `/api/community/comments/${commentId}/like`
      );
      return response.data;
    } catch (error) {
      console.error("댓글 좋아요 오류:", error);
      throw error;
    }
  }

  // 댓글 싫어요
  async dislikeComment(commentId: number): Promise<any> {
    try {
      const response = await this.api.post(
        `/api/community/comments/${commentId}/dislike`
      );
      return response.data;
    } catch (error) {
      console.error("댓글 싫어요 오류:", error);
      throw error;
    }
  }

  // 인기 게시글 가져오기
  async getPopularPosts(limit?: number): Promise<CommunityPost[]> {
    try {
      const params = new URLSearchParams();
      if (limit) params.append("limit", limit.toString());

      const response = await this.api.get<ApiResponse<CommunityPost[]>>(
        `/api/community/posts/popular?${params.toString()}`
      );

      // 응답 데이터가 배열인지 확인하고 안전하게 반환
      const data = response.data.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("인기 게시글 가져오기 오류:", error);
      return [];
    }
  }

  // 스트리머 목록 가져오기
  async getStreamers(params?: {
    platform?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Streamer[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.platform) queryParams.append("platform", params.platform);
      if (params?.search) queryParams.append("search", params.search);
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.offset)
        queryParams.append("offset", params.offset.toString());

      const response = await this.api.get<ApiResponse<Streamer[]>>(
        `/api/streamers?${queryParams.toString()}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error("스트리머 목록 가져오기 오류:", error);
      throw error;
    }
  }

  // 스트리머 상세 정보 가져오기
  async getStreamer(streamerId: number): Promise<Streamer> {
    try {
      const response = await this.api.get<ApiResponse<Streamer>>(
        `/api/streamers/${streamerId}`
      );
      return response.data.data!;
    } catch (error) {
      console.error("스트리머 상세 정보 가져오기 오류:", error);
      throw error;
    }
  }

  // 스트리머 등록
  async registerStreamer(data: {
    streamLink: string;
    platform: "twitch" | "youtube" | "afreeca";
    recentBroadcast?: string;
    viewerCount?: number;
    isLive?: boolean;
  }): Promise<any> {
    try {
      const response = await this.api.post("/api/streamers", data);
      return response.data;
    } catch (error) {
      console.error("스트리머 등록 오류:", error);
      throw error;
    }
  }

  // 스트리머 정보 수정
  async updateStreamerInfo(
    streamerId: number,
    data: {
      streamLink?: string;
      platform?: "twitch" | "youtube" | "afreeca";
      recentBroadcast?: string;
      viewerCount?: number;
      isLive?: boolean;
    }
  ): Promise<any> {
    try {
      const response = await this.api.put(`/api/streamers/${streamerId}`, data);
      return response.data;
    } catch (error) {
      console.error("스트리머 정보 수정 오류:", error);
      throw error;
    }
  }

  // 스트리머 등록 삭제
  async deleteStreamerRegistration(streamerId: number): Promise<any> {
    try {
      const response = await this.api.delete(`/api/streamers/${streamerId}`);
      return response.data;
    } catch (error) {
      console.error("스트리머 등록 삭제 오류:", error);
      throw error;
    }
  }

  // 사용자 매치 목록 가져오기
  async getUserMatches(
    userId: number,
    limit?: number,
    offset?: number
  ): Promise<Match[]> {
    try {
      const params = new URLSearchParams();
      if (limit) params.append("limit", limit.toString());
      if (offset) params.append("offset", offset.toString());

      const response = await this.api.get<ApiResponse<Match[]>>(
        `/api/users/${userId}/matches?${params.toString()}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error("사용자 매치 목록 가져오기 오류:", error);
      throw error;
    }
  }

  // 매치 상세 정보 가져오기
  async getMatch(matchId: string): Promise<Match> {
    try {
      const response = await this.api.get<ApiResponse<Match>>(
        `/api/matches/${matchId}`
      );
      return response.data.data!;
    } catch (error) {
      console.error("매치 상세 정보 가져오기 오류:", error);
      throw error;
    }
  }

  // 매치 저장
  async saveMatch(data: {
    gameId: number;
    matchData: any;
    winnerTeam?: number;
    duration?: number;
  }): Promise<any> {
    try {
      const response = await this.api.post("/api/matches", data);
      return response.data;
    } catch (error) {
      console.error("매치 저장 오류:", error);
      throw error;
    }
  }

  // 소환사 정보 가져오기
  async getSummoner(name: string, tag: string): Promise<any> {
    try {
      const response = await this.api.get(`/api/riot/summoner/${name}/${tag}`);
      return response.data;
    } catch (error) {
      console.error("소환사 정보 가져오기 오류:", error);
      throw error;
    }
  }

  // 리그 정보 가져오기
  async getLeagueEntries(summonerId: string): Promise<any> {
    try {
      const response = await this.api.get(`/api/riot/league/${summonerId}`);
      return response.data;
    } catch (error) {
      console.error("리그 정보 가져오기 오류:", error);
      throw error;
    }
  }

  // 매치 히스토리 가져오기
  async getMatchHistory(puuid: string, count?: number): Promise<string[]> {
    try {
      const params = new URLSearchParams();
      if (count) params.append("count", count.toString());

      const response = await this.api.get<ApiResponse<string[]>>(
        `/api/riot/matches/${puuid}?${params.toString()}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error("매치 히스토리 가져오기 오류:", error);
      throw error;
    }
  }

  // 매치 상세 정보 가져오기
  async getMatchDetails(matchId: string): Promise<any> {
    try {
      const response = await this.api.get(`/api/riot/match/${matchId}`);
      return response.data;
    } catch (error) {
      console.error("매치 상세 정보 가져오기 오류:", error);
      throw error;
    }
  }

  // 챔피언 정보 가져오기
  async getChampions(): Promise<any> {
    try {
      const response = await this.api.get("/api/riot/champions");
      return response.data;
    } catch (error) {
      console.error("챔피언 정보 가져오기 오류:", error);
      throw error;
    }
  }

  // 아이템 정보 가져오기
  async getItems(): Promise<any> {
    try {
      const response = await this.api.get("/api/riot/items");
      return response.data;
    } catch (error) {
      console.error("아이템 정보 가져오기 오류:", error);
      throw error;
    }
  }

  // 소환사 주문 정보 가져오기
  async getSummonerSpells(): Promise<any> {
    try {
      const response = await this.api.get("/api/riot/summoner-spells");
      return response.data;
    } catch (error) {
      console.error("소환사 주문 정보 가져오기 오류:", error);
      throw error;
    }
  }

  // 룬 정보 가져오기
  async getRunes(): Promise<any> {
    try {
      const response = await this.api.get("/api/riot/runes");
      return response.data;
    } catch (error) {
      console.error("룬 정보 가져오기 오류:", error);
      throw error;
    }
  }

  // 피드백 제출
  async submitFeedback(data: {
    category: string;
    title: string;
    content: string;
    featureName?: string;
    rating?: number;
    isAnonymous?: boolean;
  }): Promise<any> {
    try {
      const response = await this.api.post("/api/feedback", data);
      return response.data;
    } catch (error) {
      console.error("피드백 제출 오류:", error);
      throw error;
    }
  }

  // 피드백 통계 가져오기
  async getFeedbackStats(featureName?: string): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (featureName) params.append("featureName", featureName);

      const response = await this.api.get<ApiResponse<{ stats: any }>>(
        `/api/feedback/stats?${params.toString()}`
      );
      return response.data.data?.stats;
    } catch (error) {
      console.error("피드백 통계 가져오기 오류:", error);
      throw error;
    }
  }

  // 사용자 평가
  async evaluateUser(
    targetUserId: number,
    evaluationType: "like" | "dislike"
  ): Promise<any> {
    try {
      const response = await this.api.post("/api/feedback/evaluate-user", {
        targetUserId,
        evaluationType,
      });
      return response.data;
    } catch (error) {
      console.error("사용자 평가 오류:", error);
      throw error;
    }
  }

  // 사용자 평가 목록 가져오기
  async getUserEvaluations(userId: number): Promise<any> {
    try {
      const response = await this.api.get<
        ApiResponse<{ evaluations: any[]; summary: any }>
      >(`/api/feedback/evaluations/${userId}`);
      return response.data.data!;
    } catch (error) {
      console.error("사용자 평가 목록 가져오기 오류:", error);
      throw error;
    }
  }

  // 사용자 신고
  async reportUser(data: {
    reportedUserId: number;
    reportType: string;
    reason: string;
    evidence?: string;
  }): Promise<any> {
    try {
      const response = await this.api.post("/api/feedback/report", data);
      return response.data;
    } catch (error) {
      console.error("사용자 신고 오류:", error);
      throw error;
    }
  }

  // 토너먼트 생성
  async createTournament(gameId: number, name: string): Promise<any> {
    try {
      const response = await this.api.post("/api/tournaments", {
        gameId,
        name,
      });
      return response.data;
    } catch (error) {
      console.error("토너먼트 생성 오류:", error);
      throw error;
    }
  }

  // 게임별 토너먼트 가져오기
  async getTournamentByGame(gameId: number): Promise<any> {
    try {
      const response = await this.api.get(`/api/tournaments/game/${gameId}`);
      return response.data;
    } catch (error: any) {
      // 404 에러는 토너먼트가 없는 것이므로 조용히 처리
      if (error.response?.status === 404) {
        console.log("토너먼트가 없습니다:", gameId);
        return { data: { tournament: null } };
      }
      console.error("게임별 토너먼트 가져오기 오류:", error);
      throw error;
    }
  }

  // 매치 결과 업데이트
  async updateMatchResult(
    matchId: number,
    data: {
      winnerId: number;
      winnerNickname: string;
      tournamentCode?: string;
      gameId?: string;
    }
  ): Promise<any> {
    try {
      const response = await this.api.put(
        `/api/tournaments/matches/${matchId}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("매치 결과 업데이트 오류:", error);
      throw error;
    }
  }

  // 토너먼트 브래킷 가져오기
  async getTournamentBracket(tournamentId: number): Promise<any> {
    try {
      const response = await this.api.get(
        `/api/tournaments/${tournamentId}/bracket`
      );
      return response.data;
    } catch (error) {
      console.error("토너먼트 브래킷 가져오기 오류:", error);
      throw error;
    }
  }

  // 팀 리더 선거 시작
  async startTeamLeaderElection(gameId: number): Promise<any> {
    try {
      const response = await this.api.post(
        `/api/custom-games/${gameId}/start-election`
      );
      return response.data;
    } catch (error) {
      console.error("팀 리더 선거 시작 오류:", error);
      throw error;
    }
  }

  // 팀 리더 선출
  async electTeamLeaders(
    gameId: number,
    teamLeaders: Array<{
      userId: number;
      teamName: string;
      color: "blue" | "red";
    }>
  ): Promise<any> {
    try {
      const response = await this.api.post(
        `/api/custom-games/${gameId}/elect-leaders`,
        {
          teamLeaders,
        }
      );
      return response.data;
    } catch (error) {
      console.error("팀 리더 선출 오류:", error);
      throw error;
    }
  }

  // 팀 참가
  async joinTeam(gameId: number, teamId: number): Promise<any> {
    try {
      const response = await this.api.post(
        `/api/custom-games/${gameId}/join-team`,
        {
          teamId,
        }
      );
      return response.data;
    } catch (error) {
      console.error("팀 참가 오류:", error);
      throw error;
    }
  }

  // 라인 선택 시작
  async startLineSelection(gameId: number): Promise<any> {
    try {
      const response = await this.api.post(
        `/api/custom-games/${gameId}/start-line-selection`
      );
      return response.data;
    } catch (error) {
      console.error("라인 선택 시작 오류:", error);
      throw error;
    }
  }

  // 라인 선택
  async selectLine(
    gameId: number,
    lineName: "top" | "jungle" | "mid" | "adc" | "support"
  ): Promise<any> {
    try {
      const response = await this.api.post(
        `/api/custom-games/${gameId}/select-line`,
        {
          lineName,
        }
      );
      return response.data;
    } catch (error) {
      console.error("라인 선택 오류:", error);
      throw error;
    }
  }

  // 게임 시작
  async startGame(gameId: number): Promise<any> {
    try {
      const response = await this.api.post(
        `/api/custom-games/${gameId}/start-game`
      );
      return response.data;
    } catch (error) {
      console.error("게임 시작 오류:", error);
      throw error;
    }
  }

  // 게임 팀 정보 가져오기
  async getGameTeams(gameId: number): Promise<any> {
    try {
      const response = await this.api.get(`/api/custom-games/${gameId}/teams`);
      return response.data;
    } catch (error) {
      console.error("게임 팀 정보 가져오기 오류:", error);
      throw error;
    }
  }

  // 라인 포지션 정보 가져오기
  async getLinePositions(gameId: number): Promise<any> {
    try {
      const response = await this.api.get(
        `/api/custom-games/${gameId}/line-positions`
      );
      return response.data;
    } catch (error) {
      console.error("라인 포지션 정보 가져오기 오류:", error);
      throw error;
    }
  }

  // 사용자 매치 히스토리 가져오기
  async getUserMatchHistory(userId: number): Promise<any> {
    try {
      const response = await this.api.get(`/api/users/${userId}/matches`);
      return response.data;
    } catch (error) {
      console.error("사용자 매치 히스토리 가져오기 오류:", error);
      throw error;
    }
  }

  // 관전자 관련
  async joinAsSpectator(gameId: number): Promise<any> {
    try {
      const response = await this.api.post(`/custom-games/${gameId}/spectate`);
      return response.data;
    } catch (error) {
      console.error("Failed to join as spectator:", error);
      throw error;
    }
  }

  async getGameSpectators(gameId: number): Promise<any> {
    try {
      const response = await this.api.get(`/custom-games/${gameId}/spectators`);
      return response.data;
    } catch (error) {
      console.error("Failed to get game spectators:", error);
      throw error;
    }
  }

  // 채팅 메시지 관련
  async getChatMessages(
    gameId: number,
    limit?: number,
    offset?: number
  ): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (limit) params.append("limit", limit.toString());
      if (offset) params.append("offset", offset.toString());

      const response = await this.api.get(
        `/custom-games/${gameId}/chat?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get chat messages:", error);
      throw error;
    }
  }

  async sendChatMessage(gameId: number, message: string): Promise<any> {
    try {
      const response = await this.api.post(`/custom-games/${gameId}/chat`, {
        message,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to send chat message:", error);
      throw error;
    }
  }

  // 경매 관련
  async placeAuctionBid(
    gameId: number,
    playerId: number,
    bidAmount: number
  ): Promise<any> {
    try {
      const response = await this.api.post(
        `/custom-games/${gameId}/auction/bid`,
        {
          playerId,
          bidAmount,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to place auction bid:", error);
      throw error;
    }
  }

  async getAuctionBids(gameId: number): Promise<any> {
    try {
      const response = await this.api.get(
        `/custom-games/${gameId}/auction/bids`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get auction bids:", error);
      throw error;
    }
  }

  // 가위바위보 관련
  async playRockPaperScissors(
    gameId: number,
    choice: "rock" | "paper" | "scissors"
  ): Promise<any> {
    try {
      const response = await this.api.post(`/custom-games/${gameId}/rps/play`, {
        choice,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to play rock paper scissors:", error);
      throw error;
    }
  }

  async getRPSResults(gameId: number): Promise<any> {
    try {
      const response = await this.api.get(
        `/custom-games/${gameId}/rps/results`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to get RPS results:", error);
      throw error;
    }
  }

  // 게임 초대 보내기
  async sendGameInvite(gameId: number, friendUserId: number): Promise<any> {
    try {
      const response = await this.api.post("/api/games/invite", {
        gameId,
        friendUserId,
      });
      return response.data;
    } catch (error) {
      console.error("게임 초대 오류:", error);
      throw error;
    }
  }

  // 게임 초대 수락
  async acceptGameInvite(inviteId: number): Promise<any> {
    try {
      const response = await this.api.put(
        `/api/games/invite/${inviteId}/accept`
      );
      return response.data;
    } catch (error) {
      console.error("게임 초대 수락 오류:", error);
      throw error;
    }
  }

  // 게임 초대 거절
  async rejectGameInvite(inviteId: number): Promise<any> {
    try {
      const response = await this.api.put(
        `/api/games/invite/${inviteId}/reject`
      );
      return response.data;
    } catch (error) {
      console.error("게임 초대 거절 오류:", error);
      throw error;
    }
  }

  // 받은 게임 초대 목록
  async getGameInvites(): Promise<any> {
    try {
      const response = await this.api.get("/api/games/invites");
      return response.data;
    } catch (error) {
      console.error("게임 초대 목록 오류:", error);
      throw error;
    }
  }

  // Check if user is participant in game
  async checkParticipantStatus(gameId: number, userId: number): Promise<any> {
    try {
      const response = await this.api.get(
        `/api/custom-games/${gameId}/participant/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("참가자 상태 확인 오류:", error);
      throw error;
    }
  }

  // Get active participants count
  async getParticipantsCount(gameId: number): Promise<any> {
    try {
      const response = await this.api.get(
        `/api/custom-games/${gameId}/participants/count`
      );
      return response.data;
    } catch (error) {
      console.error("참가자 수 조회 오류:", error);
      throw error;
    }
  }

  // Check if game should be maintained
  async checkGameMaintenance(gameId: number): Promise<any> {
    try {
      const response = await this.api.get(
        `/api/custom-games/${gameId}/maintenance-check`
      );
      return response.data;
    } catch (error) {
      console.error("게임 유지 상태 확인 오류:", error);
      throw error;
    }
  }

  // Cleanup empty games
  async cleanupEmptyGames(): Promise<any> {
    try {
      const response = await this.api.post(
        "/api/custom-games/cleanup-empty-games"
      );
      return response.data;
    } catch (error) {
      console.error("빈 게임 정리 오류:", error);
      throw error;
    }
  }
}

const apiService = new ApiService();
export default apiService;

// Export types
export type {
  ApiResponse,
  AuthResponse,
  CommunityPost,
  CustomGame,
  Match,
  Message,
  Streamer,
  User,
};
