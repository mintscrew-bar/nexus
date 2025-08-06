import axios from "axios";
import {
  Match,
  Participant,
  ParticipantStats,
  Rune,
  SummonerInfo,
  Team,
} from "../types";

// Riot API 설정
const RIOT_API_BASE_URL = "https://kr.api.riotgames.com";
const RIOT_API_KEY = process.env.REACT_APP_RIOT_API_KEY || "";

// Axios 인스턴스 생성
const riotApi = axios.create({
  baseURL: RIOT_API_BASE_URL,
  headers: {
    "X-Riot-Token": RIOT_API_KEY,
  },
});

// API 응답 인터셉터
riotApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Riot API Error:", error.response?.data);
    throw error;
  }
);

export class RiotApiService {
  // 소환사 정보 조회
  static async getSummonerByName(
    name: string,
    tag: string
  ): Promise<SummonerInfo> {
    try {
      const response = await riotApi.get(
        `/lol/summoner/v4/summoners/by-name/${encodeURIComponent(name)}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get summoner info: ${error}`);
    }
  }

  // 소환사 정보 조회 (PUUID로)
  static async getSummonerByPuuid(puuid: string): Promise<SummonerInfo> {
    try {
      const response = await riotApi.get(
        `/lol/summoner/v4/summoners/by-puuid/${puuid}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get summoner info by puuid: ${error}`);
    }
  }

  // 리그 정보 조회
  static async getLeagueEntries(summonerId: string) {
    try {
      const response = await riotApi.get(
        `/lol/league/v4/entries/by-summoner/${summonerId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get league entries: ${error}`);
    }
  }

  // 최근 매치 ID 목록 조회
  static async getRecentMatchIds(
    puuid: string,
    count: number = 20
  ): Promise<string[]> {
    try {
      const response = await riotApi.get(
        `/lol/match/v5/matches/by-puuid/${puuid}/ids`,
        {
          params: {
            count,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get recent match IDs: ${error}`);
    }
  }

  // 매치 상세 정보 조회
  static async getMatchDetails(matchId: string): Promise<Match> {
    try {
      const response = await riotApi.get(`/lol/match/v5/matches/${matchId}`);
      const matchData = response.data;

      // Riot API 응답을 내부 Match 타입으로 변환
      const match: Match = {
        id: matchData.info.gameId.toString(),
        matchId: matchId,
        gameMode: matchData.info.gameMode,
        gameType: matchData.info.gameType,
        gameDuration: matchData.info.gameDuration,
        gameCreation: new Date(matchData.info.gameCreation),
        participants: matchData.info.participants.map((p: any) =>
          this.transformParticipant(p)
        ),
        teams: this.transformTeams(matchData.info.teams),
        isCustomGame: matchData.info.gameMode === "CUSTOM_GAME",
      };

      return match;
    } catch (error) {
      throw new Error(`Failed to get match details: ${error}`);
    }
  }

  // 챔피언 정보 조회 (정적 데이터)
  static async getChampionData() {
    try {
      const response = await axios.get(
        "https://ddragon.leagueoflegends.com/cdn/13.24.1/data/ko_KR/champion.json"
      );
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to get champion data: ${error}`);
    }
  }

  // 아이템 정보 조회 (정적 데이터)
  static async getItemData() {
    try {
      const response = await axios.get(
        "https://ddragon.leagueoflegends.com/cdn/13.24.1/data/ko_KR/item.json"
      );
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to get item data: ${error}`);
    }
  }

  // 스펠 정보 조회 (정적 데이터)
  static async getSpellData() {
    try {
      const response = await axios.get(
        "https://ddragon.leagueoflegends.com/cdn/13.24.1/data/ko_KR/summoner.json"
      );
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to get spell data: ${error}`);
    }
  }

  // 룬 정보 조회 (정적 데이터)
  static async getRuneData() {
    try {
      const response = await axios.get(
        "https://ddragon.leagueoflegends.com/cdn/13.24.1/data/ko_KR/runesReforged.json"
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get rune data: ${error}`);
    }
  }

  // 사용자 설정 게임 토너먼트 코드 생성 (백엔드 API 호출)
  static async createTournamentCode(
    tournamentId: string,
    count: number = 1
  ): Promise<string[]> {
    try {
      const response = await axios.post("/api/tournaments/codes", {
        tournamentId,
        count,
      });
      return response.data.codes;
    } catch (error) {
      throw new Error(`Failed to create tournament codes: ${error}`);
    }
  }

  // 사용자 설정 게임 매치 ID 조회 (토너먼트 코드 기반, 백엔드 API 호출)
  static async getCustomGameMatchId(
    tournamentCode: string
  ): Promise<string | null> {
    try {
      const response = await axios.get(
        `/api/tournaments/match/${tournamentCode}`
      );
      return response.data.matchId || null;
    } catch (error) {
      throw new Error(`Failed to get custom game match ID: ${error}`);
    }
  }

  // 내부 헬퍼 메서드들
  private static transformParticipant(participantData: any): Participant {
    return {
      summonerId: participantData.summonerId,
      summonerName: participantData.summonerName,
      puuid: participantData.puuid,
      championId: participantData.championId,
      championName: participantData.championName,
      teamId: participantData.teamId,
      lane: participantData.lane,
      role: participantData.role,
      kills: participantData.kills,
      deaths: participantData.deaths,
      assists: participantData.assists,
      cs:
        participantData.totalMinionsKilled +
        participantData.neutralMinionsKilled,
      gold: participantData.goldEarned,
      items: [
        participantData.item0,
        participantData.item1,
        participantData.item2,
        participantData.item3,
        participantData.item4,
        participantData.item5,
        participantData.item6,
      ].filter((item) => item !== 0),
      spells: [participantData.summoner1Id, participantData.summoner2Id],
      runes: this.transformRunes(participantData.perks),
      stats: this.transformParticipantStats(participantData),
    };
  }

  private static transformTeams(teamsData: any[]): Team[] {
    return teamsData.map((team) => ({
      teamId: team.teamId,
      win: team.win,
      objectives: team.objectives.map((obj: any) => ({
        type: obj.objective,
        first: obj.first,
        kills: obj.kills,
      })),
    }));
  }

  private static transformParticipantStats(
    participantData: any
  ): ParticipantStats {
    return {
      totalDamageDealt: participantData.totalDamageDealtToChampions,
      totalDamageTaken: participantData.totalDamageTaken,
      visionScore: participantData.visionScore,
      objectivesStolen: participantData.objectivesStolen,
      doubleKills: participantData.doubleKills,
      tripleKills: participantData.tripleKills,
      quadraKills: participantData.quadraKills,
      pentaKills: participantData.pentaKills,
    };
  }

  private static transformRunes(perksData: any): Rune[] {
    if (!perksData) return [];

    const runes: Rune[] = [];

    // 메인 룬
    if (perksData.perkIds && perksData.perkIds.length > 0) {
      runes.push({
        id: perksData.perkIds[0],
        name: "메인 룬",
        icon: "",
      });
    }

    // 서브 룬
    if (perksData.perkSubStyle) {
      runes.push({
        id: perksData.perkSubStyle,
        name: "서브 룬",
        icon: "",
      });
    }

    return runes;
  }
}

export default RiotApiService;
