const { pool } = require("./src/config/database");

async function createUsersTable() {
  try {
    console.log("🔄 Creating users table...");

    await pool.query(`
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
        auth_provider VARCHAR(50) DEFAULT 'local' CHECK (auth_provider IN ('local', 'google', 'discord')),
        google_id VARCHAR(255),
        discord_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Users table created successfully!");
  } catch (error) {
    console.error("❌ Error creating users table:", error);
  } finally {
    await pool.end();
  }
}

createUsersTable();
