const dbManager = require("./src/config/database-manager");

async function checkGames() {
  try {
    await dbManager.initialize();
    console.log("✅ Database connected");

    const result = await dbManager.query(
      "SELECT * FROM custom_games ORDER BY id DESC LIMIT 5"
    );
    console.log("📋 Custom games:", result.rows);

    if (result.rows.length === 0) {
      console.log("❌ No custom games found in database");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkGames();
