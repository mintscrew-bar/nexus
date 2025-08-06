import { create } from "zustand";
import { devtools } from "zustand/middleware";
import apiService from "../services/api";
import socketService from "../services/socket";
import {
  CustomGame,
  Friend,
  Match,
  Message,
  StreamerInfo,
  User,
} from "../types";

interface AppState {
  // 사용자 관련
  user: User | null;
  isAuthenticated: boolean;

  // 친구 관련
  friends: Friend[];

  // 메시지 관련
  messages: Message[];

  // 매치 관련
  matches: Match[];

  // 내전 관련
  customGames: CustomGame[];

  // 스트리머 관련
  streamers: StreamerInfo[];

  // UI 상태
  isLoading: boolean;
  error: string | null;
  theme: "dark" | "light";
  friendsPanelOpen: boolean;

  // 연결 상태
  connectionStatus: {
    isConnected: boolean;
    lastCheck: Date | null;
    errorCount: number;
    retryAttempts: number;
  };

  // Socket.IO 상태
  socketStatus: {
    isConnected: boolean;
    lastConnected: Date | null;
    errorCount: number;
  };

  // 실시간 상태
  onlineUsers: string[];
  typingUsers: { [key: string]: boolean };
}

interface AppActions {
  // 사용자 관련 액션
  initializeAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  setAuthenticated: (authenticated: boolean) => void;
  logout: () => void;

  // 친구 관련 액션
  setFriends: (friends: Friend[]) => void;
  addFriend: (friend: Friend) => void;
  removeFriend: (friendId: string) => void;
  updateFriendStatus: (friendId: string, status: Friend["status"]) => void;

  // 메시지 관련 액션
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  markMessageAsRead: (messageId: string) => void;

  // 매치 관련 액션
  setMatches: (matches: Match[]) => void;
  addMatch: (match: Match) => void;

  // 내전 관련 액션
  setCustomGames: (games: CustomGame[]) => void;
  addCustomGame: (game: CustomGame) => void;
  updateCustomGame: (gameId: string, updates: Partial<CustomGame>) => void;
  removeCustomGame: (gameId: string) => void;

  // 스트리머 관련 액션
  setStreamers: (streamers: StreamerInfo[]) => void;
  addStreamer: (streamer: StreamerInfo) => void;
  updateStreamer: (streamerId: string, updates: Partial<StreamerInfo>) => void;
  removeStreamer: (streamerId: string) => void;

  // UI 상태 액션
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTheme: (theme: "dark" | "light") => void;
  setFriendsPanelOpen: (open: boolean) => void;
  clearError: () => void;

  // 연결 상태 액션
  updateConnectionStatus: (status: AppState["connectionStatus"]) => void;
  checkConnection: () => Promise<boolean>;

  // Socket.IO 상태 액션
  updateSocketStatus: (status: AppState["socketStatus"]) => void;
  initializeSocket: () => void;
  disconnectSocket: () => void;

  // 실시간 상태 액션
  setOnlineUsers: (users: string[]) => void;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;
  setTypingUser: (userId: string, isTyping: boolean) => void;
}

const initialState: AppState = {
  user: null,
  isAuthenticated: false, // 초기값을 false로 변경
  friends: [],
  messages: [],
  matches: [],
  customGames: [],
  streamers: [],
  isLoading: false,
  error: null,
  theme: (localStorage.getItem("theme") as "dark" | "light") || "dark",
  friendsPanelOpen: true,
  connectionStatus: {
    isConnected: true,
    lastCheck: null,
    errorCount: 0,
    retryAttempts: 0,
  },
  socketStatus: {
    isConnected: false,
    lastConnected: null,
    errorCount: 0,
  },
  onlineUsers: [],
  typingUsers: {},
};

export const useAppStore = create<AppState & AppActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // 초기화 시 토큰 확인 및 사용자 정보 로드
      initializeAuth: async () => {
        console.log("🔐 Zustand: 인증 초기화 시작");
        const token = localStorage.getItem("token");
        console.log("🔑 Zustand: 토큰 존재 여부:", !!token);

        if (!token) {
          console.log("🔑 Zustand: 토큰이 없음, 로그인 필요");
          set({ user: null, isAuthenticated: false });
          return;
        }

        try {
          console.log("🔑 Zustand: 토큰 설정 중...");
          apiService.setToken(token);
          console.log("👤 Zustand: 현재 사용자 정보 가져오는 중...");
          const user = await apiService.getCurrentUser();
          console.log("✅ Zustand: 사용자 정보 로드 완료", user);
          set({ user, isAuthenticated: true });
        } catch (error) {
          console.error("❌ Zustand: 인증 상태 복원 실패:", error);
          // 토큰이 유효하지 않으면 제거
          localStorage.removeItem("token");
          apiService.clearToken();
          socketService.clearToken();
          set({ user: null, isAuthenticated: false });
        }
      },

      // 사용자 관련 액션
      setUser: (user) => set({ user }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      setAuthenticated: (authenticated) =>
        set({ isAuthenticated: authenticated }),
      logout: () => {
        console.log("🚪 로그아웃 실행");
        localStorage.removeItem("token");
        apiService.clearToken();
        socketService.clearToken();
        set({
          user: null,
          isAuthenticated: false,
          friends: [],
          messages: [],
          matches: [],
          customGames: [],
          streamers: [],
          onlineUsers: [],
          typingUsers: {},
          socketStatus: {
            isConnected: false,
            lastConnected: null,
            errorCount: 0,
          },
        });
      },

      // 친구 관련 액션
      setFriends: (friends) => set({ friends }),
      addFriend: (friend) =>
        set((state) => ({
          friends: [...state.friends, friend],
        })),
      removeFriend: (friendId) =>
        set((state) => ({
          friends: state.friends.filter((f) => f.id.toString() !== friendId),
        })),
      updateFriendStatus: (friendId, status) =>
        set((state) => ({
          friends: state.friends.map((f) =>
            f.id.toString() === friendId ? { ...f, status } : f
          ),
        })),

      // 메시지 관련 액션
      setMessages: (messages) => set({ messages }),
      addMessage: (message) =>
        set((state) => ({
          messages: [message, ...state.messages],
        })),
      markMessageAsRead: (messageId) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id.toString() === messageId ? { ...m, is_read: true } : m
          ),
        })),

      // 매치 관련 액션
      setMatches: (matches) => set({ matches }),
      addMatch: (match) =>
        set((state) => ({
          matches: [match, ...state.matches],
        })),

      // 내전 관련 액션
      setCustomGames: (customGames) => set({ customGames }),
      addCustomGame: (game) =>
        set((state) => ({
          customGames: [game, ...state.customGames],
        })),
      updateCustomGame: (gameId, updates) =>
        set((state) => ({
          customGames: state.customGames.map((g) =>
            g.id.toString() === gameId ? { ...g, ...updates } : g
          ),
        })),
      removeCustomGame: (gameId) =>
        set((state) => ({
          customGames: state.customGames.filter(
            (g) => g.id.toString() !== gameId
          ),
        })),

      // 스트리머 관련 액션
      setStreamers: (streamers) => set({ streamers }),
      addStreamer: (streamer) =>
        set((state) => ({
          streamers: [streamer, ...state.streamers],
        })),
      updateStreamer: (streamerId, updates) =>
        set((state) => ({
          streamers: state.streamers.map((s) =>
            s.id.toString() === streamerId ? { ...s, ...updates } : s
          ),
        })),
      removeStreamer: (streamerId) =>
        set((state) => ({
          streamers: state.streamers.filter(
            (s) => s.id.toString() !== streamerId
          ),
        })),

      // UI 상태 액션
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setTheme: (theme) => {
        localStorage.setItem("theme", theme);
        set({ theme });
      },
      setFriendsPanelOpen: (open) => set({ friendsPanelOpen: open }),
      clearError: () => set({ error: null }),

      // 연결 상태 액션
      updateConnectionStatus: (connectionStatus) => set({ connectionStatus }),
      checkConnection: async () => {
        try {
          const isConnected = await apiService.checkConnection();
          const connectionStatus = apiService.getConnectionStatus();
          set({ connectionStatus });
          return isConnected;
        } catch (error) {
          console.error("연결 상태 확인 실패:", error);
          set((state) => ({
            connectionStatus: {
              ...state.connectionStatus,
              isConnected: false,
              errorCount: state.connectionStatus.errorCount + 1,
            },
          }));
          return false;
        }
      },

      // Socket.IO 상태 액션
      updateSocketStatus: (socketStatus) => set({ socketStatus }),
      initializeSocket: () => {
        const token = localStorage.getItem("token");
        const { user, isAuthenticated } = get();

        console.log("🔌 Socket 초기화 시도:", {
          hasToken: !!token,
          hasUser: !!user,
          isAuthenticated,
        });

        // 토큰과 사용자 정보가 모두 있어야 Socket 연결
        if (!token || !user || !isAuthenticated) {
          console.warn(
            "⚠️ Socket 연결 조건 불충족 - 토큰 또는 사용자 정보 없음"
          );
          return;
        }

        if (!socketService.isConnected()) {
          console.log("🔌 Socket 연결 시작");
          socketService.setToken(token);
          socketService.connect();

          // Socket.IO 이벤트 리스너 설정
          socketService.onUserOnline((data) => {
            set((state) => ({
              onlineUsers: [...state.onlineUsers, data.userId],
            }));
          });

          socketService.onUserOffline((data) => {
            set((state) => ({
              onlineUsers: state.onlineUsers.filter((id) => id !== data.userId),
            }));
          });

          socketService.onFriendOnline((data) => {
            set((state) => ({
              friends: state.friends.map((f) =>
                f.id.toString() === data.userId
                  ? { ...f, status: "online" as const }
                  : f
              ),
            }));
          });

          socketService.onFriendOffline((data) => {
            set((state) => ({
              friends: state.friends.map((f) =>
                f.id.toString() === data.userId
                  ? { ...f, status: "offline" as const }
                  : f
              ),
            }));
          });

          socketService.onPrivateMessage((data) => {
            const newMessage: Message = {
              id: Date.now().toString(),
              senderId: parseInt(data.senderId),
              receiverId: get().user?.id || 0,
              content: data.message,
              timestamp: new Date(data.timestamp),
              isRead: false,
            };
            get().addMessage(newMessage);
          });

          socketService.onTyping((data) => {
            set((state) => ({
              typingUsers: {
                ...state.typingUsers,
                [data.senderId]: data.isTyping,
              },
            }));
          });

          set({
            socketStatus: {
              isConnected: true,
              lastConnected: new Date(),
              errorCount: 0,
            },
          });
        } else {
          console.log("🔌 Socket이 이미 연결됨");
        }
      },
      disconnectSocket: () => {
        console.log("🔌 Socket 연결 해제");
        socketService.disconnect();
        set({
          socketStatus: {
            isConnected: false,
            lastConnected: null,
            errorCount: 0,
          },
          onlineUsers: [],
          typingUsers: {},
        });
      },

      // 실시간 상태 액션
      setOnlineUsers: (users) => set({ onlineUsers: users }),
      addOnlineUser: (userId) =>
        set((state) => ({
          onlineUsers: [...state.onlineUsers, userId],
        })),
      removeOnlineUser: (userId) =>
        set((state) => ({
          onlineUsers: state.onlineUsers.filter((id) => id !== userId),
        })),
      setTypingUser: (userId, isTyping) =>
        set((state) => ({
          typingUsers: {
            ...state.typingUsers,
            [userId]: isTyping,
          },
        })),
    }),
    {
      name: "nexus-store",
    }
  )
);
