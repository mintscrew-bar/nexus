import { Eye, EyeOff, Lock, Settings, Trophy, Users, X } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/api";
import { useAppStore } from "../../store/useAppStore";
import { CustomGame } from "../../types";

interface CreateCustomGameModalProps {
  onClose: () => void;
  onCreate: (game: CustomGame) => void;
}

const CreateCustomGameModal: React.FC<CreateCustomGameModalProps> = ({
  onClose,
  onCreate,
}) => {
  const { user } = useAppStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    password: "",
    maxPlayers: 10,
    teamComposition: "none" as CustomGame["teamComposition"],
    banPickMode: "Draft Pick",
    allowSpectators: true,
  });

  const handleInputChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setIsSubmitting(true);

    try {
      const response = await apiService.createCustomGame({
        title: formData.title,
        description: formData.description,
        password: formData.password || undefined,
        maxPlayers: formData.maxPlayers,
        teamComposition: formData.teamComposition,
        banPickMode: formData.banPickMode,
        allowSpectators: formData.allowSpectators,
      });

      console.log("Create game response:", response);

      // 백엔드 API 응답 구조에 맞게 게임 ID 추출
      let gameId: number | undefined;

      if (response && typeof response === "object") {
        // 백엔드 응답 구조: { data: { game: { id: ... } } }
        if (response.data && response.data.game && response.data.game.id) {
          gameId = response.data.game.id;
        } else if (response.data && response.data.id) {
          gameId = response.data.id;
        } else if (response.id) {
          gameId = response.id;
        } else if (response.game && response.game.id) {
          gameId = response.game.id;
        }
      }

      if (gameId) {
        console.log("게임 생성 성공, 게임 ID:", gameId);
        console.log("페이지 이동 시도:", `/custom-games/${gameId}`);

        // 모달 닫기
        onClose();

        // 약간의 지연 후 페이지 이동 (상태 업데이트 완료 대기)
        setTimeout(() => {
          console.log("페이지 이동 실행:", `/custom-games/${gameId}`);

          // navigate 함수가 작동하지 않을 경우를 대비해 window.location.href도 시도
          try {
            navigate(`/custom-games/${gameId}`);
            console.log("navigate 함수 호출 완료");
          } catch (error) {
            console.error(
              "navigate 함수 실패, window.location.href 사용:",
              error
            );
            window.location.href = `/custom-games/${gameId}`;
          }
        }, 100);
      } else {
        console.error("응답에서 게임 ID를 찾을 수 없음:", response);
        console.error("전체 응답 객체:", JSON.stringify(response, null, 2));
        throw new Error("게임 ID를 찾을 수 없습니다. 응답을 확인해주세요.");
      }
    } catch (error) {
      console.error("Failed to create custom game:", error);
      alert("내전 방 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTeamCompositionDescription = (composition: string) => {
    switch (composition) {
      case "auction":
        return "팀장들이 경매를 통해 팀원을 선택합니다";
      case "rock-paper-scissors":
        return "가위바위보로 팀을 나눕니다";
      case "none":
        return "팀 구성 없이 자유롭게 참가합니다";
      default:
        return "";
    }
  };

  const getBanPickDescription = (mode: string) => {
    switch (mode) {
      case "Draft Pick":
        return "표준 밴픽 방식";
      case "Blind Pick":
        return "블라인드 픽 방식";
      case "All Random":
        return "모든 챔피언 랜덤";
      case "Tournament Draft":
        return "토너먼트 드래프트";
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-bg-secondary rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-border shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-nexus-gold" />
            <h2 className="text-2xl font-bold text-text-primary">내전 생성</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 기본 정보 섹션 */}
          <div className="bg-bg-tertiary rounded-lg p-6 border border-border">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-text-primary">
                기본 정보
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  내전 제목 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full px-3 py-2 bg-bg-primary border border-border rounded-md text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="내전 제목을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  최대 인원 *
                </label>
                <select
                  required
                  value={formData.maxPlayers}
                  onChange={(e) =>
                    handleInputChange("maxPlayers", parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 bg-bg-primary border border-border rounded-md text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value={5}>5명 (1팀)</option>
                  <option value={10}>10명 (2팀)</option>
                  <option value={15}>15명 (3팀)</option>
                  <option value={20}>20명 (4팀)</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-text-secondary mb-2">
                설명
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={3}
                className="w-full px-3 py-2 bg-bg-primary border border-border rounded-md text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                placeholder="내전에 대한 설명을 입력하세요 (선택사항)"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-text-secondary mb-2">
                비밀번호
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-bg-primary border border-border rounded-md text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="비밀번호 (선택사항)"
                />
                {formData.password && (
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-nexus-gold" />
                )}
              </div>
            </div>
          </div>

          {/* 게임 설정 섹션 */}
          <div className="bg-bg-tertiary rounded-lg p-6 border border-border">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-semibold text-text-primary">
                게임 설정
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  팀 구성 방식
                </label>
                <select
                  value={formData.teamComposition}
                  onChange={(e) =>
                    handleInputChange("teamComposition", e.target.value as any)
                  }
                  className="w-full px-3 py-2 bg-bg-primary border border-border rounded-md text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="none">없음</option>
                  <option value="auction">경매</option>
                  <option value="rock-paper-scissors">가위바위보</option>
                </select>
                <p className="text-xs text-text-muted mt-1">
                  {getTeamCompositionDescription(formData.teamComposition)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  밴픽 방식
                </label>
                <select
                  value={formData.banPickMode}
                  onChange={(e) =>
                    handleInputChange("banPickMode", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-bg-primary border border-border rounded-md text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Draft Pick">Draft Pick</option>
                  <option value="Blind Pick">Blind Pick</option>
                  <option value="All Random">All Random</option>
                  <option value="Tournament Draft">Tournament Draft</option>
                </select>
                <p className="text-xs text-text-muted mt-1">
                  {getBanPickDescription(formData.banPickMode)}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between p-4 bg-bg-primary rounded-lg border border-border">
              <div className="flex items-center space-x-3">
                {formData.allowSpectators ? (
                  <Eye className="w-5 h-5 text-success" />
                ) : (
                  <EyeOff className="w-5 h-5 text-text-muted" />
                )}
                <div>
                  <p className="text-text-primary font-medium">관전 허용</p>
                  <p className="text-sm text-text-secondary">
                    다른 사용자가 게임을 관전할 수 있습니다
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleInputChange(
                    "allowSpectators",
                    !formData.allowSpectators
                  )
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.allowSpectators ? "bg-success" : "bg-bg-quaternary"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.allowSpectators ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 미리보기 섹션 */}
          <div className="bg-bg-tertiary rounded-lg p-6 border border-border">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              미리보기
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-secondary">제목:</span>
                  <span className="text-text-primary font-medium">
                    {formData.title || "제목 미입력"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">인원:</span>
                  <span className="text-text-primary font-medium">
                    {formData.maxPlayers}명
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">팀 구성:</span>
                  <span className="text-text-primary font-medium">
                    {formData.teamComposition === "auction"
                      ? "경매"
                      : formData.teamComposition === "rock-paper-scissors"
                      ? "가위바위보"
                      : "없음"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-secondary">밴픽:</span>
                  <span className="text-text-primary font-medium">
                    {formData.banPickMode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">관전:</span>
                  <span className="text-text-primary font-medium">
                    {formData.allowSpectators ? "허용" : "비허용"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">비밀번호:</span>
                  <span className="text-text-primary font-medium">
                    {formData.password ? "설정됨" : "없음"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex space-x-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-bg-tertiary text-text-primary rounded-md hover:bg-bg-quaternary transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!formData.title.trim() || isSubmitting}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>생성 중...</span>
                </>
              ) : (
                <>
                  <Trophy className="w-4 h-4" />
                  <span>내전 생성</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCustomGameModal;
