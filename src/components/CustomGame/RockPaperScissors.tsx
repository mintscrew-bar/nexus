import {
  AlertCircle,
  CheckCircle,
  Hand,
  Scissors,
  Square,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import apiService from "../../services/api";
import socketService from "../../services/socket";
import { useAppStore } from "../../store/useAppStore";
import LoadingSpinner from "../common/LoadingSpinner";

interface RockPaperScissorsProps {
  game: any;
  participants: any[];
  captains: any[]; // 팀장들만 참여
  onComplete: (results: any) => void;
}

interface RPSChoice {
  id: number;
  user_id: number;
  nexus_nickname: string;
  choice: "rock" | "paper" | "scissors";
  created_at: string;
}

interface RPSRound {
  round: number;
  participants: any[];
  choices: RPSChoice[];
  winners: any[];
  losers: any[];
  isComplete: boolean;
}

const RockPaperScissors: React.FC<RockPaperScissorsProps> = ({
  game,
  participants,
  captains,
  onComplete,
}) => {
  const { user } = useAppStore();
  const [choices, setChoices] = useState<RPSChoice[]>([]);
  const [userChoice, setUserChoice] = useState<
    "rock" | "paper" | "scissors" | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // 30초 선택 시간
  const [showResults, setShowResults] = useState(false);
  const [currentRound, setCurrentRound] = useState<RPSRound | null>(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [gamePhase, setGamePhase] = useState<
    "waiting" | "choosing" | "results" | "complete"
  >("waiting");
  const [teams, setTeams] = useState<any[]>([]);
  const [choiceAnimations, setChoiceAnimations] = useState<
    { id: number; choice: string; user: string }[]
  >([]);
  const [resultAnimations, setResultAnimations] = useState<
    { id: number; type: "win" | "lose" | "draw" }[]
  >([]);

  // 추가된 상태 변수들
  const [results, setResults] = useState<any>(null);
  const [winners, setWinners] = useState<any[]>([]);
  const [losers, setLosers] = useState<any[]>([]);
  const [rpsPhase, setRPSPhase] = useState<string>("waiting");

  useEffect(() => {
    initializeRPS();
    setupRealtimeConnection();
  }, []);

  useEffect(() => {
    if (gamePhase === "choosing" && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gamePhase === "choosing") {
      autoSelectForTimeout();
    }
  }, [timeLeft, gamePhase]);

  const initializeRPS = () => {
    setGamePhase("choosing");
    setCurrentRound({
      round: 1,
      participants: [...captains], // 팀장들만 참여
      choices: [],
      winners: [],
      losers: [],
      isComplete: false,
    });
    addNotification("가위바위보가 시작되었습니다! ✂️✋🪨");
  };

  const setupRealtimeConnection = () => {
    // Socket.IO 연결은 중앙에서 관리되므로 여기서는 연결하지 않음

    // 가위바위보 선택 이벤트 리스너
    socketService.onRPSChoice((data) => {
      const { user_id, user_nickname, choice } = data;
      const newChoice: RPSChoice = {
        id: Date.now(),
        user_id,
        nexus_nickname: user_nickname,
        choice,
        created_at: new Date().toISOString(),
      };
      setChoices((prev) => [...prev, newChoice]);
      addNotification(`${user_nickname}님이 선택했습니다! ✨`);
    });

    // 가위바위보 결과 이벤트 리스너
    socketService.onRPSResults((data) => {
      setResults(data.results);
      setShowResults(true);
      addNotification("가위바위보 결과가 나왔습니다! 🎯");
    });

    // 가위바위보 완료 이벤트 리스너
    socketService.onRPSComplete((data) => {
      setWinners(data.results.winners);
      setLosers(data.results.losers);
      setRPSPhase("completed");
      addNotification("가위바위보가 완료되었습니다! 🎉");
    });
  };

  const addChoiceAnimation = (choice: string, user: string) => {
    const animation = {
      id: Date.now(),
      choice,
      user,
    };
    setChoiceAnimations((prev) => [...prev, animation]);
    setTimeout(() => {
      setChoiceAnimations((prev) => prev.filter((a) => a.id !== animation.id));
    }, 3000);
  };

  const addResultAnimation = (type: "win" | "lose" | "draw") => {
    const animation = {
      id: Date.now(),
      type,
    };
    setResultAnimations((prev) => [...prev, animation]);
    setTimeout(() => {
      setResultAnimations((prev) => prev.filter((a) => a.id !== animation.id));
    }, 2000);
  };

  const addNotification = (message: string) => {
    const newNotification = `${new Date().toLocaleTimeString()} - ${message}`;
    setNotifications((prev) => [...prev.slice(-4), newNotification]);
  };

  const autoSelectForTimeout = () => {
    if (!userChoice && canParticipate()) {
      const randomChoice = ["rock", "paper", "scissors"][
        Math.floor(Math.random() * 3)
      ] as "rock" | "paper" | "scissors";
      handleMakeChoice(randomChoice);
      addNotification("시간 초과로 자동 선택되었습니다! ⏰");
    }
  };

  const loadChoices = async () => {
    try {
      const response = await apiService.getRPSResults(game.id);
      setChoices(response.data.choices || []);
    } catch (error) {
      console.error("Failed to load choices:", error);
    }
  };

  const handleMakeChoice = async (choice: "rock" | "paper" | "scissors") => {
    if (isSubmitting || !canParticipate()) return;

    setIsSubmitting(true);
    try {
      await apiService.playRockPaperScissors(game.id, choice);

      setUserChoice(choice);
      addNotification(`당신이 ${getChoiceName(choice)}을(를) 선택했습니다! 🎯`);

      // 선택 애니메이션
      addChoiceAnimation(choice, user!.nexusNickname);
    } catch (error) {
      console.error("Failed to make choice:", error);
      addNotification("선택에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showRoundResults = () => {
    setGamePhase("results");
    setShowResults(true);

    const winners = getWinners();
    const losers = getLosers();

    if (winners.length === 1) {
      addNotification(`${winners[0].nexus_nickname}님이 승리했습니다! 🏆`);
      addResultAnimation("win");
    } else if (winners.length > 1) {
      addNotification("무승부입니다! 다시 시작합니다. 🤝");
      addResultAnimation("draw");
    } else {
      addNotification("모든 참가자가 패배했습니다! 😅");
      addResultAnimation("lose");
    }

    // 3초 후 다음 라운드 또는 게임 종료
    setTimeout(() => {
      if (winners.length === 1) {
        // 승자가 결정되면 게임 종료
        setGamePhase("complete");
        onComplete({ winner: winners[0], teams: [] });
      } else {
        // 무승부면 다음 라운드
        startNextRound(winners);
      }
    }, 3000);
  };

  const startNextRound = (winners: any[]) => {
    setRoundNumber(roundNumber + 1);
    setChoices([]);
    setUserChoice(null);
    setShowResults(false);
    setTimeLeft(30);
    setGamePhase("choosing");

    setCurrentRound({
      round: roundNumber + 1,
      participants: winners,
      choices: [],
      winners: [],
      losers: [],
      isComplete: false,
    });

    addNotification(`라운드 ${roundNumber + 1}가 시작되었습니다! 🔄`);
  };

  const getChoiceIcon = (choice: string) => {
    switch (choice) {
      case "rock":
        return <Square className="w-6 h-6" />;
      case "paper":
        return <Hand className="w-6 h-6" />;
      case "scissors":
        return <Scissors className="w-6 h-6" />;
      default:
        return <AlertCircle className="w-6 h-6" />;
    }
  };

  const getChoiceName = (choice: string) => {
    switch (choice) {
      case "rock":
        return "바위";
      case "paper":
        return "보";
      case "scissors":
        return "가위";
      default:
        return "알 수 없음";
    }
  };

  const getWinner = () => {
    const choices = currentRound?.choices || [];
    if (choices.length === 0) return null;

    const rockCount = choices.filter((c) => c.choice === "rock").length;
    const paperCount = choices.filter((c) => c.choice === "paper").length;
    const scissorsCount = choices.filter((c) => c.choice === "scissors").length;

    if (rockCount > 0 && paperCount > 0 && scissorsCount > 0) return null; // 무승부
    if (rockCount > 0 && paperCount > 0) return "paper"; // 보가 이김
    if (rockCount > 0 && scissorsCount > 0) return "rock"; // 바위가 이김
    if (paperCount > 0 && scissorsCount > 0) return "scissors"; // 가위가 이김

    return null; // 모두 같은 선택
  };

  const getWinners = () => {
    const winningChoice = getWinner();
    if (!winningChoice) return [];
    return choices.filter((c) => c.choice === winningChoice);
  };

  const getLosers = () => {
    const winningChoice = getWinner();
    if (!winningChoice) return [];
    return choices.filter((c) => c.choice !== winningChoice);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const hasUserMadeChoice = () => {
    return choices.some((c) => c.user_id === user?.id);
  };

  const getUserChoice = () => {
    return choices.find((c) => c.user_id === user?.id);
  };

  const canParticipate = () => {
    return user && captains.some((c) => c.user_id === user.id);
  };

  if (gamePhase === "waiting") {
    return (
      <div className="bg-theme-surface rounded-lg p-6 border border-theme-border">
        <LoadingSpinner size="lg" text="가위바위보 준비 중..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 게임 헤더 */}
      <div className="bg-theme-surface rounded-lg p-6 border border-theme-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Hand className="w-6 h-6 text-nexus-blue" />
            <h2 className="text-xl font-semibold text-theme-text">
              가위바위보
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-theme-text-secondary">
              라운드: {roundNumber}
            </div>
            <div className="text-sm text-theme-text-secondary">
              참가자: {captains.length}명
            </div>
          </div>
        </div>

        {/* 게임 상태 */}
        <div className="bg-theme-bg-secondary rounded-lg p-4 border border-theme-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-theme-text">
                {gamePhase === "choosing" ? "선택 중..." : "결과 확인"}
              </h3>
              <p className="text-sm text-theme-text-secondary">
                {gamePhase === "choosing"
                  ? "가위, 바위, 보 중 하나를 선택하세요!"
                  : "결과를 확인하세요"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-nexus-yellow">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-theme-text-secondary">
                {choices.length}/{captains.length} 선택 완료
              </div>
            </div>
          </div>

          {/* 선택 버튼 */}
          {gamePhase === "choosing" &&
            canParticipate() &&
            !hasUserMadeChoice() && (
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => handleMakeChoice("rock")}
                  disabled={isSubmitting}
                  className="p-4 bg-theme-surface border border-theme-border rounded-lg hover:bg-theme-bg-secondary transition-colors disabled:opacity-50"
                >
                  <Square className="w-8 h-8 text-nexus-blue mb-2" />
                  <div className="text-sm font-medium text-theme-text">
                    바위
                  </div>
                </button>
                <button
                  onClick={() => handleMakeChoice("paper")}
                  disabled={isSubmitting}
                  className="p-4 bg-theme-surface border border-theme-border rounded-lg hover:bg-theme-bg-secondary transition-colors disabled:opacity-50"
                >
                  <Hand className="w-8 h-8 text-nexus-green mb-2" />
                  <div className="text-sm font-medium text-theme-text">보</div>
                </button>
                <button
                  onClick={() => handleMakeChoice("scissors")}
                  disabled={isSubmitting}
                  className="p-4 bg-theme-surface border border-theme-border rounded-lg hover:bg-theme-bg-secondary transition-colors disabled:opacity-50"
                >
                  <Scissors className="w-8 h-8 text-nexus-yellow mb-2" />
                  <div className="text-sm font-medium text-theme-text">
                    가위
                  </div>
                </button>
              </div>
            )}

          {/* 사용자 선택 표시 */}
          {hasUserMadeChoice() && (
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-nexus-blue/20 px-4 py-2 rounded-lg">
                <span className="text-theme-text">내 선택:</span>
                {getChoiceIcon(getUserChoice()?.choice || "")}
                <span className="text-theme-text font-medium">
                  {getChoiceName(getUserChoice()?.choice || "")}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 선택 애니메이션 */}
        {choiceAnimations.map((animation) => (
          <div
            key={animation.id}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-nexus-blue text-white px-4 py-2 rounded-lg animate-bounce z-50"
          >
            {animation.user}: {getChoiceName(animation.choice)}
          </div>
        ))}

        {/* 결과 애니메이션 */}
        {resultAnimations.map((animation) => (
          <div
            key={animation.id}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          >
            {animation.type === "win" && (
              <div className="bg-green-500 text-white px-6 py-3 rounded-lg animate-bounce">
                🏆 승리!
              </div>
            )}
            {animation.type === "lose" && (
              <div className="bg-red-500 text-white px-6 py-3 rounded-lg animate-bounce">
                😅 패배!
              </div>
            )}
            {animation.type === "draw" && (
              <div className="bg-yellow-500 text-white px-6 py-3 rounded-lg animate-bounce">
                🤝 무승부!
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 참가자 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {captains.map((captain) => {
          const choice = choices.find((c) => c.user_id === captain.user_id);
          const isWinner = getWinners().some(
            (w) => w.user_id === captain.user_id
          );
          const isLoser = getLosers().some(
            (l) => l.user_id === captain.user_id
          );

          return (
            <div
              key={captain.user_id}
              className={`bg-theme-surface rounded-lg p-4 border border-theme-border transition-all ${
                choice ? "ring-2" : ""
              } ${isWinner ? "ring-green-500 bg-green-500/10" : ""} ${
                isLoser ? "ring-red-500 bg-red-500/10" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-nexus-blue rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {captain.nexus_nickname?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-theme-text">
                      {captain.nexus_nickname}
                    </h4>
                    <p className="text-xs text-theme-text-secondary">
                      {captain.user_id === user?.id ? "(나)" : ""}
                    </p>
                  </div>
                </div>
                {choice && (
                  <div className="flex items-center space-x-1">
                    {getChoiceIcon(choice.choice)}
                    <span className="text-sm text-theme-text">
                      {getChoiceName(choice.choice)}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                {choice ? (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-theme-text-secondary">상태:</span>
                    <div className="flex items-center space-x-1">
                      {isWinner && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {isLoser && <XCircle className="w-4 h-4 text-red-500" />}
                      <span
                        className={
                          isWinner
                            ? "text-green-500"
                            : isLoser
                            ? "text-red-500"
                            : "text-theme-text"
                        }
                      >
                        {isWinner ? "승리" : isLoser ? "패배" : "대기"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-theme-text-secondary">
                    선택 대기 중...
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 알림 */}
      <div className="bg-theme-surface rounded-lg p-4 border border-theme-border">
        <h3 className="text-lg font-semibold text-theme-text mb-3">
          실시간 알림
        </h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {notifications.map((notification, index) => (
            <div key={index} className="text-sm text-theme-text-secondary">
              {notification}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RockPaperScissors;
