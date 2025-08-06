import { Clock, Crown, Eye, X } from "lucide-react";
import React, { useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import { StreamerInfo } from "../../types";

interface RegisterStreamerModalProps {
  onClose: () => void;
  onRegister: (streamer: StreamerInfo) => void;
}

const RegisterStreamerModal: React.FC<RegisterStreamerModalProps> = ({
  onClose,
  onRegister,
}) => {
  const { user } = useAppStore();
  const [formData, setFormData] = useState({
    streamLink: "",
    platform: "twitch" as StreamerInfo["platform"],
    recentBroadcast: "",
    viewerCount: 0,
    isLive: false,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    const newStreamer: StreamerInfo = {
      id: Date.now().toString(),
      userId: user.id,
      streamLink: formData.streamLink,
      platform: formData.platform,
      recentBroadcast: formData.recentBroadcast,
      viewerCount: formData.viewerCount,
      isLive: formData.isLive,
    };

    onRegister(newStreamer);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "twitch":
        return "🎮";
      case "youtube":
        return "📺";
      case "afreeca":
        return "📱";
      default:
        return "📺";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-nexus-darker rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Crown className="w-6 h-6 text-nexus-yellow" />
            <h2 className="text-2xl font-bold text-white">스트리머 등록</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-nexus-light-gray hover:text-white hover:bg-nexus-gray rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">기본 정보</h3>

            <div>
              <label className="block text-sm font-medium text-nexus-light-gray mb-2">
                방송 플랫폼 *
              </label>
              <select
                required
                value={formData.platform}
                onChange={(e) =>
                  handleInputChange("platform", e.target.value as any)
                }
                className="w-full px-3 py-2 bg-nexus-dark border border-nexus-gray rounded-md text-white focus:outline-none focus:border-nexus-blue"
              >
                <option value="twitch">Twitch</option>
                <option value="youtube">YouTube</option>
                <option value="afreeca">AfreecaTV</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-nexus-light-gray mb-2">
                방송 링크 *
              </label>
              <input
                type="url"
                required
                value={formData.streamLink}
                onChange={(e) =>
                  handleInputChange("streamLink", e.target.value)
                }
                className="w-full px-3 py-2 bg-nexus-dark border border-nexus-gray rounded-md text-white focus:outline-none focus:border-nexus-blue"
                placeholder="https://twitch.tv/yourchannel"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-nexus-light-gray mb-2">
                최근 방송
              </label>
              <input
                type="text"
                value={formData.recentBroadcast}
                onChange={(e) =>
                  handleInputChange("recentBroadcast", e.target.value)
                }
                className="w-full px-3 py-2 bg-nexus-dark border border-nexus-gray rounded-md text-white focus:outline-none focus:border-nexus-blue"
                placeholder="리그 오브 레전드 솔로랭크 플레이"
              />
            </div>
          </div>

          {/* 방송 상태 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">방송 상태</h3>

            <div className="flex items-center justify-between p-4 bg-nexus-dark rounded-lg">
              <div className="flex items-center space-x-3">
                {formData.isLive ? (
                  <Eye className="w-5 h-5 text-nexus-green" />
                ) : (
                  <Clock className="w-5 h-5 text-nexus-light-gray" />
                )}
                <div>
                  <p className="text-white font-medium">현재 방송 중</p>
                  <p className="text-sm text-nexus-light-gray">
                    실시간 방송 상태를 설정합니다
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleInputChange("isLive", !formData.isLive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.isLive ? "bg-nexus-green" : "bg-nexus-gray"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isLive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {formData.isLive && (
              <div>
                <label className="block text-sm font-medium text-nexus-light-gray mb-2">
                  현재 시청자 수
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.viewerCount}
                  onChange={(e) =>
                    handleInputChange(
                      "viewerCount",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-full px-3 py-2 bg-nexus-dark border border-nexus-gray rounded-md text-white focus:outline-none focus:border-nexus-blue"
                  placeholder="1250"
                />
              </div>
            )}
          </div>

          {/* 미리보기 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">미리보기</h3>
            <div className="bg-nexus-dark rounded-lg p-4 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">
                  {getPlatformIcon(formData.platform)}
                </span>
                <span className="text-white font-medium">
                  {formData.platform.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-nexus-light-gray">방송 링크:</span>
                <span className="text-white">
                  {formData.streamLink || "미입력"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-nexus-light-gray">최근 방송:</span>
                <span className="text-white">
                  {formData.recentBroadcast || "미입력"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-nexus-light-gray">방송 상태:</span>
                <span className="text-white">
                  {formData.isLive ? "LIVE" : "오프라인"}
                </span>
              </div>
              {formData.isLive && (
                <div className="flex justify-between">
                  <span className="text-nexus-light-gray">시청자 수:</span>
                  <span className="text-white">
                    {formData.viewerCount.toLocaleString()}명
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex space-x-3 pt-4 border-t border-nexus-gray">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-nexus-gray text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!formData.streamLink.trim()}
              className="flex-1 px-4 py-2 bg-nexus-purple text-white rounded-md hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              스트리머 등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterStreamerModal;
