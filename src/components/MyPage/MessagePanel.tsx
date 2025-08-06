import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Circle, Crown, MoreVertical, Search, Send } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import { Message } from "../../types";

const MessagePanel: React.FC = () => {
  const { friends, messages, addMessage, markMessageAsRead, user } =
    useAppStore();

  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const acceptedFriends = friends.filter((f) => f.status === "accepted");
  const filteredFriends = acceptedFriends.filter((friend) =>
    friend.nexusNickname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedFriendData = acceptedFriends.find(
    (f) => f.id.toString() === selectedFriend
  );
  const conversationMessages = messages.filter(
    (m) =>
      (m.senderId === user?.id &&
        m.receiverId === parseInt(selectedFriend || "0")) ||
      (m.senderId === parseInt(selectedFriend || "0") &&
        m.receiverId === user?.id)
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  useEffect(() => {
    if (selectedFriend) {
      // 읽지 않은 메시지를 읽음으로 표시
      conversationMessages
        .filter((m) => m.receiverId === user?.id && !m.isRead)
        .forEach((m) => markMessageAsRead(m.id));
    }
  }, [selectedFriend, conversationMessages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedFriend && user) {
      const message: Message = {
        id: Date.now().toString(),
        senderId: user.id,
        receiverId: parseInt(selectedFriend || "0"),
        content: newMessage.trim(),
        timestamp: new Date(),
        isRead: false,
      };
      addMessage(message);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getUnreadCount = (friendId: string) => {
    return messages.filter(
      (m) =>
        m.senderId === parseInt(friendId) &&
        m.receiverId === user?.id &&
        !m.isRead
    ).length;
  };

  const getLastMessage = (friendId: string) => {
    const friendMessages = messages.filter(
      (m) =>
        (m.senderId === user?.id && m.receiverId === parseInt(friendId)) ||
        (m.senderId === parseInt(friendId) && m.receiverId === user?.id)
    );
    return friendMessages.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
  };

  return (
    <div className="bg-nexus-darker rounded-lg h-[600px] flex">
      {/* 친구 목록 */}
      <div className="w-1/3 border-r border-nexus-gray flex flex-col">
        {/* 헤더 */}
        <div className="p-4 border-b border-nexus-gray">
          <h2 className="text-xl font-bold text-white mb-3">메시지</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-nexus-light-gray" />
            <input
              type="text"
              placeholder="친구 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-nexus-dark border border-nexus-gray rounded-md text-white placeholder-nexus-light-gray focus:outline-none focus:border-nexus-blue text-sm"
            />
          </div>
        </div>

        {/* 친구 목록 */}
        <div className="flex-1 overflow-y-auto">
          {filteredFriends.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-nexus-light-gray text-sm">
                {searchTerm ? "검색 결과가 없습니다." : "친구가 없습니다."}
              </p>
            </div>
          ) : (
            filteredFriends.map((friend) => {
              const unreadCount = getUnreadCount(friend.id.toString());
              const lastMessage = getLastMessage(friend.id.toString());
              const isSelected = selectedFriend === friend.id.toString();

              return (
                <div
                  key={friend.id}
                  onClick={() => setSelectedFriend(friend.id.toString())}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-nexus-blue bg-opacity-20"
                      : "hover:bg-nexus-dark"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {/* 아바타 */}
                    <div className="relative">
                      <div className="w-10 h-10 bg-nexus-gray rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {friend.nexusNickname?.charAt(0)?.toUpperCase() ||
                            "?"}
                        </span>
                      </div>
                      <div
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-nexus-dark ${
                          friend.isOnline
                            ? "bg-nexus-green"
                            : "bg-nexus-light-gray"
                        }`}
                      />
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <span className="font-medium text-white text-sm truncate">
                            {friend.nexusNickname || "알 수 없음"}
                          </span>
                          {friend.isStreamer && (
                            <Crown className="w-3 h-3 text-nexus-yellow" />
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <span className="bg-nexus-red text-white text-xs px-2 py-1 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      {lastMessage && (
                        <p className="text-xs text-nexus-light-gray truncate">
                          {lastMessage.senderId === user?.id ? "나: " : ""}
                          {lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 채팅 영역 */}
      <div className="flex-1 flex flex-col">
        {selectedFriendData ? (
          <>
            {/* 채팅 헤더 */}
            <div className="p-4 border-b border-nexus-gray flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-nexus-gray rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {selectedFriendData.nexusNickname
                        ?.charAt(0)
                        ?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-nexus-dark ${
                      selectedFriendData.isOnline
                        ? "bg-nexus-green"
                        : "bg-nexus-light-gray"
                    }`}
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    <span className="font-medium text-white">
                      {selectedFriendData.nexusNickname || "알 수 없음"}
                    </span>
                    {selectedFriendData.isStreamer && (
                      <Crown className="w-4 h-4 text-nexus-yellow" />
                    )}
                  </div>
                  <p className="text-xs text-nexus-light-gray">
                    {selectedFriendData.isOnline ? "온라인" : "오프라인"}
                  </p>
                </div>
              </div>
              <button className="p-2 text-nexus-light-gray hover:text-white hover:bg-nexus-gray rounded-md transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* 메시지 목록 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversationMessages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-nexus-light-gray">
                    아직 메시지가 없습니다.
                  </p>
                  <p className="text-nexus-light-gray text-sm mt-2">
                    대화를 시작해보세요!
                  </p>
                </div>
              ) : (
                conversationMessages.map((message) => {
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
                            ? "bg-nexus-blue text-white"
                            : "bg-nexus-dark text-white"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isOwnMessage
                              ? "text-blue-100"
                              : "text-nexus-light-gray"
                          }`}
                        >
                          {formatDistanceToNow(message.timestamp, {
                            addSuffix: true,
                            locale: ko,
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 메시지 입력 */}
            <div className="p-4 border-t border-nexus-gray">
              <div className="flex space-x-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 px-3 py-2 bg-nexus-dark border border-nexus-gray rounded-md text-white placeholder-nexus-light-gray focus:outline-none focus:border-nexus-blue resize-none"
                  rows={2}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-nexus-blue text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Circle className="w-12 h-12 text-nexus-light-gray mx-auto mb-4" />
              <p className="text-nexus-light-gray">
                친구를 선택하여 메시지를 보내세요
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagePanel;
