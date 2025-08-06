import { Clock } from "lucide-react";
import React, { useEffect, useState } from "react";
import RiotApiService from "../../services/riotApi";
import { useAppStore } from "../../store/useAppStore";
import { Match } from "../../types";
import LoadingSpinner from "../common/LoadingSpinner";
import MatchCard from "./MatchCard";

interface MatchHistoryProps {
  userId: number; // userId를 number로 변경
}

const MatchHistory: React.FC<MatchHistoryProps> = ({ userId }) => {
  const { user } = useAppStore();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.puuid) {
      loadMatchHistory(user.puuid);
    }
  }, [user?.puuid]);

  const loadMatchHistory = async (puuid: string) => {
    try {
      setLoading(true);
      setError(null);

      // 최근 20게임의 매치 ID 가져오기
      const matchIds = await RiotApiService.getRecentMatchIds(puuid, 20);

      const fetchedMatches: Match[] = [];
      for (const matchId of matchIds) {
        try {
          const matchDetails = await RiotApiService.getMatchDetails(matchId);
          fetchedMatches.push(matchDetails);
        } catch (detailError) {
          console.error(
            `Failed to get details for match ${matchId}:`,
            detailError
          );
        }
      }

      setMatches(fetchedMatches);
    } catch (error) {
      console.error("Failed to load match history:", error);
      setError(
        "전적을 불러오는데 실패했습니다. Riot ID가 올바른지 확인해주세요."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-theme-surface rounded-lg p-6 border border-theme-border">
        <LoadingSpinner size="md" text="전적을 불러오는 중..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-theme-surface rounded-lg p-6 border border-theme-border text-theme-text text-center">
        <div className="text-red-500 mb-2">⚠️</div>
        <p className="text-theme-text-secondary">{error}</p>
        <button
          onClick={() => user?.puuid && loadMatchHistory(user.puuid)}
          className="mt-4 px-4 py-2 bg-nexus-blue text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-theme-surface rounded-lg p-6 border border-theme-border text-theme-text text-center">
        사용자 정보를 불러올 수 없습니다.
      </div>
    );
  }

  const userMatches = matches.filter((match) =>
    match.participants.some((p) => p.puuid === user.puuid)
  );

  const totalGames = userMatches.length;
  const wins = userMatches.filter((match) => {
    const participant = match.participants.find((p) => p.puuid === user.puuid);
    return participant?.teamId === match.teams.find((t) => t.win)?.teamId;
  }).length;
  const losses = totalGames - wins;
  const winRate =
    totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : "0.0";

  // KDA 계산
  const totalKills = userMatches.reduce((sum, match) => {
    const participant = match.participants.find((p) => p.puuid === user.puuid);
    return sum + (participant?.kills || 0);
  }, 0);

  const totalDeaths = userMatches.reduce((sum, match) => {
    const participant = match.participants.find((p) => p.puuid === user.puuid);
    return sum + (participant?.deaths || 0);
  }, 0);

  const totalAssists = userMatches.reduce((sum, match) => {
    const participant = match.participants.find((p) => p.puuid === user.puuid);
    return sum + (participant?.assists || 0);
  }, 0);

  const avgKDA =
    totalDeaths > 0
      ? ((totalKills + totalAssists) / totalDeaths).toFixed(2)
      : "∞";

  // 모스트 챔피언 계산
  const championStats = userMatches.reduce((stats, match) => {
    const participant = match.participants.find((p) => p.puuid === user.puuid);
    if (participant) {
      const championName = participant.championName;
      if (!stats[championName]) {
        stats[championName] = {
          games: 0,
          wins: 0,
          kills: 0,
          deaths: 0,
          assists: 0,
        };
      }
      stats[championName].games++;
      stats[championName].kills += participant.kills;
      stats[championName].deaths += participant.deaths;
      stats[championName].assists += participant.assists;

      const isWin =
        participant.teamId === match.teams.find((t) => t.win)?.teamId;
      if (isWin) stats[championName].wins++;
    }
    return stats;
  }, {} as Record<string, { games: number; wins: number; kills: number; deaths: number; assists: number }>);

  const mostPlayedChampions = Object.entries(championStats)
    .sort(([, a], [, b]) => (b as any).games - (a as any).games)
    .slice(0, 5)
    .map(([champion, stats]) => ({
      champion,
      games: (stats as any).games,
      winRate: (((stats as any).wins / (stats as any).games) * 100).toFixed(1),
      kda:
        (stats as any).deaths > 0
          ? (
              ((stats as any).kills + (stats as any).assists) /
              (stats as any).deaths
            ).toFixed(2)
          : "∞",
    }));

  return (
    <div className="space-y-6">
      {/* 전적 요약 */}
      <div className="bg-theme-surface rounded-lg p-6 border border-theme-border">
        <h2 className="text-xl font-semibold text-theme-text mb-4">
          전적 요약
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{totalGames}</div>
            <div className="text-sm text-theme-text-secondary">총 게임</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{wins}</div>
            <div className="text-sm text-theme-text-secondary">승리</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{losses}</div>
            <div className="text-sm text-theme-text-secondary">패배</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-nexus-yellow">
              {winRate}%
            </div>
            <div className="text-sm text-theme-text-secondary">승률</div>
          </div>
        </div>

        {/* KDA 정보 */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-nexus-blue">
              {totalKills}
            </div>
            <div className="text-sm text-theme-text-secondary">총 킬</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-red-400">{totalDeaths}</div>
            <div className="text-sm text-theme-text-secondary">총 데스</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-nexus-green">
              {totalAssists}
            </div>
            <div className="text-sm text-theme-text-secondary">총 어시스트</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-nexus-yellow">{avgKDA}</div>
            <div className="text-sm text-theme-text-secondary">평균 KDA</div>
          </div>
        </div>
      </div>

      {/* 모스트 챔피언 */}
      {mostPlayedChampions.length > 0 && (
        <div className="bg-theme-surface rounded-lg p-6 border border-theme-border">
          <h3 className="text-lg font-semibold text-theme-text mb-4">
            모스트 챔피언
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mostPlayedChampions.map((champ, index) => (
              <div
                key={champ.champion}
                className="bg-theme-bg-secondary rounded-lg p-4 border border-theme-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-theme-text">
                    {champ.champion}
                  </span>
                  <span className="text-sm text-nexus-yellow">
                    #{index + 1}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-nexus-blue">
                      {champ.games}
                    </div>
                    <div className="text-theme-text-secondary">게임</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-green-400">
                      {champ.winRate}%
                    </div>
                    <div className="text-theme-text-secondary">승률</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-nexus-yellow">
                      {champ.kda}
                    </div>
                    <div className="text-theme-text-secondary">KDA</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 최근 전적 */}
      <div className="bg-theme-surface rounded-lg p-6 border border-theme-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-theme-text">최근 전적</h3>
          <div className="flex items-center space-x-2 text-sm text-theme-text-secondary">
            <Clock className="w-4 h-4" />
            <span>최근 {userMatches.length}게임</span>
          </div>
        </div>

        {userMatches.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-theme-text-secondary">아직 전적이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userMatches.slice(0, 10).map((match) => (
              <MatchCard key={match.id} match={match} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchHistory;
