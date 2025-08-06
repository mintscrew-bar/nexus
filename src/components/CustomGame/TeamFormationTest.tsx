import { Play, Settings, Target, Trophy, Users } from "lucide-react";
import React, { useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import AdvancedTeamFormation from "./AdvancedTeamFormation";
import AuctionSystem from "./AuctionSystem";
import RockPaperScissors from "./RockPaperScissors";
import TeamFormation from "./TeamFormation";

interface TeamFormationTestProps {}

const TeamFormationTest: React.FC<TeamFormationTestProps> = () => {
  const { user } = useAppStore();
  const [currentMode, setCurrentMode] = useState<
    "advanced" | "auction" | "rps" | "manual" | "results"
  >("advanced");
  const [testParticipants, setTestParticipants] = useState([
    { user_id: 1, nexus_nickname: "테스트유저1", role: "participant" },
    { user_id: 2, nexus_nickname: "테스트유저2", role: "participant" },
    { user_id: 3, nexus_nickname: "테스트유저3", role: "participant" },
    { user_id: 4, nexus_nickname: "테스트유저4", role: "participant" },
    { user_id: 5, nexus_nickname: "테스트유저5", role: "participant" },
    { user_id: 6, nexus_nickname: "테스트유저6", role: "participant" },
    { user_id: 7, nexus_nickname: "테스트유저7", role: "participant" },
    { user_id: 8, nexus_nickname: "테스트유저8", role: "participant" },
    { user_id: 9, nexus_nickname: "테스트유저9", role: "participant" },
    { user_id: 10, nexus_nickname: "테스트유저10", role: "participant" },
  ]);
  const [testGame, setTestGame] = useState({
    id: 999,
    title: "팀 구성 테스트",
    team_composition: "auction",
    max_players: 10,
    current_players: 10,
    status: "team-formation",
    allow_spectators: true,
  });
  const [isTestActive, setIsTestActive] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const startTest = () => {
    setIsTestActive(true);
    setTestResults([]);
  };

  const resetTest = () => {
    setIsTestActive(false);
    setTestResults([]);
  };

  const handleTestComplete = (results?: any) => {
    console.log("팀 구성 완료:", results);
    setTestResults(results);
    setCurrentMode("results");
  };

  const handleTournamentComplete = (winner: any) => {
    console.log("토너먼트 완료:", winner);
    setTestResults((prev: any) => ({ ...prev, tournamentWinner: winner }));
  };

  const addTestParticipant = () => {
    const newId = Math.max(...testParticipants.map((p) => p.user_id)) + 1;
    setTestParticipants((prev) => [
      ...prev,
      {
        user_id: newId,
        nexus_nickname: `테스트유저${newId}`,
        role: "participant",
      },
    ]);
  };

  const removeTestParticipant = (userId: number) => {
    setTestParticipants((prev) => prev.filter((p) => p.user_id !== userId));
  };

  const updateGameSettings = (settings: Partial<typeof testGame>) => {
    setTestGame((prev) => ({ ...prev, ...settings }));
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-theme-text mb-2">
            팀 구성 시스템 테스트
          </h1>
          <p className="text-theme-text-secondary">
            다양한 팀 구성 방식을 실험해보세요
          </p>
        </div>

        {/* 테스트 설정 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽 - 설정 패널 */}
          <div className="space-y-6">
            {/* 테스트 모드 선택 */}
            <div className="bg-theme-surface rounded-lg p-6 border border-theme-border">
              <h3 className="text-lg font-semibold text-theme-text mb-4">
                테스트 모드
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setCurrentMode("advanced")}
                  className={`w-full p-3 rounded-lg border transition-colors ${
                    currentMode === "advanced"
                      ? "bg-purple-500/20 border-purple-400 text-purple-400"
                      : "bg-theme-bg-secondary border-theme-border text-theme-text hover:border-theme-border-hover"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>고도화된 팀 구성</span>
                  </div>
                </button>
                <button
                  onClick={() => setCurrentMode("auction")}
                  className={`w-full p-3 rounded-lg border transition-colors ${
                    currentMode === "auction"
                      ? "bg-blue-500/20 border-blue-400 text-blue-400"
                      : "bg-theme-bg-secondary border-theme-border text-theme-text hover:border-theme-border-hover"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>경매 시스템</span>
                  </div>
                </button>
                <button
                  onClick={() => setCurrentMode("rps")}
                  className={`w-full p-3 rounded-lg border transition-colors ${
                    currentMode === "rps"
                      ? "bg-green-500/20 border-green-400 text-green-400"
                      : "bg-theme-bg-secondary border-theme-border text-theme-text hover:border-theme-border-hover"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Play className="w-5 h-5" />
                    <span>가위바위보</span>
                  </div>
                </button>
                <button
                  onClick={() => setCurrentMode("manual")}
                  className={`w-full p-3 rounded-lg border transition-colors ${
                    currentMode === "manual"
                      ? "bg-purple-500/20 border-purple-400 text-purple-400"
                      : "bg-theme-bg-secondary border-theme-border text-theme-text hover:border-theme-border-hover"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>수동 구성</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 게임 설정 */}
            <div className="bg-theme-surface rounded-lg p-6 border border-theme-border">
              <h3 className="text-lg font-semibold text-theme-text mb-4">
                게임 설정
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-theme-text-secondary mb-2">
                    최대 인원
                  </label>
                  <input
                    type="number"
                    value={testGame.max_players}
                    onChange={(e) =>
                      updateGameSettings({
                        max_players: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border rounded-md text-theme-text focus:outline-none focus:border-nexus-blue"
                    min="2"
                    max="20"
                  />
                </div>
                <div>
                  <label className="block text-sm text-theme-text-secondary mb-2">
                    팀 구성 방식
                  </label>
                  <select
                    value={testGame.team_composition}
                    onChange={(e) =>
                      updateGameSettings({ team_composition: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border rounded-md text-theme-text focus:outline-none focus:border-nexus-blue"
                  >
                    <option value="auction">경매</option>
                    <option value="rock-paper-scissors">가위바위보</option>
                    <option value="none">수동</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 테스트 제어 */}
            <div className="bg-theme-surface rounded-lg p-6 border border-theme-border">
              <h3 className="text-lg font-semibold text-theme-text mb-4">
                테스트 제어
              </h3>
              <div className="space-y-3">
                <button
                  onClick={startTest}
                  disabled={isTestActive}
                  className="w-full px-4 py-2 bg-nexus-blue text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTestActive ? "테스트 진행 중..." : "테스트 시작"}
                </button>
                <button
                  onClick={resetTest}
                  className="w-full px-4 py-2 bg-theme-bg-secondary text-theme-text rounded-md hover:bg-theme-surface-hover transition-colors"
                >
                  테스트 리셋
                </button>
              </div>
            </div>
          </div>

          {/* 중앙 - 테스트 영역 */}
          <div className="lg:col-span-2">
            {isTestActive ? (
              <div className="bg-theme-surface rounded-lg p-6 border border-theme-border">
                <h3 className="text-lg font-semibold text-theme-text mb-4">
                  {currentMode === "advanced" && "고도화된 팀 구성 테스트"}
                  {currentMode === "auction" && "경매 시스템 테스트"}
                  {currentMode === "rps" && "가위바위보 테스트"}
                  {currentMode === "manual" && "수동 팀 구성 테스트"}
                </h3>

                {currentMode === "advanced" && (
                  <AdvancedTeamFormation
                    game={testGame}
                    participants={testParticipants}
                    onComplete={handleTestComplete}
                  />
                )}

                {currentMode === "auction" && (
                  <AuctionSystem
                    game={testGame}
                    participants={testParticipants}
                    captains={testParticipants.slice(0, 2)} // 테스트용으로 상위 2명을 팀장으로 설정
                    onComplete={handleTestComplete}
                  />
                )}

                {currentMode === "rps" && (
                  <RockPaperScissors
                    game={testGame}
                    participants={testParticipants}
                    captains={testParticipants.slice(0, 2)} // 테스트용으로 상위 2명을 팀장으로 설정
                    onComplete={handleTestComplete}
                  />
                )}

                {currentMode === "manual" && (
                  <TeamFormation
                    game={testGame}
                    onComplete={handleTestComplete}
                  />
                )}
              </div>
            ) : (
              <div className="bg-theme-surface rounded-lg p-6 border border-theme-border">
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-theme-text-secondary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-theme-text mb-2">
                    테스트 준비 완료
                  </h3>
                  <p className="text-theme-text-secondary">
                    왼쪽 패널에서 설정을 조정하고 "테스트 시작" 버튼을
                    클릭하세요.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 테스트 결과 */}
        {currentMode === "results" && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-semibold text-theme-text">
                테스트 결과
              </h2>
            </div>

            {testResults && (
              <div className="space-y-4">
                {/* 구성된 팀들 */}
                {testResults.teams && testResults.teams.length > 0 && (
                  <div className="p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg">
                    <h3 className="text-lg font-medium text-blue-400 mb-4">
                      구성된 팀
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {testResults.teams.map((team: any, index: number) => (
                        <div
                          key={team.id}
                          className="p-4 bg-theme-bg-secondary border border-theme-border rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-theme-text">
                              {team.name}
                            </h4>
                            <span className="text-theme-text-secondary text-sm">
                              {team.members?.length || 0}명
                            </span>
                          </div>
                          <div className="space-y-2">
                            {team.members?.map((member: any) => (
                              <div
                                key={member.user_id}
                                className="flex items-center space-x-2"
                              >
                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-medium">
                                    {member.nexus_nickname?.charAt(0) || "?"}
                                  </span>
                                </div>
                                <span className="text-theme-text text-sm">
                                  {member.nexus_nickname}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 토너먼트 승자 */}
                {testResults.tournamentWinner && (
                  <div className="p-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">
                        토너먼트 승자
                      </span>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white text-xl font-bold">
                          {testResults.tournamentWinner.name.charAt(0)}
                        </span>
                      </div>
                      <h4 className="text-yellow-400 font-medium text-lg">
                        {testResults.tournamentWinner.name}
                      </h4>
                    </div>
                  </div>
                )}

                {/* 사용된 전략 */}
                {testResults.strategy && (
                  <div className="p-4 bg-green-500/20 border border-green-400/30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 font-medium">
                        사용된 전략
                      </span>
                    </div>
                    <p className="text-theme-text-secondary">
                      {testResults.strategy === "balanced" && "균형 팀"}
                      {testResults.strategy === "captain-draft" &&
                        "팀장 드래프트"}
                      {testResults.strategy === "skill-based" && "실력 기반"}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentMode("advanced")}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                다시 테스트
              </button>
              <button
                onClick={() => {
                  setTestResults(null);
                  setCurrentMode("advanced");
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                초기화
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamFormationTest;
