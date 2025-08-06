import { Star, ThumbsDown, ThumbsUp, X } from "lucide-react";
import React, { useState } from "react";
import apiService from "../../services/api";

interface UserEvaluationModalProps {
  targetUser: {
    id: number;
    nexusNickname: string;
    avatarUrl?: string;
    tierInfo?: any;
    mainLane?: string;
    mostChampions?: string[];
  };
  onClose: () => void;
  onSuccess: () => void;
}

const UserEvaluationModal: React.FC<UserEvaluationModalProps> = ({
  targetUser,
  onClose,
  onSuccess,
}) => {
  const [evaluationType, setEvaluationType] = useState<
    "like" | "dislike" | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!evaluationType) return;

    setIsSubmitting(true);
    try {
      await apiService.evaluateUser(targetUser.id, evaluationType);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("사용자 평가 실패:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTierColor = (tier: string) => {
    const tierColors: { [key: string]: string } = {
      IRON: "text-red-400",
      BRONZE: "text-orange-400",
      SILVER: "text-gray-400",
      GOLD: "text-yellow-400",
      PLATINUM: "text-green-400",
      DIAMOND: "text-blue-400",
      MASTER: "text-purple-400",
      GRANDMASTER: "text-pink-400",
      CHALLENGER: "text-red-500",
    };
    return tierColors[tier] || "text-gray-400";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-nexus-darker rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-nexus-white">사용자 평가</h2>
          <button
            onClick={onClose}
            className="text-nexus-gray hover:text-nexus-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 사용자 정보 */}
        <div className="bg-nexus-dark rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-nexus-gray rounded-full flex items-center justify-center">
              <span className="text-nexus-white font-medium text-lg">
                {targetUser.nexusNickname?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
            <div>
              <h3 className="text-nexus-white font-semibold">
                <span className="font-medium text-white">
                  {targetUser.nexusNickname || "알 수 없음"}
                </span>
              </h3>
              {targetUser.mainLane && (
                <p className="text-nexus-gray text-sm">
                  주 포지션: {targetUser.mainLane}
                </p>
              )}
            </div>
          </div>

          {/* 티어 정보 */}
          {targetUser.tierInfo && (
            <div className="space-y-2">
              {targetUser.tierInfo.solo && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-nexus-gray">솔로랭크</span>
                  <span
                    className={`font-medium ${getTierColor(
                      targetUser.tierInfo.solo.tier
                    )}`}
                  >
                    {targetUser.tierInfo.solo.tier}{" "}
                    {targetUser.tierInfo.solo.rank} (
                    {targetUser.tierInfo.solo.lp}LP)
                  </span>
                </div>
              )}
              {targetUser.tierInfo.flex && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-nexus-gray">자유랭크</span>
                  <span
                    className={`font-medium ${getTierColor(
                      targetUser.tierInfo.flex.tier
                    )}`}
                  >
                    {targetUser.tierInfo.flex.tier}{" "}
                    {targetUser.tierInfo.flex.rank} (
                    {targetUser.tierInfo.flex.lp}LP)
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 주 챔피언 */}
          {targetUser.mostChampions && targetUser.mostChampions.length > 0 && (
            <div className="mt-3">
              <p className="text-nexus-gray text-sm mb-1">주 챔피언</p>
              <div className="flex flex-wrap gap-1">
                {targetUser.mostChampions.slice(0, 3).map((champion, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-nexus-blue/20 text-nexus-blue rounded text-xs"
                  >
                    {champion}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 평가 옵션 */}
        <div className="space-y-4 mb-6">
          <h3 className="text-nexus-white font-medium">
            이 사용자에 대한 평가를 선택해주세요
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setEvaluationType("like")}
              className={`flex items-center justify-center space-x-2 p-4 rounded-lg border-2 transition-colors ${
                evaluationType === "like"
                  ? "border-nexus-blue bg-nexus-blue/10 text-nexus-blue"
                  : "border-nexus-gray/20 text-nexus-gray hover:border-nexus-blue/50 hover:text-nexus-blue"
              }`}
            >
              <ThumbsUp className="w-5 h-5" />
              <span className="font-medium">좋아요</span>
            </button>

            <button
              onClick={() => setEvaluationType("dislike")}
              className={`flex items-center justify-center space-x-2 p-4 rounded-lg border-2 transition-colors ${
                evaluationType === "dislike"
                  ? "border-red-400 bg-red-400/10 text-red-400"
                  : "border-nexus-gray/20 text-nexus-gray hover:border-red-400/50 hover:text-red-400"
              }`}
            >
              <ThumbsDown className="w-5 h-5" />
              <span className="font-medium">싫어요</span>
            </button>
          </div>
        </div>

        {/* 평가 설명 */}
        <div className="bg-nexus-dark rounded-lg p-4 mb-6">
          <h4 className="text-nexus-white font-medium mb-2">
            평가 시스템 안내
          </h4>
          <div className="space-y-2 text-sm text-nexus-gray">
            <div className="flex items-center space-x-2">
              <ThumbsUp className="w-4 h-4 text-nexus-blue" />
              <span>좋아요: 게임 매너가 좋고 실력이 뛰어난 사용자</span>
            </div>
            <div className="flex items-center space-x-2">
              <ThumbsDown className="w-4 h-4 text-red-400" />
              <span>싫어요: 부적절한 행동이나 매너가 나쁜 사용자</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>평가 결과는 사용자 프로필에 반영됩니다</span>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-nexus-gray hover:text-nexus-white transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!evaluationType || isSubmitting}
            className={`px-6 py-2 font-medium rounded-lg transition-colors ${
              evaluationType === "like"
                ? "bg-nexus-blue text-white hover:bg-nexus-blue-dark"
                : evaluationType === "dislike"
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-nexus-gray text-nexus-dark cursor-not-allowed"
            } disabled:opacity-50`}
          >
            {isSubmitting ? "평가 중..." : "평가하기"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserEvaluationModal;
