const express = require("express");
const { getOne, getMany, execute } = require("../config/database");
const { isAuthenticated } = require("../config/passport");

const router = express.Router();

// Get user's matches
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const matches = await getMany(
      `SELECT m.*, um.participant_data
       FROM matches m
       JOIN user_matches um ON m.id = um.match_id
       WHERE um.user_id = $1
       ORDER BY m.game_creation DESC
       LIMIT $2 OFFSET $3`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    res.json({ matches });
  } catch (error) {
    console.error("Get user matches error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get user matches",
    });
  }
});

// Get match by ID
router.get("/:matchId", async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await getOne("SELECT * FROM matches WHERE match_id = $1", [
      matchId,
    ]);
    if (!match) {
      return res.status(404).json({
        error: "Not Found",
        message: "Match not found",
      });
    }

    res.json({ match });
  } catch (error) {
    console.error("Get match error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get match",
    });
  }
});

// Save match data
router.post("/", isAuthenticated, async (req, res) => {
  try {
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
    const userId = req.user.id;

    // Check if match already exists
    let match = await getOne("SELECT * FROM matches WHERE match_id = $1", [
      matchId,
    ]);

    if (!match) {
      // Create new match
      match = await getOne(
        `INSERT INTO matches (match_id, tournament_code, game_mode, game_type, 
                             game_duration, game_creation, is_custom_game, 
                             participants, teams)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          matchId,
          tournamentCode,
          gameMode,
          gameType,
          gameDuration,
          gameCreation,
          isCustomGame,
          JSON.stringify(participants),
          JSON.stringify(teams),
        ]
      );
    }

    // Find user's participant data
    const userParticipant = participants.find(
      (p) => p.puuid === req.user.puuid
    );
    if (userParticipant) {
      // Save user's match participation
      await execute(
        `INSERT INTO user_matches (user_id, match_id, participant_data)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, match_id) DO UPDATE SET participant_data = $3`,
        [userId, match.id, JSON.stringify(userParticipant)]
      );
    }

    res.status(201).json({
      message: "Match saved successfully",
      match,
    });
  } catch (error) {
    console.error("Save match error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to save match",
    });
  }
});

module.exports = router;
