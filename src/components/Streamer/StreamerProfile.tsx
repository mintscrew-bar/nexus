import { Clock, Edit, ExternalLink, Users, Video } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiService, { Streamer } from "../../services/api";
import { useAppStore } from "../../store/useAppStore";

const StreamerProfile: React.FC = () => {
  const { streamerId } = useParams<{ streamerId: string }>();
  const { user } = useAppStore();
  const [streamer, setStreamer] = useState<Streamer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    streamLink: "",
    platform: "twitch" as "twitch" | "youtube" | "afreeca",
    recentBroadcast: "",
    viewerCount: 0,
    isLive: false,
  });

  const loadStreamerInfo = useCallback(async () => {
    if (!streamerId) return;

    try {
      setIsLoading(true);
      const streamerData = await apiService.getStreamer(parseInt(streamerId));
      setStreamer(streamerData);
      setEditForm({
        streamLink: streamerData.stream_link,
        platform: streamerData.platform,
        recentBroadcast: streamerData.recent_broadcast || "",
        viewerCount: streamerData.viewer_count,
        isLive: streamerData.is_live,
      });
    } catch (error) {
      console.error("스트리머 정보 로딩 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, [streamerId]);

  useEffect(() => {
    if (streamerId) {
      loadStreamerInfo();
    }
  }, [streamerId, loadStreamerInfo]);

  const handleUpdateStreamer = async () => {
    if (!streamerId) return;

    try {
      await apiService.updateStreamerInfo(parseInt(streamerId), editForm);
      await loadStreamerInfo();
      setIsEditing(false);
      alert("스트리머 정보가 업데이트되었습니다.");
    } catch (error) {
      console.error("Failed to update streamer info:", error);
      alert("스트리머 정보 업데이트에 실패했습니다.");
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "twitch":
        return "🎮";
      case "youtube":
        return "📺";
      case "afreeca":
        return "📱";
      default:
        return "🎥";
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case "twitch":
        return "Twitch";
      case "youtube":
        return "YouTube";
      case "afreeca":
        return "AfreecaTV";
      default:
        return "Unknown";
    }
  };

  const formatViewerCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (isLoading) {
    return (
      <div className="bg-nexus-darker rounded-lg p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-white">
            스트리머 정보를 불러오는 중...
          </span>
        </div>
      </div>
    );
  }

  if (!streamer) {
    return (
      <div className="bg-nexus-darker rounded-lg p-6">
        <div className="text-center">
          <Video className="w-12 h-12 text-nexus-light-gray mx-auto mb-4" />
          <p className="text-nexus-light-gray">
            스트리머 정보를 찾을 수 없습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-nexus-darker rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">스트리머 정보</h2>
        {user?.id === streamer.user_id && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-2 px-3 py-2 bg-nexus-blue text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>{isEditing ? "취소" : "편집"}</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-nexus-light-gray mb-1">
              방송 링크
            </label>
            <input
              type="url"
              value={editForm.streamLink}
              onChange={(e) =>
                setEditForm({ ...editForm, streamLink: e.target.value })
              }
              className="w-full px-3 py-2 bg-nexus-dark border border-nexus-gray rounded-md text-white placeholder-nexus-light-gray focus:outline-none focus:border-blue-500"
              placeholder="https://twitch.tv/username"
            />
          </div>

          <div>
            <label className="block text-sm text-nexus-light-gray mb-1">
              플랫폼
            </label>
            <select
              value={editForm.platform}
              onChange={(e) =>
                setEditForm({ ...editForm, platform: e.target.value as any })
              }
              className="w-full px-3 py-2 bg-nexus-dark border border-nexus-gray rounded-md text-white focus:outline-none focus:border-blue-500"
            >
              <option value="twitch">Twitch</option>
              <option value="youtube">YouTube</option>
              <option value="afreeca">AfreecaTV</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-nexus-light-gray mb-1">
              최근 방송
            </label>
            <input
              type="text"
              value={editForm.recentBroadcast}
              onChange={(e) =>
                setEditForm({ ...editForm, recentBroadcast: e.target.value })
              }
              className="w-full px-3 py-2 bg-nexus-dark border border-nexus-gray rounded-md text-white placeholder-nexus-light-gray focus:outline-none focus:border-blue-500"
              placeholder="최근 방송 제목"
            />
          </div>

          <div>
            <label className="block text-sm text-nexus-light-gray mb-1">
              시청자 수
            </label>
            <input
              type="number"
              value={editForm.viewerCount}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  viewerCount: parseInt(e.target.value),
                })
              }
              className="w-full px-3 py-2 bg-nexus-dark border border-nexus-gray rounded-md text-white placeholder-nexus-light-gray focus:outline-none focus:border-blue-500"
              placeholder="0"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isLive"
              checked={editForm.isLive}
              onChange={(e) =>
                setEditForm({ ...editForm, isLive: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 bg-nexus-dark border-nexus-gray rounded focus:ring-blue-500"
            />
            <label htmlFor="isLive" className="text-sm text-nexus-light-gray">
              현재 라이브 중
            </label>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleUpdateStreamer}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              저장
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 px-4 py-2 bg-nexus-gray text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 스트리머 기본 정보 */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 bg-nexus-blue rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-medium">
                  {streamer.nexus_nickname?.charAt(0) || "?"}
                </span>
              </div>
              {streamer.is_online && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-nexus-dark"></div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {streamer.nexus_nickname}
              </h3>
              <p className="text-nexus-light-gray text-sm">
                {streamer.is_online ? "온라인" : "오프라인"}
              </p>
            </div>
          </div>

          {/* 방송 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-nexus-dark rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <Video className="w-5 h-5 text-purple-400" />
                <h4 className="text-white font-medium">방송 정보</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">
                    {getPlatformIcon(streamer.platform)}
                  </span>
                  <span className="text-white">
                    {getPlatformName(streamer.platform)}
                  </span>
                </div>
                {streamer.is_live && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-400 font-medium">라이브</span>
                  </div>
                )}
                {streamer.viewer_count > 0 && (
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-nexus-light-gray" />
                    <span className="text-white">
                      {formatViewerCount(streamer.viewer_count)} 시청자
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-nexus-dark rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="w-5 h-5 text-blue-400" />
                <h4 className="text-white font-medium">최근 활동</h4>
              </div>
              <div className="space-y-2">
                {streamer.recent_broadcast && (
                  <p className="text-white text-sm">
                    {streamer.recent_broadcast}
                  </p>
                )}
                <p className="text-nexus-light-gray text-xs">
                  등록일: {new Date(streamer.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* 방송 링크 */}
          {streamer.stream_link && (
            <div className="p-4 bg-nexus-dark rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium mb-2">방송 링크</h4>
                  <p className="text-nexus-light-gray text-sm break-all">
                    {streamer.stream_link}
                  </p>
                </div>
                <a
                  href={streamer.stream_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>방송 보기</span>
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StreamerProfile;
