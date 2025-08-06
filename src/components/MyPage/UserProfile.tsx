import { Crown, Edit, Save, Trophy, Users, X } from "lucide-react";
import React, { useState } from "react";
import apiService from "../../services/api";
import { User } from "../../types";

interface UserProfileProps {
  user: User;
  onEdit: () => void;
  isEditing: boolean;
  onSave: (updates: Partial<User>) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onEdit,
  isEditing,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    nexusNickname: user.nexusNickname,
    mainLane: user.mainLane || "",
    mostChampions: user.mostChampions || [],
  });
  const [riotNickname, setRiotNickname] = useState(user.riotNickname || "");
  const [riotTag, setRiotTag] = useState(user.riotTag || "");
  const [isLinking, setIsLinking] = useState(false);
  const [linkMessage, setLinkMessage] = useState("");

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const handleCancel = () => {
    setFormData({
      nexusNickname: user.nexusNickname,
      mainLane: user.mainLane || "",
      mostChampions: user.mostChampions || [],
    });
  };

  const getTierDisplay = (tier?: any) => {
    if (!tier) return "언랭";

    const soloRank = tier.soloRank;
    const flexRank = tier.flexRank;

    return (
      <div className="space-y-2">
        {soloRank && (
          <div className="flex items-center space-x-2">
            <Crown className="w-4 h-4 text-nexus-yellow" />
            <span className="text-sm">
              솔로랭크: {soloRank.tier} {soloRank.rank} {soloRank.lp}LP
            </span>
          </div>
        )}
        {flexRank && (
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-nexus-blue" />
            <span className="text-sm">
              자유랭크: {flexRank.tier} {flexRank.rank} {flexRank.lp}LP
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-theme-surface rounded-lg p-6 border border-theme-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-theme-text">프로필 정보</h2>
        {!isEditing ? (
          <button
            onClick={onEdit}
            className="flex items-center space-x-2 px-4 py-2 bg-nexus-blue text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>편집</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-nexus-green text-white rounded-md hover:bg-green-600 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>저장</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 px-4 py-2 bg-nexus-gray text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>취소</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 기본 정보 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-theme-text mb-4">
            기본 정보
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">
                Nexus 닉네임
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.nexusNickname}
                  onChange={(e) =>
                    handleInputChange("nexusNickname", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border rounded-md text-theme-text focus:outline-none focus:border-nexus-blue"
                />
              ) : (
                <p className="text-theme-text font-medium">
                  {user.nexusNickname}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">
                Riot ID
              </label>
              <p className="text-theme-text font-medium">
                {user.riotNickname}#{user.riotTag}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">
                주 라인
              </label>
              {isEditing ? (
                <select
                  value={formData.mainLane}
                  onChange={(e) =>
                    handleInputChange("mainLane", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border rounded-md text-theme-text focus:outline-none focus:border-nexus-blue"
                >
                  <option value="">선택하세요</option>
                  <option value="TOP">탑</option>
                  <option value="JUNGLE">정글</option>
                  <option value="MIDDLE">미드</option>
                  <option value="BOTTOM">원딜</option>
                  <option value="UTILITY">서폿</option>
                </select>
              ) : (
                <p className="text-theme-text font-medium">
                  {user.mainLane ? user.mainLane : "미설정"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-text-secondary mb-1">
                모스트 챔피언
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.mostChampions.join(", ")}
                  onChange={(e) =>
                    handleInputChange(
                      "mostChampions",
                      e.target.value.split(", ").filter((c) => c.trim())
                    )
                  }
                  placeholder="챔피언명을 쉼표로 구분하여 입력"
                  className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border rounded-md text-theme-text focus:outline-none focus:border-nexus-blue"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user.mostChampions && user.mostChampions.length > 0 ? (
                    user.mostChampions.map((champion, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-nexus-blue text-white text-sm rounded-md"
                      >
                        {champion}
                      </span>
                    ))
                  ) : (
                    <span className="text-theme-text-secondary">미설정</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 티어 정보 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-theme-text mb-4">
            티어 정보
          </h3>

          <div className="bg-theme-bg-secondary rounded-lg p-4 border border-theme-border">
            {getTierDisplay(user.tier)}
          </div>

          {/* 연동 상태 */}
          <div className="space-y-3">
            <h4 className="text-md font-semibold text-theme-text">연동 상태</h4>
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  user.puuid ? "bg-nexus-green" : "bg-nexus-red"
                }`}
              />
              <span className="text-sm text-theme-text">
                {user.puuid ? "Riot ID 연동됨" : "Riot ID 미연동"}
              </span>
            </div>
          </div>

          {/* 온라인 상태 */}
          <div className="space-y-3">
            <h4 className="text-md font-semibold text-theme-text">상태</h4>
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  user.isOnline ? "bg-nexus-green" : "bg-theme-text-muted"
                }`}
              />
              <span className="text-sm text-theme-text">
                {user.isOnline ? "온라인" : "오프라인"}
              </span>
            </div>
            {user.lastSeen && !user.isOnline && (
              <p className="text-xs text-theme-text-secondary">
                마지막 접속: {new Date(user.lastSeen).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Riot ID 연동 영역 */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-theme-text mb-2">
          Riot ID 연동
        </h3>
        {user.puuid ? (
          <div className="text-nexus-green text-sm mb-2">
            연동 완료: {user.riotNickname}#{user.riotTag}
          </div>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
            <input
              type="text"
              value={riotNickname}
              onChange={(e) => setRiotNickname(e.target.value)}
              placeholder="Riot 닉네임"
              className="px-3 py-2 rounded-md bg-theme-bg-secondary border border-theme-border text-theme-text focus:outline-none focus:border-nexus-blue"
            />
            <span className="text-theme-text-secondary">#</span>
            <input
              type="text"
              value={riotTag}
              onChange={(e) => setRiotTag(e.target.value)}
              placeholder="태그 (1234)"
              className="px-3 py-2 rounded-md bg-theme-bg-secondary border border-theme-border text-theme-text focus:outline-none focus:border-nexus-blue w-24"
            />
            <button
              onClick={async () => {
                setIsLinking(true);
                setLinkMessage("");
                try {
                  const response = await apiService.linkRiotId(
                    riotNickname,
                    riotTag
                  );
                  if (response.user) {
                    setLinkMessage("연동 성공!");
                    onSave({
                      riotNickname: response.user.riot_nickname,
                      riotTag: response.user.riot_tag,
                      puuid: response.user.puuid,
                    });
                  } else {
                    setLinkMessage(response.message || "연동 실패");
                  }
                } catch (error: any) {
                  setLinkMessage(
                    error.response?.data?.message || "연동 중 오류 발생"
                  );
                } finally {
                  setIsLinking(false);
                }
              }}
              disabled={isLinking || !riotNickname || !riotTag}
              className="px-4 py-2 bg-nexus-blue text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {isLinking ? "연동 중..." : "연동하기"}
            </button>
          </div>
        )}
        {linkMessage && (
          <div className="text-sm text-nexus-yellow mt-1">{linkMessage}</div>
        )}
      </div>

      {/* 스트리머 정보 */}
      {user.isStreamer && user.streamerInfo && (
        <div className="mt-6 pt-6 border-t border-nexus-gray">
          <h3 className="text-lg font-semibold text-white mb-4">
            스트리머 정보
          </h3>
          <div className="bg-nexus-dark rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Trophy className="w-5 h-5 text-nexus-yellow" />
              <span className="font-medium text-white">스트리머</span>
            </div>
            <p className="text-sm text-nexus-light-gray">
              플랫폼: {user.streamerInfo.platform}
            </p>
            <p className="text-sm text-nexus-light-gray">
              시청자 수: {user.streamerInfo.viewerCount}명
            </p>
            {user.streamerInfo.isLive && (
              <span className="inline-block px-2 py-1 bg-nexus-red text-white text-xs rounded-md mt-2">
                LIVE
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
