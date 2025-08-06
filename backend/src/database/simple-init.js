const dbManager = require("../config/database-manager");

const simpleInit = async () => {
  try {
    console.log("🔄 Simple database initialization...");

    // 연결 테스트
    const result = await dbManager.query("SELECT NOW()");
    console.log("✅ Database connection successful:", result.rows[0]);

    // users 테이블이 존재하는지 확인
    const tableCheck = await dbManager.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      )
    `);

    if (tableCheck.rows[0].exists) {
      console.log("✅ Users table already exists");

      // 테이블 구조 확인
      const columns = await dbManager.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users'
        ORDER BY ordinal_position
      `);

      console.log("📊 Users table structure:");
      columns.rows.forEach((col) => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });

      return true;
    } else {
      console.log("❌ Users table does not exist");
      return false;
    }
  } catch (error) {
    console.error("❌ Simple database initialization failed:", error);
    return false;
  }
};

module.exports = { simpleInit };
