import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import apiService from "../../services/api";
import socketService from "../../services/socket";
import { useAppStore } from "../../store/useAppStore";
import { Friend, FriendRequest } from "../../types";
import AddFriendModal from "../Friends/AddFriendModal";
import FriendList from "../Friends/FriendList";
import FriendRequestList from "../Friends/FriendRequestList";

const FriendsPanel: React.FC = () => {
  const {
    user,
    friendsPanelOpen,
    setFriendsPanelOpen,
    setFriends: setStoreFriends,
  } = useAppStore();
  const [friends, setLocalFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"friends" | "requests" | "messages">(
    "friends"
  );
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);

  const loadFriends = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await apiService.getFriends();
      const friendsData = Array.isArray(response) ? response : [];
      setLocalFriends(friendsData);
      setStoreFriends(friendsData);
    } catch (error) {
      console.error("Failed to load friends:", error);
      setLocalFriends([]);
      setStoreFriends([]);
    } finally {
      setLoading(false);
    }
  }, [user, setStoreFriends]);

  const loadFriendRequests = useCallback(async () => {
    if (!user) return;

    try {
      const response = await apiService.getFriendRequests();
      const requests = response?.data?.requests || response?.requests || response || [];
      setFriendRequests(Array.isArray(requests) ? requests : []);
    } catch (error) {
      console.error("Failed to load friend requests:", error);
      setFriendRequests([]);
    }
  }, [user]);

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
      await loadFriendRequests();
    } catch (error) {
      console.error("친구 요청 거절 실패:", error);
    }
  };

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

  const setupSocketListeners = useCallback(() => {
    if (!user || !socketService.hasToken()) return;

    socketService.onFriendOnline((data) => {
      setLocalFriends((prev) =>
        prev.map((friend) =>
          friend.friendUserId === data.userId
            ? { ...friend, isOnline: true }
            : friend
        )
      );
    });

    socketService.onFriendOffline((data) => {
      setLocalFriends((prev) =>
        prev.map((friend) =>
          friend.friendUserId === data.userId
            ? { ...friend, isOnline: false }
            : friend
        )
      );
    });

    socketService.onFriendRequest((data: FriendRequest) => {
      setFriendRequests((prev) => [data, ...prev]);
    });

    if (!socketService.isConnected()) {
      socketService.connect();
    }

    return () => {
      socketService.off("friend:online");
      socketService.off("friend:offline");
      socketService.off("friend:request");
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      loadFriends();
      loadFriendRequests();
      const cleanup = setupSocketListeners();
      return cleanup;
    } else {
      setLoading(false);
      setLocalFriends([]);
      setFriendRequests([]);
    }
  }, [user, loadFriends, loadFriendRequests, setupSocketListeners]);

  const filteredFriends = friends.filter(
    (friend) =>
      friend.nexusNickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.riotNickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.riotTag?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Mobile button */}
      <div className="fixed right-0 top-0 h-full w-12 bg-bg-secondary border-l-2 border-border flex items-center justify-center z-40 shadow-lg lg:hidden">
        <button
          onClick={() => setFriendsPanelOpen(!friendsPanelOpen)}
          className="group relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all duration-200"
          title={friendsPanelOpen ? "Close Friends Panel" : "Open Friends Panel"}
        >
          {friendsPanelOpen ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Desktop panel */}
      <div
        className={`hidden lg:flex fixed right-0 top-0 h-full w-80 bg-bg-secondary border-l-2 border-border flex-col z-40 shadow-xl transition-transform duration-300 ${
          friendsPanelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-border bg-bg-tertiary">
          <div className="flex items-center space-x-2">
            <h2 className="text-text-primary font-semibold">Friends</h2>
            <span className="text-text-secondary text-sm">
              ({friends.length})
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddFriendModal(true)}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-quaternary transition-all duration-200"
              title="Add Friend"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border bg-bg-tertiary">
          <button
            onClick={() => setActiveTab("friends")}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "friends"
                ? "bg-primary text-white"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-quaternary"
            }`}
          >
            Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "requests"
                ? "bg-primary text-white"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-quaternary"
            }`}
          >
            Requests ({friendRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "messages"
                ? "bg-primary text-white"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-quaternary"
            }`}
          >
            Messages
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "friends" && (
            <>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search friends..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-bg-primary border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <FriendList
                  friends={filteredFriends}
                  onRemove={handleRemoveFriend}
                />
              )}
            </>
          )}
          {activeTab === "requests" && (
            <FriendRequestList
              requests={friendRequests}
              onAccept={handleAcceptRequest}
              onReject={handleRejectRequest}
            />
          )}
          {activeTab === "messages" && (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-muted text-sm">Messages</p>
              <p className="text-text-muted text-xs mt-2">
                Messages will be available in a separate page.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile panel */}
      {friendsPanelOpen && (
        <div className="fixed right-0 top-0 h-full w-80 bg-bg-secondary border-l-2 border-border flex flex-col z-40 shadow-xl lg:hidden">
          {/* ... same as desktop panel ... */}
        </div>
      )}

      {showAddFriendModal && (
        <AddFriendModal onClose={() => setShowAddFriendModal(false)} />
      )}
    </>
  );
};

export default FriendsPanel;