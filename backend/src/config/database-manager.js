const { Pool } = require("pg");

class DatabaseManager {
  constructor() {
    this.pool = null;
    this.isInitialized = false;
    this.connectionString =
      process.env.DATABASE_URL ||
      "postgresql://nexus_user:justgamo1226.@localhost:5432/nexus_db";
    this.initializing = false; // 초기화 중인지 추적
  }

  async initialize() {
    // 이미 초기화 중이면 대기
    if (this.initializing) {
      console.log("🔄 Database initialization already in progress, waiting...");
      while (this.initializing) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return this.isInitialized;
    }

    try {
      this.initializing = true;
      console.log("🔄 Initializing database manager...");

      // 기존 풀이 있으면 종료
      if (this.pool && !this.pool.ended) {
        await this.pool.end();
      }

      // 새로운 풀 생성
      this.pool = new Pool({
        connectionString: this.connectionString,
        max: parseInt(process.env.DB_MAX_CONNECTIONS) || 20,
        idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
        connectionTimeoutMillis:
          parseInt(process.env.DB_CONNECTION_TIMEOUT) || 10000,
        ssl:
          process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : false,
      });

      // 연결 이벤트 리스너
      this.pool.on("connect", () => {
        console.log("✅ Connected to PostgreSQL database");
      });

      this.pool.on("error", (err) => {
        console.error("❌ PostgreSQL connection error:", err);
      });

      // 연결 테스트
      await this.pool.query("SELECT NOW()");

      this.isInitialized = true;
      console.log("✅ Database manager initialized successfully");
      return true;
    } catch (error) {
      console.error("❌ Database manager initialization failed:", error);
      this.isInitialized = false;
      this.pool = null;
      return false;
    } finally {
      this.initializing = false;
    }
  }

  isHealthy() {
    return this.isInitialized && this.pool && !this.pool.ended;
  }

  async query(text, params) {
    // 안전한 초기화 체크
    if (!this.isHealthy()) {
      console.log("🔄 Database not healthy, initializing...");
      const success = await this.initialize();
      if (!success) {
        throw new Error("Failed to initialize database connection");
      }
    }

    try {
      const start = Date.now();
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      console.log("Executed query", { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error("Query error:", error);

      // 풀 오류인 경우 재초기화 시도
      if (error.message && error.message.includes("pool")) {
        console.log("🔄 Pool error detected, reinitializing...");
        this.isInitialized = false;
        const success = await this.initialize();
        if (success) {
          // 재시도
          const retryRes = await this.pool.query(text, params);
          return retryRes;
        } else {
          throw new Error("Failed to reinitialize database after pool error");
        }
      }

      throw error;
    }
  }

  async getOne(text, params) {
    const res = await this.query(text, params);
    return res.rows[0];
  }

  async getMany(text, params) {
    const res = await this.query(text, params);
    return res.rows;
  }

  async execute(text, params) {
    const res = await this.query(text, params);
    return res.rowCount;
  }

  async connectDB() {
    return await this.initialize();
  }

  async end() {
    if (this.pool && !this.pool.ended) {
      await this.pool.end();
    }
    this.isInitialized = false;
    this.pool = null;
  }

  getPool() {
    return this.pool;
  }

  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isHealthy: this.isHealthy(),
      hasPool: !!this.pool,
      poolEnded: this.pool ? this.pool.ended : true,
      initializing: this.initializing,
    };
  }
}

// 싱글톤 인스턴스
const dbManager = new DatabaseManager();

module.exports = dbManager;
