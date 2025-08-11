import { MoreVertical } from "lucide-react";
import React from "react";
import { Friend } from "../../types";
import Avatar from "../common/Avatar";

interface FriendListProps {
  friends: Friend[];
  onRemove: (friendId: number) => void;
}

const FriendList: React.FC<FriendListProps> = ({ friends, onRemove }) => {
  const onlineFriends = friends.filter((friend) => friend.isOnline);
  const offlineFriends = friends.filter((friend) => !friend.isOnline);

  return (
    <div className="space-y-6">
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
                    <p className="text-xs text-success">온라인</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onRemove(friend.id)}
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
                      {new Date(friend.lastSeen || "").toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onRemove(friend.id)}
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
    </div>
  );
};

export default FriendList;
