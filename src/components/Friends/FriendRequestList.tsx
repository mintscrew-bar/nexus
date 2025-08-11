import { Check, X } from "lucide-react";
import React from "react";
import { FriendRequest } from "../../types";
import Avatar from "../common/Avatar";

interface FriendRequestListProps {
  requests: FriendRequest[];
  onAccept: (requestId: number) => void;
  onReject: (requestId: number) => void;
}

const FriendRequestList: React.FC<FriendRequestListProps> = ({ requests, onAccept, onReject }) => {
  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <div
          key={request.id}
          className="flex items-center justify-between p-3 bg-bg-primary rounded-lg hover:bg-bg-tertiary transition-colors border border-border"
        >
          <div className="flex items-center space-x-3">
            <Avatar
              src={request.fromUser.avatarUrl}
              alt={request.fromUser.nexusNickname}
              size="md"
            />
            <div>
              <p className="text-text-primary font-medium">
                {request.fromUser.nexusNickname}
              </p>
              <p className="text-xs text-text-secondary">
                친구요청을 보냈습니다.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onAccept(request.id)}
              className="p-2 text-success hover:bg-success/10 rounded-md transition-colors"
              title="수락"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => onReject(request.id)}
              className="p-2 text-danger hover:bg-danger/10 rounded-md transition-colors"
              title="거절"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FriendRequestList;
