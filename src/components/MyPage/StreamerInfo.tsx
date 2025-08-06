import { Clock, Crown, ExternalLink, Eye, Play, Users } from "lucide-react";
import React from "react";
import { User } from "../../types";

interface StreamerInfoProps {
  user: User;
}

const StreamerInfo: React.FC<StreamerInfoProps> = ({ user }) => {
  if (!user.isStreamer || !user.streamerInfo) {
    return null;
  }

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

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "twitch":
        return "text-purple-400";
      case "youtube":
        return "text-red-400";
      case "afreeca":
        return "text-blue-400";
      default:
        return "text-nexus-light-gray";
    }
  };

  return (
    <div className="bg-nexus-darker rounded-lg p-6">
      {/* 헤더 */}
      <div className="flex items-center space-x-2 mb-4">
        <Crown className="w-5 h-5 text-nexus-yellow" />
        <h3 className="text-lg font-semibold text-white">스트리머 정보</h3>
        {user.streamerInfo.isLive && (
          <span className="inline-flex items-center px-2 py-1 bg-nexus-red text-white text-xs rounded-full">
            <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
            LIVE
          </span>
        )}
      </div>

      {/* 플랫폼 정보 */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-2xl">
            {getPlatformIcon(user.streamerInfo.platform)}
          </span>
          <span
            className={`font-medium ${getPlatformColor(
              user.streamerInfo.platform
            )}`}
          >
            {user.streamerInfo.platform.toUpperCase()}
          </span>
        </div>

        {user.streamerInfo.streamLink && (
          <a
            href={user.streamerInfo.streamLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 text-nexus-blue hover:text-blue-400 transition-colors"
          >
            <span className="text-sm">방송 보기</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* 시청자 수 */}
      {user.streamerInfo.isLive && (
        <div className="flex items-center space-x-2 mb-4 p-3 bg-nexus-dark rounded-lg">
          <Eye className="w-5 h-5 text-nexus-green" />
          <div>
            <p className="text-white font-medium">
              {user.streamerInfo.viewerCount.toLocaleString()}명
            </p>
            <p className="text-xs text-nexus-light-gray">시청자</p>
          </div>
        </div>
      )}

      {/* 최근 방송 */}
      {user.streamerInfo.recentBroadcast && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-nexus-light-gray" />
            <span className="text-sm font-medium text-nexus-light-gray">
              최근 방송
            </span>
          </div>
          <p className="text-sm text-white">
            {user.streamerInfo.recentBroadcast}
          </p>
        </div>
      )}

      {/* 방송 통계 */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-nexus-gray">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Play className="w-4 h-4 text-nexus-blue" />
            <span className="text-sm font-medium text-nexus-light-gray">
              총 방송
            </span>
          </div>
          <p className="text-lg font-bold text-white">127회</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Users className="w-4 h-4 text-nexus-green" />
            <span className="text-sm font-medium text-nexus-light-gray">
              평균 시청자
            </span>
          </div>
          <p className="text-lg font-bold text-white">
            {user.streamerInfo.isLive
              ? Math.round(user.streamerInfo.viewerCount * 0.8).toLocaleString()
              : "0"}
            명
          </p>
        </div>
      </div>

      {/* 방송 일정 (예시) */}
      <div className="mt-4 pt-4 border-t border-nexus-gray">
        <h4 className="text-sm font-medium text-nexus-light-gray mb-2">
          방송 일정
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white">오늘</span>
            <span className="text-nexus-light-gray">20:00 ~ 23:00</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-white">내일</span>
            <span className="text-nexus-light-gray">19:00 ~ 22:00</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-white">토요일</span>
            <span className="text-nexus-light-gray">15:00 ~ 18:00</span>
          </div>
        </div>
      </div>

      {/* 팔로워 수 (예시) */}
      <div className="mt-4 pt-4 border-t border-nexus-gray">
        <div className="flex items-center justify-between">
          <span className="text-sm text-nexus-light-gray">팔로워</span>
          <span className="text-white font-medium">12.5K</span>
        </div>
      </div>
    </div>
  );
};

export default StreamerInfo;
