import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private eventListeners: Map<string, Set<(...args: any[]) => void>> =
    new Map();
  private isConnecting = false;

  constructor() {
    this.token = localStorage.getItem("token");
    console.log("🔌 SocketService 초기화 - 토큰 존재:", !!this.token);
  }

  // 이벤트 리스너 등록 (중복 방지)
  private addEventListener(event: string, callback: (...args: any[]) => void) {
    if (!this.socket) {
      console.warn(
        "⚠️ Socket이 연결되지 않아 이벤트 리스너를 등록할 수 없습니다:",
        event
      );
      return;
    }

    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }

    const listeners = this.eventListeners.get(event)!;
    if (!listeners.has(callback)) {
      listeners.add(callback);
      this.socket.on(event, callback);
      console.log(`✅ Socket 이벤트 리스너 등록: ${event}`);
    }
  }

  // 이벤트 리스너 제거
  private removeEventListener(
    event: string,
    callback?: (...args: any[]) => void
  ) {
    if (!this.socket) return;

    const listeners = this.eventListeners.get(event);
    if (listeners) {
      if (callback) {
        listeners.delete(callback);
        this.socket.off(event, callback);
      } else {
        // 모든 리스너 제거
        listeners.forEach((cb) => this.socket!.off(event, cb));
        listeners.clear();
      }
    }
  }

  // 모든 이벤트 리스너 제거
  clearAllListeners() {
    if (!this.socket) return;

    this.eventListeners.forEach((listeners, event) => {
      listeners.forEach((callback) => {
        this.socket!.off(event, callback);
      });
    });
    this.eventListeners.clear();
    console.log("🧹 모든 Socket 이벤트 리스너 제거 완료");
  }

  connect() {
    // 이미 연결 중이거나 연결된 경우 중복 연결 방지
    if (this.isConnecting || this.socket?.connected) {
      console.log("⚠️ Socket 연결 중이거나 이미 연결됨");
      return;
    }

    // 토큰이 없으면 연결하지 않음
    if (!this.token) {
      console.warn("⚠️ 토큰이 없어 Socket 연결을 건너뜁니다");
      return;
    }

    this.isConnecting = true;
    const backendUrl =
      process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

    console.log("🔌 Socket.IO 연결 시도:", backendUrl);

    this.socket = io(backendUrl, {
      auth: {
        token: this.token,
      },
      transports: ["websocket", "polling"],
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on("connect", () => {
      console.log("✅ Socket connected");
      this.reconnectAttempts = 0;
      this.isConnecting = false;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      this.isConnecting = false;

      if (reason === "io server disconnect") {
        // 서버에서 연결을 끊은 경우 수동으로 재연결
        this.socket?.connect();
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      this.reconnectAttempts++;
      this.isConnecting = false;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("Max reconnection attempts reached");
      }
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log(`✅ Socket reconnected after ${attemptNumber} attempts`);
      this.reconnectAttempts = 0;
      this.isConnecting = false;
    });

    this.socket.on("reconnect_error", (error) => {
      console.error("Socket reconnection error:", error);
      this.isConnecting = false;
    });

    this.socket.on("reconnect_failed", () => {
      console.error("Socket reconnection failed");
      this.isConnecting = false;
    });
  }

  disconnect() {
    if (this.socket) {
      console.log("🔌 Socket 연결 해제");
      this.clearAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnecting = false;
    }
  }

  setToken(token: string) {
    console.log("🔑 Socket 토큰 설정");
    this.token = token;
    localStorage.setItem("token", token);

    if (this.socket) {
      this.socket.auth = { token };
      this.socket.connect();
    }
  }

  clearToken() {
    console.log("🔑 Socket 토큰 제거");
    this.token = null;
    localStorage.removeItem("token");
    this.disconnect();
  }

  // 토큰 존재 여부 확인
  hasToken(): boolean {
    return !!this.token;
  }

  // 게임 채팅 관련
  joinGameChat(gameId: number) {
    if (!this.socket) {
      console.warn("⚠️ Socket이 연결되지 않아 게임 채팅에 참여할 수 없습니다");
      return;
    }
    this.socket.emit("custom-game:join", { gameId });
  }

  leaveGameChat(gameId: number) {
    if (!this.socket) return;
    this.socket.emit("custom-game:leave", { gameId });
  }

  sendGameMessage(gameId: number, message: string) {
    if (!this.socket) {
      console.warn("⚠️ Socket이 연결되지 않아 게임 메시지를 보낼 수 없습니다");
      return;
    }
    this.socket.emit("game:chat", { gameId, message });
  }

  onGameMessage(callback: (data: any) => void) {
    this.addEventListener("game:chat", callback);
  }

  onPlayerJoined(callback: (data: any) => void) {
    this.addEventListener("custom-game:player-joined", callback);
  }

  onPlayerLeft(callback: (data: any) => void) {
    this.addEventListener("custom-game:player-left", callback);
  }

  onGameProgressUpdate(callback: (data: any) => void) {
    this.addEventListener("custom-game:progress-update", callback);
  }

  // 경매 관련 - 이벤트명 수정
  joinAuctionRoom(gameId: number) {
    if (!this.socket) {
      console.warn("⚠️ Socket이 연결되지 않아 경매방에 참여할 수 없습니다");
      return;
    }
    this.socket.emit("auction:join", { gameId });
  }

  leaveAuctionRoom(gameId: number) {
    if (!this.socket) return;
    this.socket.emit("auction:leave", { gameId });
  }

  sendAuctionBid(
    gameId: number,
    playerId: number,
    bidAmount: number,
    playerNickname: string
  ) {
    if (!this.socket) {
      console.warn("⚠️ Socket이 연결되지 않아 경매 입찰을 보낼 수 없습니다");
      return;
    }
    this.socket.emit("auction:bid", {
      gameId,
      playerId,
      bidAmount,
      playerNickname,
    });
  }

  onAuctionBid(callback: (data: any) => void) {
    this.addEventListener("auction:bid", callback);
  }

  onAuctionEnd(callback: (data: any) => void) {
    this.addEventListener("auction:end", callback);
  }

  onAuctionComplete(callback: (data: any) => void) {
    this.addEventListener("auction:complete", callback);
  }

  onAuctionTimer(callback: (data: any) => void) {
    this.addEventListener("auction:timer", callback);
  }

  onNewAuctionPlayer(callback: (data: any) => void) {
    this.addEventListener("auction:new-player", callback);
  }

  // 가위바위보 관련 - 이벤트명 수정
  joinRPSRoom(gameId: number) {
    if (!this.socket) {
      console.warn(
        "⚠️ Socket이 연결되지 않아 가위바위보방에 참여할 수 없습니다"
      );
      return;
    }
    this.socket.emit("rps:join", { gameId });
  }

  leaveRPSRoom(gameId: number) {
    if (!this.socket) return;
    this.socket.emit("rps:leave", { gameId });
  }

  sendRPSChoice(gameId: number, choice: string) {
    if (!this.socket) {
      console.warn(
        "⚠️ Socket이 연결되지 않아 가위바위보 선택을 보낼 수 없습니다"
      );
      return;
    }
    this.socket.emit("rps:choice", { gameId, choice });
  }

  onRPSChoice(callback: (data: any) => void) {
    this.addEventListener("rps:choice", callback);
  }

  onRPSResults(callback: (data: any) => void) {
    this.addEventListener("rps:results", callback);
  }

  onRPSComplete(callback: (data: any) => void) {
    this.addEventListener("rps:complete", callback);
  }

  onRPSRoundStart(callback: (data: any) => void) {
    this.addEventListener("rps:round-start", callback);
  }

  onRPSGameEnd(callback: (data: any) => void) {
    this.addEventListener("rps:game-end", callback);
  }

  onRPSTimer(callback: (data: any) => void) {
    this.addEventListener("rps:timer", callback);
  }

  // 개인 메시지 관련 - 이벤트명 수정
  sendPrivateMessage(receiverId: number, message: string) {
    if (!this.socket) {
      console.warn("⚠️ Socket이 연결되지 않아 개인 메시지를 보낼 수 없습니다");
      return;
    }
    this.socket.emit("private-message", { receiverId, message });
  }

  onPrivateMessage(callback: (data: any) => void) {
    this.addEventListener("private-message", callback);
  }

  onNewMessage(callback: (data: any) => void) {
    this.addEventListener("new-message", callback);
  }

  onTyping(callback: (data: any) => void) {
    this.addEventListener("message:typing", callback);
  }

  sendTyping(receiverId: number, isTyping: boolean) {
    if (!this.socket) {
      console.warn("⚠️ Socket이 연결되지 않아 타이핑 상태를 보낼 수 없습니다");
      return;
    }
    this.socket.emit("message:typing", { receiverId, isTyping });
  }

  // 상태 업데이트 관련
  updatePresence(status: string, activity?: string) {
    if (!this.socket) {
      console.warn("⚠️ Socket이 연결되지 않아 상태를 업데이트할 수 없습니다");
      return;
    }
    this.socket.emit("presence:update", { status, activity });
  }

  onPresenceUpdate(callback: (data: any) => void) {
    this.addEventListener("presence:update", callback);
  }

  onUserOnline(callback: (data: any) => void) {
    this.addEventListener("user:online", callback);
  }

  onUserOffline(callback: (data: any) => void) {
    this.addEventListener("user:offline", callback);
  }

  onFriendOnline(callback: (data: any) => void) {
    this.addEventListener("friend:online", callback);
  }

  onFriendOffline(callback: (data: any) => void) {
    this.addEventListener("friend:offline", callback);
  }

  onFriendRequest(callback: (data: any) => void) {
    this.addEventListener("friend:request", callback);
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.addEventListener(event, callback);
  }

  // 친구 알림 관련
  notifyFriends(friendIds: number[]) {
    if (!this.socket) {
      console.warn("⚠️ Socket이 연결되지 않아 친구 알림을 보낼 수 없습니다");
      return;
    }
    this.socket.emit("friends:notify", { friendIds });
  }

  // 이벤트 리스너 제거 (개선된 버전)
  off(event: string, callback?: (...args: any[]) => void) {
    this.removeEventListener(event, callback);
  }

  // 연결 상태 확인
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // 토큰 갱신 시 Socket 재연결
  refreshConnection() {
    console.log("🔄 Socket 연결 새로고침");
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connect();
  }
}

const socketService = new SocketService();
export default socketService;
