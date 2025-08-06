import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  MoreVertical,
  Search,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import apiService from "../../services/api";
import socketService from "../../services/socket";
import { useAppStore } from "../../store/useAppStore";
import { Friend } from "../../types";
import Avatar from "../common/Avatar";

interface FriendRequest {
  id: number;
  from_user: {
    id: number;
    nexus_nickname: string;
    avatar_url?: string;
  };
  created_at: string;
}

interface SearchResult {
  id: number;
  nexusNickname: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeen?: string;
}

const FriendsPanel: React.FC = () => {
  const {
    user,
    friendsPanelOpen,
    setFriendsPanelOpen,
    setFriends: setStoreFriends,
  } = useAppStore();
  const [friends, setLocalFriends] = useState<Friend[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"friends" | "messages">("friends");

  // 친구 추가 관련 상태
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<Set<number>>(
    new Set()
  );

  const loadFriends = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await apiService.getFriends();
      console.log("친구 목록 응답:", response);

      const friendsData = Array.isArray(response) ? response : [];
      setLocalFriends(friendsData);

      const convertedFriends = friendsData.map((friend: any) => ({
        id: friend.id,
        userId: friend.user_id,
        friendUserId: friend.friend_user_id,
        nexusNickname: friend.nexus_nickname,
        riotNickname: friend.riot_nickname,
        riotTag: friend.riot_tag,
        avatarUrl: friend.avatar_url,
        isStreamer: friend.is_streamer,
        isOnline: friend.is_online,
        lastSeen: friend.last_seen,
        tierInfo: friend.tier_info,
        mainLane: friend.main_lane,
        mostChampions: friend.most_champions,
        createdAt: friend.created_at,
        updatedAt: friend.updated_at,
        status: friend.status,
      }));
      setStoreFriends(convertedFriends);
    } catch (error) {
      console.error("Failed to load friends:", error);
      setLocalFriends([]);
      setStoreFriends([]);
    } finally {
      setLoading(false);
    }
  }, [user, setStoreFriends]);

  const setupSocketListeners = useCallback(() => {
    // 사용자가 로그인되어 있고 웹소켓이 연결된 경우에만 이벤트 리스너 설정
    if (!user || !socketService.hasToken()) {
      console.log(
        "⚠️ FriendsPanel: 사용자 정보 또는 토큰이 없어 웹소켓 리스너를 설정하지 않습니다"
      );
      return;
    }

    console.log("🔌 FriendsPanel: 웹소켓 이벤트 리스너 설정");

    socketService.onFriendOnline((data) => {
      console.log("👥 친구 온라인:", data);
      setLocalFriends((prev: any[]) =>
        prev.map((friend: any) =>
          friend.friendUserId === data.userId
            ? { ...friend, is_online: true }
            : friend
        )
      );
    });

    socketService.onFriendOffline((data) => {
      console.log("👥 친구 오프라인:", data);
      setLocalFriends((prev: any[]) =>
        prev.map((friend: any) =>
          friend.friendUserId === data.userId
            ? { ...friend, is_online: false }
            : friend
        )
      );
    });

    // 웹소켓 연결 상태 확인
    if (!socketService.isConnected()) {
      console.log("🔌 FriendsPanel: 웹소켓이 연결되지 않음, 연결 시도");
      socketService.connect();
    }
  }, [user]);

  // 사용자 검색
  const searchUsers = useCallback(
    async (query: string) => {
      if (!query.trim() || query.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const results = await apiService.searchUsers(query, 10);
        const filteredResults = results.filter((user: any) => {
          const isAlreadyFriend = friends.some(
            (friend) => friend.friendUserId === user.id
          );
          const isSelf = user.id === user?.id;
          return !isAlreadyFriend && !isSelf;
        });

        const convertedResults = filteredResults.map((user: any) => ({
          id: user.id,
          nexusNickname: user.nexusNickname,
          avatarUrl: user.avatarUrl,
          isOnline: user.isOnline,
          lastSeen: user.lastSeen,
        }));

        setSearchResults(convertedResults);
      } catch (error) {
        console.error("사용자 검색 오류:", error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    },
    [friends]
  );

  // 친구 요청 보내기
  const sendFriendRequest = useCallback(async (targetUserId: number) => {
    try {
      setPendingRequests((prev) => new Set(prev).add(targetUserId));
      await apiService.sendFriendRequest(targetUserId);

      alert("친구 요청을 보냈습니다!");

      setSearchResults((prev) =>
        prev.filter((user) => user.id !== targetUserId)
      );
    } catch (error: any) {
      console.error("친구 요청 보내기 오류:", error);
      alert(
        error.response?.data?.message || "친구 요청 보내기에 실패했습니다."
      );
    } finally {
      setPendingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(targetUserId);
        return newSet;
      });
    }
  }, []);

  // 검색 입력 처리
  const handleSearchInput = useCallback(
    (value: string) => {
      setSearchQuery(value);
      if (value.trim()) {
        searchUsers(value);
      } else {
        setSearchResults([]);
      }
    },
    [searchUsers]
  );

  useEffect(() => {
    if (user) {
      loadFriends();
      setupSocketListeners();
    } else {
      setLoading(false);
      setLocalFriends([]);
    }
  }, [user, loadFriends, setupSocketListeners]);

  const handleRemoveFriend = async (friendId: number) => {
    if (!window.confirm("정말로 이 친구를 삭제하시겠습니까?")) return;

    try {
      await apiService.removeFriend(friendId);
      await loadFriends();
      alert("친구를 삭제했습니다.");
    } catch (error) {
      console.error("Failed to remove friend:", error);
      alert("친구 삭제에 실패했습니다.");
    }
  };

  const filteredFriends = friends.filter(
    (friend) =>
      friend.nexusNickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.riotNickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.riotTag?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onlineFriends = filteredFriends.filter((friend) => friend.isOnline);
  const offlineFriends = filteredFriends.filter((friend) => !friend.isOnline);

  return (
    <>
      {/* 모바일에서만 표시되는 버튼 */}
      <div className="fixed right-0 top-0 h-full w-12 bg-bg-secondary border-l-2 border-border flex items-center justify-center z-40 shadow-lg lg:hidden">
        {!friendsPanelOpen ? (
          <button
            onClick={() => setFriendsPanelOpen(true)}
            className="group relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all duration-200"
            title="친구창 열기"
          >
            <ChevronLeft className="w-5 h-5" />

            {/* 툴팁 */}
            <div className="absolute right-full mr-2 px-2 py-1 bg-bg-tertiary border border-border text-text-primary text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
              친구창 열기
            </div>
          </button>
        ) : (
          <button
            onClick={() => setFriendsPanelOpen(false)}
            className="group relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all duration-200"
            title="친구창 닫기"
          >
            <ChevronRight className="w-5 h-5" />

            {/* 툴팁 */}
            <div className="absolute right-full mr-2 px-2 py-1 bg-bg-tertiary border border-border text-text-primary text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
              친구창 닫기
            </div>
          </button>
        )}
      </div>

      {/* 데스크톱 고정 친구창 */}
      <div className="hidden lg:flex fixed right-0 top-0 h-full w-80 bg-bg-secondary border-l-2 border-border flex-col z-40 shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b-2 border-border bg-bg-tertiary">
          <div className="flex items-center space-x-2">
            <h2 className="text-text-primary font-semibold">친구</h2>
            <span className="text-text-secondary text-sm">
              ({friends.length})
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddFriendModal(true)}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-quaternary transition-all duration-200"
              title="친구 추가"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex border-b border-border bg-bg-tertiary">
          <button
            onClick={() => setActiveTab("friends")}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "friends"
                ? "bg-primary text-white"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-quaternary"
            }`}
          >
            친구 ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "messages"
                ? "bg-primary text-white"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-quaternary"
            }`}
          >
            메시지
          </button>
        </div>

        {activeTab === "friends" ? (
          <>
            {/* 검색 */}
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="text"
                  placeholder="친구 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-bg-primary border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* 친구 목록 */}
                <div>
                  {filteredFriends.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-text-muted mx-auto mb-4" />
                      <p className="text-text-muted text-sm">
                        {searchTerm
                          ? "검색 결과가 없습니다."
                          : "아직 친구가 없습니다."}
                      </p>
                      {!searchTerm && (
                        <p className="text-text-muted text-xs mt-2">
                          다른 사용자를 검색하여 친구를 추가해보세요!
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* 온라인 친구 */}
                      {onlineFriends.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-success mb-3">
                            온라인 ({onlineFriends.length})
                          </h3>
                          <div className="space-y-2">
                            {onlineFriends.map((friend) => (
                              <div
                                key={friend.id}
                                className="flex items-center justify-between p-3 bg-bg-primary rounded-lg hover:bg-bg-tertiary transition-colors border border-border"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="relative">
                                    <Avatar
                                      src={friend.avatarUrl}
                                      alt={friend.nexusNickname}
                                      size="md"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-bg-secondary"></div>
                                  </div>
                                  <div>
                                    <p className="text-text-primary font-medium">
                                      {friend.nexusNickname}
                                    </p>
                                    <p className="text-xs text-success">
                                      온라인
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() =>
                                      handleRemoveFriend(friend.id)
                                    }
                                    className="p-2 text-text-muted hover:text-danger hover:bg-bg-quaternary rounded-md transition-colors"
                                    title="친구 삭제"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 오프라인 친구 */}
                      {offlineFriends.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-text-muted mb-3">
                            오프라인 ({offlineFriends.length})
                          </h3>
                          <div className="space-y-2">
                            {offlineFriends.map((friend) => (
                              <div
                                key={friend.id}
                                className="flex items-center justify-between p-3 bg-bg-primary rounded-lg hover:bg-bg-tertiary transition-colors border border-border"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="relative">
                                    <Avatar
                                      src={friend.avatarUrl}
                                      alt={friend.nexusNickname}
                                      size="md"
                                    />
                                  </div>
                                  <div>
                                    <p className="text-text-primary font-medium">
                                      {friend.nexusNickname}
                                    </p>
                                    <p className="text-xs text-text-muted">
                                      마지막 접속:{" "}
                                      {new Date(
                                        friend.lastSeen || ""
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() =>
                                      handleRemoveFriend(friend.id)
                                    }
                                    className="p-2 text-text-muted hover:text-danger hover:bg-bg-quaternary rounded-md transition-colors"
                                    title="친구 삭제"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-muted text-sm">메시지 기능</p>
              <p className="text-text-muted text-xs mt-2">
                메시지 기능은 별도 페이지에서 제공됩니다.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 모바일 친구창 */}
      {friendsPanelOpen && (
        <div className="fixed right-0 top-0 h-full w-80 bg-bg-secondary border-l-2 border-border flex flex-col z-40 shadow-xl lg:hidden">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b-2 border-border bg-bg-tertiary">
            <div className="flex items-center space-x-2">
              <h2 className="text-text-primary font-semibold">친구</h2>
              <span className="text-text-secondary text-sm">
                ({friends.length})
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAddFriendModal(true)}
                className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-quaternary transition-all duration-200"
                title="친구 추가"
              >
                <UserPlus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setFriendsPanelOpen(false)}
                className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-quaternary transition-all duration-200"
                title="친구창 닫기"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <div className="flex border-b border-border bg-bg-tertiary">
            <button
              onClick={() => setActiveTab("friends")}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "friends"
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-quaternary"
              }`}
            >
              친구 ({friends.length})
            </button>
            <button
              onClick={() => setActiveTab("messages")}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "messages"
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-quaternary"
              }`}
            >
              메시지
            </button>
          </div>

          {activeTab === "friends" ? (
            <>
              {/* 검색 */}
              <div className="p-4 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input
                    type="text"
                    placeholder="친구 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-bg-primary border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {/* 친구 목록 */}
                  <div>
                    {filteredFriends.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-text-muted mx-auto mb-4" />
                        <p className="text-text-muted text-sm">
                          {searchTerm
                            ? "검색 결과가 없습니다."
                            : "아직 친구가 없습니다."}
                        </p>
                        {!searchTerm && (
                          <p className="text-text-muted text-xs mt-2">
                            다른 사용자를 검색하여 친구를 추가해보세요!
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        {/* 온라인 친구 */}
                        {onlineFriends.length > 0 && (
                          <div>
                            <h3 className="text-sm font-medium text-success mb-3">
                              온라인 ({onlineFriends.length})
                            </h3>
                            <div className="space-y-2">
                              {onlineFriends.map((friend) => (
                                <div
                                  key={friend.id}
                                  className="flex items-center justify-between p-3 bg-bg-primary rounded-lg hover:bg-bg-tertiary transition-colors border border-border"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="relative">
                                      <Avatar
                                        src={friend.avatarUrl}
                                        alt={friend.nexusNickname}
                                        size="md"
                                      />
                                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-bg-secondary"></div>
                                    </div>
                                    <div>
                                      <p className="text-text-primary font-medium">
                                        {friend.nexusNickname}
                                      </p>
                                      <p className="text-xs text-success">
                                        온라인
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() =>
                                        handleRemoveFriend(friend.id)
                                      }
                                      className="p-2 text-text-muted hover:text-danger hover:bg-bg-quaternary rounded-md transition-colors"
                                      title="친구 삭제"
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 오프라인 친구 */}
                        {offlineFriends.length > 0 && (
                          <div>
                            <h3 className="text-sm font-medium text-text-muted mb-3">
                              오프라인 ({offlineFriends.length})
                            </h3>
                            <div className="space-y-2">
                              {offlineFriends.map((friend) => (
                                <div
                                  key={friend.id}
                                  className="flex items-center justify-between p-3 bg-bg-primary rounded-lg hover:bg-bg-tertiary transition-colors border border-border"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="relative">
                                      <Avatar
                                        src={friend.avatarUrl}
                                        alt={friend.nexusNickname}
                                        size="md"
                                      />
                                    </div>
                                    <div>
                                      <p className="text-text-primary font-medium">
                                        {friend.nexusNickname}
                                      </p>
                                      <p className="text-xs text-text-muted">
                                        마지막 접속:{" "}
                                        {new Date(
                                          friend.lastSeen || ""
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() =>
                                        handleRemoveFriend(friend.id)
                                      }
                                      className="p-2 text-text-muted hover:text-danger hover:bg-bg-quaternary rounded-md transition-colors"
                                      title="친구 삭제"
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <p className="text-text-muted text-sm">메시지 기능</p>
                <p className="text-text-muted text-xs mt-2">
                  메시지 기능은 별도 페이지에서 제공됩니다.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 친구 추가 모달 */}
      {showAddFriendModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-bg-secondary border border-border rounded-lg w-96 max-h-[80vh] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-text-primary font-semibold">친구 추가</h3>
              <button
                onClick={() => {
                  setShowAddFriendModal(false);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="text"
                  placeholder="닉네임으로 사용자 검색..."
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-bg-primary border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-64">
              {searchLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : searchQuery.trim() && searchResults.length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-8 h-8 text-text-muted mx-auto mb-2" />
                  <p className="text-text-muted text-sm">
                    검색 결과가 없습니다.
                  </p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-bg-primary rounded-lg hover:bg-bg-tertiary transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar
                          src={user.avatarUrl}
                          alt={user.nexusNickname}
                          size="sm"
                        />
                        <div>
                          <p className="text-text-primary font-medium">
                            {user.nexusNickname}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {user.isOnline ? "온라인" : "오프라인"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => sendFriendRequest(user.id)}
                        disabled={pendingRequests.has(user.id)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          pendingRequests.has(user.id)
                            ? "bg-bg-quaternary text-text-muted cursor-not-allowed"
                            : "bg-primary hover:bg-primary-dark text-white"
                        }`}
                      >
                        {pendingRequests.has(user.id) ? (
                          <div className="flex items-center space-x-1">
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                            <span>전송 중...</span>
                          </div>
                        ) : (
                          "친구 요청"
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border bg-bg-tertiary">
              <p className="text-xs text-text-secondary text-center">
                닉네임을 입력하여 사용자를 검색하고 친구 요청을 보낼 수
                있습니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FriendsPanel;
