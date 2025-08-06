import {
  Clock,
  Crown,
  ExternalLink,
  Eye,
  Play,
  Plus,
  Search,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import RegisterStreamerModal from "./RegisterStreamerModal";

const StreamerList: React.FC = () => {
  const { streamers, addStreamer } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState<
    "all" | "twitch" | "youtube" | "afreeca"
  >("all");

  const filteredStreamers = streamers.filter((streamer) => {
    const matchesSearch = streamer.streamLink
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesPlatform =
      filterPlatform === "all" || streamer.platform === filterPlatform;
    return matchesSearch && matchesPlatform;
  });

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
    <div className="min-h-screen bg-nexus-dark text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">스트리머</h1>
            <p className="text-nexus-light-gray">
              NEXUS 스트리머들의 방송을 확인해보세요
            </p>
          </div>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-nexus-purple text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>스트리머 등록</span>
          </button>
        </div>

        {/* 필터 및 검색 */}
        <div className="flex flex-wrap items-center justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-nexus-light-gray" />
              <input
                type="text"
                placeholder="스트리머 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-nexus-darker border border-nexus-gray rounded-lg text-white placeholder-nexus-light-gray focus:outline-none focus:border-nexus-blue"
              />
            </div>
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value as any)}
              className="px-4 py-2 bg-nexus-darker border border-nexus-gray rounded-lg text-white focus:outline-none focus:border-nexus-blue"
            >
              <option value="all">전체 플랫폼</option>
              <option value="twitch">Twitch</option>
              <option value="youtube">YouTube</option>
              <option value="afreeca">AfreecaTV</option>
            </select>
          </div>
          <div className="text-sm text-nexus-light-gray">
            총 {filteredStreamers.length}명의 스트리머
          </div>
        </div>

        {/* 스트리머 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStreamers.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Crown className="w-16 h-16 text-nexus-light-gray mx-auto mb-4" />
              <p className="text-nexus-light-gray text-lg mb-2">
                {searchTerm || filterPlatform !== "all"
                  ? "검색 결과가 없습니다."
                  : "등록된 스트리머가 없습니다."}
              </p>
              {!searchTerm && filterPlatform === "all" && (
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="px-6 py-3 bg-nexus-purple text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  첫 번째 스트리머 등록하기
                </button>
              )}
            </div>
          ) : (
            filteredStreamers.map((streamer) => (
              <div
                key={streamer.id}
                className="bg-nexus-darker rounded-lg p-6 hover:bg-nexus-gray transition-colors"
              >
                {/* 헤더 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">
                        {getPlatformIcon(streamer.platform)}
                      </span>
                      <span
                        className={`font-medium ${getPlatformColor(
                          streamer.platform
                        )}`}
                      >
                        {streamer.platform.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      스트리머
                    </h3>
                    <p className="text-sm text-nexus-light-gray">
                      방송 링크: {streamer.streamLink}
                    </p>
                  </div>
                  {streamer.isLive && (
                    <span className="inline-flex items-center px-2 py-1 bg-nexus-red text-white text-xs rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
                      LIVE
                    </span>
                  )}
                </div>

                {/* 방송 정보 */}
                <div className="space-y-3 mb-4">
                  {streamer.isLive && (
                    <div className="flex items-center space-x-2 p-3 bg-nexus-dark rounded-lg">
                      <Eye className="w-5 h-5 text-nexus-green" />
                      <div>
                        <p className="text-white font-medium">
                          {streamer.viewerCount.toLocaleString()}명
                        </p>
                        <p className="text-xs text-nexus-light-gray">시청자</p>
                      </div>
                    </div>
                  )}

                  {streamer.recentBroadcast && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-nexus-light-gray" />
                      <div>
                        <p className="text-sm text-white">최근 방송</p>
                        <p className="text-xs text-nexus-light-gray">
                          {streamer.recentBroadcast}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 통계 */}
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
                      {streamer.isLive
                        ? Math.round(
                            streamer.viewerCount * 0.8
                          ).toLocaleString()
                        : "0"}
                      명
                    </p>
                  </div>
                </div>

                {/* 방송 일정 */}
                <div className="mt-4 pt-4 border-t border-nexus-gray">
                  <h4 className="text-sm font-medium text-nexus-light-gray mb-2">
                    방송 일정
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white">오늘</span>
                      <span className="text-nexus-light-gray">
                        20:00 ~ 23:00
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white">내일</span>
                      <span className="text-nexus-light-gray">
                        19:00 ~ 22:00
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white">토요일</span>
                      <span className="text-nexus-light-gray">
                        15:00 ~ 18:00
                      </span>
                    </div>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="mt-4 pt-4 border-t border-nexus-gray">
                  <a
                    href={streamer.streamLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-nexus-purple text-white rounded-md hover:bg-purple-600 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>방송 보기</span>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 스트리머 등록 모달 */}
        {showRegisterModal && (
          <RegisterStreamerModal
            onClose={() => setShowRegisterModal(false)}
            onRegister={(streamer) => {
              addStreamer(streamer);
              setShowRegisterModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default StreamerList;
