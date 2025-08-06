const { pool, execute } = require("../config/database");
const bcrypt = require("bcryptjs");

const seedDatabase = async () => {
  try {
    console.log("🔄 Seeding database with sample data...");

    // Create sample users
    const hashedPassword = await bcrypt.hash("password123", 12);

    const users = [
      {
        email: "admin@nexus.com",
        password_hash: hashedPassword,
        nexus_nickname: "NexusAdmin",
        riot_nickname: "NexusAdmin",
        riot_tag: "KR1",
        puuid: "sample-puuid-1",
        avatar_url: "https://via.placeholder.com/150",
        auth_provider: "local",
        is_verified: true,
        is_streamer: false,
        tier_info: JSON.stringify({
          solo: { tier: "GOLD", rank: "II", lp: 1250 },
          flex: { tier: "SILVER", rank: "I", lp: 850 },
        }),
        main_lane: "mid",
        most_champions: JSON.stringify(["Yasuo", "Zed", "Ahri"]),
      },
      {
        email: "streamer@nexus.com",
        password_hash: hashedPassword,
        nexus_nickname: "ProStreamer",
        riot_nickname: "ProStreamer",
        riot_tag: "KR2",
        puuid: "sample-puuid-2",
        avatar_url: "https://via.placeholder.com/150",
        auth_provider: "local",
        is_verified: true,
        is_streamer: true,
        tier_info: JSON.stringify({
          solo: { tier: "DIAMOND", rank: "IV", lp: 2100 },
          flex: { tier: "PLATINUM", rank: "II", lp: 1650 },
        }),
        main_lane: "adc",
        most_champions: JSON.stringify(["Jinx", "Kaisa", "Vayne"]),
      },
      {
        email: "user1@nexus.com",
        password_hash: hashedPassword,
        nexus_nickname: "LeaguePlayer1",
        riot_nickname: "LeaguePlayer1",
        riot_tag: "KR3",
        puuid: "sample-puuid-3",
        avatar_url: "https://via.placeholder.com/150",
        auth_provider: "local",
        is_verified: true,
        is_streamer: false,
        tier_info: JSON.stringify({
          solo: { tier: "SILVER", rank: "III", lp: 750 },
          flex: { tier: "BRONZE", rank: "I", lp: 450 },
        }),
        main_lane: "top",
        most_champions: JSON.stringify(["Darius", "Garen", "Sett"]),
      },
      {
        email: "user2@nexus.com",
        password_hash: hashedPassword,
        nexus_nickname: "SupportMain",
        riot_nickname: "SupportMain",
        riot_tag: "KR4",
        puuid: "sample-puuid-4",
        avatar_url: "https://via.placeholder.com/150",
        auth_provider: "local",
        is_verified: true,
        is_streamer: false,
        tier_info: JSON.stringify({
          solo: { tier: "GOLD", rank: "IV", lp: 1100 },
          flex: { tier: "SILVER", rank: "II", lp: 650 },
        }),
        main_lane: "support",
        most_champions: JSON.stringify(["Thresh", "Leona", "Nautilus"]),
      },
      {
        email: "user3@nexus.com",
        password_hash: hashedPassword,
        nexus_nickname: "JungleKing",
        riot_nickname: "JungleKing",
        riot_tag: "KR5",
        puuid: "sample-puuid-5",
        avatar_url: "https://via.placeholder.com/150",
        auth_provider: "local",
        is_verified: true,
        is_streamer: false,
        tier_info: JSON.stringify({
          solo: { tier: "PLATINUM", rank: "III", lp: 1850 },
          flex: { tier: "GOLD", rank: "I", lp: 1350 },
        }),
        main_lane: "jungle",
        most_champions: JSON.stringify(["Lee Sin", "Graves", "KhaZix"]),
      },
    ];

    for (const user of users) {
      await execute(
        `INSERT INTO users (
          email, password_hash, nexus_nickname, riot_nickname, riot_tag, puuid,
          avatar_url, auth_provider, is_verified, is_streamer, tier_info,
          main_lane, most_champions
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          user.email,
          user.password_hash,
          user.nexus_nickname,
          user.riot_nickname,
          user.riot_tag,
          user.puuid,
          user.avatar_url,
          user.auth_provider,
          user.is_verified,
          user.is_streamer,
          user.tier_info,
          user.main_lane,
          user.most_champions,
        ]
      );
    }

    // Create sample friends relationships
    const friendRelationships = [
      { user_id: 1, friend_user_id: 2, status: "accepted" },
      { user_id: 1, friend_user_id: 3, status: "accepted" },
      { user_id: 2, friend_user_id: 3, status: "pending" },
      { user_id: 3, friend_user_id: 4, status: "accepted" },
      { user_id: 4, friend_user_id: 5, status: "accepted" },
    ];

    for (const friendship of friendRelationships) {
      await execute(
        "INSERT INTO friends (user_id, friend_user_id, status) VALUES ($1, $2, $3)",
        [friendship.user_id, friendship.friend_user_id, friendship.status]
      );
    }

    // Create sample messages
    const messages = [
      { sender_id: 1, receiver_id: 2, content: "안녕하세요! 스트리머님" },
      { sender_id: 2, receiver_id: 1, content: "안녕하세요! 관리자님" },
      { sender_id: 3, receiver_id: 4, content: "같이 게임하실래요?" },
      { sender_id: 4, receiver_id: 3, content: "네! 좋아요" },
      { sender_id: 5, receiver_id: 4, content: "정글러 구합니다" },
    ];

    for (const message of messages) {
      await execute(
        "INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3)",
        [message.sender_id, message.receiver_id, message.content]
      );
    }

    // Create sample custom games
    const customGames = [
      {
        title: "친목 내전",
        description: "친구들과 함께하는 즐거운 내전입니다",
        password: null,
        max_players: 10,
        current_players: 5,
        status: "recruiting",
        team_composition: "none",
        ban_pick_mode: "Draft Pick",
        allow_spectators: true,
        created_by: 1,
      },
      {
        title: "경쟁 내전",
        description: "실력 겨루기 내전입니다",
        password: "1234",
        max_players: 10,
        current_players: 8,
        status: "in-progress",
        team_composition: "auction",
        ban_pick_mode: "Tournament Draft",
        allow_spectators: false,
        created_by: 2,
      },
      {
        title: "연습 내전",
        description: "챔피언 연습용 내전입니다",
        password: null,
        max_players: 10,
        current_players: 3,
        status: "recruiting",
        team_composition: "rock-paper-scissors",
        ban_pick_mode: "Blind Pick",
        allow_spectators: true,
        created_by: 3,
      },
    ];

    for (const game of customGames) {
      await execute(
        `INSERT INTO custom_games (
          title, description, password, max_players, current_players,
          status, team_composition, ban_pick_mode, allow_spectators, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          game.title,
          game.description,
          game.password,
          game.max_players,
          game.current_players,
          game.status,
          game.team_composition,
          game.ban_pick_mode,
          game.allow_spectators,
          game.created_by,
        ]
      );
    }

    // Create sample custom game participants
    const participants = [
      { game_id: 1, user_id: 1, role: "leader" },
      { game_id: 1, user_id: 2, role: "participant" },
      { game_id: 1, user_id: 3, role: "participant" },
      { game_id: 1, user_id: 4, role: "participant" },
      { game_id: 1, user_id: 5, role: "participant" },
      { game_id: 2, user_id: 2, role: "leader" },
      { game_id: 2, user_id: 1, role: "participant" },
      { game_id: 2, user_id: 3, role: "participant" },
      { game_id: 2, user_id: 4, role: "participant" },
      { game_id: 2, user_id: 5, role: "participant" },
      { game_id: 3, user_id: 3, role: "leader" },
      { game_id: 3, user_id: 4, role: "participant" },
      { game_id: 3, user_id: 5, role: "participant" },
    ];

    for (const participant of participants) {
      await execute(
        "INSERT INTO custom_game_participants (game_id, user_id, role) VALUES ($1, $2, $3)",
        [participant.game_id, participant.user_id, participant.role]
      );
    }

    // Create sample streamer info
    const streamerInfo = [
      {
        user_id: 2,
        stream_link: "https://www.twitch.tv/prostreamer",
        platform: "twitch",
        recent_broadcast: "다이아몬드 랭크 게임",
        viewer_count: 150,
        is_live: true,
      },
    ];

    for (const info of streamerInfo) {
      await execute(
        `INSERT INTO streamer_info (
          user_id, stream_link, platform, recent_broadcast, viewer_count, is_live
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          info.user_id,
          info.stream_link,
          info.platform,
          info.recent_broadcast,
          info.viewer_count,
          info.is_live,
        ]
      );
    }

    // Create sample community posts
    const posts = [
      {
        user_id: 1,
        category: "general",
        title: "NEXUS 커뮤니티에 오신 것을 환영합니다!",
        content:
          "안녕하세요! NEXUS 커뮤니티에 오신 것을 환영합니다. 다양한 게시글을 작성해보세요.",
        image_url: null,
        tags: ["환영", "커뮤니티"],
        view_count: 25,
        like_count: 8,
        dislike_count: 0,
        is_anonymous: false,
      },
      {
        user_id: 2,
        category: "strategy",
        title: "다이아몬드 랭크 정글 가이드",
        content:
          "다이아몬드 랭크에서 정글러로 승률을 높이는 방법을 공유합니다.",
        image_url: null,
        tags: ["정글", "가이드", "다이아몬드"],
        view_count: 45,
        like_count: 12,
        dislike_count: 2,
        is_anonymous: false,
      },
      {
        user_id: 3,
        category: "humor",
        title: "오늘 게임에서 있었던 재미있는 일",
        content:
          "오늘 게임에서 정말 재미있는 일이 있었는데, 팀원들이 다 웃었습니다.",
        image_url: null,
        tags: ["유머", "게임"],
        view_count: 18,
        like_count: 5,
        dislike_count: 1,
        is_anonymous: false,
      },
    ];

    for (const post of posts) {
      await execute(
        `INSERT INTO community_posts (
          user_id, category, title, content, image_url, tags,
          view_count, like_count, dislike_count, is_anonymous
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          post.user_id,
          post.category,
          post.title,
          post.content,
          post.image_url,
          post.tags,
          post.view_count,
          post.like_count,
          post.dislike_count,
          post.is_anonymous,
        ]
      );
    }

    // Create sample comments
    const comments = [
      {
        post_id: 1,
        user_id: 2,
        content: "환영합니다! 좋은 커뮤니티가 되었으면 좋겠네요.",
        is_anonymous: false,
      },
      {
        post_id: 1,
        user_id: 3,
        content: "감사합니다! 많이 이용하겠습니다.",
        is_anonymous: false,
      },
      {
        post_id: 2,
        user_id: 1,
        content: "정말 유용한 가이드네요!",
        is_anonymous: false,
      },
      {
        post_id: 2,
        user_id: 4,
        content: "다음에 더 자세한 가이드 부탁드려요.",
        is_anonymous: false,
      },
      {
        post_id: 3,
        user_id: 5,
        content: "재미있었겠네요 ㅋㅋ",
        is_anonymous: false,
      },
    ];

    for (const comment of comments) {
      await execute(
        "INSERT INTO community_comments (post_id, user_id, content, is_anonymous) VALUES ($1, $2, $3, $4)",
        [
          comment.post_id,
          comment.user_id,
          comment.content,
          comment.is_anonymous,
        ]
      );
    }

    // Create sample user evaluations
    const evaluations = [
      { evaluator_id: 1, target_user_id: 2, evaluation_type: "like" },
      { evaluator_id: 1, target_user_id: 3, evaluation_type: "like" },
      { evaluator_id: 2, target_user_id: 1, evaluation_type: "like" },
      { evaluator_id: 3, target_user_id: 4, evaluation_type: "like" },
      { evaluator_id: 4, target_user_id: 5, evaluation_type: "like" },
      { evaluator_id: 5, target_user_id: 3, evaluation_type: "dislike" },
    ];

    for (const evaluation of evaluations) {
      await execute(
        "INSERT INTO user_evaluations (evaluator_id, target_user_id, evaluation_type) VALUES ($1, $2, $3)",
        [
          evaluation.evaluator_id,
          evaluation.target_user_id,
          evaluation.evaluation_type,
        ]
      );
    }

    // Create sample feedback
    const feedback = [
      {
        user_id: 1,
        feature_name: "custom_games",
        rating: 5,
        comment: "내전 기능이 정말 좋습니다!",
        is_anonymous: false,
      },
      {
        user_id: 2,
        feature_name: "community",
        rating: 4,
        comment: "커뮤니티 기능이 유용해요",
        is_anonymous: false,
      },
      {
        user_id: 3,
        feature_name: "match_history",
        rating: 3,
        comment: "매치 히스토리 기능을 개선해주세요",
        is_anonymous: true,
      },
      {
        user_id: 4,
        feature_name: "friends",
        rating: 5,
        comment: "친구 기능이 완벽해요",
        is_anonymous: false,
      },
      {
        user_id: 5,
        feature_name: "streamers",
        rating: 4,
        comment: "스트리머 기능도 좋습니다",
        is_anonymous: false,
      },
    ];

    for (const fb of feedback) {
      await execute(
        "INSERT INTO user_feedback (user_id, feature_name, rating, comment, is_anonymous) VALUES ($1, $2, $3, $4, $5)",
        [fb.user_id, fb.feature_name, fb.rating, fb.comment, fb.is_anonymous]
      );
    }

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
};

// Run seed if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
