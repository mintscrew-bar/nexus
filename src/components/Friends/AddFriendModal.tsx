import { Search, User, X } from "lucide-react";
import React, { useCallback, useState } from "react";
import apiService from "../../services/api";
import { SearchResult } from "../../types";
import Avatar from "../common/Avatar";

interface AddFriendModalProps {
  onClose: () => void;
}

const AddFriendModal: React.FC<AddFriendModalProps> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<Set<number>>(
    new Set()
  );

  const searchUsers = useCallback(
    async (query: string) => {
      if (!query.trim() || query.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const results = await apiService.searchUsers(query, 10);
        setSearchResults(results);
      } catch (error) {
        console.error("사용자 검색 오류:", error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    },
    []
  );

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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-bg-secondary border border-border rounded-lg w-96 max-h-[80vh] overflow-hidden shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-text-primary font-semibold">친구 추가</h3>
          <button
            onClick={onClose}
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
  );
};

export default AddFriendModal;
