const { pool } = require("./src/config/database");

async function testDatabase() {
  try {
    console.log("🔄 Testing database connection...");

    // 연결 테스트
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Database connection successful:", result.rows[0]);

    // users 테이블 확인
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    `);

    console.log("📋 Users table exists:", tables.rows.length > 0);

    if (tables.rows.length > 0) {
      // users 테이블 구조 확인
      const columns = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users'
      `);

      console.log("📊 Users table columns:");
      columns.rows.forEach((col) => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
    }
  } catch (error) {
    console.error("❌ Database test failed:", error);
  } finally {
    await pool.end();
  }
}

testDatabase();
