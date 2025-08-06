const { pool } = require("./src/config/database");

async function checkSchema() {
  try {
    console.log("🔍 Checking database schema...");

    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('google_id', 'discord_id')
    `);

    console.log("Column types:", result.rows);

    // 전체 users 테이블 구조도 확인
    const allColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

    console.log("\nAll users table columns:");
    allColumns.rows.forEach((row) => {
      console.log(`${row.column_name}: ${row.data_type}`);
    });
  } catch (error) {
    console.error("Error checking schema:", error);
  } finally {
    process.exit(0);
  }
}

checkSchema();
