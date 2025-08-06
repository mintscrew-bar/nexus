import {
  Award,
  Gavel,
  Scissors,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import AuctionSystem from "./AuctionSystem";
import RockPaperScissors from "./RockPaperScissors";
import TournamentBracket from "./TournamentBracket";

interface CaptainCandidate {
  user_id: number;
  nexus_nickname: string;
  self_nominated: boolean;
  nominated_by_others: number;
  total_votes: number;
  is_selected: boolean;
}

interface AdvancedTeamFormationProps {
  game: any;
  participants: any[];
  onComplete: (results: any) => void;
}

const AdvancedTeamFormation: React.FC<AdvancedTeamFormationProps> = ({
  game,
  participants,
  onComplete,
}) => {
  const { user } = useAppStore();
  const [formationStep, setFormationStep] = useState<
    | "strategy"
    | "captain-election"
    | "draft-method"
    | "auction"
    | "rps"
    | "draft"
    | "bracket"
    | "complete"
  >("strategy");
  const [selectedStrategy, setSelectedStrategy] = useState<string>("");
  const [captains, setCaptains] = useState<any[]>([]);
  const [electionPhase, setElectionPhase] = useState<
    "nomination" | "voting" | "results"
  >("nomination");
  const [captainCandidates, setCaptainCandidates] = useState<
    CaptainCandidate[]
  >([]);
  const [userNominations, setUserNominations] = useState<number[]>([]);
  const [userVote, setUserVote] = useState<number | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [requiredCaptainCount, setRequiredCaptainCount] = useState(2);
  const [draftMethod, setDraftMethod] = useState<"manual" | "auction" | "rps">(
    "manual"
  );
  const [formedTeams, setFormedTeams] = useState<any[]>([]);
  const [isForming, setIsForming] = useState(false);

  // 참가자 수에 따른 팀장 수 계산
  useEffect(() => {
    const playerCount = participants.length;
    if (playerCount <= 10) {
      setRequiredCaptainCount(2);
    } else if (playerCount <= 15) {
      setRequiredCaptainCount(3);
    } else if (playerCount <= 20) {
      setRequiredCaptainCount(4);
    } else {
      setRequiredCaptainCount(Math.ceil(playerCount / 5));
    }
  }, [participants]);

  // 방장 확인 (게임 생성자가 방장)
  useEffect(() => {
    setIsHost(game.created_by === user?.id);
  }, [game, user]);

  // 팀 구성 시작
  const startFormation = () => {
    setIsForming(true);
    if (selectedStrategy === "balanced" || selectedStrategy === "skill-based") {
      selectCaptains(); // 팀장 선출 건너뛰기
    } else {
      setFormationStep("captain-election");
      initializeCaptainCandidates();
    }
  };

  // 팀장 후보 초기화
  const initializeCaptainCandidates = () => {
    const candidates = participants.map((p) => ({
      user_id: p.user_id,
      nexus_nickname: p.nexus_nickname,
      self_nominated: false,
      nominated_by_others: 0,
      total_votes: 0,
      is_selected: false,
    }));
    setCaptainCandidates(candidates);
  };

  // 자기 추천
  const handleSelfNomination = (userId: number) => {
    setCaptainCandidates((prev) =>
      prev.map((c) =>
        c.user_id === userId
          ? { ...c, self_nominated: true, total_votes: c.total_votes + 1 }
          : c
      )
    );
  };

  // 다른 사람 추천
  const handleNominateOthers = (userId: number) => {
    if (userNominations.includes(userId)) return;

    setUserNominations((prev) => [...prev, userId]);
    setCaptainCandidates((prev) =>
      prev.map((c) =>
        c.user_id === userId
          ? {
              ...c,
              nominated_by_others: c.nominated_by_others + 1,
              total_votes: c.total_votes + 1,
            }
          : c
      )
    );
  };

  // 추천 단계 종료
  const endNomination = () => {
    setElectionPhase("voting");
  };

  // 투표
  const handleVote = (userId: number) => {
    if (userVote === userId) return;

    setUserVote(userId);
    setCaptainCandidates((prev) =>
      prev.map((c) =>
        c.user_id === userId ? { ...c, total_votes: c.total_votes + 1 } : c
      )
    );
  };

  // 투표 종료
  const endElection = () => {
    setElectionPhase("results");
    const sortedCandidates = [...captainCandidates]
      .sort((a, b) => b.total_votes - a.total_votes)
      .slice(0, requiredCaptainCount);
    const electedCaptains = sortedCandidates
      .map((c) => participants.find((p) => p.user_id === c.user_id))
      .filter(Boolean);
    setCaptains(electedCaptains);
    setTimeout(() => {
      setFormationStep("draft-method");
    }, 3000);
  };

  // 방장이 임의로 팀장 선정
  const hostSelectCaptains = () => {
    const selectedCaptains = participants
      .sort(() => Math.random() - 0.5)
      .slice(0, requiredCaptainCount);
    setCaptains(selectedCaptains);
    setFormationStep("draft-method");
  };

  // 균형/실력 기반 팀 구성 (팀장 선출 건너뛰기)
  const selectCaptains = () => {
    if (selectedStrategy === "balanced") {
      // 균형 팀 구성
      const shuffled = [...participants].sort(() => Math.random() - 0.5);
      const teamSize = Math.ceil(participants.length / 2);
      const teams = [
        {
          id: 1,
          name: "팀 1",
          members: shuffled.slice(0, teamSize),
          captain: shuffled[0],
        },
        {
          id: 2,
          name: "팀 2",
          members: shuffled.slice(teamSize),
          captain: shuffled[teamSize],
        },
      ];
      setFormedTeams(teams);
      setFormationStep("bracket");
    } else if (selectedStrategy === "skill-based") {
      // 실력 기반 팀 구성
      const sorted = [...participants].sort(
        (a, b) => (b.rating || 1000) - (a.rating || 1000)
      );
      const teamSize = Math.ceil(participants.length / 2);
      const teams = [
        {
          id: 1,
          name: "팀 1",
          members: sorted.slice(0, teamSize),
          captain: sorted[0],
        },
        {
          id: 2,
          name: "팀 2",
          members: sorted.slice(teamSize),
          captain: sorted[teamSize],
        },
      ];
      setFormedTeams(teams);
      setFormationStep("bracket");
    }
  };

  // 경매 시작
  const startAuction = () => {
    setFormationStep("auction");
  };

  // 가위바위보 시작
  const startRPS = () => {
    setFormationStep("rps");
  };

  // 수동 드래프트 시작
  const startManualDraft = () => {
    setFormationStep("draft");
  };

  // 팀 구성 완료 처리
  const handleTeamFormationComplete = (results: any) => {
    setFormedTeams(results.teams || []);
    setFormationStep("bracket");
  };

  // 토너먼트 완료 처리
  const handleTournamentComplete = (winner: any) => {
    setFormationStep("complete");
    onComplete({
      teams: formedTeams,
      tournamentWinner: winner,
      strategy: selectedStrategy,
    });
  };

  return (
    <div className="bg-theme-surface rounded-lg p-6 border border-theme-border">
      <div className="flex items-center space-x-3 mb-6">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h2 className="text-xl font-semibold text-theme-text">고급 팀 구성</h2>
      </div>

      {/* 진행 단계 표시 */}
      <div className="mb-6 p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Target className="w-5 h-5 text-blue-400" />
          <span className="text-blue-400 font-medium">진행 단계</span>
        </div>
        <div className="text-theme-text-secondary text-sm">
          {formationStep === "strategy" && "1. 전략 선택"}
          {formationStep === "captain-election" && "2. 팀장 선출"}
          {formationStep === "draft-method" && "3. 드래프트 방법 선택"}
          {(formationStep === "auction" ||
            formationStep === "rps" ||
            formationStep === "draft") &&
            "4. 팀 구성"}
          {formationStep === "bracket" && "5. 대진표"}
          {formationStep === "complete" && "완료"}
        </div>
      </div>

      {/* 전략 선택 */}
      {formationStep === "strategy" && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-theme-text mb-4">
            팀 구성 전략 선택
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedStrategy === "balanced"
                  ? "bg-blue-500/20 border-blue-400"
                  : "bg-theme-bg-secondary border-theme-border hover:border-theme-border-hover"
              }`}
              onClick={() => setSelectedStrategy("balanced")}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-theme-text">균형 팀</span>
              </div>
              <p className="text-theme-text-secondary text-sm">
                실력과 역할을 고려하여 균형잡힌 팀을 구성합니다.
              </p>
            </div>

            <div
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedStrategy === "captain-draft"
                  ? "bg-blue-500/20 border-blue-400"
                  : "bg-theme-bg-secondary border-theme-border hover:border-theme-border-hover"
              }`}
              onClick={() => setSelectedStrategy("captain-draft")}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Gavel className="w-5 h-5 text-yellow-400" />
                <span className="font-medium text-theme-text">
                  팀장 드래프트
                </span>
              </div>
              <p className="text-theme-text-secondary text-sm">
                팀장을 선출하고 드래프트 방식으로 팀을 구성합니다.
              </p>
            </div>

            <div
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedStrategy === "skill-based"
                  ? "bg-blue-500/20 border-blue-400"
                  : "bg-theme-bg-secondary border-theme-border hover:border-theme-border-hover"
              }`}
              onClick={() => setSelectedStrategy("skill-based")}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Award className="w-5 h-5 text-green-400" />
                <span className="font-medium text-theme-text">실력 기반</span>
              </div>
              <p className="text-theme-text-secondary text-sm">
                실력 순서대로 팀을 나누어 구성합니다.
              </p>
            </div>
          </div>

          <button
            onClick={startFormation}
            disabled={!selectedStrategy}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            팀 구성 시작
          </button>
        </div>
      )}

      {/* 팀장 선출 */}
      {formationStep === "captain-election" && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-theme-text mb-4">
            팀장 선출
          </h3>

          {electionPhase === "nomination" && (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 font-medium">
                    자기 추천 단계
                  </span>
                </div>
                <p className="text-theme-text-secondary text-sm">
                  팀장이 되고 싶은 사람은 자기 추천을 할 수 있습니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {captainCandidates.map((candidate) => (
                  <div
                    key={candidate.user_id}
                    className={`p-4 rounded-lg border transition-colors ${
                      candidate.self_nominated
                        ? "bg-green-500/20 border-green-400"
                        : "bg-theme-bg-secondary border-theme-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-theme-text">
                        {candidate.nexus_nickname}
                      </span>
                      {candidate.self_nominated && (
                        <span className="text-green-400 text-xs font-medium">
                          추천됨
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleSelfNomination(candidate.user_id)}
                        disabled={candidate.self_nominated}
                        className="w-full px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        자기 추천
                      </button>
                      <button
                        onClick={() => handleNominateOthers(candidate.user_id)}
                        disabled={userNominations.includes(candidate.user_id)}
                        className="w-full px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        다른 사람 추천
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={endNomination}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                >
                  추천 단계 종료
                </button>
                {isHost && (
                  <button
                    onClick={hostSelectCaptains}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    방장이 임의 선정
                  </button>
                )}
              </div>
            </div>
          )}

          {electionPhase === "voting" && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 font-medium">투표 단계</span>
                </div>
                <p className="text-theme-text-secondary text-sm">
                  추천받은 후보들 중에서 팀장을 선택하세요.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {captainCandidates
                  .filter((c) => c.self_nominated || c.nominated_by_others > 0)
                  .map((candidate) => (
                    <div
                      key={candidate.user_id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        userVote === candidate.user_id
                          ? "bg-blue-500/20 border-blue-400"
                          : "bg-theme-bg-secondary border-theme-border hover:border-theme-border-hover"
                      }`}
                      onClick={() => handleVote(candidate.user_id)}
                    >
                      <div className="text-center">
                        <div className="font-medium text-theme-text mb-2">
                          {candidate.nexus_nickname}
                        </div>
                        <div className="text-theme-text-secondary text-sm">
                          추천: {candidate.self_nominated ? "자기" : "타인"} |
                          투표: {candidate.total_votes}표
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              <button
                onClick={endElection}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                투표 종료
              </button>
            </div>
          )}

          {electionPhase === "results" && (
            <div className="space-y-4">
              <div className="p-4 bg-green-500/20 border border-green-400/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Award className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">선출 결과</span>
                </div>
                <p className="text-theme-text-secondary text-sm">
                  팀장이 선출되었습니다!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {captains.map((captain) => (
                  <div
                    key={captain.user_id}
                    className="p-4 bg-green-500/20 border border-green-400/30 rounded-lg"
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white text-lg font-bold">
                          {captain.nexus_nickname.charAt(0)}
                        </span>
                      </div>
                      <div className="font-medium text-green-400">
                        {captain.nexus_nickname}
                      </div>
                      <div className="text-green-300 text-sm">팀장</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 드래프트 방법 선택 */}
      {formationStep === "draft-method" && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-theme-text mb-4">
            드래프트 방법 선택
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                draftMethod === "manual"
                  ? "bg-blue-500/20 border-blue-400"
                  : "bg-theme-bg-secondary border-theme-border hover:border-theme-border-hover"
              }`}
              onClick={() => setDraftMethod("manual")}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-theme-text">
                  수동 드래프트
                </span>
              </div>
              <p className="text-theme-text-secondary text-sm">
                팀장이 직접 플레이어를 선택합니다.
              </p>
            </div>

            <div
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                draftMethod === "auction"
                  ? "bg-blue-500/20 border-blue-400"
                  : "bg-theme-bg-secondary border-theme-border hover:border-theme-border-hover"
              }`}
              onClick={() => setDraftMethod("auction")}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Gavel className="w-5 h-5 text-yellow-400" />
                <span className="font-medium text-theme-text">경매</span>
              </div>
              <p className="text-theme-text-secondary text-sm">
                포인트를 사용하여 플레이어를 경매합니다.
              </p>
            </div>

            <div
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                draftMethod === "rps"
                  ? "bg-blue-500/20 border-blue-400"
                  : "bg-theme-bg-secondary border-theme-border hover:border-theme-border-hover"
              }`}
              onClick={() => setDraftMethod("rps")}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Scissors className="w-5 h-5 text-green-400" />
                <span className="font-medium text-theme-text">가위바위보</span>
              </div>
              <p className="text-theme-text-secondary text-sm">
                가위바위보로 플레이어를 선택합니다.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (draftMethod === "auction") {
                startAuction();
              } else if (draftMethod === "rps") {
                startRPS();
              } else {
                startManualDraft();
              }
            }}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            드래프트 시작
          </button>
        </div>
      )}

      {/* 경매 시스템 */}
      {formationStep === "auction" && (
        <AuctionSystem
          game={game}
          participants={participants}
          captains={captains}
          onComplete={handleTeamFormationComplete}
        />
      )}

      {/* 가위바위보 시스템 */}
      {formationStep === "rps" && (
        <RockPaperScissors
          game={game}
          participants={participants}
          captains={captains}
          onComplete={handleTeamFormationComplete}
        />
      )}

      {/* 수동 드래프트 */}
      {formationStep === "draft" && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-theme-text mb-4">
            수동 드래프트
          </h3>
          <p className="text-theme-text-secondary">
            수동 드래프트 기능은 개발 중입니다...
          </p>
        </div>
      )}

      {/* 대진표 */}
      {formationStep === "bracket" && (
        <TournamentBracket
          teams={formedTeams}
          onMatchComplete={(matchId, winner) => {
            console.log(`Match ${matchId} completed, winner: ${winner.name}`);
          }}
          onTournamentComplete={handleTournamentComplete}
        />
      )}

      {/* 완료 */}
      {formationStep === "complete" && (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-theme-text">
            팀 구성 완료!
          </h3>
          <p className="text-theme-text-secondary">
            토너먼트가 성공적으로 구성되었습니다.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdvancedTeamFormation;
