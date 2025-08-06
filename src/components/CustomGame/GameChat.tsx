import { MessageCircle, Send } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import apiService from "../../services/api";
import socketService from "../../services/socket";
import { useAppStore } from "../../store/useAppStore";

interface GameChatProps {
  gameId: number;
}

interface ChatMessage {
  id: number;
  sender_id: number;
  nexus_nickname: string;
  avatar_url?: string;
  message: string;
  created_at: string;
}

const GameChat: React.FC<GameChatProps> = ({ gameId }) => {
  const { user } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    if (!gameId) return;

    try {
      setIsLoading(true);
      const response = await apiService.getChatMessages(gameId, 50);
      setMessages(response.data || []);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  const connectToChat = useCallback(() => {
    // Socket.IO 연결은 중앙에서 관리되므로 여기서는 연결하지 않음
    setIsConnected(true);

    // 게임 채팅방 참가
    socketService.joinGameChat(gameId);

    // 메시지 수신 리스너
    const handleGameMessage = (data: any) => {
      const newMsg: ChatMessage = {
        id: Date.now(), // 임시 ID
        sender_id: data.userId,
        nexus_nickname: data.user.nexusNickname,
        avatar_url: data.user.avatarUrl,
        message: data.message,
        created_at: data.timestamp,
      };
      setMessages((prev) => [...prev, newMsg]);
    };

    // 플레이어 입장/퇴장 리스너
    const handlePlayerJoined = (data: any) => {
      const systemMessage: ChatMessage = {
        id: Date.now(),
        sender_id: 0,
        nexus_nickname: "시스템",
        message: `${data.user.nexusNickname}님이 입장했습니다.`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, systemMessage]);
    };

    const handlePlayerLeft = (data: any) => {
      const systemMessage: ChatMessage = {
        id: Date.now(),
        sender_id: 0,
        nexus_nickname: "시스템",
        message: "플레이어가 퇴장했습니다.",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, systemMessage]);
    };

    // 리스너 등록
    socketService.onGameMessage(handleGameMessage);
    socketService.onPlayerJoined(handlePlayerJoined);
    socketService.onPlayerLeft(handlePlayerLeft);

    // cleanup 함수 반환
    return () => {
      socketService.off("game:chat", handleGameMessage);
      socketService.off("custom-game:player-joined", handlePlayerJoined);
      socketService.off("custom-game:player-left", handlePlayerLeft);
    };
  }, [gameId]);

  useEffect(() => {
    if (gameId) {
      loadMessages();
      const cleanup = connectToChat();

      // cleanup 함수 반환
      return cleanup;
    }
  }, [gameId, loadMessages, connectToChat]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      // 서버에 메시지 저장
      await apiService.sendChatMessage(gameId, newMessage.trim());

      // Socket.IO로 실시간 전송
      socketService.sendGameMessage(gameId, newMessage.trim());

      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("메시지 전송에 실패했습니다.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOwnMessage = (message: ChatMessage) => {
    return message.sender_id === user?.id;
  };

  return (
    <div className="bg-theme-surface rounded-lg h-96 flex flex-col border border-theme-border">
      {/* 채팅 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-theme-border">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-blue-500" />
          <h3 className="text-theme-text font-medium">게임 채팅</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="text-xs text-theme-text-secondary">
            {isConnected ? "연결됨" : "연결 안됨"}
          </span>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-theme-text-secondary text-sm mt-2">
              메시지를 불러오는 중...
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                isOwnMessage(message) ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                  message.sender_id === 0
                    ? "bg-gray-600 text-gray-300 text-center mx-auto"
                    : isOwnMessage(message)
                    ? "bg-blue-500 text-white"
                    : "bg-theme-bg-secondary text-theme-text border border-theme-border"
                }`}
              >
                {message.sender_id !== 0 && (
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-5 h-5 bg-nexus-blue rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {message.nexus_nickname?.charAt(0) || "?"}
                      </span>
                    </div>
                    <span className="text-xs opacity-75">
                      {message.nexus_nickname}
                    </span>
                    <span className="text-xs opacity-50">
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                )}
                <p className="text-sm break-words">{message.message}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 메시지 입력 */}
      <div className="p-4 border-t border-theme-border">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-3 py-2 bg-theme-bg-secondary border border-theme-border rounded-md text-theme-text placeholder-theme-text-muted focus:outline-none focus:border-blue-500"
            disabled={!isConnected}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameChat;
