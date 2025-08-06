const dbManager = require("./src/config/database-manager");

async function testGameQuery() {
  try {
    await dbManager.initialize();
    console.log("✅ Database connected");

    // 게임 ID 16 조회
    const game = await dbManager.getOne(
      `SELECT cg.*, 
              creator.nexus_nickname as creator_nickname,
              creator.avatar_url as creator_avatar
       FROM custom_games cg
       LEFT JOIN users creator ON cg.created_by = creator.id
       WHERE cg.id = $1`,
      [16]
    );

    console.log("📋 Game 16:", game);

    if (!game) {
      console.log("❌ Game 16 not found");
    } else {
      console.log("✅ Game 16 found");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

testGameQuery();
