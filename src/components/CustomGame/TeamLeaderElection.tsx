import { Check, Crown } from "lucide-react";
import React, { useState } from "react";
import apiService from "../../services/api";
import { useAppStore } from "../../store/useAppStore";

interface TeamLeaderElectionProps {
  game: any;
  participants: any[];
  onComplete: () => void;
}

const TeamLeaderElection: React.FC<TeamLeaderElectionProps> = ({
  game,
  participants,
  onComplete,
}) => {
  const { user } = useAppStore();
  const [selectedLeaders, setSelectedLeaders] = useState<
    Array<{
      userId: number;
      teamName: string;
      color: "blue" | "red";
    }>
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectLeader = (participant: any, teamColor: "blue" | "red") => {
    const teamName = teamColor === "blue" ? "블루팀" : "레드팀";

    setSelectedLeaders((prev) => {
      // Remove existing leader for this team
      const filtered = prev.filter((leader) => leader.color !== teamColor);
      // Add new leader
      return [
        ...filtered,
        {
          userId: participant.user_id,
          teamName,
          color: teamColor,
        },
      ];
    });
  };

  const handleSubmit = async () => {
    if (selectedLeaders.length !== 2) {
      alert("두 팀의 팀장을 모두 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.electTeamLeaders(game.id, selectedLeaders);
      onComplete();
    } catch (error) {
      console.error("Failed to elect team leaders:", error);
      alert("팀장 선출에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLeaderSelected = (participantId: number) => {
    return selectedLeaders.some((leader) => leader.userId === participantId);
  };

  const getLeaderTeam = (participantId: number) => {
    return selectedLeaders.find((leader) => leader.userId === participantId);
  };

  return (
    <div className="bg-nexus-darker rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Crown className="w-6 h-6 text-yellow-500" />
        <h2 className="text-xl font-semibold text-white">팀장 선출</h2>
      </div>

      <div className="mb-6">
        <p className="text-nexus-light-gray mb-4">
          각 팀의 팀장을 선택해주세요. 팀장은 팀 구성과 라인 선택을 관리합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 블루팀 */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-400 mb-4">
            블루팀 팀장
          </h3>
          <div className="space-y-2">
            {participants.map((participant) => (
              <div
                key={participant.user_id}
                className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                  getLeaderTeam(participant.user_id)?.color === "blue"
                    ? "bg-blue-500/20 border border-blue-400"
                    : "bg-nexus-dark hover:bg-nexus-gray"
                }`}
                onClick={() => handleSelectLeader(participant, "blue")}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {participant.nexus_nickname?.charAt(0) || "?"}
                    </span>
                  </div>
                  <span className="text-white font-medium">
                    {participant.nexus_nickname}
                  </span>
                </div>
                {getLeaderTeam(participant.user_id)?.color === "blue" && (
                  <Check className="w-5 h-5 text-blue-400" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 레드팀 */}
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-400 mb-4">레드팀 팀장</h3>
          <div className="space-y-2">
            {participants.map((participant) => (
              <div
                key={participant.user_id}
                className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                  getLeaderTeam(participant.user_id)?.color === "red"
                    ? "bg-red-500/20 border border-red-400"
                    : "bg-nexus-dark hover:bg-nexus-gray"
                }`}
                onClick={() => handleSelectLeader(participant, "red")}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {participant.nexus_nickname?.charAt(0) || "?"}
                    </span>
                  </div>
                  <span className="text-white font-medium">
                    {participant.nexus_nickname}
                  </span>
                </div>
                {getLeaderTeam(participant.user_id)?.color === "red" && (
                  <Check className="w-5 h-5 text-red-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-nexus-light-gray">
          선택된 팀장: {selectedLeaders.length}/2
        </div>
        <button
          onClick={handleSubmit}
          disabled={selectedLeaders.length !== 2 || isSubmitting}
          className="px-6 py-2 bg-nexus-blue text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "처리 중..." : "팀장 선출 완료"}
        </button>
      </div>
    </div>
  );
};

export default TeamLeaderElection;
