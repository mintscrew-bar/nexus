import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  Clock,
  Crown,
  Eye,
  EyeOff,
  Filter,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trophy,
  Users,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/api";
import { useAppStore } from "../../store/useAppStore";
import { CustomGame } from "../../types";
import LoadingSpinner from "../common/LoadingSpinner";
import CreateCustomGameModal from "./CreateCustomGameModal";

interface PasswordModalProps {
  game: CustomGame;
  onClose: () => void;
  onSuccess: () => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({
  game,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await apiService.joinCustomGame(parseInt(game.id), password);
      onSuccess();
    } catch (error: any) {
      setError(
        error.response?.data?.message || "비밀번호가 올바르지 않습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-theme-surface rounded-lg p-6 w-full max-w-md border border-theme-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-nexus-yellow" />
            <h3 className="text-lg font-semibold text-theme-text">
              비밀번호 입력
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-theme-text-secondary hover:text-theme-text hover:bg-theme-surface-hover rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-theme-text-secondary mb-2">
            <span className="font-medium text-theme-text">{game.title}</span>{" "}
            방에 입장하려면 비밀번호를 입력하세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border rounded-md text-theme-text focus:outline-none focus:border-nexus-blue"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20 rounded-md">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-500">{error}</span>
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-theme-bg-secondary text-theme-text rounded-md hover:bg-theme-surface-hover transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!password.trim() || isSubmitting}
              className="flex-1 px-4 py-2 bg-nexus-blue text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>입장 중...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>입장하기</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CustomGameList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [customGames, setCustomGames] = useState<CustomGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "recruiting" | "in-progress" | "completed"
  >("all");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGame, setSelectedGame] = useState<CustomGame | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [joiningGame, setJoiningGame] = useState<string | null>(null);

  // URL 파라미터 확인하여 내전 생성 모달 자동 열기
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shouldCreate = urlParams.get("create");
    if (shouldCreate === "true") {
      setShowCreateModal(true);
      // URL에서 create 파라미터 제거
      navigate("/custom-games", { replace: true });
    }
  }, [navigate]);

  // 내전 목록 가져오기
  const fetchCustomGames = async () => {
    try {
      setLoading(true);

      // 사용자 인증 상태 확인
      if (!user) {
        console.log("사용자가 로그인되지 않았습니다.");
        setCustomGames([]);
        return;
      }

      console.log("사용자 정보:", user);

      const games = await apiService.getCustomGames({
        status: filterStatus === "all" ? undefined : filterStatus,
        search: searchTerm || undefined,
      });

      console.log("Fetched games:", games);

      // API CustomGame 타입을 types/index.ts CustomGame 타입으로 변환
      const convertedGames = games.map((game: any) => ({
        id: game.id.toString(),
        title: game.title,
        description: game.description || "",
        password: game.password,
        maxPlayers: game.max_players,
        currentPlayers: game.current_players_count || game.current_players || 0,
        status: game.status,
        teamComposition: game.team_composition,
        banPickMode: game.ban_pick_mode,
        allowSpectators: game.allow_spectators,
        createdAt: new Date(game.created_at),
        createdBy: game.created_by,
        participants: Array.isArray(game.participants)
          ? game.participants.map((p: any) => ({
              user_id: p.user_id || p.userId,
              nexus_nickname:
                p.nexus_nickname || p.nexusNickname || "알 수 없음",
              avatar_url: p.avatar_url || p.avatarUrl,
              role: p.role || "participant",
              joined_at: p.joined_at || p.joinedAt,
            }))
          : [],
      }));

      console.log("Converted games:", convertedGames);
      setCustomGames(convertedGames);
    } catch (error) {
      console.error("Failed to fetch custom games:", error);
      setCustomGames([]); // 에러 시 빈 배열로 설정
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드 및 필터 변경 시 데이터 가져오기
  useEffect(() => {
    fetchCustomGames();
  }, [filterStatus, searchTerm]);

  // 새로고침
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCustomGames();
    setRefreshing(false);
  };

  const filteredGames = customGames.filter((game) => {
    const matchesSearch =
      game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (game.description &&
        game.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      filterStatus === "all" || game.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: CustomGame["status"]) => {
    switch (status) {
      case "recruiting":
        return "text-nexus-yellow";
      case "in-progress":
        return "text-nexus-blue";
      case "completed":
        return "text-nexus-green";
      default:
        return "text-nexus-light-gray";
    }
  };

  const getStatusText = (status: CustomGame["status"]) => {
    switch (status) {
      case "recruiting":
        return "모집 중";
      case "in-progress":
        return "진행 중";
      case "completed":
        return "완료";
      default:
        return "알 수 없음";
    }
  };

  const getTeamCompositionText = (
    composition: CustomGame["teamComposition"]
  ) => {
    switch (composition) {
      case "auction":
        return "경매";
      case "rock-paper-scissors":
        return "가위바위보";
      case "none":
        return "없음";
      default:
        return "알 수 없음";
    }
  };

  const handleGameClick = (game: CustomGame) => {
    // 더블클릭 이벤트는 별도로 처리
  };

  const handleGameDoubleClick = (game: CustomGame) => {
    handleJoinGame(game);
  };

  const handleJoinGame = (game: CustomGame) => {
    if (game.password) {
      setSelectedGame(game);
      setShowPasswordModal(true);
    } else {
      handleJoinGameWithoutPassword(game);
    }
  };

  const handleJoinGameWithoutPassword = async (game: CustomGame) => {
    try {
      setJoiningGame(game.id);

      // 토큰 상태 확인
      const token = localStorage.getItem("token");
      console.log("현재 토큰:", token ? "존재함" : "없음");
      console.log("사용자 정보:", user);

      if (!token) {
        alert("로그인이 필요합니다. 다시 로그인해주세요.");
        window.location.href = "/login";
        return;
      }

      await apiService.joinCustomGame(parseInt(game.id));
      console.log("내전 입장 성공:", game.id);
      navigate(`/custom-games/${game.id}`);
    } catch (error: any) {
      console.error("Failed to join game:", error);

      // 401 오류인 경우 로그인 페이지로 이동
      if (error.response?.status === 401) {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
        window.location.href = "/login";
        return;
      }

      alert("방 입장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setJoiningGame(null);
    }
  };

  const handlePasswordSuccess = () => {
    if (selectedGame) {
      setShowPasswordModal(false);
      setSelectedGame(null);
      navigate(`/custom-games/${selectedGame.id}`);
    }
  };

  const handleCreateGame = (game: CustomGame) => {
    setCustomGames((prev) => [game, ...prev]);
    setShowCreateModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-bg text-theme-text flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" text="내전 목록을 불러오는 중..." />
          <p className="text-theme-text-secondary mt-4">
            잠시만 기다려주세요...
          </p>
        </div>
      </div>
    );
  }

  // 사용자가 로그인하지 않은 경우
  if (!user) {
    return (
      <div className="min-h-screen bg-theme-bg text-theme-text flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            로그인이 필요합니다
          </h2>
          <p className="text-theme-text-secondary mb-6">
            내전 기능을 이용하려면 로그인해주세요.
          </p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="bg-nexus-blue hover:bg-nexus-blue-dark text-white px-6 py-2 rounded-lg transition-colors"
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Trophy className="w-8 h-8 text-nexus-yellow" />
              <h1 className="text-3xl font-bold text-theme-text">내전 목록</h1>
            </div>
            <p className="text-theme-text-secondary">
              다른 플레이어들과 함께 내전을 즐겨보세요
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-nexus-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>내전 생성</span>
          </button>
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-theme-surface rounded-lg p-6 mb-6 border border-theme-border">
          <div className="flex flex-wrap items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-text-secondary" />
                <input
                  type="text"
                  placeholder="내전 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text placeholder-theme-text-muted focus:outline-none focus:border-nexus-blue"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-text-secondary" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="pl-10 pr-8 py-2 bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text focus:outline-none focus:border-nexus-blue appearance-none"
                >
                  <option value="all">전체</option>
                  <option value="recruiting">모집 중</option>
                  <option value="in-progress">진행 중</option>
                  <option value="completed">완료</option>
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-3 py-2 bg-theme-bg-secondary text-theme-text rounded-lg hover:bg-theme-surface-hover transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
                <span>새로고침</span>
              </button>
              <div className="text-sm text-theme-text-secondary">
                총 {filteredGames.length}개의 내전
              </div>
            </div>
          </div>
        </div>

        {/* 내전 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Trophy className="w-16 h-16 text-theme-text-muted mx-auto mb-4" />
              <p className="text-theme-text-muted text-lg mb-2">
                {searchTerm || filterStatus !== "all"
                  ? "검색 결과가 없습니다."
                  : "아직 내전이 없습니다."}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-nexus-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                첫 번째 내전 생성하기
              </button>
            </div>
          ) : (
            filteredGames.map((game) => (
              <div
                key={game.id}
                onDoubleClick={() => handleGameDoubleClick(game)}
                className="bg-theme-surface rounded-lg p-6 hover:bg-theme-surface-hover transition-colors cursor-pointer border border-theme-border group"
              >
                {/* 헤더 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-theme-text mb-1 group-hover:text-nexus-blue transition-colors">
                      {game.title}
                    </h3>
                    <p className="text-sm text-theme-text-secondary line-clamp-2">
                      {game.description || "설명 없음"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {game.password && (
                      <Lock className="w-4 h-4 text-nexus-yellow" />
                    )}
                    {game.allowSpectators ? (
                      <Eye className="w-4 h-4 text-nexus-green" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-nexus-light-gray" />
                    )}
                  </div>
                </div>

                {/* 상태 및 정보 */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium ${getStatusColor(
                        game.status
                      )}`}
                    >
                      {getStatusText(game.status)}
                    </span>
                    <span className="text-xs text-nexus-light-gray">
                      {new Date(game.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-nexus-blue" />
                      <span className="text-nexus-light-gray">
                        {game.currentPlayers}/{game.maxPlayers}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-nexus-green" />
                      <span className="text-nexus-light-gray">
                        {formatDistanceToNow(game.createdAt, {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 설정 정보 */}
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-nexus-light-gray">팀 구성:</span>
                    <span className="text-theme-text font-medium">
                      {getTeamCompositionText(game.teamComposition)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-nexus-light-gray">밴픽:</span>
                    <span className="text-theme-text font-medium">
                      {game.banPickMode}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-nexus-light-gray">관전:</span>
                    <span className="text-theme-text font-medium">
                      {game.allowSpectators ? "허용" : "비허용"}
                    </span>
                  </div>
                </div>

                {/* 참가자 목록 */}
                {game.participants && game.participants.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-nexus-gray">
                    <h4 className="text-sm font-medium text-nexus-light-gray mb-2 flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>참가자</span>
                    </h4>
                    <div className="space-y-1">
                      {game.participants
                        .slice(0, 3)
                        .map((participant: any, index: number) => {
                          const nickname =
                            participant.nexus_nickname || "알 수 없음";
                          const firstChar =
                            nickname.charAt(0)?.toUpperCase() || "?";

                          return (
                            <div
                              key={
                                participant.user_id || `participant-${index}`
                              }
                              className="flex items-center space-x-2"
                            >
                              <div className="w-6 h-6 bg-nexus-gray rounded-full flex items-center justify-center">
                                <span className="text-xs text-white">
                                  {firstChar}
                                </span>
                              </div>
                              <span className="text-xs text-nexus-light-gray">
                                {nickname}
                              </span>
                              {participant.role === "leader" && (
                                <Crown className="w-3 h-3 text-nexus-yellow" />
                              )}
                            </div>
                          );
                        })}
                      {game.participants.length > 3 && (
                        <div className="text-xs text-nexus-light-gray">
                          +{game.participants.length - 3}명 더
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 액션 버튼 */}
                <div className="mt-4 pt-4 border-t border-nexus-gray">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoinGame(game);
                    }}
                    disabled={joiningGame === game.id}
                    className="w-full px-4 py-2 bg-nexus-blue text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {joiningGame === game.id ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>입장 중...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        <span>
                          {game.status === "recruiting"
                            ? "참가하기"
                            : "상세보기"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 내전 생성 모달 */}
        {showCreateModal && (
          <CreateCustomGameModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateGame}
          />
        )}

        {/* 비밀번호 입력 모달 */}
        {showPasswordModal && selectedGame && (
          <PasswordModal
            game={selectedGame}
            onClose={() => {
              setShowPasswordModal(false);
              setSelectedGame(null);
            }}
            onSuccess={handlePasswordSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default CustomGameList;
