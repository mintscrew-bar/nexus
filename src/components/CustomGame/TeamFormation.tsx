import { Check, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import apiService from "../../services/api";
import { useAppStore } from "../../store/useAppStore";

interface TeamFormationProps {
  game: any;
  onComplete: () => void;
}

const TeamFormation: React.FC<TeamFormationProps> = ({ game, onComplete }) => {
  const { user } = useAppStore();
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningTeam, setJoiningTeam] = useState<number | null>(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await apiService.getGameTeams(game.id);
      setTeams(response.data.teams || []);
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async (teamId: number) => {
    setJoiningTeam(teamId);
    try {
      await apiService.joinTeam(game.id, teamId);
      await fetchTeams(); // Refresh teams
    } catch (error) {
      console.error("Failed to join team:", error);
      alert("팀 참가에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setJoiningTeam(null);
    }
  };

  const isUserInTeam = (team: any) => {
    return team.members?.some((member: any) => member.user_id === user?.id);
  };

  const getTeamMemberCount = (team: any) => {
    return team.members?.length || 0;
  };

  const getMaxTeamSize = () => {
    return Math.ceil(game.max_players / 2);
  };

  if (loading) {
    return (
      <div className="bg-theme-surface rounded-lg p-6 border border-theme-border">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-theme-text">팀 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-theme-surface rounded-lg p-6 border border-theme-border">
      <div className="flex items-center space-x-2 mb-6">
        <Users className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-semibold text-theme-text">팀 구성</h2>
      </div>

      <div className="mb-6">
        <p className="text-theme-text-secondary mb-4">
          원하는 팀을 선택하여 참가하세요. 각 팀은 최대 {getMaxTeamSize()}명까지
          참가할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams.map((team) => (
          <div
            key={team.id}
            className={`border rounded-lg p-4 ${
              team.color === "blue"
                ? "bg-blue-900/20 border-blue-500/30"
                : "bg-red-900/20 border-red-500/30"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className={`text-lg font-medium ${
                  team.color === "blue" ? "text-blue-400" : "text-red-400"
                }`}
              >
                {team.name}
              </h3>
              <span className="text-sm text-nexus-light-gray">
                {getTeamMemberCount(team)}/{getMaxTeamSize()}명
              </span>
            </div>

            {/* 팀장 정보 */}
            <div className="mb-4 p-3 bg-nexus-dark rounded-md">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    team.color === "blue" ? "bg-blue-500" : "bg-red-500"
                  }`}
                >
                  <span className="text-white text-sm font-medium">
                    {team.leader_nickname?.charAt(0) || "?"}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">
                    {team.leader_nickname}
                  </p>
                  <p className="text-xs text-nexus-light-gray">팀장</p>
                </div>
              </div>
            </div>

            {/* 팀원 목록 */}
            <div className="space-y-2 mb-4">
              {team.members?.map((member: any) => (
                <div
                  key={member.user_id}
                  className="flex items-center space-x-3 p-2 bg-nexus-dark rounded"
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      team.color === "blue" ? "bg-blue-500" : "bg-red-500"
                    }`}
                  >
                    <span className="text-white text-xs font-medium">
                      {member.nexus_nickname?.charAt(0) || "?"}
                    </span>
                  </div>
                  <span className="text-white text-sm">
                    {member.nexus_nickname}
                  </span>
                  {member.user_id === team.leader_id && (
                    <span className="text-xs text-yellow-500">팀장</span>
                  )}
                </div>
              ))}
            </div>

            {/* 참가 버튼 */}
            {!isUserInTeam(team) &&
              getTeamMemberCount(team) < getMaxTeamSize() && (
                <button
                  onClick={() => handleJoinTeam(team.id)}
                  disabled={joiningTeam === team.id}
                  className={`w-full px-4 py-2 rounded-md text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    team.color === "blue"
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {joiningTeam === team.id ? "참가 중..." : "팀 참가"}
                </button>
              )}

            {isUserInTeam(team) && (
              <div className="flex items-center justify-center space-x-2 text-green-400">
                <Check className="w-4 h-4" />
                <span className="text-sm">참가 중</span>
              </div>
            )}

            {getTeamMemberCount(team) >= getMaxTeamSize() &&
              !isUserInTeam(team) && (
                <div className="text-center text-nexus-light-gray text-sm">
                  팀이 가득 찼습니다
                </div>
              )}
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-nexus-light-gray">
          모든 참가자가 팀에 참가하면 라인 선택 단계로 진행됩니다.
        </p>
      </div>
    </div>
  );
};

export default TeamFormation;
