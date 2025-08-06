// User related types
export interface User {
  id: number;
  email: string;
  nexusNickname: string;
  riotNickname?: string;
  riotTag?: string;
  puuid?: string;
  tier?: Tier;
  mainLane?: string;
  mostChampions?: string[];
  isStreamer: boolean;
  isVerified: boolean;
  isOnline?: boolean;
  lastSeen?: string; // Date 대신 string으로 변경
  avatarUrl?: string;
  streamerInfo?: StreamerInfo;
}

export interface Tier {
  soloRank?: RankInfo;
  flexRank?: RankInfo;
}

export interface RankInfo {
  tier: string;
  rank: string;
  lp: number;
  wins: number;
  losses: number;
}

// Match related types
export interface Match {
  id: string;
  matchId: string;
  tournamentCode?: string;
  gameMode: string;
  gameType: string;
  gameDuration: number;
  gameCreation: Date;
  participants: Participant[];
  teams: Team[];
  isCustomGame: boolean;
}

export interface Participant {
  summonerId: string;
  summonerName: string;
  puuid: string;
  championId: number;
  championName: string;
  teamId: number;
  lane: string;
  role: string;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  gold: number;
  items: number[];
  spells: number[];
  runes: Rune[];
  stats: ParticipantStats;
}

export interface ParticipantStats {
  totalDamageDealt: number;
  totalDamageTaken: number;
  visionScore: number;
  objectivesStolen: number;
  doubleKills: number;
  tripleKills: number;
  quadraKills: number;
  pentaKills: number;
}

export interface Team {
  teamId: number;
  win: boolean;
  objectives: Objective[];
}

export interface Objective {
  type: string;
  first: boolean;
  kills: number;
}

export interface Rune {
  id: number;
  name: string;
  icon: string;
}

// Friend and messaging types
export interface Friend {
  id: number;
  userId: number;
  friendUserId: number;
  status:
    | "pending"
    | "accepted"
    | "rejected"
    | "blocked"
    | "online"
    | "offline";
  nexusNickname: string;
  riotNickname?: string;
  riotTag?: string;
  avatarUrl?: string;
  isStreamer: boolean;
  isOnline: boolean;
  lastSeen?: string;
  tierInfo?: any;
  mainLane?: string;
  mostChampions?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FriendRequest {
  id: number;
  fromUser: User;
  createdAt: Date;
}

export interface Message {
  id: string;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

// Streamer types
export interface StreamerInfo {
  id: string;
  userId: number; // string에서 number로 변경
  streamLink: string;
  viewerCount: number;
  recentBroadcast: string;
  isLive: boolean;
  platform: "twitch" | "youtube" | "afreeca";
}

// Custom game types
export interface CustomGame {
  id: string;
  title: string;
  description: string;
  password?: string;
  maxPlayers: number;
  currentPlayers: number;
  status:
    | "recruiting"
    | "team-leader-election"
    | "team-formation"
    | "line-selection"
    | "in-progress"
    | "completed";
  teamComposition: "auction" | "rock-paper-scissors" | "none";
  banPickMode: string;
  allowSpectators: boolean;
  createdAt: Date;
  createdBy: number;
  participants: CustomGameParticipant[];
  teams?: GameTeam[];
  currentPhase?: string;
}

export interface GameTeam {
  id: number;
  name: string;
  leader: CustomGameParticipant;
  members: CustomGameParticipant[];
  color: "blue" | "red";
}

export interface LinePosition {
  id: number;
  name: "top" | "jungle" | "mid" | "adc" | "support";
  playerId?: number;
  playerNickname?: string;
}

export interface CustomGameParticipant {
  userId: number; // string에서 number로 변경
  user: User;
  teamId?: number;
  role: "leader" | "member" | "spectator";
  joinedAt: Date;
}

// API response types
export interface RiotApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface SummonerInfo {
  id: string;
  accountId: string;
  puuid: string;
  name: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

// Store types
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  theme: "dark" | "light";
  friends: Friend[];
  messages: Message[];
  matches: Match[];
  customGames: CustomGame[];
  streamers: StreamerInfo[];
  isLoading: boolean;
  error: string | null;
}

// UI types
export interface MatchCardProps {
  match: Match;
  user: User;
  isExpanded: boolean;
  onToggle: () => void;
}

export interface UserProfileProps {
  user: User;
  onEdit: () => void;
}

export interface FriendListProps {
  friends: Friend[];
  onMessage: (friend: Friend) => void;
  onRemove: (friend: Friend) => void;
}

export interface MessageListProps {
  messages: Message[];
  currentUser: User;
  onSendMessage: (content: string, receiverId: number) => void; // receiverId를 number로 변경
}

export interface Tournament {
  id: number;
  gameId: number;
  name: string;
  status: "pending" | "in-progress" | "completed";
  currentRound: number;
  totalRounds: number;
  participants: TournamentParticipant[];
  matches: TournamentMatch[];
  winner?: TournamentParticipant;
  runnerUp?: TournamentParticipant;
  thirdPlace?: TournamentParticipant;
  createdAt: Date;
  updatedAt: Date;
}

export interface TournamentParticipant {
  id: number;
  tournamentId: number;
  userId: number;
  nexusNickname: string;
  avatarUrl?: string;
  seed: number;
  eliminated: boolean;
  finalRank?: number;
  joinedAt: Date;
}

export interface TournamentMatch {
  id: number;
  tournamentId: number;
  round: number;
  matchNumber: number;
  player1Id?: number;
  player2Id?: number;
  player1Nickname?: string;
  player2Nickname?: string;
  winnerId?: number;
  winnerNickname?: string;
  status: "pending" | "in-progress" | "completed";
  tournamentCode?: string;
  gameId?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface TournamentBracket {
  rounds: TournamentRound[];
  participants: TournamentParticipant[];
}

export interface TournamentRound {
  round: number;
  matches: TournamentMatch[];
  name: string;
}

export interface TournamentResult {
  tournament: Tournament;
  bracket: TournamentBracket;
  finalStandings: TournamentParticipant[];
}
