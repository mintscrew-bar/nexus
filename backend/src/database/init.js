const dbManager = require("../config/database-manager");

const createTables = async () => {
  try {
    console.log("🔄 Initializing database...");

    // Users table - 권한 문제 해결을 위해 더 간단한 방식 사용
    try {
      await dbManager.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255),
          nexus_nickname VARCHAR(100) NOT NULL UNIQUE,
          riot_nickname VARCHAR(100),
          riot_tag VARCHAR(10),
          puuid VARCHAR(255),
          avatar_url TEXT,
          is_verified BOOLEAN DEFAULT FALSE,
          is_streamer BOOLEAN DEFAULT FALSE,
          is_online BOOLEAN DEFAULT FALSE,
          last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          auth_provider VARCHAR(50) DEFAULT 'local',
          google_id VARCHAR(255),
          discord_id VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (error) {
      console.log("⚠️  Users table creation failed, checking if it exists...");
      // 테이블이 이미 존재하는지 확인
      const tableExists = await dbManager.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        )
      `);

      if (!tableExists.rows[0].exists) {
        throw new Error("Users table does not exist and cannot be created");
      }
      console.log("✅ Users table already exists");
    }

    // Friends table
    try {
      await dbManager.query(`
        CREATE TABLE IF NOT EXISTS friends (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          friend_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          status VARCHAR(20) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, friend_user_id)
        )
      `);
    } catch (error) {
      console.log("⚠️  Friends table creation failed, skipping...");
    }

    // Custom games table
    await dbManager.query(`
      CREATE TABLE IF NOT EXISTS custom_games (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        password VARCHAR(100),
        max_players INTEGER DEFAULT 10,
        current_players INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'recruiting' CHECK (status IN ('recruiting', 'team-formation', 'line-selection', 'in-progress', 'completed')),
        team_composition VARCHAR(20) DEFAULT 'none' CHECK (team_composition IN ('none', 'auction', 'rock-paper-scissors')),
        ban_pick_mode VARCHAR(50) DEFAULT 'Draft Pick',
        allow_spectators BOOLEAN DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Game participants table
    await dbManager.query(`
      CREATE TABLE IF NOT EXISTS game_participants (
        id SERIAL PRIMARY KEY,
        game_id INTEGER REFERENCES custom_games(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) DEFAULT 'player' CHECK (role IN ('leader', 'player', 'spectator')),
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(game_id, user_id)
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

    // Custom game participants table (별도 테이블)
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

    console.log("✅ Database initialized successfully!");
    return true;
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
};

const checkConnection = async () => {
  try {
    const result = await dbManager.query("SELECT NOW()");
    console.log("✅ Database connection successful:", result.rows[0]);
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
};

const initDatabase = async () => {
  try {
    const isConnected = await checkConnection();
    if (!isConnected) {
      throw new Error("Database connection failed");
    }

    await createTables();
    console.log("✅ Database initialization completed successfully!");
    return true;
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    return false;
  }
};

module.exports = {
  createTables,
  checkConnection,
  initDatabase,
};
