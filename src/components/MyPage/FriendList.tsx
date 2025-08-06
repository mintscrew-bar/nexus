import {
  Crown,
  MessageCircle,
  MoreVertical,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import { Friend } from "../../types";

const FriendList: React.FC = () => {
  const { friends, addFriend, removeFriend, updateFriendStatus } =
    useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [newFriendId, setNewFriendId] = useState("");

  const filteredFriends = friends.filter(
    (friend) =>
      friend.nexusNickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.riotNickname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddFriend = () => {
    if (!newFriendId.trim()) return;

    // 실제로는 백엔드 API 호출
    const newFriend: Friend = {
      id: Date.now(),
      userId: 1,
      friendUserId: parseInt(newFriendId),
      status: "pending",
      nexusNickname: newFriendId,
      riotNickname: newFriendId,
      riotTag: "KR1",
      avatarUrl: "",
      isStreamer: false,
      isOnline: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addFriend(newFriend);
    setNewFriendId("");
  };

  const handleRemoveFriend = (friendId: string) => {
    removeFriend(friendId);
  };

  const handleAcceptFriend = (friendId: string) => {
    updateFriendStatus(friendId, "accepted");
  };

  const handleBlockFriend = (friendId: string) => {
    updateFriendStatus(friendId, "blocked");
  };

  const getStatusColor = (isOnline: boolean) => {
    return isOnline ? "bg-nexus-green" : "bg-nexus-light-gray";
  };

  const getStatusText = (status: Friend["status"]) => {
    switch (status) {
      case "pending":
        return { text: "대기 중", color: "text-nexus-yellow" };
      case "accepted":
        return { text: "친구", color: "text-nexus-green" };
      case "blocked":
        return { text: "차단됨", color: "text-nexus-red" };
      default:
        return { text: "알 수 없음", color: "text-nexus-light-gray" };
    }
  };

  return (
    <div className="bg-nexus-darker rounded-lg p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">친구 목록</h2>
        <button
          onClick={() => setShowAddFriend(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-nexus-blue text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>친구 추가</span>
        </button>
      </div>

      {/* 검색 */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-nexus-light-gray" />
        <input
          type="text"
          placeholder="친구 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-nexus-dark border border-nexus-gray rounded-md text-white placeholder-nexus-light-gray focus:outline-none focus:border-nexus-blue"
        />
      </div>

      {/* 친구 추가 모달 */}
      {showAddFriend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-nexus-darker rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">친구 추가</h3>
            <input
              type="text"
              placeholder="Nexus 닉네임 또는 Riot ID"
              value={newFriendId}
              onChange={(e) => setNewFriendId(e.target.value)}
              className="w-full px-3 py-2 bg-nexus-dark border border-nexus-gray rounded-md text-white placeholder-nexus-light-gray focus:outline-none focus:border-nexus-blue mb-4"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleAddFriend}
                className="flex-1 px-4 py-2 bg-nexus-blue text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                추가
              </button>
              <button
                onClick={() => setShowAddFriend(false)}
                className="flex-1 px-4 py-2 bg-nexus-gray text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 친구 목록 */}
      <div className="space-y-2">
        {filteredFriends.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-nexus-light-gray mx-auto mb-4" />
            <p className="text-nexus-light-gray">
              {searchTerm ? "검색 결과가 없습니다." : "친구가 없습니다."}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddFriend(true)}
                className="mt-4 px-4 py-2 bg-nexus-blue text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                친구 추가하기
              </button>
            )}
          </div>
        ) : (
          filteredFriends.map((friend) => {
            const statusInfo = getStatusText(friend.status);

            return (
              <div
                key={friend.id}
                className="flex items-center justify-between p-4 bg-nexus-dark rounded-lg hover:bg-nexus-gray transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {/* 온라인 상태 */}
                  <div className="relative">
                    <div className="w-10 h-10 bg-nexus-gray rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {friend.nexusNickname?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-nexus-dark ${getStatusColor(
                        friend.isOnline || false
                      )}`}
                    />
                  </div>

                  {/* 사용자 정보 */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-white text-sm truncate">
                        {friend.nexusNickname || "알 수 없음"}
                      </span>
                      {friend.isStreamer && (
                        <Crown className="w-4 h-4 text-nexus-yellow" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-nexus-light-gray">
                        {friend.riotNickname}#{friend.riotTag}
                      </span>
                      <span className={`text-xs ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center space-x-2">
                  {friend.status === "accepted" && (
                    <button
                      onClick={() => {
                        /* 메시지 기능 */
                      }}
                      className="p-2 text-nexus-blue hover:bg-nexus-blue hover:bg-opacity-20 rounded-md transition-colors"
                      title="메시지 보내기"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  )}

                  {friend.status === "pending" && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleAcceptFriend(friend.id.toString())}
                        className="px-2 py-1 bg-nexus-green text-white text-xs rounded hover:bg-green-600 transition-colors"
                      >
                        수락
                      </button>
                      <button
                        onClick={() => handleRemoveFriend(friend.id.toString())}
                        className="px-2 py-1 bg-nexus-red text-white text-xs rounded hover:bg-red-600 transition-colors"
                      >
                        거절
                      </button>
                    </div>
                  )}

                  {friend.status === "accepted" && (
                    <div className="relative">
                      <button className="p-2 text-nexus-light-gray hover:text-white hover:bg-nexus-gray rounded-md transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {/* 드롭다운 메뉴 */}
                      <div className="absolute right-0 top-full mt-1 bg-nexus-dark border border-nexus-gray rounded-md shadow-lg z-10 min-w-[120px]">
                        <button
                          onClick={() =>
                            handleBlockFriend(friend.id.toString())
                          }
                          className="w-full px-3 py-2 text-left text-sm text-nexus-light-gray hover:text-white hover:bg-nexus-gray"
                        >
                          차단
                        </button>
                        <button
                          onClick={() =>
                            handleRemoveFriend(friend.id.toString())
                          }
                          className="w-full px-3 py-2 text-left text-sm text-nexus-red hover:bg-nexus-red hover:bg-opacity-20"
                        >
                          친구 삭제
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 통계 */}
      <div className="mt-6 pt-6 border-t border-nexus-gray">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-white">
              {friends.filter((f) => f.status === "accepted").length}
            </p>
            <p className="text-sm text-nexus-light-gray">친구</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {friends.filter((f) => f.status === "pending").length}
            </p>
            <p className="text-sm text-nexus-light-gray">대기 중</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {friends.filter((f) => f.isOnline).length}
            </p>
            <p className="text-sm text-nexus-light-gray">온라인</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendList;
