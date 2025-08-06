import {
  Activity,
  Award,
  Crown,
  FileText,
  MessageCircle,
  MessageSquare,
  Settings,
  Star,
  Target,
  ThumbsDown,
  ThumbsUp,
  Trophy,
  Users,
  Video,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { RiotApiService } from "../../services/riotApi";
import { useAppStore } from "../../store/useAppStore";
import { User } from "../../types";
import FeedbackModal from "../Feedback/FeedbackModal";
import FriendsList from "../Friends/FriendsList";
import StreamerProfile from "../Streamer/StreamerProfile";
import UserEvaluationModal from "../UserEvaluation/UserEvaluationModal";
import MatchHistory from "./MatchHistory";
import MessagePanel from "./MessagePanel";
import UserProfile from "./UserProfile";

const MyPage: React.FC = () => {
  const {
    user,
    setUser,
    setMatches,
    setLoading,
    setError,
    matches,
    isLoading,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<
    | "profile"
    | "matches"
    | "friends"
    | "messages"
    | "evaluations"
    | "feedback"
    | "streamer"
  >("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // 사용자 정보 로드
  useEffect(() => {
    if (user?.puuid) {
      loadUserMatches();
    }
  }, [user?.puuid]);

  const loadUserMatches = async () => {
    if (!user?.puuid) return;

    try {
      setLoading(true);
      setError(null);

      // 최근 매치 ID 목록 조회
      const matchIds = await RiotApiService.getRecentMatchIds(user.puuid, 20);

      // 매치 상세 정보 조회 (병렬 처리)
      const matchPromises = matchIds
        .slice(0, 10)
        .map((matchId) => RiotApiService.getMatchDetails(matchId));

      const matches = await Promise.all(matchPromises);
      setMatches(matches);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to load matches"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async (updatedUser: Partial<User>) => {
    try {
      setLoading(true);
      // 실제로는 백엔드 API 호출
      setUser({ ...user!, ...updatedUser });
      setIsEditing(false);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUserEvaluation = (targetUser: any) => {
    setSelectedUser(targetUser);
    setShowEvaluationModal(true);
  };

  const handleEvaluationSuccess = () => {
    // 평가 성공 시 처리
    console.log("사용자 평가가 완료되었습니다.");
  };

  const handleFeedbackSuccess = () => {
    // 피드백 제출 성공 시 처리
    console.log("피드백이 제출되었습니다.");
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-nexus-dark">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            로그인이 필요합니다
          </h2>
          <p className="text-nexus-light-gray">
            마이페이지를 이용하려면 로그인해주세요.
          </p>
        </div>
      </div>
    );
  }

  const winRate =
    matches.length > 0
      ? Math.round(
          (matches.filter(
            (m) =>
              m.participants.find((p) => p.puuid === user.puuid)?.teamId ===
              m.teams.find((t) => t.win)?.teamId
          ).length /
            matches.length) *
            100
        )
      : 0;

  const avgKDA =
    matches.length > 0
      ? (() => {
          const userMatches = matches.filter((m) =>
            m.participants.find((p) => p.puuid === user.puuid)
          );
          const totalKills = userMatches.reduce((sum, m) => {
            const participant = m.participants.find(
              (p) => p.puuid === user.puuid
            );
            return sum + (participant?.kills || 0);
          }, 0);
          const totalDeaths = userMatches.reduce((sum, m) => {
            const participant = m.participants.find(
              (p) => p.puuid === user.puuid
            );
            return sum + (participant?.deaths || 0);
          }, 0);
          const totalAssists = userMatches.reduce((sum, m) => {
            const participant = m.participants.find(
              (p) => p.puuid === user.puuid
            );
            return sum + (participant?.assists || 0);
          }, 0);

          if (totalDeaths === 0) return "Perfect";
          return ((totalKills + totalAssists) / totalDeaths).toFixed(2);
        })()
      : "0.00";

  return (
    <div className="min-h-screen bg-nexus-dark text-white">
      <div className="container mx-auto px-4 py-6">
        {/* 헤더 섹션 */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-nexus-blue to-nexus-purple rounded-full flex items-center justify-center text-2xl font-bold">
              {user.nexusNickname?.charAt(0) || "U"}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {user.nexusNickname}
              </h1>
              <div className="flex items-center space-x-4 text-nexus-light-gray">
                <span className="flex items-center space-x-1">
                  <Target className="w-4 h-4" />
                  <span>{user.mainLane || "Unknown"}</span>
                </span>
                {user.isStreamer && (
                  <span className="flex items-center space-x-1 text-yellow-400">
                    <Crown className="w-4 h-4" />
                    <span>스트리머</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 통계 카드들 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-nexus-dark-light rounded-lg p-4 border border-nexus-gray">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-nexus-blue rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-nexus-light-gray text-sm">총 게임</p>
                  <p className="text-white font-bold text-xl">
                    {matches.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-nexus-dark-light rounded-lg p-4 border border-nexus-gray">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-nexus-light-gray text-sm">승률</p>
                  <p className="text-white font-bold text-xl">{winRate}%</p>
                </div>
              </div>
            </div>

            <div className="bg-nexus-dark-light rounded-lg p-4 border border-nexus-gray">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-nexus-light-gray text-sm">평균 KDA</p>
                  <p className="text-white font-bold text-xl">{avgKDA}</p>
                </div>
              </div>
            </div>

            <div className="bg-nexus-dark-light rounded-lg p-4 border border-nexus-gray">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-nexus-light-gray text-sm">티어</p>
                  <p className="text-white font-bold text-xl">
                    {user.tier?.soloRank?.tier || "Unranked"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 사이드바 */}
          <div className="lg:col-span-1">
            <div className="bg-nexus-dark-light rounded-lg p-4 border border-nexus-gray sticky top-4">
              <h3 className="text-lg font-semibold mb-4 text-white">메뉴</h3>
              <div className="space-y-2">
                {[
                  { id: "profile", label: "프로필", icon: Settings },
                  { id: "matches", label: "전적", icon: Trophy },
                  { id: "friends", label: "친구", icon: Users },
                  { id: "messages", label: "메시지", icon: MessageCircle },
                  { id: "evaluations", label: "평가", icon: Star },
                  { id: "feedback", label: "피드백", icon: FileText },
                  ...(user.isStreamer
                    ? [{ id: "streamer", label: "스트리머", icon: Video }]
                    : []),
                ].map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? "bg-nexus-blue text-white"
                          : "text-nexus-light-gray hover:text-white hover:bg-nexus-gray"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 메인 컨텐츠 영역 */}
          <div className="lg:col-span-3">
            <div className="bg-nexus-dark-light rounded-lg border border-nexus-gray overflow-hidden">
              {activeTab === "profile" && (
                <UserProfile
                  user={user}
                  onEdit={handleEditProfile}
                  isEditing={isEditing}
                  onSave={handleSaveProfile}
                />
              )}

              {activeTab === "matches" && <MatchHistory userId={user.id} />}

              {activeTab === "friends" && <FriendsList />}

              {activeTab === "messages" && <MessagePanel />}

              {activeTab === "evaluations" && (
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4 text-white">
                    사용자 평가
                  </h3>
                  <p className="text-nexus-light-gray mb-6">
                    다른 사용자들의 매너와 실력을 평가해보세요.
                  </p>

                  <div className="space-y-4">
                    <div className="bg-nexus-dark rounded-lg p-4 border border-nexus-gray">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">F</span>
                          </div>
                          <div>
                            <h4 className="text-white font-medium">Friend1</h4>
                            <p className="text-nexus-light-gray text-sm">
                              GOLD II • MID
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            handleUserEvaluation({
                              id: 1,
                              nexusNickname: "Friend1",
                              tierInfo: {
                                solo: { tier: "GOLD", rank: "II", lp: 1250 },
                              },
                              mainLane: "mid",
                              mostChampions: ["Yasuo", "Zed", "Ahri"],
                            })
                          }
                          className="flex items-center space-x-2 px-4 py-2 bg-nexus-blue text-white rounded-lg hover:bg-nexus-blue-dark transition-colors"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span>평가하기</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-nexus-dark rounded-lg p-4 border border-nexus-gray">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">S</span>
                          </div>
                          <div>
                            <h4 className="text-white font-medium">
                              StreamerOne
                            </h4>
                            <p className="text-nexus-light-gray text-sm">
                              DIAMOND IV • ADC
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            handleUserEvaluation({
                              id: 2,
                              nexusNickname: "StreamerOne",
                              tierInfo: {
                                solo: { tier: "DIAMOND", rank: "IV", lp: 2100 },
                              },
                              mainLane: "adc",
                              mostChampions: ["Jinx", "Kaisa", "Vayne"],
                            })
                          }
                          className="flex items-center space-x-2 px-4 py-2 bg-nexus-blue text-white rounded-lg hover:bg-nexus-blue-dark transition-colors"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span>평가하기</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "feedback" && (
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4 text-white">
                    피드백 제출
                  </h3>
                  <p className="text-nexus-light-gray mb-6">
                    NEXUS의 기능에 대한 의견을 들려주세요.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-nexus-dark rounded-lg p-4 border border-nexus-gray">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                          <ThumbsUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">좋은 점</h4>
                          <p className="text-nexus-light-gray text-sm">
                            개선된 부분이나 만족스러운 기능
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-nexus-dark rounded-lg p-4 border border-nexus-gray">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                          <ThumbsDown className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">개선점</h4>
                          <p className="text-nexus-light-gray text-sm">
                            불편한 점이나 개선이 필요한 부분
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowFeedbackModal(true)}
                    className="flex items-center space-x-2 px-6 py-3 bg-nexus-blue text-white font-medium rounded-lg hover:bg-nexus-blue-dark transition-colors"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>피드백 제출하기</span>
                  </button>
                </div>
              )}

              {activeTab === "streamer" && user.isStreamer && (
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4 text-white">
                    스트리머 정보
                  </h3>
                  <p className="text-nexus-light-gray mb-6">
                    스트리머 등록 정보를 관리하세요.
                  </p>
                  <div className="bg-nexus-dark rounded-lg p-4 border border-nexus-gray">
                    <p className="text-nexus-light-gray text-sm">
                      스트리머 정보는 별도 페이지에서 관리됩니다.
                    </p>
                    <button
                      onClick={() => window.location.href = "/streamers"}
                      className="mt-4 flex items-center space-x-2 px-4 py-2 bg-nexus-blue text-white rounded-lg hover:bg-nexus-blue-dark transition-colors"
                    >
                      <Video className="w-4 h-4" />
                      <span>스트리머 목록 보기</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 사용자 평가 모달 */}
      {showEvaluationModal && selectedUser && (
        <UserEvaluationModal
          targetUser={selectedUser}
          onClose={() => {
            setShowEvaluationModal(false);
            setSelectedUser(null);
          }}
          onSuccess={handleEvaluationSuccess}
        />
      )}

      {/* 피드백 모달 */}
      {showFeedbackModal && (
        <FeedbackModal
          onClose={() => setShowFeedbackModal(false)}
          onSuccess={handleFeedbackSuccess}
        />
      )}
    </div>
  );
};

export default MyPage;
