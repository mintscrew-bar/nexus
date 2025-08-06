import { Award, Target, Trophy } from "lucide-react";
import React, { useEffect, useState } from "react";

interface Team {
  id: number;
  name: string;
  members: any[];
  captain: any;
  totalRating?: number;
}

interface Match {
  id: number;
  team1: Team;
  team2: Team;
  winner?: Team;
  status: "pending" | "in-progress" | "completed";
  score?: { team1: number; team2: number };
}

interface TournamentBracketProps {
  teams: Team[];
  onMatchComplete?: (matchId: number, winner: Team) => void;
  onTournamentComplete?: (winner: Team) => void;
}

const TournamentBracket: React.FC<TournamentBracketProps> = ({
  teams,
  onMatchComplete,
  onTournamentComplete,
}) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [tournamentStatus, setTournamentStatus] = useState<
    "pending" | "in-progress" | "completed"
  >("pending");

  // 팀을 대진표에 배치
  useEffect(() => {
    if (teams.length === 0) return;

    const generateMatches = () => {
      const newMatches: Match[] = [];
      const shuffledTeams = [...teams].sort(() => Math.random() - 0.5); // 랜덤 배치

      for (let i = 0; i < shuffledTeams.length; i += 2) {
        if (i + 1 < shuffledTeams.length) {
          newMatches.push({
            id: i / 2 + 1,
            team1: shuffledTeams[i],
            team2: shuffledTeams[i + 1],
            status: "pending",
          });
        } else {
          // 홀수 팀인 경우 부전승 처리
          newMatches.push({
            id: i / 2 + 1,
            team1: shuffledTeams[i],
            team2: { id: -1, name: "부전승", members: [], captain: null },
            status: "completed",
            winner: shuffledTeams[i],
            score: { team1: 1, team2: 0 },
          });
        }
      }

      setMatches(newMatches);
      setTournamentStatus("in-progress");
    };

    generateMatches();
  }, [teams]);

  const handleMatchResult = (matchId: number, winner: Team) => {
    setMatches((prev) =>
      prev.map((match) =>
        match.id === matchId
          ? { ...match, winner, status: "completed" as const }
          : match
      )
    );

    onMatchComplete?.(matchId, winner);

    // 모든 매치가 완료되었는지 확인
    const allCompleted = matches.every((match) => match.status === "completed");
    if (allCompleted) {
      setTournamentStatus("completed");
      onTournamentComplete?.(winner);
    }
  };

  const getTeamDisplay = (team: Team) => {
    if (team.id === -1) {
      return <div className="text-gray-400 text-sm italic">부전승</div>;
    }

    return (
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">
            {team.name.charAt(0)}
          </span>
        </div>
        <div>
          <div className="text-theme-text font-medium text-sm">{team.name}</div>
          <div className="text-theme-text-secondary text-xs">
            {team.members.length}명
          </div>
        </div>
      </div>
    );
  };

  const getMatchStatus = (match: Match) => {
    switch (match.status) {
      case "pending":
        return (
          <div className="text-yellow-400 text-xs font-medium">대기 중</div>
        );
      case "in-progress":
        return (
          <div className="text-green-400 text-xs font-medium animate-pulse">
            진행 중
          </div>
        );
      case "completed":
        return <div className="text-blue-400 text-xs font-medium">완료</div>;
    }
  };

  return (
    <div className="bg-theme-surface rounded-lg p-6 border border-theme-border">
      <div className="flex items-center space-x-3 mb-6">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h2 className="text-xl font-semibold text-theme-text">
          토너먼트 대진표
        </h2>
      </div>

      {/* 토너먼트 상태 */}
      <div className="mb-6 p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 font-medium">토너먼트 상태</span>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              tournamentStatus === "pending"
                ? "bg-yellow-500/20 text-yellow-400"
                : tournamentStatus === "in-progress"
                ? "bg-green-500/20 text-green-400"
                : "bg-blue-500/20 text-blue-400"
            }`}
          >
            {tournamentStatus === "pending" && "대기 중"}
            {tournamentStatus === "in-progress" && "진행 중"}
            {tournamentStatus === "completed" && "완료"}
          </div>
        </div>
        <div className="mt-2 text-theme-text-secondary text-sm">
          총 {teams.length}팀, {matches.length}경기
        </div>
      </div>

      {/* 대진표 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-theme-text mb-4">1라운드</h3>
        <div className="grid gap-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className={`p-4 rounded-lg border transition-colors ${
                match.status === "completed"
                  ? "bg-green-500/10 border-green-400/30"
                  : match.status === "in-progress"
                  ? "bg-yellow-500/10 border-yellow-400/30"
                  : "bg-theme-bg-secondary border-theme-border"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-theme-text-secondary text-sm">
                  경기 {match.id}
                </span>
                {getMatchStatus(match)}
              </div>

              <div className="space-y-3">
                {/* 팀 1 */}
                <div
                  className={`p-3 rounded border ${
                    match.winner?.id === match.team1.id
                      ? "bg-green-500/20 border-green-400"
                      : "bg-theme-bg border-theme-border"
                  }`}
                >
                  {getTeamDisplay(match.team1)}
                </div>

                {/* VS */}
                <div className="text-center">
                  <div className="text-theme-text-secondary text-sm font-medium">
                    VS
                  </div>
                </div>

                {/* 팀 2 */}
                <div
                  className={`p-3 rounded border ${
                    match.winner?.id === match.team2.id
                      ? "bg-green-500/20 border-green-400"
                      : "bg-theme-bg border-theme-border"
                  }`}
                >
                  {getTeamDisplay(match.team2)}
                </div>
              </div>

              {/* 승자 표시 */}
              {match.winner && (
                <div className="mt-3 p-2 bg-green-500/20 border border-green-400/30 rounded">
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm font-medium">
                      승자: {match.winner.name}
                    </span>
                  </div>
                </div>
              )}

              {/* 매치 컨트롤 (개발용) */}
              {match.status === "pending" && (
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => handleMatchResult(match.id, match.team1)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                  >
                    {match.team1.name} 승리
                  </button>
                  <button
                    onClick={() => handleMatchResult(match.id, match.team2)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                  >
                    {match.team2.name} 승리
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 토너먼트 완료 메시지 */}
      {tournamentStatus === "completed" && (
        <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-medium">
              토너먼트가 완료되었습니다!
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentBracket;
