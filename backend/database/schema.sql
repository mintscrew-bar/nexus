-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255),
  nexus_nickname VARCHAR(100) NOT NULL UNIQUE,
  riot_nickname VARCHAR(100),
  riot_tag VARCHAR(10),
  puuid VARCHAR(255),
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_streamer BOOLEAN DEFAULT FALSE,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  auth_provider VARCHAR(50) DEFAULT 'local' CHECK (auth_provider IN ('local', 'google', 'discord')),
  google_id VARCHAR(255),
  discord_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 커뮤니티 게시글 테이블
CREATE TABLE IF NOT EXISTS community_posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  tags TEXT[],
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  dislike_count INTEGER DEFAULT 0,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 커뮤니티 댓글 테이블
CREATE TABLE IF NOT EXISTS community_comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id INTEGER REFERENCES community_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  dislike_count INTEGER DEFAULT 0,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 커스텀 게임 테이블
CREATE TABLE IF NOT EXISTS custom_games (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  password VARCHAR(255),
  max_players INTEGER NOT NULL DEFAULT 10,
  current_players INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'recruiting' CHECK (status IN ('recruiting', 'team-formation', 'line-selection', 'in-progress', 'completed')),
  team_composition VARCHAR(50) DEFAULT 'none' CHECK (team_composition IN ('none', 'auction', 'rock-paper-scissors')),
  ban_pick_mode VARCHAR(100) DEFAULT 'standard',
  allow_spectators BOOLEAN DEFAULT TRUE,
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 게임 참가자 테이블
CREATE TABLE IF NOT EXISTS game_participants (
  id SERIAL PRIMARY KEY,
  game_id INTEGER NOT NULL REFERENCES custom_games(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'player' CHECK (role IN ('player', 'leader', 'spectator')),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(game_id, user_id)
);

-- 친구 테이블
CREATE TABLE IF NOT EXISTS friends (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, friend_user_id)
);

-- 전적 테이블
CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  match_id VARCHAR(255) NOT NULL UNIQUE,
  tournament_code VARCHAR(255),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_mode VARCHAR(100) NOT NULL,
  game_type VARCHAR(100) NOT NULL,
  game_duration INTEGER NOT NULL,
  game_creation TIMESTAMP NOT NULL,
  is_custom_game BOOLEAN DEFAULT FALSE,
  participants JSONB NOT NULL,
  teams JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 스트리머 정보 테이블
CREATE TABLE IF NOT EXISTS streamer_info (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stream_link VARCHAR(500) NOT NULL,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('twitch', 'youtube', 'afreeca')),
  recent_broadcast TEXT,
  viewer_count INTEGER DEFAULT 0,
  is_live BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- 토너먼트 테이블
CREATE TABLE IF NOT EXISTS tournaments (
  id SERIAL PRIMARY KEY,
  game_id INTEGER NOT NULL REFERENCES custom_games(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  current_round INTEGER DEFAULT 1,
  total_rounds INTEGER DEFAULT 1,
  winner_id INTEGER REFERENCES users(id),
  runner_up_id INTEGER REFERENCES users(id),
  third_place_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(game_id)
);

-- 게임 팀 테이블
CREATE TABLE IF NOT EXISTS game_teams (
  id SERIAL PRIMARY KEY,
  game_id INTEGER NOT NULL REFERENCES custom_games(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  leader_id INTEGER NOT NULL REFERENCES users(id),
  color VARCHAR(20) NOT NULL CHECK (color IN ('blue', 'red')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 게임 라인 포지션 테이블
CREATE TABLE IF NOT EXISTS game_line_positions (
  id SERIAL PRIMARY KEY,
  game_id INTEGER NOT NULL REFERENCES custom_games(id) ON DELETE CASCADE,
  name VARCHAR(20) NOT NULL CHECK (name IN ('top', 'jungle', 'mid', 'adc', 'support')),
  player_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(game_id, name)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_user_id ON friends(friend_user_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);
CREATE INDEX IF NOT EXISTS idx_matches_user_id ON matches(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_match_id ON matches(match_id);
CREATE INDEX IF NOT EXISTS idx_streamer_info_user_id ON streamer_info(user_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_game_id ON tournaments(game_id);
CREATE INDEX IF NOT EXISTS idx_game_teams_game_id ON game_teams(game_id);
CREATE INDEX IF NOT EXISTS idx_game_line_positions_game_id ON game_line_positions(game_id); 