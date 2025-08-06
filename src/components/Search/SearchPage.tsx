import { AlertCircle, Loader2, Search, User as UserIcon } from "lucide-react";
import React, { useState } from "react";
import { RiotApiService } from "../../services/riotApi";
import { useAppStore } from "../../store/useAppStore";
import { User } from "../../types";
import MatchCard from "../MyPage/MatchCard";

const SearchPage: React.FC = () => {
  const { setMatches, setLoading, setError, matches, isLoading } =
    useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTag, setSearchTag] = useState("");
  const [searchedUser, setSearchedUser] = useState<User | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchTerm.trim() || !searchTag.trim()) {
      setError("Riot ID와 태그를 모두 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);

      // Riot API로 소환사 정보 조회
      const summonerInfo = await RiotApiService.getSummonerByName(
        searchTerm,
        searchTag
      );

      // 리그 정보 조회
      const leagueEntries = await RiotApiService.getLeagueEntries(
        summonerInfo.id
      );

      // 사용자 정보 생성
      const user: User = {
        id: parseInt(summonerInfo.id),
        email: `${summonerInfo.name}@riot.com`,
        nexusNickname: searchTerm,
        riotNickname: summonerInfo.name,
        riotTag: searchTag,
        puuid: summonerInfo.puuid,
        tier: {
          soloRank: leagueEntries.find(
            (entry: any) => entry.queueType === "RANKED_SOLO_5x5"
          ),
          flexRank: leagueEntries.find(
            (entry: any) => entry.queueType === "RANKED_FLEX_SR"
          ),
        },
        isStreamer: false,
        isVerified: false,
        isOnline: false,
      };

      setSearchedUser(user);

      // 최근 매치 ID 목록 조회
      const matchIds = await RiotApiService.getRecentMatchIds(
        summonerInfo.puuid,
        20
      );

      // 매치 상세 정보 조회 (병렬 처리)
      const matchPromises = matchIds
        .slice(0, 10)
        .map((matchId) => RiotApiService.getMatchDetails(matchId));

      const matches = await Promise.all(matchPromises);
      setMatches(matches);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "사용자를 찾을 수 없습니다."
      );
      setSearchedUser(null);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    if (matches.length === 0)
      return { wins: 0, losses: 0, winRate: 0, avgKda: 0 };

    const wins = matches.filter(
      (m) =>
        m.participants.find((p) => p.puuid === searchedUser?.puuid)?.teamId ===
        m.teams.find((t) => t.win)?.teamId
    ).length;

    const userMatches = matches.filter((m) =>
      m.participants.find((p) => p.puuid === searchedUser?.puuid)
    );

    const totalKills = userMatches.reduce((sum, m) => {
      const participant = m.participants.find(
        (p) => p.puuid === searchedUser?.puuid
      );
      return sum + (participant?.kills || 0);
    }, 0);

    const totalDeaths = userMatches.reduce((sum, m) => {
      const participant = m.participants.find(
        (p) => p.puuid === searchedUser?.puuid
      );
      return sum + (participant?.deaths || 0);
    }, 0);

    const totalAssists = userMatches.reduce((sum, m) => {
      const participant = m.participants.find(
        (p) => p.puuid === searchedUser?.puuid
      );
      return sum + (participant?.assists || 0);
    }, 0);

    const avgKda =
      totalDeaths === 0
        ? totalKills + totalAssists
        : (totalKills + totalAssists) / totalDeaths;

    return {
      wins,
      losses: userMatches.length - wins,
      winRate: userMatches.length > 0 ? (wins / userMatches.length) * 100 : 0,
      avgKda: avgKda,
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-theme-text mb-2">전적 검색</h1>
          <p className="text-theme-text-secondary">
            Riot ID로 다른 플레이어의 전적을 검색해보세요
          </p>
        </div>

        {/* 검색 폼 */}
        <div className="bg-theme-surface rounded-lg p-6 mb-8 border border-theme-border">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                  Riot ID *
                </label>
                <input
                  type="text"
                  required
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border rounded-md text-theme-text focus:outline-none focus:border-nexus-blue"
                  placeholder="소환사명"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-text-secondary mb-2">
                  태그 *
                </label>
                <input
                  type="text"
                  required
                  value={searchTag}
                  onChange={(e) => setSearchTag(e.target.value)}
                  className="w-full px-3 py-2 bg-theme-bg-secondary border border-theme-border rounded-md text-theme-text focus:outline-none focus:border-nexus-blue"
                  placeholder="KR1"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto px-6 py-2 bg-nexus-blue text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>검색 중...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>검색</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* 검색 결과 */}
        {hasSearched && (
          <div className="space-y-6">
            {searchedUser ? (
              <>
                {/* 사용자 정보 */}
                <div className="bg-theme-surface rounded-lg p-6 border border-theme-border">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-theme-border rounded-full flex items-center justify-center">
                      <UserIcon className="w-8 h-8 text-theme-text" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-theme-text">
                        {searchedUser.riotNickname}
                      </h2>
                      <p className="text-theme-text-secondary">
                        #{searchedUser.riotTag}
                      </p>
                    </div>
                  </div>

                  {/* 티어 정보 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchedUser.tier?.soloRank && (
                      <div className="bg-theme-bg-secondary rounded-lg p-4 border border-theme-border">
                        <h3 className="text-lg font-semibold text-theme-text mb-2">
                          솔로랭크
                        </h3>
                        <p className="text-theme-text-secondary">
                          {searchedUser.tier.soloRank.tier}{" "}
                          {searchedUser.tier.soloRank.rank}{" "}
                          {searchedUser.tier.soloRank.lp}LP
                        </p>
                        <p className="text-sm text-theme-text-secondary">
                          {searchedUser.tier.soloRank.wins}승{" "}
                          {searchedUser.tier.soloRank.losses}패
                        </p>
                      </div>
                    )}
                    {searchedUser.tier?.flexRank && (
                      <div className="bg-theme-bg-secondary rounded-lg p-4 border border-theme-border">
                        <h3 className="text-lg font-semibold text-theme-text mb-2">
                          자유랭크
                        </h3>
                        <p className="text-theme-text-secondary">
                          {searchedUser.tier.flexRank.tier}{" "}
                          {searchedUser.tier.flexRank.rank}{" "}
                          {searchedUser.tier.flexRank.lp}LP
                        </p>
                        <p className="text-sm text-theme-text-secondary">
                          {searchedUser.tier.flexRank.wins}승{" "}
                          {searchedUser.tier.flexRank.losses}패
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 통계 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-theme-surface rounded-lg p-4 text-center border border-theme-border">
                    <p className="text-2xl font-bold text-theme-text">
                      {stats.winRate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-theme-text-secondary">승률</p>
                  </div>
                  <div className="bg-theme-surface rounded-lg p-4 text-center border border-theme-border">
                    <p className="text-2xl font-bold text-theme-text">
                      {stats.avgKda.toFixed(2)}
                    </p>
                    <p className="text-sm text-theme-text-secondary">
                      평균 KDA
                    </p>
                  </div>
                  <div className="bg-theme-surface rounded-lg p-4 text-center border border-theme-border">
                    <p className="text-2xl font-bold text-theme-text">
                      {matches.length}
                    </p>
                    <p className="text-sm text-theme-text-secondary">총 게임</p>
                  </div>
                  <div className="bg-theme-surface rounded-lg p-4 text-center border border-theme-border">
                    <p className="text-2xl font-bold text-theme-text">
                      {matches.filter((m) => m.isCustomGame).length}
                    </p>
                    <p className="text-sm text-theme-text-secondary">
                      사용자 설정 게임
                    </p>
                  </div>
                </div>

                {/* 전적 목록 */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-theme-text">
                    최근 전적
                  </h3>
                  {matches.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-theme-text-secondary">
                        표시할 전적이 없습니다.
                      </p>
                    </div>
                  ) : (
                    matches.map((match) => (
                      <MatchCard
                        key={match.matchId}
                        match={match}
                        user={searchedUser}
                      />
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="bg-theme-surface rounded-lg p-6 text-center border border-theme-border">
                <AlertCircle className="w-12 h-12 text-nexus-red mx-auto mb-4" />
                <p className="text-theme-text-secondary">
                  사용자를 찾을 수 없습니다.
                </p>
                <p className="text-sm text-theme-text-secondary mt-2">
                  Riot ID와 태그를 다시 확인해주세요.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 검색 가이드 */}
        {!hasSearched && (
          <div className="bg-theme-surface rounded-lg p-6 border border-theme-border">
            <h3 className="text-lg font-semibold text-theme-text mb-4">
              검색 가이드
            </h3>
            <div className="space-y-3 text-sm text-theme-text-secondary">
              <p>
                • Riot ID는 소환사명과 태그로 구성됩니다 (예: SummonerName#KR1)
              </p>
              <p>• 태그는 대소문자를 구분합니다</p>
              <p>• 최근 20게임의 전적을 확인할 수 있습니다</p>
              <p>• 일반 게임과 사용자 설정 게임을 모두 표시합니다</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
