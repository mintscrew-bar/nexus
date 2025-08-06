import {
  ArrowLeft,
  MessageSquare,
  MoreVertical,
  Phone,
  Search,
  Send,
  Video,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import apiService from "../../services/api";
import socketService from "../../services/socket";
import { useAppStore } from "../../store/useAppStore";
import { User as UserType } from "../../types";
import Avatar from "../common/Avatar";

interface Message {
  id: string;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

interface Conversation {
  id: string;
  user: UserType;
  lastMessage?: Message;
  unreadCount: number;
  isOnline: boolean;
}

const DMPanel: React.FC = () => {
  const { user, messages, addMessage, setMessages } = useAppStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadConversations();
      setupSocketListeners();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      const response = await apiService.getConversations();
      setConversations(response || []);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    socketService.onNewMessage((data: any) => {
      const message: Message = {
        id: data.id.toString(),
        senderId: data.sender_id,
        receiverId: data.receiver_id,
        content: data.content,
        timestamp: new Date(data.timestamp),
        isRead: data.is_read,
      };
      addMessage(message);

      // 대화 목록 업데이트
      setConversations((prev) => {
        const existing = prev.find(
          (c) =>
            c.user.id === message.senderId || c.user.id === message.receiverId
        );

        if (existing) {
          return prev.map((c) =>
            c.id === existing.id
              ? { ...c, lastMessage: message, unreadCount: c.unreadCount + 1 }
              : c
          );
        }

        return prev;
      });
    });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const apiMessage = await apiService.sendMessage(
        selectedConversation.user.id,
        newMessage.trim()
      );

      const message: Message = {
        id: apiMessage.id.toString(),
        senderId: apiMessage.sender_id,
        receiverId: apiMessage.receiver_id,
        content: apiMessage.content,
        timestamp: new Date(apiMessage.timestamp),
        isRead: apiMessage.is_read,
      };

      addMessage(message);
      setNewMessage("");

      // 대화 목록 업데이트
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id
            ? { ...c, lastMessage: message, unreadCount: 0 }
            : c
        )
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("메시지 전송에 실패했습니다.");
    }
  };

  const handleConversationSelect = async (conversation: Conversation) => {
    setSelectedConversation(conversation);

    try {
      const apiMessages = await apiService.getMessages(conversation.user.id);
      const messages: Message[] = apiMessages.map((msg: any) => ({
        id: msg.id.toString(),
        senderId: msg.sender_id,
        receiverId: msg.receiver_id,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        isRead: msg.is_read,
      }));
      setMessages(messages);

      // 읽음 처리
      await apiService.markMessagesAsRead(conversation.user.id);

      // 대화 목록에서 읽음 처리
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversation.id ? { ...c, unreadCount: 0 } : c
        )
      );
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.user.nexusNickname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentConversationMessages = messages.filter(
    (msg) =>
      selectedConversation &&
      (msg.senderId === selectedConversation.user.id ||
        msg.receiverId === selectedConversation.user.id)
  );

  if (!isOpen) {
    return (
      <div className="fixed right-0 top-0 h-full w-8 bg-nexus-dark border-l border-gray-700 flex items-center justify-center z-30">
        <button
          onClick={() => setIsOpen(true)}
          className="transform rotate-90 text-gray-400 hover:text-white"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-nexus-dark border-l border-gray-700 flex flex-col z-30">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-white font-semibold">메시지</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-gray-400 hover:text-white"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!selectedConversation ? (
        // 대화 목록
        <div className="flex-1 overflow-y-auto">
          {/* 검색 */}
          <div className="p-4 border-b border-theme-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-text-secondary" />
              <input
                type="text"
                placeholder="대화 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-theme-bg-secondary border border-theme-border rounded-md text-theme-text placeholder-theme-text-muted focus:outline-none focus:border-nexus-blue"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="p-2">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-theme-text-muted mx-auto mb-4" />
                  <p className="text-theme-text-muted">
                    {searchTerm ? "검색 결과가 없습니다." : "대화가 없습니다."}
                  </p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationSelect(conversation)}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-theme-surface-hover cursor-pointer transition-colors"
                  >
                    <div className="relative">
                      <Avatar
                        src={conversation.user.avatarUrl}
                        alt={conversation.user.nexusNickname}
                        size="md"
                      />
                      {conversation.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-theme-bg"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-theme-text font-medium truncate">
                          {conversation.user.nexusNickname}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-theme-text-secondary text-sm truncate">
                          {conversation.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        // 메시지 화면
        <div className="flex-1 flex flex-col">
          {/* 대화 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-theme-border">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedConversation(null)}
                className="p-1 text-theme-text-secondary hover:text-theme-text"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="relative">
                <Avatar
                  src={selectedConversation.user.avatarUrl}
                  alt={selectedConversation.user.nexusNickname}
                  size="md"
                />
                {selectedConversation.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-theme-bg"></div>
                )}
              </div>
              <div>
                <p className="text-theme-text font-medium">
                  {selectedConversation.user.nexusNickname}
                </p>
                <p className="text-gray-400 text-sm">
                  {selectedConversation.isOnline ? "온라인" : "오프라인"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-white">
                <Phone className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white">
                <Video className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 메시지 목록 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {currentConversationMessages.map((message) => {
              const isOwnMessage = message.senderId === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${
                    isOwnMessage ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-white"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* 메시지 입력 */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="메시지를 입력하세요..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DMPanel;
