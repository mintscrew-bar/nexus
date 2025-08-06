const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "nexus-super-secret-jwt-key-2024";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const setupSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000"],
      credentials: true,
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
    allowEIO3: true,
  });

  // Socket.IO 인증 미들웨어
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization ||
        socket.handshake.query.token;

      if (!token) {
        console.log("No token provided for socket connection");
        // 토큰이 없어도 연결은 허용하되, 인증되지 않은 사용자로 처리
        socket.userId = null;
        socket.user = null;
        return next();
      }

      const decoded = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
      socket.userId = decoded.userId || decoded.id; // userId 또는 id 사용
      socket.user = decoded;
      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      // 인증 실패해도 연결은 허용하되, 인증되지 않은 사용자로 처리
      socket.userId = null;
      socket.user = null;
      next();
    }
  });

  // 연결 이벤트
  io.on("connection", (socket) => {
    if (socket.userId) {
      console.log(`✅ User connected: ${socket.userId}`);

      // 온라인 상태 업데이트
      socket.join(`user:${socket.userId}`);
      io.emit("user:online", { userId: socket.userId });
    } else {
      console.log("✅ Anonymous user connected");
    }

    // 친구 목록에 온라인 상태 알림
    socket.on("friends:notify", (data) => {
      if (!socket.userId) return;

      const { friendIds } = data;
      friendIds.forEach((friendId) => {
        socket
          .to(`user:${friendId}`)
          .emit("friend:online", { userId: socket.userId });
      });
    });

    // 커스텀 게임 관련
    socket.on("custom-game:join", (data) => {
      const { gameId } = data;
      socket.join(`game:${gameId}`);

      if (socket.userId) {
        socket.to(`game:${gameId}`).emit("custom-game:player-joined", {
          gameId,
          userId: socket.userId,
          user: socket.user,
        });
      }
    });

    socket.on("custom-game:leave", (data) => {
      const { gameId } = data;
      socket.leave(`game:${gameId}`);

      if (socket.userId) {
        socket.to(`game:${gameId}`).emit("custom-game:player-left", {
          gameId,
          userId: socket.userId,
        });
      }
    });

    // 게임 채팅
    socket.on("game:chat", (data) => {
      if (!socket.userId) return;

      const { gameId, message } = data;
      socket.to(`game:${gameId}`).emit("game:chat", {
        gameId,
        userId: socket.userId,
        user: socket.user,
        message,
        timestamp: new Date().toISOString(),
      });
    });

    // 개인 메시지 (클라이언트 이벤트명과 일치)
    socket.on("private-message", (data) => {
      if (!socket.userId) return;

      const { receiverId, message } = data;
      socket.to(`user:${receiverId}`).emit("private-message", {
        senderId: socket.userId,
        sender: socket.user,
        message,
        timestamp: new Date().toISOString(),
      });
    });

    // 타이핑 표시
    socket.on("message:typing", (data) => {
      if (!socket.userId) return;

      const { receiverId, isTyping } = data;
      socket.to(`user:${receiverId}`).emit("message:typing", {
        senderId: socket.userId,
        isTyping,
        timestamp: new Date().toISOString(),
      });
    });

    // 프레즌스 업데이트
    socket.on("presence:update", (data) => {
      if (!socket.userId) return;

      const { status, activity } = data;
      socket.broadcast.emit("presence:update", {
        userId: socket.userId,
        status,
        activity,
        timestamp: new Date().toISOString(),
      });
    });

    // 경매 시스템 - 이벤트명 수정
    socket.on("auction:join", (data) => {
      const { gameId } = data;
      socket.join(`auction:${gameId}`);
      console.log(`User ${socket.userId} joined auction room ${gameId}`);
    });

    socket.on("auction:leave", (data) => {
      const { gameId } = data;
      socket.leave(`auction:${gameId}`);
      console.log(`User ${socket.userId} left auction room ${gameId}`);
    });

    socket.on("auction:bid", (data) => {
      if (!socket.userId) return;

      const { gameId, playerId, bidAmount, playerNickname } = data;

      // 경매방의 모든 사용자에게 입찰 정보 전송
      socket.to(`auction:${gameId}`).emit("auction:bid", {
        bidderId: socket.userId,
        bidderNickname: socket.user?.nexusNickname || "Unknown",
        playerId,
        bidAmount,
        playerNickname,
        timestamp: new Date().toISOString(),
      });

      console.log(
        `Auction bid: User ${socket.userId} bid ${bidAmount} for player ${playerId} in game ${gameId}`
      );
    });

    // 새로운 플레이어 경매 시작
    socket.on("auction:new-player", (data) => {
      const { gameId, playerId, playerNickname } = data;

      socket.to(`auction:${gameId}`).emit("auction:new-player", {
        playerId,
        playerNickname,
        timestamp: new Date().toISOString(),
      });

      console.log(
        `New auction player: ${playerNickname} (${playerId}) in game ${gameId}`
      );
    });

    // 경매 타이머 업데이트
    socket.on("auction:timer", (data) => {
      const { gameId, timeLeft } = data;

      socket.to(`auction:${gameId}`).emit("auction:timer", {
        timeLeft,
        timestamp: new Date().toISOString(),
      });
    });

    // 경매 종료
    socket.on("auction:end", (data) => {
      const { gameId, results } = data;

      socket.to(`auction:${gameId}`).emit("auction:end", {
        results,
        timestamp: new Date().toISOString(),
      });

      console.log(`Auction ended for game ${gameId}`);
    });

    // 경매 완료
    socket.on("auction:complete", (data) => {
      const { gameId, results } = data;

      socket.to(`auction:${gameId}`).emit("auction:complete", {
        results,
        timestamp: new Date().toISOString(),
      });

      console.log(`Auction completed for game ${gameId}`);
    });

    // 가위바위보 시스템 - 이벤트명 수정
    socket.on("rps:join", (data) => {
      const { gameId } = data;
      socket.join(`rps:${gameId}`);
      console.log(`User ${socket.userId} joined RPS room ${gameId}`);
    });

    socket.on("rps:leave", (data) => {
      const { gameId } = data;
      socket.leave(`rps:${gameId}`);
      console.log(`User ${socket.userId} left RPS room ${gameId}`);
    });

    socket.on("rps:choice", (data) => {
      if (!socket.userId) return;

      const { gameId, choice } = data;

      socket.to(`rps:${gameId}`).emit("rps:choice", {
        userId: socket.userId,
        userNickname: socket.user?.nexusNickname || "Unknown",
        choice,
        timestamp: new Date().toISOString(),
      });

      console.log(
        `RPS choice: User ${socket.userId} chose ${choice} in game ${gameId}`
      );
    });

    // 가위바위보 결과
    socket.on("rps:results", (data) => {
      const { gameId, results } = data;

      socket.to(`rps:${gameId}`).emit("rps:results", {
        results,
        timestamp: new Date().toISOString(),
      });

      console.log(`RPS results for game ${gameId}`);
    });

    // 가위바위보 완료
    socket.on("rps:complete", (data) => {
      const { gameId, results } = data;

      socket.to(`rps:${gameId}`).emit("rps:complete", {
        results,
        timestamp: new Date().toISOString(),
      });

      console.log(`RPS completed for game ${gameId}`);
    });

    // 가위바위보 라운드 시작
    socket.on("rps:round-start", (data) => {
      const { gameId, roundNumber } = data;

      socket.to(`rps:${gameId}`).emit("rps:round-start", {
        roundNumber,
        timestamp: new Date().toISOString(),
      });

      console.log(`RPS round ${roundNumber} started for game ${gameId}`);
    });

    // 가위바위보 게임 종료
    socket.on("rps:game-end", (data) => {
      const { gameId, winner } = data;

      socket.to(`rps:${gameId}`).emit("rps:game-end", {
        winner,
        timestamp: new Date().toISOString(),
      });

      console.log(`RPS game ended for game ${gameId}, winner: ${winner}`);
    });

    // 가위바위보 타이머
    socket.on("rps:timer", (data) => {
      const { gameId, timeLeft } = data;

      socket.to(`rps:${gameId}`).emit("rps:timer", {
        timeLeft,
        timestamp: new Date().toISOString(),
      });
    });

    // 연결 해제
    socket.on("disconnect", (reason) => {
      if (socket.userId) {
        console.log(`❌ User disconnected: ${socket.userId}`);

        // 오프라인 상태 알림
        io.emit("user:offline", { userId: socket.userId });

        // 친구들에게 오프라인 알림
        socket.broadcast.emit("friend:offline", { userId: socket.userId });
      } else {
        console.log("❌ Anonymous user disconnected");
      }
    });
  });

  console.log("✅ Socket.IO configured");
  return io;
};

module.exports = setupSocketIO;
