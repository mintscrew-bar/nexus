const express = require("express");
const { getOne, getMany, execute } = require("../config/database");
const { isAuthenticated } = require("../config/passport");
const Joi = require("joi");

const router = express.Router();

// Validation schemas
const createGameSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(1000),
  password: Joi.string().max(100),
  maxPlayers: Joi.number().integer().min(5).max(20).default(10),
  teamComposition: Joi.string()
    .valid("none", "auction", "rock-paper-scissors")
    .default("none"),
  banPickMode: Joi.string()
    .valid("Draft Pick", "Blind Pick", "All Random", "Tournament Draft")
    .default("Draft Pick"),
  allowSpectators: Joi.boolean().default(true),
});

const joinGameSchema = Joi.object({
  password: Joi.string().max(100).optional(),
});

// Get all custom games
router.get("/", async (req, res) => {
  try {
    const { status, search, limit = 20, offset = 0 } = req.query;

    let whereClause = "WHERE 1=1";
    const params = [];
    let paramCount = 1;

    if (status && status !== "all") {
      whereClause += ` AND cg.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (search) {
      whereClause += ` AND (cg.title ILIKE $${paramCount} OR cg.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    const games = await getMany(
      `SELECT cg.*, 
              creator.nexus_nickname as creator_nickname,
              creator.avatar_url as creator_avatar,
              COUNT(cgp.user_id) as current_players_count
       FROM custom_games cg
       JOIN users creator ON cg.created_by = creator.id
       LEFT JOIN custom_game_participants cgp ON cg.id = cgp.game_id
       ${whereClause}
       GROUP BY cg.id, creator.nexus_nickname, creator.avatar_url
       ORDER BY cg.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    // Get participants for each game
    for (const game of games) {
      const participants = await getMany(
        `SELECT cgp.*, u.nexus_nickname, u.avatar_url, u.is_streamer
         FROM custom_game_participants cgp
         JOIN users u ON cgp.user_id = u.id
         WHERE cgp.game_id = $1
         ORDER BY cgp.joined_at`,
        [game.id]
      );
      game.participants = participants;
    }

    res.json({
      data: { games },
      message: "Custom games retrieved successfully",
    });
  } catch (error) {
    console.error("Get custom games error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get custom games",
    });
  }
});

// Get custom game by ID
router.get("/:gameId", async (req, res) => {
  try {
    const { gameId } = req.params;

    const game = await getOne(
      `SELECT cg.*, 
              creator.nexus_nickname as creator_nickname,
              creator.avatar_url as creator_avatar
       FROM custom_games cg
       LEFT JOIN users creator ON cg.created_by = creator.id
       WHERE cg.id = $1`,
      [gameId]
    );

    if (!game) {
      return res.status(404).json({
        error: "Not Found",
        message: "Custom game not found",
      });
    }

    // Get participants
    const participants = await getMany(
      `SELECT cgp.*, u.nexus_nickname, u.avatar_url, u.is_streamer
       FROM custom_game_participants cgp
       JOIN users u ON cgp.user_id = u.id
       WHERE cgp.game_id = $1
       ORDER BY cgp.joined_at`,
      [gameId]
    );

    // Get chat messages
    const messages = await getMany(
      `SELECT gcm.*, u.nexus_nickname, u.avatar_url
       FROM game_chat_messages gcm
       JOIN users u ON gcm.user_id = u.id
       WHERE gcm.game_id = $1
       ORDER BY gcm.created_at DESC
       LIMIT 50`,
      [gameId]
    );

    game.participants = participants;
    game.messages = messages;

    res.json({ data: { game } });
  } catch (error) {
    console.error("Get custom game error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get custom game",
    });
  }
});

// Create custom game
router.post("/", isAuthenticated, async (req, res) => {
  try {
    console.log("🔍 Create game request data:", {
      body: req.body,
      user: req.user,
      userId: req.user?.id,
    });

    const { error, value } = createGameSchema.validate(req.body);
    if (error) {
      console.log("❌ Validation error:", error.details[0].message);
      return res.status(400).json({
        error: "Validation Error",
        message: error.details[0].message,
      });
    }

    console.log("✅ Validation passed, value:", value);

    const {
      title,
      description,
      password,
      maxPlayers,
      teamComposition,
      banPickMode,
      allowSpectators,
    } = value;

    const userId = req.user.id;

    // Create custom game
    const game = await getOne(
      `INSERT INTO custom_games (
        title, description, password, max_players, current_players,
        team_composition, ban_pick_mode, allow_spectators, created_by
      ) VALUES ($1, $2, $3, $4, 1, $5, $6, $7, $8) RETURNING *`,
      [
        title,
        description,
        password,
        maxPlayers,
        teamComposition,
        banPickMode,
        allowSpectators,
        userId,
      ]
    );

    // Add creator as leader
    await execute(
      "INSERT INTO custom_game_participants (game_id, user_id, role) VALUES ($1, $2, $3)",
      [game.id, userId, "leader"]
    );

    res.status(201).json({
      message: "Custom game created successfully",
      data: { game },
    });
  } catch (error) {
    console.error("Create custom game error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to create custom game",
    });
  }
});

// Join custom game
router.post("/:gameId/join", isAuthenticated, async (req, res) => {
  try {
    const { gameId } = req.params;
    console.log("🔍 Join request data:", {
      gameId,
      body: req.body,
      user: req.user,
      userId: req.user?.id,
      headers: req.headers.authorization ? "토큰 존재" : "토큰 없음",
    });

    const { error, value } = joinGameSchema.validate(req.body);
    const userId = req.user.id;

    if (error) {
      console.log("❌ Validation error:", error.details[0].message);
      return res.status(400).json({
        error: "Validation Error",
        message: error.details[0].message,
      });
    }

    console.log("✅ Validation passed, value:", value);
    console.log("✅ User authenticated:", { userId, user: req.user });

    // Get game details
    const game = await getOne("SELECT * FROM custom_games WHERE id = $1", [
      gameId,
    ]);
    if (!game) {
      return res.status(404).json({
        error: "Not Found",
        message: "Custom game not found",
      });
    }

    // Check if game is recruiting
    if (game.status !== "recruiting") {
      return res.status(400).json({
        error: "Bad Request",
        message: "Game is not accepting participants",
      });
    }

    // Check password if required
    if (game.password && game.password !== value.password) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Incorrect password",
      });
    }

    // Check if user is already a participant
    const existingParticipant = await getOne(
      "SELECT * FROM custom_game_participants WHERE game_id = $1 AND user_id = $2",
      [gameId, userId]
    );

    if (existingParticipant) {
      return res.status(409).json({
        error: "Conflict",
        message: "Already a participant in this game",
      });
    }

    // Check if game is full
    const participantCount = await getOne(
      "SELECT COUNT(*) as count FROM custom_game_participants WHERE game_id = $1",
      [gameId]
    );

    if (parseInt(participantCount.count) >= game.max_players) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Game is full",
      });
    }

    // Add user as participant
    await execute(
      "INSERT INTO custom_game_participants (game_id, user_id, role) VALUES ($1, $2, $3)",
      [gameId, userId, "participant"]
    );

    // Update game current players count
    await execute(
      "UPDATE custom_games SET current_players = current_players + 1 WHERE id = $1",
      [gameId]
    );

    console.log("✅ User", userId, "joined game", gameId);

    const { getIo } = require("../config/socket");
    const io = getIo();
    const updatedGame = await getOne("SELECT * FROM custom_games WHERE id = $1", [gameId]);
    io.to(`game-${gameId}`).emit('game:updated', updatedGame);

    res.json({
      message: "Successfully joined the game",
      data: { gameId, userId },
    });
  } catch (error) {
    console.error("Join custom game error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to join custom game",
    });
  }
});

// Leave custom game
router.delete("/:gameId/leave", isAuthenticated, async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;

    // Check if user is a participant
    const participant = await getOne(
      "SELECT * FROM custom_game_participants WHERE game_id = $1 AND user_id = $2",
      [gameId, userId]
    );

    if (!participant) {
      return res.status(404).json({
        error: "Not Found",
        message: "Not a participant in this game",
      });
    }

    // Check if user is the leader
    const isLeader = participant.role === "leader";

    // Remove user from participants
    await execute(
      "DELETE FROM custom_game_participants WHERE game_id = $1 AND user_id = $2",
      [gameId, userId]
    );

    // Update current players count
    await execute(
      "UPDATE custom_games SET current_players = current_players - 1 WHERE id = $1",
      [gameId]
    );

    console.log(`❌ User ${userId} left game ${gameId}`);

    // Check if this was the last participant
    const remainingParticipants = await getOne(
      "SELECT COUNT(*) as count FROM custom_game_participants WHERE game_id = $1",
      [gameId]
    );

    console.log(
      `📊 Remaining participants in game ${gameId}: ${remainingParticipants.count}`
    );

    if (remainingParticipants.count === 0) {
      // Delete the game if no participants remain
      await execute("DELETE FROM custom_games WHERE id = $1", [gameId]);
      console.log(`🗑️ Game ${gameId} deleted - no participants remain`);

      const { getIo } = require("../config/socket");
      const io = getIo();
      const updatedGame = await getOne("SELECT * FROM custom_games WHERE id = $1", [gameId]);
      io.to(`game-${gameId}`).emit('game:updated', updatedGame);

      res.json({
        message:
          "Left custom game successfully. Game deleted as no participants remain.",
      });
    } else if (isLeader) {
      // If leader left, transfer leadership to the next participant
      const nextLeader = await getOne(
        `SELECT cgp.user_id, u.nexus_nickname 
         FROM custom_game_participants cgp
         JOIN users u ON cgp.user_id = u.id
         WHERE cgp.game_id = $1 AND cgp.user_id != $2
         ORDER BY cgp.joined_at ASC
         LIMIT 1`,
        [gameId, userId]
      );

      if (nextLeader) {
        // Transfer leadership to the next participant
        await execute(
          "UPDATE custom_game_participants SET role = $1 WHERE game_id = $2 AND user_id = $3",
          ["leader", gameId, nextLeader.user_id]
        );

        console.log(
          `👑 Leadership transferred to ${nextLeader.nexus_nickname} (${nextLeader.user_id}) in game ${gameId}`
        );

        const { getIo } = require("../config/socket");
        const io = getIo();
        const updatedGame = await getOne("SELECT * FROM custom_games WHERE id = $1", [gameId]);
        io.to(`game-${gameId}`).emit('game:updated', updatedGame);

        res.json({
          message: `Left custom game successfully. Leadership transferred to ${nextLeader.nexus_nickname}.`,
        });
      } else {
        // No other participants, delete the game
        await execute("DELETE FROM custom_games WHERE id = $1", [gameId]);
        console.log(
          `🗑️ Game ${gameId} deleted - leader left and no other participants`
        );

        res.json({
          message:
            "Left custom game successfully. Game deleted as no participants remain.",
        });
      }
    } else {
      const { getIo } = require("../config/socket");
      const io = getIo();
      const updatedGame = await getOne("SELECT * FROM custom_games WHERE id = $1", [gameId]);
      io.to(`game-${gameId}`).emit('game:updated', updatedGame);

      res.json({
        message: "Left custom game successfully",
      });
    }
  } catch (error) {
    console.error("Leave custom game error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to leave custom game",
    });
  }
});

// Start custom game
router.post("/:gameId/start", isAuthenticated, async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;

    // Check if user is the leader
    const participant = await getOne(
      "SELECT * FROM custom_game_participants WHERE game_id = $1 AND user_id = $2 AND role = $3",
      [gameId, userId, "leader"]
    );

    if (!participant) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Only the leader can start the game",
      });
    }

    // Update game status
    await execute(
      "UPDATE custom_games SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      ["in-progress", gameId]
    );

    const { getIo } = require("../config/socket");
    const io = getIo();
    const updatedGame = await getOne("SELECT * FROM custom_games WHERE id = $1", [gameId]);
    io.to(`game-${gameId}`).emit('game:updated', updatedGame);

    res.json({
      message: "Custom game started successfully",
    });
  } catch (error) {
    console.error("Start custom game error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to start custom game",
    });
  }
});

// End custom game
router.post("/:gameId/end", isAuthenticated, async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;

    // Check if user is the leader
    const participant = await getOne(
      "SELECT * FROM custom_game_participants WHERE game_id = $1 AND user_id = $2 AND role = $3",
      [gameId, userId, "leader"]
    );

    if (!participant) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Only the leader can end the game",
      });
    }

    // Update game status
    await execute(
      "UPDATE custom_games SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      ["completed", gameId]
    );

    const { getIo } = require("../config/socket");
    const io = getIo();
    const updatedGame = await getOne("SELECT * FROM custom_games WHERE id = $1", [gameId]);
    io.to(`game-${gameId}`).emit('game:updated', updatedGame);

    res.json({
      message: "Custom game ended successfully",
    });
  } catch (error) {
    console.error("End custom game error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to end custom game",
    });
  }
});

// Delete custom game
router.delete("/:gameId", isAuthenticated, async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;

    // Check if user is the leader
    const participant = await getOne(
      "SELECT * FROM custom_game_participants WHERE game_id = $1 AND user_id = $2 AND role = $3",
      [gameId, userId, "leader"]
    );

    if (!participant) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Only the leader can delete the game",
      });
    }

    // Delete game (participants and messages will be deleted due to CASCADE)
    await execute("DELETE FROM custom_games WHERE id = $1", [gameId]);

    const { getIo } = require("../config/socket");
    const io = getIo();
    io.to(`game-${gameId}`).emit('game:deleted');

    res.json({
      message: "Custom game deleted successfully",
    });
  } catch (error) {
    console.error("Delete custom game error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to delete custom game",
    });
  }
});

// Get user's custom games
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const games = await getMany(
      `SELECT cg.*, 
              creator.nexus_nickname as creator_nickname,
              creator.avatar_url as creator_avatar,
              cgp.role as user_role
       FROM custom_games cg
       JOIN users creator ON cg.created_by = creator.id
       JOIN custom_game_participants cgp ON cg.id = cgp.game_id
       WHERE cgp.user_id = $1
       ORDER BY cg.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    res.json({ games });
  } catch (error) {
    console.error("Get user custom games error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get user custom games",
    });
  }
});

// Start team leader election
router.post("/:gameId/start-election", isAuthenticated, async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;

    // Check if user is the leader
    const participant = await getOne(
      "SELECT * FROM custom_game_participants WHERE game_id = $1 AND user_id = $2 AND role = $3",
      [gameId, userId, "leader"]
    );

    if (!participant) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Only the leader can start team leader election",
      });
    }

    // Update game status to team leader election
    await execute(
      "UPDATE custom_games SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      ["team-leader-election", gameId]
    );

    const { getIo } = require("../config/socket");
    const io = getIo();
    const updatedGame = await getOne("SELECT * FROM custom_games WHERE id = $1", [gameId]);
    io.to(`game-${gameId}`).emit('game:updated', updatedGame);

    res.json({
      message: "Team leader election started successfully",
    });
  } catch (error) {
    console.error("Start team leader election error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to start team leader election",
    });
  }
});

// Elect team leaders
router.post("/:gameId/elect-leaders", isAuthenticated, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { teamLeaders } = req.body; // [{userId, teamName, color}]

    // Check if user is the leader
    const participant = await getOne(
      "SELECT * FROM custom_game_participants WHERE game_id = $1 AND user_id = $2 AND role = $3",
      [gameId, userId, "leader"]
    );

    if (!participant) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Only the leader can elect team leaders",
      });
    }

    // Create teams
    for (const teamLeader of teamLeaders) {
      await execute(
        `INSERT INTO game_teams (game_id, name, leader_id, color)
         VALUES ($1, $2, $3, $4)`,
        [gameId, teamLeader.teamName, teamLeader.userId, teamLeader.color]
      );
    }

    // Update game status to team formation
    await execute(
      "UPDATE custom_games SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      ["team-formation", gameId]
    );

    const { getIo } = require("../config/socket");
    const io = getIo();
    const updatedGame = await getOne("SELECT * FROM custom_games WHERE id = $1", [gameId]);
    io.to(`game-${gameId}`).emit('game:updated', updatedGame);

    res.json({
      message: "Team leaders elected successfully",
    });
  } catch (error) {
    console.error("Elect team leaders error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to elect team leaders",
    });
  }
});

// Join team (for none mode)
router.post("/:gameId/join-team", isAuthenticated, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { teamId } = req.body;
    const userId = req.user.id;

    // Check if user is a participant
    const participant = await getOne(
      "SELECT * FROM custom_game_participants WHERE game_id = $1 AND user_id = $2",
      [gameId, userId]
    );

    if (!participant) {
      return res.status(404).json({
        error: "Not Found",
        message: "Not a participant in this game",
      });
    }

    // Add user to team
    await execute(
      "INSERT INTO game_team_members (team_id, user_id) VALUES ($1, $2)",
      [teamId, userId]
    );

    const { getIo } = require("../config/socket");
    const io = getIo();
    const updatedGame = await getOne("SELECT * FROM custom_games WHERE id = $1", [gameId]);
    io.to(`game-${gameId}`).emit('game:updated', updatedGame);

    res.json({
      message: "Joined team successfully",
    });
  } catch (error) {
    console.error("Join team error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to join team",
    });
  }
});

// Auction bidding
router.post("/:gameId/auction/bid", isAuthenticated, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { playerId, bidAmount } = req.body;
    const userId = req.user.id;

    // Check if user is a participant
    const participant = await getOne(
      "SELECT * FROM custom_game_participants WHERE game_id = $1 AND user_id = $2",
      [gameId, userId]
    );

    if (!participant) {
      return res.status(404).json({
        error: "Not Found",
        message: "Not a participant in this game",
      });
    }

    // Save bid
    await execute(
      `INSERT INTO auction_bids (game_id, bidder_id, player_id, bid_amount, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
      [gameId, userId, playerId, bidAmount]
    );

    const { getIo } = require("../config/socket");
    const io = getIo();
    const updatedGame = await getOne("SELECT * FROM custom_games WHERE id = $1", [gameId]);
    io.to(`game-${gameId}`).emit('auction:bid', { gameId, userId, playerId, bidAmount });

    res.json({
      message: "Bid placed successfully",
    });
  } catch (error) {
    console.error("Auction bid error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to place bid",
    });
  }
});

// Get auction bids
router.get("/:gameId/auction/bids", async (req, res) => {
  try {
    const { gameId } = req.params;

    const bids = await getMany(
      `SELECT ab.*, u.nexus_nickname as bidder_nickname, p.nexus_nickname as player_nickname
       FROM auction_bids ab
       JOIN users u ON ab.bidder_id = u.id
       JOIN users p ON ab.player_id = p.id
       WHERE ab.game_id = $1
       ORDER BY ab.bid_amount DESC`,
      [gameId]
    );

    res.json({
      data: { bids },
    });
  } catch (error) {
    console.error("Get auction bids error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get auction bids",
    });
  }
});

// Rock paper scissors
router.post("/:gameId/rps/play", isAuthenticated, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { choice } = req.body; // "rock", "paper", "scissors"
    const userId = req.user.id;

    // Check if user is a participant
    const participant = await getOne(
      "SELECT * FROM custom_game_participants WHERE game_id = $1 AND user_id = $2",
      [gameId, userId]
    );

    if (!participant) {
      return res.status(404).json({
        error: "Not Found",
        message: "Not a participant in this game",
      });
    }

    // Save RPS choice
    await execute(
      `INSERT INTO rps_choices (game_id, user_id, choice, created_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
      [gameId, userId, choice]
    );

    const { getIo } = require("../config/socket");
    const io = getIo();
    io.to(`game-${gameId}`).emit('rps:choice', { gameId, userId, choice });

    res.json({
      message: "RPS choice saved successfully",
    });
  } catch (error) {
    console.error("RPS play error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to save RPS choice",
    });
  }
});

// Get RPS results
router.get("/:gameId/rps/results", async (req, res) => {
  try {
    const { gameId } = req.params;

    const choices = await getMany(
      `SELECT rps.*, u.nexus_nickname
       FROM rps_choices rps
       JOIN users u ON rps.user_id = u.id
       WHERE rps.game_id = $1
       ORDER BY rps.created_at`,
      [gameId]
    );

    res.json({
      data: { choices },
    });
  } catch (error) {
    console.error("Get RPS results error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get RPS results",
    });
  }
});

// Start line selection
router.post(
  "/:gameId/start-line-selection",
  isAuthenticated,
  async (req, res) => {
    try {
      const { gameId } = req.params;
      const userId = req.user.id;

      // Check if user is the leader
      const participant = await getOne(
        "SELECT * FROM custom_game_participants WHERE game_id = $1 AND user_id = $2 AND role = $3",
        [gameId, userId, "leader"]
      );

      if (!participant) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Only the leader can start line selection",
        });
      }

      // Update game status to line selection
      await execute(
        "UPDATE custom_games SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        ["line-selection", gameId]
      );

      const { getIo } = require("../config/socket");
      const io = getIo();
      const updatedGame = await getOne("SELECT * FROM custom_games WHERE id = $1", [gameId]);
      io.to(`game-${gameId}`).emit('game:updated', updatedGame);

      res.json({
        message: "Line selection started successfully",
      });
    } catch (error) {
      console.error("Start line selection error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to start line selection",
      });
    }
  }
);

// Select line position
router.post("/:gameId/select-line", isAuthenticated, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { lineName } = req.body; // "top", "jungle", "mid", "adc", "support"
    const userId = req.user.id;

    // Check if user is a participant
    const participant = await getOne(
      "SELECT * FROM custom_game_participants WHERE game_id = $1 AND user_id = $2",
      [gameId, userId]
    );

    if (!participant) {
      return res.status(404).json({
        error: "Not Found",
        message: "Not a participant in this game",
      });
    }

    // Check if line is already taken
    const existingLine = await getOne(
      "SELECT * FROM game_line_positions WHERE game_id = $1 AND line_name = $2",
      [gameId, lineName]
    );

    if (existingLine) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Line position already taken",
      });
    }

    // Assign line position
    await execute(
      `INSERT INTO game_line_positions (game_id, user_id, line_name)
       VALUES ($1, $2, $3)`,
      [gameId, userId, lineName]
    );

    const { getIo } = require("../config/socket");
    const io = getIo();
    const updatedGame = await getOne("SELECT * FROM custom_games WHERE id = $1", [gameId]);
    io.to(`game-${gameId}`).emit('game:updated', updatedGame);

    res.json({
      message: "Line position selected successfully",
    });
  } catch (error) {
    console.error("Select line position error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to select line position",
    });
  }
});

// Start the actual game
router.post("/:gameId/start-game", isAuthenticated, async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;

    // Check if user is the leader
    const participant = await getOne(
      "SELECT * FROM custom_game_participants WHERE game_id = $1 AND user_id = $2 AND role = $3",
      [gameId, userId, "leader"]
    );

    if (!participant) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Only the leader can start the game",
      });
    }

    // Check if all players have selected lines
    const totalPlayers = await getOne(
      "SELECT COUNT(*) as count FROM custom_game_participants WHERE game_id = $1",
      [gameId]
    );

    const selectedLines = await getOne(
      "SELECT COUNT(*) as count FROM game_line_positions WHERE game_id = $1",
      [gameId]
    );

    if (selectedLines.count < totalPlayers.count) {
      return res.status(400).json({
        error: "Bad Request",
        message: "All players must select their line positions first",
      });
    }

    // Update game status to in-progress
    await execute(
      "UPDATE custom_games SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      ["in-progress", gameId]
    );

    const { getIo } = require("../config/socket");
    const io = getIo();
    const updatedGame = await getOne("SELECT * FROM custom_games WHERE id = $1", [gameId]);
    io.to(`game-${gameId}`).emit('game:updated', updatedGame);

    res.json({
      message: "Game started successfully",
    });
  } catch (error) {
    console.error("Start game error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to start game",
    });
  }
});

// Get game teams
router.get("/:gameId/teams", async (req, res) => {
  try {
    const { gameId } = req.params;

    const teams = await getMany(
      `SELECT gt.*, u.nexus_nickname as leader_nickname
       FROM game_teams gt
       JOIN users u ON gt.leader_id = u.id
       WHERE gt.game_id = $1`,
      [gameId]
    );

    // Get team members for each team
    for (const team of teams) {
      const members = await getMany(
        `SELECT gtm.*, u.nexus_nickname, u.avatar_url
         FROM game_team_members gtm
         JOIN users u ON gtm.user_id = u.id
         WHERE gtm.team_id = $1`,
        [team.id]
      );
      team.members = members;
    }

    res.json({
      data: { teams },
    });
  } catch (error) {
    console.error("Get game teams error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get game teams",
    });
  }
});

// Get line positions
router.get("/:gameId/line-positions", async (req, res) => {
  try {
    const { gameId } = req.params;

    const linePositions = await getMany(
      `SELECT glp.*, u.nexus_nickname
       FROM game_line_positions glp
       JOIN users u ON glp.player_id = u.id
       WHERE glp.game_id = $1`,
      [gameId]
    );

    res.json({
      data: { linePositions },
    });
  } catch (error) {
    console.error("Get line positions error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get line positions",
    });
  }
});

// Check if user is participant in game
router.get("/:gameId/participant/:userId", async (req, res) => {
  try {
    const { gameId, userId } = req.params;

    const participant = await getOne(
      `SELECT cgp.*, u.nexus_nickname, u.avatar_url, u.is_streamer
       FROM custom_game_participants cgp
       JOIN users u ON cgp.user_id = u.id
       WHERE cgp.game_id = $1 AND cgp.user_id = $2`,
      [gameId, userId]
    );

    if (!participant) {
      return res.status(404).json({
        error: "Not Found",
        message: "User is not a participant in this game",
        data: { isParticipant: false },
      });
    }

    res.json({
      data: {
        isParticipant: true,
        participant,
      },
    });
  } catch (error) {
    console.error("Check participant error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to check participant status",
    });
  }
});

// Get active participants count
router.get("/:gameId/participants/count", async (req, res) => {
  try {
    const { gameId } = req.params;

    const result = await getOne(
      `SELECT COUNT(*) as count
       FROM custom_game_participants
       WHERE game_id = $1`,
      [gameId]
    );

    res.json({
      data: {
        participantCount: parseInt(result.count),
        gameId: parseInt(gameId),
      },
    });
  } catch (error) {
    console.error("Get participants count error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get participants count",
    });
  }
});

// Check if game should be maintained (has active participants)
router.get("/:gameId/maintenance-check", async (req, res) => {
  try {
    const { gameId } = req.params;

    // Get game info
    const game = await getOne(
      `SELECT cg.*, creator.nexus_nickname as creator_nickname
       FROM custom_games cg
       JOIN users creator ON cg.created_by = creator.id
       WHERE cg.id = $1`,
      [gameId]
    );

    if (!game) {
      return res.status(404).json({
        error: "Not Found",
        message: "Game not found",
      });
    }

    // Get active participants count
    const participantCount = await getOne(
      `SELECT COUNT(*) as count
       FROM custom_game_participants
       WHERE game_id = $1`,
      [gameId]
    );

    const activeCount = parseInt(participantCount.count);
    const shouldMaintain = activeCount > 0;

    // If no participants, mark game for deletion
    if (!shouldMaintain) {
      await execute(
        `DELETE FROM custom_games 
         WHERE id = $1`,
        [gameId]
      );
      console.log(`🗑️ 빈 게임 삭제: ${gameId}`);
    }

    res.json({
      data: {
        gameId: parseInt(gameId),
        activeParticipants: activeCount,
        shouldMaintain,
        gameStatus: game.status,
        maxPlayers: game.max_players,
      },
    });
  } catch (error) {
    console.error("Game maintenance check error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to check game maintenance status",
    });
  }
});

// Periodic cleanup of empty games
router.post("/cleanup-empty-games", async (req, res) => {
  try {
    // Find games with no participants
    const emptyGames = await getMany(
      `SELECT cg.id, cg.title, cg.created_at
       FROM custom_games cg
       LEFT JOIN custom_game_participants cgp ON cg.id = cgp.game_id
       WHERE cgp.user_id IS NULL
       AND cg.status = 'recruiting'
       AND cg.created_at < NOW() - INTERVAL '30 minutes'`
    );

    if (emptyGames.length > 0) {
      const gameIds = emptyGames.map((game) => game.id);

      // Delete empty games
      await execute(
        `DELETE FROM custom_games 
         WHERE id = ANY($1)`,
        [gameIds]
      );

      console.log(`🗑️ Cleaned up ${emptyGames.length} empty games:`, gameIds);
    }

    res.json({
      data: {
        cleanedGames: emptyGames.length,
        gameIds: emptyGames.map((g) => g.id),
      },
    });
  } catch (error) {
    console.error("Cleanup empty games error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to cleanup empty games",
    });
  }
});

module.exports = router;
