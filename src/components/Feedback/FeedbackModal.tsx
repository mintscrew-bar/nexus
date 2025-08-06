import { MessageSquare, Star, ThumbsDown, ThumbsUp, X } from "lucide-react";
import React, { useState } from "react";
import apiService from "../../services/api";

interface FeedbackModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    featureName: "",
    rating: 0,
    comment: "",
    isAnonymous: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const features = [
    { value: "custom_games", label: "내전 시스템" },
    { value: "community", label: "커뮤니티" },
    { value: "match_history", label: "매치 히스토리" },
    { value: "friends", label: "친구 시스템" },
    { value: "streamers", label: "스트리머 기능" },
    { value: "user_evaluation", label: "사용자 평가" },
    { value: "search", label: "검색 기능" },
    { value: "ui_ux", label: "UI/UX" },
    { value: "performance", label: "성능" },
    { value: "other", label: "기타" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.featureName || !formData.rating) {
      alert("모든 필수 항목을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.submitFeedback({
        category: "feedback",
        title: formData.featureName,
        content: formData.comment,
        featureName: formData.featureName,
        rating: formData.rating,
        isAnonymous: formData.isAnonymous,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("피드백 제출 실패:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-400";
    if (rating >= 3) return "text-yellow-400";
    return "text-red-400";
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1:
        return "매우 나쁨";
      case 2:
        return "나쁨";
      case 3:
        return "보통";
      case 4:
        return "좋음";
      case 5:
        return "매우 좋음";
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-nexus-darker rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-nexus-white">피드백 제출</h2>
          <button
            onClick={onClose}
            className="text-nexus-gray hover:text-nexus-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기능 선택 */}
          <div>
            <label className="block text-sm font-medium text-nexus-gray mb-2">
              평가할 기능 *
            </label>
            <select
              required
              value={formData.featureName}
              onChange={(e) =>
                setFormData({ ...formData, featureName: e.target.value })
              }
              className="w-full px-4 py-2 bg-nexus-dark border border-nexus-gray/20 rounded-lg text-nexus-white focus:outline-none focus:ring-2 focus:ring-nexus-blue"
            >
              <option value="">기능을 선택하세요</option>
              {features.map((feature) => (
                <option key={feature.value} value={feature.value}>
                  {feature.label}
                </option>
              ))}
            </select>
          </div>

          {/* 평점 */}
          <div>
            <label className="block text-sm font-medium text-nexus-gray mb-2">
              평점 *
            </label>
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating })}
                  className={`flex flex-col items-center space-y-1 p-3 rounded-lg transition-colors ${
                    formData.rating === rating
                      ? "bg-nexus-blue/20 border border-nexus-blue"
                      : "hover:bg-nexus-gray/10"
                  }`}
                >
                  <Star
                    className={`w-6 h-6 ${
                      formData.rating >= rating
                        ? getRatingColor(formData.rating)
                        : "text-nexus-gray"
                    }`}
                    fill={formData.rating >= rating ? "currentColor" : "none"}
                  />
                  <span className="text-xs text-nexus-gray">{rating}</span>
                </button>
              ))}
            </div>
            {formData.rating > 0 && (
              <p
                className={`mt-2 text-sm font-medium ${getRatingColor(
                  formData.rating
                )}`}
              >
                {getRatingText(formData.rating)}
              </p>
            )}
          </div>

          {/* 상세 의견 */}
          <div>
            <label className="block text-sm font-medium text-nexus-gray mb-2">
              상세 의견
            </label>
            <textarea
              rows={4}
              value={formData.comment}
              onChange={(e) =>
                setFormData({ ...formData, comment: e.target.value })
              }
              className="w-full px-4 py-2 bg-nexus-dark border border-nexus-gray/20 rounded-lg text-nexus-white focus:outline-none focus:ring-2 focus:ring-nexus-blue resize-none"
              placeholder="개선 사항이나 의견을 자유롭게 작성해주세요..."
            />
          </div>

          {/* 익명 옵션 */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAnonymous"
              checked={formData.isAnonymous}
              onChange={(e) =>
                setFormData({ ...formData, isAnonymous: e.target.checked })
              }
              className="mr-2"
            />
            <label htmlFor="isAnonymous" className="text-sm text-nexus-gray">
              익명으로 제출
            </label>
          </div>

          {/* 피드백 가이드 */}
          <div className="bg-nexus-dark rounded-lg p-4">
            <h4 className="text-nexus-white font-medium mb-3">
              피드백 작성 가이드
            </h4>
            <div className="space-y-2 text-sm text-nexus-gray">
              <div className="flex items-start space-x-2">
                <ThumbsUp className="w-4 h-4 text-green-400 mt-0.5" />
                <span>좋은 점이나 개선된 부분을 알려주세요</span>
              </div>
              <div className="flex items-start space-x-2">
                <ThumbsDown className="w-4 h-4 text-red-400 mt-0.5" />
                <span>불편한 점이나 개선이 필요한 부분을 알려주세요</span>
              </div>
              <div className="flex items-start space-x-2">
                <MessageSquare className="w-4 h-4 text-nexus-blue mt-0.5" />
                <span>구체적인 예시나 제안사항을 포함해주세요</span>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-nexus-gray hover:text-nexus-white transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || formData.rating === 0}
              className="px-6 py-2 bg-nexus-blue text-white font-medium rounded-lg hover:bg-nexus-blue-dark transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "제출 중..." : "피드백 제출"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
