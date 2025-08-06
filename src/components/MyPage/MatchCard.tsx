import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import React, { useState } from "react";
import { Match, User } from "../../types";

interface MatchCardProps {
  match: Match;
  user: User;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, user }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const userParticipant = match.participants.find(
    (p) => p.puuid === user.puuid
  );
  const userTeam = match.teams.find(
    (t) => t.teamId === userParticipant?.teamId
  );
  const isWin = userTeam?.win || false;

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getKdaColor = (kills: number, deaths: number, assists: number) => {
    if (deaths === 0) return "text-nexus-green";
    const kda = (kills + assists) / deaths;
    if (kda >= 3) return "text-nexus-green";
    if (kda >= 2) return "text-nexus-yellow";
    return "text-nexus-red";
  };

  const getCsPerMinute = (cs: number, duration: number) => {
    const minutes = duration / 60;
    return (cs / minutes).toFixed(1);
  };

  const getDamagePerMinute = (damage: number, duration: number) => {
    const minutes = duration / 60;
    return Math.round(damage / minutes);
  };

  if (!userParticipant) return null;

  return (
    <div
      className={`bg-theme-surface rounded-lg border-l-4 border ${
        isWin ? "border-nexus-green" : "border-nexus-red"
      }`}
    >
      {/* 기본 정보 */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* 승패 표시 */}
            <div
              className={`flex items-center space-x-2 ${
                isWin ? "text-nexus-green" : "text-nexus-red"
              }`}
            >
              <Trophy className="w-5 h-5" />
              <span className="font-bold text-lg">
                {isWin ? "승리" : "패배"}
              </span>
            </div>

            {/* 게임 정보 */}
            <div className="flex items-center space-x-4 text-sm text-theme-text-secondary">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(match.gameDuration)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{match.isCustomGame ? "사용자 설정" : "일반 게임"}</span>
              </div>
              <span>
                {formatDistanceToNow(match.gameCreation, {
                  addSuffix: true,
                  locale: ko,
                })}
              </span>
            </div>
          </div>

          {/* 확장 버튼 */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-nexus-gray rounded-md transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-nexus-light-gray" />
            ) : (
              <ChevronDown className="w-5 h-5 text-nexus-light-gray" />
            )}
          </button>
        </div>

        {/* 사용자 정보 */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* 챔피언 */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-nexus-gray rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold">
                {userParticipant.championName}
              </span>
            </div>
            <div>
              <p className="font-medium text-white">
                {userParticipant.championName}
              </p>
              <p className="text-sm text-nexus-light-gray">
                {userParticipant.lane}
              </p>
            </div>
          </div>

          {/* KDA */}
          <div className="flex items-center space-x-3">
            <Target className="w-8 h-8 text-nexus-blue" />
            <div>
              <p
                className={`font-bold text-lg ${getKdaColor(
                  userParticipant.kills,
                  userParticipant.deaths,
                  userParticipant.assists
                )}`}
              >
                {userParticipant.kills}/{userParticipant.deaths}/
                {userParticipant.assists}
              </p>
              <p className="text-sm text-nexus-light-gray">
                {userParticipant.deaths === 0
                  ? "Perfect"
                  : (
                      (userParticipant.kills + userParticipant.assists) /
                      userParticipant.deaths
                    ).toFixed(2)}{" "}
                KDA
              </p>
            </div>
          </div>

          {/* CS */}
          <div className="flex items-center space-x-3">
            <Zap className="w-8 h-8 text-nexus-yellow" />
            <div>
              <p className="font-bold text-lg text-white">
                {userParticipant.cs}
              </p>
              <p className="text-sm text-nexus-light-gray">
                {getCsPerMinute(userParticipant.cs, match.gameDuration)} CS/min
              </p>
            </div>
          </div>

          {/* 골드 */}
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-nexus-yellow" />
            <div>
              <p className="font-bold text-lg text-white">
                {Math.round(userParticipant.gold / 1000)}k
              </p>
              <p className="text-sm text-nexus-light-gray">골드</p>
            </div>
          </div>
        </div>
      </div>

      {/* 확장된 정보 */}
      {isExpanded && (
        <div className="border-t border-nexus-gray p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 상세 스탯 */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">
                상세 스탯
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-nexus-light-gray">총 데미지</span>
                  <span className="text-white font-medium">
                    {userParticipant.stats.totalDamageDealt.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-nexus-light-gray">받은 데미지</span>
                  <span className="text-white font-medium">
                    {userParticipant.stats.totalDamageTaken.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-nexus-light-gray">시야 점수</span>
                  <span className="text-white font-medium">
                    {userParticipant.stats.visionScore}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-nexus-light-gray">분당 데미지</span>
                  <span className="text-white font-medium">
                    {getDamagePerMinute(
                      userParticipant.stats.totalDamageDealt,
                      match.gameDuration
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* 아이템 */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">아이템</h4>
              <div className="grid grid-cols-3 gap-2">
                {userParticipant.items.map((itemId, index) => (
                  <div
                    key={index}
                    className="w-12 h-12 bg-nexus-gray rounded-lg flex items-center justify-center"
                  >
                    <span className="text-xs">{itemId}</span>
                  </div>
                ))}
                {Array.from({ length: 6 - userParticipant.items.length }).map(
                  (_, index) => (
                    <div
                      key={`empty-${index}`}
                      className="w-12 h-12 bg-nexus-darker rounded-lg border border-nexus-gray"
                    />
                  )
                )}
              </div>
            </div>
          </div>

          {/* 팀 정보 */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-white mb-3">팀 정보</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {match.teams.map((team) => (
                <div
                  key={team.teamId}
                  className={`p-3 rounded-lg ${
                    team.teamId === userParticipant.teamId
                      ? "bg-nexus-blue bg-opacity-20 border border-nexus-blue"
                      : "bg-nexus-dark"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">
                      팀 {team.teamId === 100 ? "블루" : "레드"}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        team.win ? "text-nexus-green" : "text-nexus-red"
                      }`}
                    >
                      {team.win ? "승리" : "패배"}
                    </span>
                  </div>

                  {/* 팀원 목록 */}
                  <div className="space-y-1">
                    {match.participants
                      .filter((p) => p.teamId === team.teamId)
                      .map((participant) => (
                        <div
                          key={participant.puuid}
                          className={`flex items-center justify-between text-sm ${
                            participant.puuid === user.puuid
                              ? "text-nexus-blue font-medium"
                              : "text-nexus-light-gray"
                          }`}
                        >
                          <span>{participant.summonerName}</span>
                          <span>{participant.championName}</span>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 오브젝트 정보 */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-white mb-3">오브젝트</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {match.teams.map((team) => (
                <div key={team.teamId} className="text-center">
                  <div
                    className={`text-sm font-medium ${
                      team.teamId === userParticipant.teamId
                        ? "text-nexus-blue"
                        : "text-nexus-light-gray"
                    }`}
                  >
                    팀 {team.teamId === 100 ? "블루" : "레드"}
                  </div>
                  <div className="mt-2 space-y-1">
                    {team.objectives.map((objective) => (
                      <div key={objective.type} className="text-xs">
                        <span className="text-nexus-light-gray">
                          {objective.type}:{" "}
                        </span>
                        <span className="text-white">{objective.kills}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchCard;
