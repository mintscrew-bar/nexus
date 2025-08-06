const dbManager = require("../config/database-manager");

const createTables = async () => {
  try {
    console.log("🔄 Creating database tables...");

    // Users table
    await dbManager.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        google_id VARCHAR(255) UNIQUE,
        discord_id VARCHAR(255) UNIQUE,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        nexus_nickname VARCHAR(100) NOT NULL,
        riot_nickname VARCHAR(100),
        riot_tag VARCHAR(10),
        puuid VARCHAR(255),
        avatar_url TEXT,
        auth_provider VARCHAR(20) DEFAULT 'local',
        is_verified BOOLEAN DEFAULT FALSE,
        is_streamer BOOLEAN DEFAULT FALSE,
        is_online BOOLEAN DEFAULT FALSE,
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        tier_info JSONB,
        main_lane VARCHAR(20),
        most_champions JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Friends table
    await dbManager.query(`
      CREATE TABLE IF NOT EXISTS friends (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        friend_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, friend_user_id)
      )
    `);

    // Messages table
    await dbManager.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Custom games table
    await dbManager.query(`
      CREATE TABLE IF NOT EXISTS custom_games (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        password VARCHAR(100),
        max_players INTEGER DEFAULT 10,
        current_players INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'recruiting' CHECK (status IN ('recruiting', 'in-progress', 'completed')),
        team_composition VARCHAR(20) DEFAULT 'none' CHECK (team_composition IN ('none', 'auction', 'rock-paper-scissors')),
        ban_pick_mode VARCHAR(50) DEFAULT 'Draft Pick',
        allow_spectators BOOLEAN DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Custom game participants table
    await dbManager.query(`
      CREATE TABLE IF NOT EXISTS custom_game_participants (
        id SERIAL PRIMARY KEY,
        game_id INTEGER REFERENCES custom_games(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) DEFAULT 'participant' CHECK (role IN ('leader', 'participant')),
        team_id INTEGER,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(game_id, user_id)
      )
    `);

    // Game chat messages table
    await dbManager.query(`
      CREATE TABLE IF NOT EXISTS game_chat_messages (
        id SERIAL PRIMARY KEY,
        game_id INTEGER REFERENCES custom_games(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Community posts table
    await dbManager.query(`
      CREATE TABLE IF NOT EXISTS community_posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        likes_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Community comments table
    await dbManager.query(`
      CREATE TABLE IF NOT EXISTS community_comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES community_posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tournaments table
    await dbManager.query(`
      CREATE TABLE IF NOT EXISTS tournaments (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        max_participants INTEGER,
        current_participants INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'registration', 'in-progress', 'completed')),
        created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tournament participants table
    await dbManager.query(`
      CREATE TABLE IF NOT EXISTS tournament_participants (
        id SERIAL PRIMARY KEY,
        tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'eliminated')),
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tournament_id, user_id)
      )
    `);

    // Feedback table
    await dbManager.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'resolved', 'closed')),
        admin_response TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Streamer info table
    await dbManager.query(`
      CREATE TABLE IF NOT EXISTS streamer_info (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        stream_link TEXT NOT NULL,
        platform VARCHAR(20) DEFAULT 'twitch' CHECK (platform IN ('twitch', 'youtube', 'afreeca')),
        recent_broadcast TEXT,
        viewer_count INTEGER DEFAULT 0,
        is_live BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Matches table
    await dbManager.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id SERIAL PRIMARY KEY,
        game_id INTEGER REFERENCES custom_games(id) ON DELETE CASCADE,
        match_data JSONB,
        winner_team INTEGER,
        duration INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User statistics table
    await dbManager.query(`
      CREATE TABLE IF NOT EXISTS user_statistics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        total_games INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        win_rate DECIMAL(5,2) DEFAULT 0.00,
        average_kda DECIMAL(5,2) DEFAULT 0.00,
        favorite_champions JSONB,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await dbManager.query(
      "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)"
    );
    await dbManager.query(
      "CREATE INDEX IF NOT EXISTS idx_users_nexus_nickname ON users(nexus_nickname)"
    );
    await dbManager.query(
      "CREATE INDEX IF NOT EXISTS idx_custom_games_status ON custom_games(status)"
    );
    await dbManager.query(
      "CREATE INDEX IF NOT EXISTS idx_community_posts_category ON community_posts(category)"
    );

    console.log("✅ Database tables created successfully!");
    return true;
  } catch (error) {
    console.error("❌ Database table creation failed:", error);
    throw error;
  }
};

const dropTables = async () => {
  try {
    console.log("🔄 Dropping all tables...");

    const tables = [
      "user_statistics",
      "matches",
      "streamer_info",
      "feedback",
      "tournament_participants",
      "tournaments",
      "community_comments",
      "community_posts",
      "game_chat_messages",
      "custom_game_participants",
      "custom_games",
      "messages",
      "friends",
      "users",
    ];

    for (const table of tables) {
      await dbManager.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
      console.log(`✅ Dropped table: ${table}`);
    }

    console.log("✅ All tables dropped successfully!");
    return true;
  } catch (error) {
    console.error("❌ Failed to drop tables:", error);
    throw error;
  }
};

const resetDatabase = async () => {
  try {
    console.log("🔄 Resetting database...");
    await dropTables();
    await createTables();
    console.log("✅ Database reset completed successfully!");
    return true;
  } catch (error) {
    console.error("❌ Database reset failed:", error);
    throw error;
  }
};

module.exports = {
  createTables,
  dropTables,
  resetDatabase,
};
