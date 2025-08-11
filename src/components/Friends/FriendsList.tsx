import { Check, MessageSquare, Search, UserPlus, Users, X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import apiService from "../../services/api";
import socketService from "../../services/socket";
import { useAppStore } from "../../store/useAppStore";
import { Friend, FriendRequest } from "../../types";
import Avatar from "../common/Avatar";
import LoadingSpinner from "../common/LoadingSpinner";

const FriendsList: React.FC = () => {
  const { user } = useAppStore();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");
  const [error, setError] = useState<string | null>(null);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const loadFriends = useCallback(async () => {
    try {
      setLoadingFriends(true);
      setError(null);
      const response = await apiService.getFriends();
      console.log("Friends response:", response); // 디버깅용
      setFriends(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Failed to load friends:", error);
      setError("친구 목록을 불러오는데 실패했습니다.");
      setFriends([]); // 에러 시 빈 배열로 설정
    } finally {
      setLoadingFriends(false);
    }
  }, []);

  const loadFriendRequests = useCallback(async () => {
    try {
      setLoadingRequests(true);
      const response = await apiService.getFriendRequests();
      console.log("Friend requests response:", response); // 디버깅용
      // API 응답 구조에 따라 적절히 처리
      const requests = response?.data?.requests || response?.requests || response || [];
      setRequests(Array.isArray(requests) ? requests : []);
    } catch (error) {
      console.error("Failed to load friend requests:", error);
      setRequests([]); // 에러 시 빈 배열로 설정
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(true);
      loadFriends();
      loadFriendRequests();

      const handleFriendOnline = (data: { userId: number }) => {
        setFriends((prev) =>
          prev.map((friend) =>
            friend.friendUserId === data.userId
              ? { ...friend, isOnline: true }
              : friend
          )
        );
      };

      const handleFriendOffline = (data: { userId: number }) => {
        setFriends((prev) =>
          prev.map((friend) =>
            friend.friendUserId === data.userId
              ? { ...friend, isOnline: false }
              : friend
          )
        );
      };

      socketService.onFriendOnline(handleFriendOnline);
      socketService.onFriendOffline(handleFriendOffline);

      return () => {
        socketService.off('friend:online', handleFriendOnline);
        socketService.off('friend:offline', handleFriendOffline);
      };
    }
  }, [user, loadFriends, loadFriendRequests]);

  

  const handleAcceptRequest = async (requestId: number) => {
    try {
      await apiService.acceptFriendRequest(requestId);
      await loadFriends();
      await loadFriendRequests();
    } catch (error) {
      console.error("Failed to accept friend request:", error);
      alert("친구 요청 수락에 실패했습니다.");
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      await apiService.rejectFriendRequest(requestId);
      loadFriendRequests(); // 목록 새로고침
    } catch (error) {
      console.error("친구 요청 거절 실패:", error);
    }
  };

  const handleRemoveFriend = async (friendId: number) => {
    if (!window.confirm("정말로 이 친구를 삭제하시겠습니까?")) return;

    try {
      await apiService.removeFriend(friendId);
      await loadFriends();
    } catch (error) {
      console.error("Failed to remove friend:", error);
      alert("친구 삭제에 실패했습니다.");
    }
  };

  const handleSendMessage = (friend: Friend) => {
    // 메시지 전송 로직 (DM 패널 열기)
    console.log("Send message to:", friend);
  };

  const filteredFriends = friends.filter((friend) =>
    friend.nexusNickname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRequests = requests.filter((request) =>
    request.fromUser.nexusNickname
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-theme-surface rounded-lg p-6 border border-theme-border">
        <LoadingSpinner size="md" text="친구 목록을 불러오는 중..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-theme-surface rounded-lg p-6 border border-theme-border text-center">
        <div className="text-red-500 mb-2">⚠️</div>
        <p className="text-theme-text-secondary mb-4">{error}</p>
        <button
          onClick={loadFriends}
          className="px-4 py-2 bg-nexus-blue text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="bg-theme-surface rounded-lg border border-theme-border">
      {/* 헤더 */}
      <div className="p-6 border-b border-theme-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-nexus-blue" />
            <h2 className="text-xl font-semibold text-theme-text">친구</h2>
          </div>
          <div className="text-sm text-theme-text-secondary">
            {friends.length}명의 친구
          </div>
        </div>

        {/* 검색 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-text-secondary" />
          <input
            type="text"
            placeholder="친구 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text placeholder-theme-text-muted focus:outline-none focus:border-nexus-blue"
          />
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex border-b border-theme-border">
        <button
          onClick={() => setActiveTab("friends")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "friends"
              ? "text-nexus-blue border-b-2 border-nexus-blue"
              : "text-theme-text-secondary hover:text-theme-text"
          }`}
        >
          친구 목록 ({filteredFriends.length})
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "requests"
              ? "text-nexus-blue border-b-2 border-nexus-blue"
              : "text-theme-text-secondary hover:text-theme-text"
          }`}
        >
          친구 요청 ({filteredRequests.length})
        </button>
      </div>

      {/* 친구 목록 */}
      {activeTab === "friends" && (
        <div className="p-6">
          {filteredFriends.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-theme-text-muted mx-auto mb-4" />
              <p className="text-theme-text-secondary mb-2">
                {searchTerm ? "검색 결과가 없습니다." : "아직 친구가 없습니다."}
              </p>
              {!searchTerm && (
                <p className="text-sm text-theme-text-muted">
                  다른 사용자에게 친구 요청을 보내보세요!
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFriends.map((friend) => (
                <div
                  key={friend.friendUserId}
                  className="flex items-center justify-between p-4 bg-theme-bg-secondary rounded-lg border border-theme-border hover:bg-theme-surface-hover transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar
                      src={friend.avatarUrl}
                      alt={friend.nexusNickname}
                      size="md"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-theme-text">
                          {friend.nexusNickname}
                        </span>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            friend.isOnline ? "bg-green-400" : "bg-gray-400"
                          }`}
                        />
                      </div>
                      <p className="text-sm text-theme-text-secondary">
                        {friend.isOnline ? "온라인" : "오프라인"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSendMessage(friend)}
                      className="p-2 text-theme-text-secondary hover:text-nexus-blue hover:bg-theme-surface-hover rounded-md transition-colors"
                      title="메시지 보내기"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveFriend(friend.friendUserId)}
                      className="p-2 text-theme-text-secondary hover:text-red-500 hover:bg-theme-surface-hover rounded-md transition-colors"
                      title="친구 삭제"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 친구 요청 */}
      {activeTab === "requests" && (
        <div className="p-6">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="w-12 h-12 text-theme-text-muted mx-auto mb-4" />
              <p className="text-theme-text-secondary">
                {searchTerm
                  ? "검색 결과가 없습니다."
                  : "대기 중인 친구 요청이 없습니다."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-theme-bg-secondary rounded-lg border border-theme-border"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar
                      src={request.fromUser.avatarUrl}
                      alt={request.fromUser.nexusNickname}
                      size="md"
                    />
                    <div>
                      <span className="font-medium text-theme-text">
                        {request.fromUser.nexusNickname}
                      </span>
                      <p className="text-sm text-theme-text-secondary">
                        친구 요청을 보냈습니다
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      className="px-3 py-1 bg-nexus-blue text-white text-sm rounded-md hover:bg-blue-600 transition-colors flex items-center space-x-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>수락</span>
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      className="px-3 py-1 bg-theme-bg-secondary text-theme-text text-sm rounded-md hover:bg-theme-surface-hover transition-colors flex items-center space-x-1"
                    >
                      <X className="w-3 h-3" />
                      <span>거절</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FriendsList;
