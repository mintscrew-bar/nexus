import { ArrowLeft, Shield, Users, Wifi } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import apiService from "../../services/api";
import socketService from "../../services/socket";
import { useAppStore } from "../../store/useAppStore";
import AuctionSystem from "./AuctionSystem";
import GameChat from "./GameChat";
import LineSelection from "./LineSelection";
import RockPaperScissors from "./RockPaperScissors";
import TeamFormation from "./TeamFormation";
import TeamLeaderElection from "./TeamLeaderElection";

interface CustomGameDetailProps {}

interface CustomGame {
  id: number;
  title: string;
  description?: string;
  status:
    | "recruiting"
    | "in-progress"
    | "completed"
    | "team-leader-election"
    | "team-formation"
    | "line-selection";
  max_players: number;
  current_players: number;
  created_by: number;
  creator_nickname: string;
  created_at: string;
  updated_at: string;
  password?: string;
  team_composition: "none" | "auction" | "rock-paper-scissors";
  ban_pick_mode: string;
  allow_spectators: boolean;
  creator_avatar?: string;
  participants?: Array<{
    user_id: number;
    nexus_nickname: string;
    avatar_url?: string;
    role?: string;
    joined_at: string;
  }>;
}

const CustomGameDetail: React.FC<CustomGameDetailProps> = () => {
  const params = useParams<{ id: string }>();
  const { id } = params;
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppStore();
  
  // 디버깅을 위한 로그
  console.log("CustomGameDetail 마운트, 전체 params:", params);
  console.log("CustomGameDetail 마운트, id:", id);
  console.log("CustomGameDetail 마운트, location:", location);
  
  // URL에서 직접 gameId 추출 (fallback)
  const pathname = window.location.pathname;
  const urlGameId = pathname.match(/\/custom-games\/(\d+)/)?.[1];
  console.log("CustomGameDetail 마운트, pathname:", pathname);
  console.log("CustomGameDetail 마운트, urlGameId:", urlGameId);
  
  // useParams에서 가져온 id가 없으면 URL에서 추출한 값 사용
  const gameId = id || urlGameId;
  console.log("CustomGameDetail 마운트, 최종 gameId:", gameId);
  const [game, setGame] = useState<CustomGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [tournament, setTournament] = useState<any>(null);
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);
  const [linePositions, setLinePositions] = useState<any[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [teamFormationPhase, setTeamFormationPhase] = useState<
    "auction" | "rps" | "none" | null
  >(null);
  const [onlineParticipants, setOnlineParticipants] = useState<Set<number>>(
    new Set()
  );
  const [gameProgress, setGameProgress] = useState<{
    phase: string;
    timeRemaining: number;
    currentStep: string;
  } | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [isSpectator, setIsSpectator] = useState(false);
  const [spectators, setSpectators] = useState<any[]>([]);

  // 참가자 상태 확인 관련 상태
  const [isParticipant, setIsParticipant] = useState<boolean | null>(null);
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [shouldMaintainGame, setShouldMaintainGame] = useState<boolean>(true);
  const [maintenanceCheckInterval, setMaintenanceCheckInterval] =
    useState<NodeJS.Timeout | null>(null);

  // 참가자 상태 확인
  const checkParticipantStatus = useCallback(async () => {
    if (!gameId || !user?.id) return;

    try {
      const response = await apiService.checkParticipantStatus(
        parseInt(gameId),
        user.id
      );
      setIsParticipant(response.data.isParticipant);
    } catch (error) {
      console.error("참가자 상태 확인 실패:", error);
      setIsParticipant(false);
    }
  }, [gameId, user?.id]);

  // 참가자 수 확인
  const checkParticipantsCount = useCallback(async () => {
    if (!gameId) return;

    try {
      const response = await apiService.getParticipantsCount(parseInt(gameId));
      setParticipantCount(response.data.participantCount);
    } catch (error) {
      console.error("참가자 수 확인 실패:", error);
    }
  }, [gameId]);

  // 게임 유지 상태 확인
  const checkGameMaintenance = useCallback(async () => {
    if (!gameId) return;

    try {
      const response = await apiService.checkGameMaintenance(parseInt(gameId));
      const { shouldMaintain, activeParticipants } = response.data;

      setShouldMaintainGame(shouldMaintain);
      setParticipantCount(activeParticipants);

      // 참가자가 없으면 게임 종료 처리
      if (!shouldMaintain && activeParticipants === 0) {
        console.log("🔄 게임에 참가자가 없어 종료 처리합니다.");
        handleGameAutoEnd();
      }
    } catch (error) {
      console.error("게임 유지 상태 확인 실패:", error);
    }
  }, [gameId]);

  // 자동 게임 종료
  const handleGameAutoEnd = useCallback(async () => {
    if (!gameId) return;

    try {
      await apiService.endCustomGame(parseInt(gameId));
      console.log("✅ 게임이 자동으로 종료되었습니다.");

      // 게임 상태 업데이트
      setGame((prev: CustomGame | null) =>
        prev ? { ...prev, status: "completed" } : null
      );

      // 조용히 메인 페이지로 리다이렉트 (alert 제거)
      navigate("/");
    } catch (error) {
      console.error("게임 자동 종료 실패:", error);
    }
  }, [gameId, navigate]);

  // 주기적 상태 확인 시작
  const startMaintenanceCheck = useCallback(() => {
    if (maintenanceCheckInterval) {
      clearInterval(maintenanceCheckInterval);
    }

    const interval = setInterval(() => {
      checkGameMaintenance();
    }, 30000); // 30초마다 확인

    setMaintenanceCheckInterval(interval);
  }, [checkGameMaintenance, maintenanceCheckInterval]);

  // 주기적 상태 확인 중지
  const stopMaintenanceCheck = useCallback(() => {
    if (maintenanceCheckInterval) {
      clearInterval(maintenanceCheckInterval);
      setMaintenanceCheckInterval(null);
    }
  }, [maintenanceCheckInterval]);

  // 게임 상세 정보 가져오기
  const fetchGameDetail = useCallback(async () => {
    if (!gameId) return;

    console.log("게임 상세 정보 가져오기 시작, gameId:", gameId);
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getCustomGame(parseInt(gameId));
      console.log("게임 상세 정보 응답:", response);
      setGame(response);
    } catch (error: any) {
      console.error("게임 상세 정보 가져오기 실패:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "게임 정보를 가져오는데 실패했습니다."
      );
    } finally {
      console.log("게임 상세 정보 로딩 완료");
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    console.log("CustomGameDetail useEffect 실행, gameId:", gameId);
    console.log("CustomGameDetail useEffect 실행, 전체 params:", params);

    if (!gameId) {
      console.warn("⚠️ gameId가 없어서 fetchGameDetail을 건너뜁니다");
      return;
    }

    fetchGameDetail();

    // 컴포넌트 언마운트 시 정리
    return () => {
      console.log("CustomGameDetail 컴포넌트 언마운트");
      stopMaintenanceCheck();
    };
  }, [
    gameId,
    checkParticipantStatus,
    checkParticipantsCount,
    startMaintenanceCheck,
    stopMaintenanceCheck,
    fetchGameDetail,
  ]);

  // 토너먼트 정보 가져오기
  useEffect(() => {
    const fetchTournament = async () => {
      if (!gameId) return;

      try {
        const response = await apiService.getTournamentByGame(parseInt(gameId));
        if (response.data && response.data.tournament) {
          setTournament(response.data.tournament);
        }
      } catch (error) {
        // 토너먼트가 없으면 무시
        console.log("No tournament found for this game");
      }
    };

    fetchTournament();
  }, [gameId]);

  // 팀 정보 가져오기
  useEffect(() => {
    const fetchTeams = async () => {
      if (!gameId) return;

      try {
        const response = await apiService.getGameTeams(parseInt(gameId));
        setTeams(response.data.teams || []);
      } catch (error) {
        // 팀이 없으면 무시
        console.log("No teams found for this game");
      }
    };

    fetchTeams();
  }, [gameId]);

  // 라인 포지션 정보 가져오기
  useEffect(() => {
    const fetchLinePositions = async () => {
      if (!gameId) return;

      try {
        const response = await apiService.getLinePositions(parseInt(gameId));
        setLinePositions(response.data.linePositions || []);
      } catch (error) {
        // 라인 포지션이 없으면 무시
        console.log("No line positions found for this game");
      }
    };

    fetchLinePositions();
  }, [gameId]);

  useEffect(() => {
    if (!gameId) return;

    const handlePlayerJoined = (data: { userId: number }) => {
      setOnlineParticipants((prev) => new Set([...Array.from(prev), data.userId]));
    };

    const handlePlayerLeft = (data: { userId: number }) => {
      setOnlineParticipants((prev) => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    };

    const handleGameProgressUpdate = (data: any) => {
      setGameProgress({
        phase: data.phase,
        timeRemaining: data.timeRemaining,
        currentStep: data.currentStep,
      });
    };

    socketService.on("custom-game:player-joined", handlePlayerJoined);
    socketService.on("custom-game:player-left", handlePlayerLeft);
    socketService.on("custom-game:progress-update", handleGameProgressUpdate);

    const handleGameUpdate = (updatedGame: CustomGame) => {
      setGame(updatedGame);
    };

    socketService.on('game:updated', handleGameUpdate);

    return () => {
      socketService.off("custom-game:player-joined", handlePlayerJoined);
      socketService.off("custom-game:player-left", handlePlayerLeft);
      socketService.off("custom-game:progress-update", handleGameProgressUpdate);
      socketService.off('game:updated', handleGameUpdate);
    };
  }, [gameId]);

  const handleLeaveGame = async () => {
    if (!gameId || !user) return;

    if (!window.confirm("정말로 이 방을 나가시겠습니까?")) {
      return;
    }

    setIsLeaving(true);
    try {
      const response = await apiService.leaveCustomGame(parseInt(gameId));
      // 방 나가기 성공 시 메시지 표시 후 내전 목록으로 이동
      if (response.message) {
        alert(response.message);
      }
      navigate("/custom-games");
    } catch (error) {
      console.error("Failed to leave game:", error);
      alert("방을 나가는데 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLeaving(false);
    }
  };

  const handleJoinGame = async () => {
    if (!game) return;

    setIsJoining(true);
    try {
      await apiService.joinCustomGame(game.id);
      apiService.getCustomGame(parseInt(gameId!)).then(setGame);
    } catch (error) {
      console.error("Failed to join game:", error);
      setError("게임 참가에 실패했습니다.");
    } finally {
      setIsJoining(false);
    }
  };

  const joinGameWithoutPassword = async () => {
    if (!game) return;

    setIsJoining(true);
    try {
      await apiService.joinCustomGame(game.id);
      apiService.getCustomGame(parseInt(gameId!)).then(setGame);
    } catch (error) {
      console.error("Failed to join game:", error);
      alert("게임 참가에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleJoinWithPassword = async () => {
    if (!game) return;

    setIsJoining(true);
    try {
      await apiService.joinCustomGame(game.id, password);
      setShowPasswordModal(false);
      setPassword("");
      apiService.getCustomGame(parseInt(gameId!)).then(setGame);
    } catch (error) {
      console.error("Failed to join game with password:", error);
      setError("비밀번호가 올바르지 않습니다.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleJoinAsSpectator = async () => {
    if (!user || !game) return;

    setIsJoining(true);
    try {
      await apiService.joinAsSpectator(game.id);
      setIsSpectator(true);
      // 관전자 목록 새로고침
      const response = await apiService.getGameSpectators(game.id);
      setSpectators(response.data.spectators || []);
    } catch (error) {
      console.error("Failed to join as spectator:", error);
      alert("관전자 참가에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleStartGame = async () => {
    if (!gameId || !user) return;

    if (!window.confirm("정말로 게임을 시작하시겠습니까?")) {
      return;
    }

    setIsStarting(true);
    try {
      await apiService.startCustomGame(parseInt(gameId));
      // 게임 시작 성공 시 페이지 새로고침
      apiService.getCustomGame(parseInt(gameId!)).then(setGame);
    } catch (error) {
      console.error("Failed to start game:", error);
      alert("게임 시작에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleEndGame = async () => {
    if (!gameId || !user) return;

    if (!window.confirm("정말로 게임을 종료하시겠습니까?")) {
      return;
    }

    setIsEnding(true);
    try {
      await apiService.endCustomGame(parseInt(gameId));
      // 게임 종료 성공 시 페이지 새로고침
      apiService.getCustomGame(parseInt(gameId!)).then(setGame);
    } catch (error) {
      console.error("Failed to end game:", error);
      alert("게임 종료에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsEnding(false);
    }
  };

  const handleCreateTournament = async () => {
    if (!game || !gameId) return;

    const tournamentName = window.prompt(
      "토너먼트 이름을 입력하세요:",
      `${game.title} 토너먼트`
    );
    if (!tournamentName || tournamentName.trim() === "") return;

    setIsStarting(true); // 같은 상태 변수 재사용
    try {
      await apiService.createTournament(
        parseInt(gameId),
        tournamentName.trim()
      );
      // 토너먼트 생성 성공 시 페이지 새로고침
      apiService.getCustomGame(parseInt(gameId!)).then(setGame);
    } catch (error) {
      console.error("Failed to create tournament:", error);
      alert("토너먼트 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleStartTeamLeaderElection = async () => {
    if (!gameId || !user) return;

    setIsStarting(true);
    try {
      await apiService.startTeamLeaderElection(parseInt(gameId));
      apiService.getCustomGame(parseInt(gameId!)).then(setGame);
    } catch (error) {
      console.error("Failed to start team leader election:", error);
      alert("팀장 선출 시작에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleStartLineSelection = async () => {
    if (!gameId || !user) return;

    setIsStarting(true);
    try {
      await apiService.startLineSelection(parseInt(gameId));
      apiService.getCustomGame(parseInt(gameId!)).then(setGame);
    } catch (error) {
      console.error("Failed to start line selection:", error);
      alert("라인 선택 시작에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleStartActualGame = async () => {
    if (!gameId || !user) return;

    setIsStarting(true);
    try {
      await apiService.startGame(parseInt(gameId));
      apiService.getCustomGame(parseInt(gameId!)).then(setGame);
    } catch (error) {
      console.error("Failed to start game:", error);
      alert("게임 시작에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-bg flex items-center justify-center">
        <div className="text-theme-text">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-theme-bg flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-theme-bg flex items-center justify-center">
        <div className="text-theme-text">게임을 찾을 수 없습니다.</div>
      </div>
    );
  }

  const getParticipantStatus = (participant: any) => {
    const isOnline = onlineParticipants.has(participant.user_id);
    return {
      isOnline,
      statusText: isOnline ? "온라인" : "오프라인",
      statusColor: isOnline ? "text-green-500" : "text-gray-500",
    };
  };

  const getGameProgressInfo = () => {
    if (!gameProgress) return null;

    const phaseText = {
      recruiting: "모집 중",
      "team-leader-election": "팀장 선출",
      "team-formation": "팀 구성",
      "line-selection": "라인 선택",
      "in-progress": "게임 진행",
      completed: "완료",
    };

    return {
      phase:
        phaseText[gameProgress.phase as keyof typeof phaseText] ||
        gameProgress.phase,
      timeRemaining: gameProgress.timeRemaining,
      currentStep: gameProgress.currentStep,
    };
  };

  return (
    <div className="min-h-screen bg-nexus-dark">
      {/* 헤더 */}
      <div className="bg-theme-surface border-b border-theme-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/custom-games")}
                className="p-2 text-theme-text-secondary hover:text-theme-text hover:bg-theme-surface-hover rounded-md transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-theme-text">
                {game.title}
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  game.status === "recruiting"
                    ? "bg-green-500 text-white"
                    : game.status === "team-leader-election"
                    ? "bg-yellow-500 text-black"
                    : game.status === "team-formation"
                    ? "bg-blue-500 text-white"
                    : game.status === "line-selection"
                    ? "bg-purple-500 text-white"
                    : game.status === "in-progress"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-500 text-white"
                }`}
              >
                {game.status === "recruiting"
                  ? "모집 중"
                  : game.status === "team-leader-election"
                  ? "팀장 선출"
                  : game.status === "team-formation"
                  ? "팀 구성"
                  : game.status === "line-selection"
                  ? "라인 선택"
                  : game.status === "in-progress"
                  ? "진행 중"
                  : "완료"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽 - 방 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 게임 정보 */}
            <div className="bg-theme-surface rounded-lg p-6 mb-6 border border-theme-border">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-theme-text">
                  {game.title}
                </h1>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      game.status === "recruiting"
                        ? "bg-green-100 text-green-800"
                        : game.status === "in-progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {game.status === "recruiting"
                      ? "모집 중"
                      : game.status === "in-progress"
                      ? "진행 중"
                      : "완료"}
                  </span>
                </div>
              </div>

              {/* 참가자 상태 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-theme-bg-secondary rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-nexus-blue" />
                    <span className="text-sm font-medium text-theme-text-secondary">
                      참가자
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-theme-text">
                    {participantCount}/{game.max_players}
                  </p>
                </div>

                <div className="bg-theme-bg-secondary rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Wifi
                      className={`w-5 h-5 ${
                        shouldMaintainGame ? "text-green-500" : "text-red-500"
                      }`}
                    />
                    <span className="text-sm font-medium text-theme-text-secondary">
                      방 상태
                    </span>
                  </div>
                  <p
                    className={`text-lg font-semibold ${
                      shouldMaintainGame ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {shouldMaintainGame ? "활성" : "비활성"}
                  </p>
                </div>

                <div className="bg-theme-bg-secondary rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Shield
                      className={`w-5 h-5 ${
                        isParticipant ? "text-green-500" : "text-gray-500"
                      }`}
                    />
                    <span className="text-sm font-medium text-theme-text-secondary">
                      내 상태
                    </span>
                  </div>
                  <p
                    className={`text-lg font-semibold ${
                      isParticipant ? "text-green-600" : "text-gray-600"
                    }`}
                  >
                    {isParticipant === null
                      ? "확인 중..."
                      : isParticipant
                      ? "참가 중"
                      : "참가 안함"}
                  </p>
                </div>
              </div>

              {game.description && (
                <p className="text-theme-text-secondary mb-4">
                  {game.description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm text-theme-text-secondary">
                <span>생성자: {game.creator_nickname}</span>
                <span>
                  생성일: {new Date(game.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* 내전 단계별 컴포넌트 */}
            {game.status === "team-leader-election" && (
              <TeamLeaderElection
                game={game}
                participants={game.participants || []}
                onComplete={() => apiService.getCustomGame(parseInt(gameId!))}
              />
            )}

            {/* 팀 구성 방식별 컴포넌트 */}
            {game.status === "team-formation" && (
              <>
                {game.team_composition === "auction" && (
                  <AuctionSystem
                    game={game}
                    participants={game.participants || []}
                    captains={[]} // 기존 방식에서는 팀장 선출 없이 사용
                    onComplete={() => apiService.getCustomGame(parseInt(gameId!))}
                  />
                )}

                {game.team_composition === "rock-paper-scissors" && (
                  <RockPaperScissors
                    game={game}
                    participants={game.participants || []}
                    captains={[]} // 기존 방식에서는 팀장 선출 없이 사용
                    onComplete={() => apiService.getCustomGame(parseInt(gameId!))}
                  />
                )}

                {game.team_composition === "none" && (
                  <TeamFormation
                    game={game}
                    onComplete={() => apiService.getCustomGame(parseInt(gameId!))}
                  />
                )}
              </>
            )}

            {game.status === "line-selection" && (
              <LineSelection
                game={game}
                onComplete={() => apiService.getCustomGame(parseInt(gameId!))}
              />
            )}

            {/* 게임 진행 상태 */}
            {getGameProgressInfo() && (
              <div className="bg-theme-surface rounded-lg p-6 border border-theme-border mb-6">
                <h2 className="text-xl font-semibold text-theme-text mb-4">
                  게임 진행 상태
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-theme-text-secondary">
                      현재 단계:
                    </span>
                    <span className="text-theme-text font-medium">
                      {getGameProgressInfo()?.phase}
                    </span>
                  </div>
                  {getGameProgressInfo()?.timeRemaining && (
                    <div className="flex items-center justify-between">
                      <span className="text-theme-text-secondary">
                        남은 시간:
                      </span>
                      <span className="text-theme-text font-medium">
                        {Math.floor(getGameProgressInfo()?.timeRemaining! / 60)}
                        분 {getGameProgressInfo()?.timeRemaining! % 60}초
                      </span>
                    </div>
                  )}
                  {getGameProgressInfo()?.currentStep && (
                    <div className="flex items-center justify-between">
                      <span className="text-theme-text-secondary">
                        현재 작업:
                      </span>
                      <span className="text-theme-text font-medium">
                        {getGameProgressInfo()?.currentStep}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 참가자 목록 */}
            <div className="bg-theme-surface rounded-lg p-6 border border-theme-border">
              <h2 className="text-xl font-semibold text-theme-text mb-4">
                참가자
              </h2>

              <div className="space-y-3">
                {game.participants && game.participants.length > 0 ? (
                  game.participants.map((participant: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-theme-bg-secondary rounded-md border border-theme-border"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-nexus-blue rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {participant.nexus_nickname?.charAt(0) || "?"}
                          </span>
                        </div>
                        <div>
                          <p className="text-theme-text font-medium">
                            {participant.nexus_nickname}
                          </p>
                          <p className="text-theme-text-secondary text-sm">
                            {participant.role === "leader" ? "방장" : "참가자"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {participant.is_online ? (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        ) : (
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        )}
                        <span className="text-theme-text-secondary text-sm">
                          {participant.is_online ? "온라인" : "오프라인"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-theme-text-secondary">
                    아직 참가자가 없습니다.
                  </div>
                )}
              </div>
            </div>

            {/* 토너먼트 정보 */}
            {tournament && (
              <div className="bg-nexus-darker rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  토너먼트
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">
                      {tournament.name}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        tournament.status === "pending"
                          ? "bg-yellow-500 text-black"
                          : tournament.status === "in-progress"
                          ? "bg-blue-500 text-white"
                          : "bg-green-500 text-white"
                      }`}
                    >
                      {tournament.status === "pending"
                        ? "대기 중"
                        : tournament.status === "in-progress"
                        ? "진행 중"
                        : "완료"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-nexus-light-gray">현재 라운드</p>
                      <p className="text-white font-medium">
                        {tournament.current_round}/{tournament.total_rounds}
                      </p>
                    </div>
                    <div>
                      <p className="text-nexus-light-gray">참가자 수</p>
                      <p className="text-white font-medium">
                        {tournament.participants?.length || 0}명
                      </p>
                    </div>
                  </div>

                  {tournament.matches && tournament.matches.length > 0 && (
                    <div>
                      <h4 className="text-md font-medium text-white mb-2">
                        진행 상황
                      </h4>
                      <div className="space-y-2">
                        {tournament.matches
                          .slice(0, 3)
                          .map((match: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-nexus-dark rounded"
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-nexus-light-gray text-sm">
                                  {match.player1_nickname} vs{" "}
                                  {match.player2_nickname}
                                </span>
                              </div>
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  match.status === "completed"
                                    ? "bg-green-500 text-white"
                                    : match.status === "in-progress"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-500 text-white"
                                }`}
                              >
                                {match.status === "completed"
                                  ? "완료"
                                  : match.status === "in-progress"
                                  ? "진행 중"
                                  : "대기"}
                              </span>
                            </div>
                          ))}
                        {tournament.matches.length > 3 && (
                          <p className="text-nexus-light-gray text-sm text-center">
                            +{tournament.matches.length - 3}개 더...
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setShowTournamentModal(true)}
                    className="w-full px-4 py-2 bg-nexus-blue text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    대진표 보기
                  </button>
                </div>
              </div>
            )}

            {/* 채팅 */}
            {showChat && (
              <div className="lg:col-span-3">
                <GameChat gameId={parseInt(gameId!)} />
              </div>
            )}
          </div>

          {/* 오른쪽 - 액션 패널 */}
          <div className="space-y-6">
            {/* 방장 정보 */}
            <div className="bg-nexus-darker rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">방장</h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-nexus-blue rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {game.participants
                      ?.find((p: any) => p.role === "leader")
                      ?.nexus_nickname?.charAt(0) ||
                      game.creator_nickname?.charAt(0) ||
                      "?"}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">
                    {game.participants?.find((p: any) => p.role === "leader")
                      ?.nexus_nickname || game.creator_nickname}
                  </p>
                  <p className="text-nexus-light-gray text-sm">방장</p>
                </div>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="bg-nexus-darker rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">액션</h3>

              <div className="space-y-3">
                {/* 참가자 여부 확인 */}
                {game.participants &&
                game.participants.some((p: any) => p.user_id === user?.id) ? (
                  // 이미 참가 중인 경우
                  <button
                    onClick={handleLeaveGame}
                    disabled={isLeaving}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLeaving ? "나가는 중..." : "방 나가기"}
                  </button>
                ) : (
                  // 참가하지 않은 경우
                  <button
                    onClick={handleJoinGame}
                    disabled={isJoining}
                    className="w-full px-4 py-2 bg-nexus-blue text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isJoining ? "참가 중..." : "참가하기"}
                  </button>
                )}

                {/* 방장이고 게임이 모집 중일 때만 팀 구성 시작 버튼 표시 */}
                {game.participants &&
                  game.participants.some(
                    (p: any) => p.user_id === user?.id && p.role === "leader"
                  ) &&
                  game.status === "recruiting" && (
                    <button
                      onClick={handleStartTeamLeaderElection}
                      disabled={isStarting}
                      className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isStarting ? "팀 구성 시작 중..." : "팀 구성 시작"}
                    </button>
                  )}

                {/* 방장이고 게임이 모집 중일 때만 토너먼트 시작 버튼 표시 */}
                {game.participants &&
                  game.participants.some(
                    (p: any) => p.user_id === user?.id && p.role === "leader"
                  ) &&
                  game.status === "recruiting" && (
                    <button
                      onClick={handleCreateTournament}
                      disabled={isStarting}
                      className="w-full px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isStarting ? "토너먼트 생성 중..." : "토너먼트 시작"}
                    </button>
                  )}

                {/* 방장이고 팀 구성 완료 후 라인 선택 시작 버튼 */}
                {game.participants &&
                  game.participants.some(
                    (p: any) => p.user_id === user?.id && p.role === "leader"
                  ) &&
                  game.status === "team-formation" &&
                  teams.length > 0 && (
                    <button
                      onClick={handleStartLineSelection}
                      disabled={isStarting}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isStarting ? "라인 선택 시작 중..." : "라인 선택 시작"}
                    </button>
                  )}

                {/* 방장이고 라인 선택 완료 후 게임 시작 버튼 */}
                {game.participants &&
                  game.participants.some(
                    (p: any) => p.user_id === user?.id && p.role === "leader"
                  ) &&
                  game.status === "line-selection" &&
                  linePositions.length >= game.current_players && (
                    <button
                      onClick={handleStartActualGame}
                      disabled={isStarting}
                      className="w-full px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isStarting ? "게임 시작 중..." : "게임 시작"}
                    </button>
                  )}

                {/* 방장이고 게임이 진행 중일 때만 종료 버튼 표시 */}
                {game.participants &&
                  game.participants.some(
                    (p: any) => p.user_id === user?.id && p.role === "leader"
                  ) &&
                  game.status === "in-progress" && (
                    <button
                      onClick={handleEndGame}
                      disabled={isEnding}
                      className="w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isEnding ? "종료 중..." : "게임 종료"}
                    </button>
                  )}

                <button
                  onClick={() => setShowChat(!showChat)}
                  className="w-full px-4 py-2 bg-nexus-gray text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  {showChat ? "채팅 숨기기" : "채팅"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 비밀번호 입력 모달 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-theme-surface rounded-lg p-6 w-full max-w-md border border-theme-border">
            <h3 className="text-xl font-semibold text-theme-text mb-4">
              비밀번호 입력
            </h3>
            <p className="text-theme-text-secondary mb-4">
              이 방은 비밀번호가 설정되어 있습니다. 비밀번호를 입력해주세요.
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border rounded-md text-theme-text placeholder-theme-text-muted focus:outline-none focus:border-nexus-blue mb-4"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleJoinWithPassword();
                }
              }}
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword("");
                }}
                className="flex-1 px-4 py-2 bg-theme-bg-secondary text-theme-text rounded-md hover:bg-theme-surface-hover transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleJoinWithPassword}
                disabled={!password.trim() || isJoining}
                className="flex-1 px-4 py-2 bg-nexus-blue text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoining ? "참가 중..." : "참가하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomGameDetail;
