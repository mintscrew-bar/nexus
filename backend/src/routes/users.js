const express = require("express");
const { getOne, getMany, execute } = require("../config/database");
const { isAuthenticated } = require("../config/passport");
const Joi = require("joi");
const axios = require("axios");

const router = express.Router();

// Validation schemas
const friendRequestSchema = Joi.object({
  friendUserId: Joi.number().integer().required(),
});

const messageSchema = Joi.object({
  receiverId: Joi.number().integer().required(),
  content: Joi.string().min(1).max(1000).required(),
});

const linkRiotIdSchema = Joi.object({
  riotNickname: Joi.string().min(1).max(50).required(),
  riotTag: Joi.string().min(1).max(10).required(),
});

// Search users
router.get("/search", async (req, res) => {
  try {
    const { query, limit = 20, offset = 0 } = req.query;

    if (!query) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Search query is required",
      });
    }

    const users = await getMany(
      `SELECT id, nexus_nickname, riot_nickname, riot_tag, avatar_url, 
              is_streamer, is_online, last_seen, tier_info, main_lane, 
              most_champions, created_at
       FROM users 
       WHERE nexus_nickname ILIKE $1 OR riot_nickname ILIKE $1
       ORDER BY nexus_nickname
       LIMIT $2 OFFSET $3`,
      [`%${query}%`, parseInt(limit), parseInt(offset)]
    );

    res.json({
      data: users,
    });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to search users",
    });
  }
});

// Get user by ID
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await getOne(
      `SELECT id, nexus_nickname, riot_nickname, riot_tag, avatar_url, 
              is_streamer, is_online, last_seen, tier_info, main_lane, 
              most_champions, created_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (!user) {
      return res.status(404).json({
        error: "Not Found",
        message: "User not found",
      });
    }

    res.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get user",
    });
  }
});



// Get user's messages
router.get("/messages", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    const messages = await getMany(
      `SELECT m.*, 
              sender.nexus_nickname as sender_nickname, sender.avatar_url as sender_avatar,
              receiver.nexus_nickname as receiver_nickname, receiver.avatar_url as receiver_avatar
       FROM messages m
       JOIN users sender ON m.sender_id = sender.id
       JOIN users receiver ON m.receiver_id = receiver.id
       WHERE m.sender_id = $1 OR m.receiver_id = $1
       ORDER BY m.timestamp DESC
       LIMIT $2 OFFSET $3`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    res.json({ messages });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get messages",
    });
  }
});

// Get conversation with specific user
router.get("/messages/:otherUserId", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const messages = await getMany(
      `SELECT m.*, 
              sender.nexus_nickname as sender_nickname, sender.avatar_url as sender_avatar,
              receiver.nexus_nickname as receiver_nickname, receiver.avatar_url as receiver_avatar
       FROM messages m
       JOIN users sender ON m.sender_id = sender.id
       JOIN users receiver ON m.receiver_id = receiver.id
       WHERE (m.sender_id = $1 AND m.receiver_id = $2) 
          OR (m.sender_id = $2 AND m.receiver_id = $1)
       ORDER BY m.timestamp ASC
       LIMIT $3 OFFSET $4`,
      [userId, otherUserId, parseInt(limit), parseInt(offset)]
    );

    // Mark messages as read
    await execute(
      "UPDATE messages SET is_read = TRUE WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE",
      [otherUserId, userId]
    );

    res.json({ messages });
  } catch (error) {
    console.error("Get conversation error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get conversation",
    });
  }
});

// Send message
router.post("/messages", isAuthenticated, async (req, res) => {
  try {
    const { error, value } = messageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation Error",
        message: error.details[0].message,
      });
    }

    const { receiverId, content } = value;
    const senderId = req.user.id;

    // Check if receiver exists
    const receiver = await getOne("SELECT * FROM users WHERE id = $1", [
      receiverId,
    ]);
    if (!receiver) {
      return res.status(404).json({
        error: "Not Found",
        message: "Receiver not found",
      });
    }

    // Create message
    const message = await getOne(
      `INSERT INTO messages (sender_id, receiver_id, content, timestamp)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *`,
      [senderId, receiverId, content]
    );

    res.status(201).json({
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to send message",
    });
  }
});

// Get unread message count
router.get("/messages/unread/count", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await getOne(
      "SELECT COUNT(*) as count FROM messages WHERE receiver_id = $1 AND is_read = FALSE",
      [userId]
    );

    res.json({
      unreadCount: parseInt(result.count),
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get unread count",
    });
  }
});

// Get user match history
router.get("/:userId/matches", isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const matches = await getMany(
      `SELECT * FROM matches 
       WHERE user_id = $1 
       ORDER BY game_creation DESC 
       LIMIT $2 OFFSET $3`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    res.json({
      data: { matches },
    });
  } catch (error) {
    console.error("Get user matches error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get user matches",
    });
  }
});

// Save match
router.post("/:userId/matches", isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      matchId,
      tournamentCode,
      gameMode,
      gameType,
      gameDuration,
      gameCreation,
      isCustomGame,
      participants,
      teams,
    } = req.body;

    // Check if match already exists
    const existingMatch = await getOne(
      "SELECT id FROM matches WHERE match_id = $1",
      [matchId]
    );

    if (existingMatch) {
      return res.status(409).json({
        error: "Conflict",
        message: "Match already exists",
      });
    }

    // Save match
    const savedMatch = await getOne(
      `INSERT INTO matches (
        match_id, tournament_code, user_id, game_mode, game_type, 
        game_duration, game_creation, is_custom_game, participants, teams
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        matchId,
        tournamentCode,
        userId,
        gameMode,
        gameType,
        gameDuration,
        gameCreation,
        isCustomGame,
        participants,
        teams,
      ]
    );

    res.status(201).json({
      message: "Match saved successfully",
      data: { match: savedMatch },
    });
  } catch (error) {
    console.error("Save match error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to save match",
    });
  }
});

// Link Riot ID
router.post("/link-riot-id", isAuthenticated, async (req, res) => {
  try {
    const { error, value } = linkRiotIdSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation Error",
        message: error.details[0].message,
      });
    }

    const { riotNickname, riotTag } = value;
    const userId = req.user.id;

    console.log(
      `🔍 Linking Riot ID: ${riotNickname}#${riotTag} for user ${userId}`
    );

    // Check if Riot ID is already linked to another user
    const existingUser = await getOne(
      "SELECT id FROM users WHERE riot_nickname = $1 AND riot_tag = $2 AND id != $3",
      [riotNickname, riotTag, userId]
    );

    if (existingUser) {
      return res.status(409).json({
        error: "Conflict",
        message: "이 Riot ID는 이미 다른 사용자에게 연동되어 있습니다.",
      });
    }

    try {
      // Fetch summoner data from Riot API
      const summonerResponse = await axios.get(
        `${
          process.env.RIOT_API_BASE_URL
        }/lol/summoner/v4/summoners/by-name/${encodeURIComponent(
          riotNickname
        )}`,
        {
          headers: {
            "X-Riot-Token": process.env.RIOT_API_KEY,
          },
        }
      );

      const summonerData = summonerResponse.data;
      const puuid = summonerData.puuid;

      // Update user with Riot ID information
      const updatedUser = await getOne(
        `UPDATE users SET 
         riot_nickname = $1, 
         riot_tag = $2, 
         puuid = $3,
         updated_at = NOW()
         WHERE id = $4 
         RETURNING id, nexus_nickname, riot_nickname, riot_tag, puuid, avatar_url, is_verified, is_streamer`,
        [riotNickname, riotTag, puuid, userId]
      );

      console.log(`✅ Riot ID linked successfully for user ${userId}`);

      res.json({
        message: "Riot ID 연동이 완료되었습니다.",
        user: updatedUser,
      });
    } catch (riotError) {
      console.error(
        "Riot API error:",
        riotError.response?.data || riotError.message
      );

      if (riotError.response?.status === 404) {
        return res.status(404).json({
          error: "Not Found",
          message: "존재하지 않는 Riot ID입니다. 닉네임과 태그를 확인해주세요.",
        });
      }

      return res.status(500).json({
        error: "Riot API Error",
        message: "Riot API 연결에 실패했습니다. 잠시 후 다시 시도해주세요.",
      });
    }
  } catch (error) {
    console.error("Link Riot ID error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Riot ID 연동에 실패했습니다.",
    });
  }
});

module.exports = router;
