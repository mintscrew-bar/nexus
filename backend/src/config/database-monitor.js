const dbManager = require("./database-manager");

class DatabaseMonitor {
  constructor() {
    this.isHealthy = true;
    this.lastCheck = null;
    this.errorCount = 0;
    this.maxErrors = 5;
  }

  async checkHealth() {
    try {
      const start = Date.now();
      await dbManager.query("SELECT 1");
      const duration = Date.now() - start;

      this.isHealthy = true;
      this.lastCheck = new Date();
      this.errorCount = 0;

      console.log(`✅ Database health check passed (${duration}ms)`);
      return true;
    } catch (error) {
      this.isHealthy = false;
      this.errorCount++;

      console.error(
        `❌ Database health check failed (${this.errorCount}/${this.maxErrors}):`,
        error.message
      );

      if (this.errorCount >= this.maxErrors) {
        console.error(
          "🚨 Database health check failed too many times, attempting restart..."
        );
        await this.restartConnection();
      }

      return false;
    }
  }

  async restartConnection() {
    try {
      console.log("🔄 Restarting database connection...");
      await dbManager.end();
      const success = await dbManager.initialize();

      if (success) {
        this.errorCount = 0;
        this.isHealthy = true;
        console.log("✅ Database connection restarted successfully");
        return true;
      } else {
        console.error("❌ Failed to restart database connection");
        return false;
      }
    } catch (error) {
      console.error("❌ Failed to restart database connection:", error);
      return false;
    }
  }

  getStatus() {
    const dbStatus = dbManager.getStatus();
    return {
      isHealthy: this.isHealthy && dbStatus.isHealthy,
      lastCheck: this.lastCheck,
      errorCount: this.errorCount,
      poolEnded: dbStatus.poolEnded,
    };
  }

  startMonitoring(intervalMs = 30000) {
    console.log(
      `🔍 Starting database monitoring (check every ${intervalMs}ms)`
    );

    setInterval(async () => {
      await this.checkHealth();
    }, intervalMs);
  }
}

module.exports = DatabaseMonitor;
