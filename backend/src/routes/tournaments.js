const express = require("express");
const { getOne, getMany, execute } = require("../config/database");
const { isAuthenticated } = require("../config/passport");

const router = express.Router();

// Create tournament for a custom game
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const { gameId, name } = req.body;
    const userId = req.user.id;

    // Check if user is the leader of the game
    const participant = await getOne(
      "SELECT * FROM custom_game_participants WHERE game_id = $1 AND user_id = $2 AND role = $3",
      [gameId, userId, "leader"]
    );

    if (!participant) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Only the leader can create tournament",
      });
    }

    // Get all participants for the game
    const participants = await getMany(
      `SELECT cgp.*, u.nexus_nickname, u.avatar_url
       FROM custom_game_participants cgp
       JOIN users u ON cgp.user_id = u.id
       WHERE cgp.game_id = $1
       ORDER BY cgp.joined_at`,
      [gameId]
    );

    if (participants.length < 2) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Need at least 2 participants for tournament",
      });
    }

    // Create tournament
    const tournament = await getOne(
      `INSERT INTO tournaments (game_id, name, status, current_round, total_rounds, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        gameId,
        name,
        "pending",
        1,
        Math.ceil(Math.log2(participants.length)),
        userId,
      ]
    );

    // Add participants to tournament
    for (let i = 0; i < participants.length; i++) {
      await execute(
        `INSERT INTO tournament_participants (tournament_id, user_id, nexus_nickname, avatar_url, seed)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          tournament.id,
          participants[i].user_id,
          participants[i].nexus_nickname,
          participants[i].avatar_url,
          i + 1,
        ]
      );
    }

    // Generate initial matches (first round)
    const totalRounds = Math.ceil(Math.log2(participants.length));
    const firstRoundMatches = Math.ceil(participants.length / 2);

    for (let i = 0; i < firstRoundMatches; i++) {
      const player1Index = i;
      const player2Index = participants.length - 1 - i;

      if (player1Index < player2Index) {
        await execute(
          `INSERT INTO tournament_matches (tournament_id, round, match_number, player1_id, player1_nickname, player2_id, player2_nickname, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            tournament.id,
            1,
            i + 1,
            participants[player1Index].user_id,
            participants[player1Index].nexus_nickname,
            participants[player2Index].user_id,
            participants[player2Index].nexus_nickname,
            "pending",
          ]
        );
      }
    }

    // Update game status to in-progress
    await execute(
      "UPDATE custom_games SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      ["in-progress", gameId]
    );

    res.status(201).json({
      message: "Tournament created successfully",
      data: { tournament },
    });
  } catch (error) {
    console.error("Create tournament error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to create tournament",
    });
  }
});

// Get tournament by game ID
router.get("/game/:gameId", async (req, res) => {
  try {
    const { gameId } = req.params;

    const tournament = await getOne(
      "SELECT * FROM tournaments WHERE game_id = $1 ORDER BY created_at DESC LIMIT 1",
      [gameId]
    );

    if (!tournament) {
      return res.status(404).json({
        error: "Not Found",
        message: "Tournament not found",
      });
    }

    // Get participants
    const participants = await getMany(
      "SELECT * FROM tournament_participants WHERE tournament_id = $1 ORDER BY seed",
      [tournament.id]
    );

    // Get matches
    const matches = await getMany(
      "SELECT * FROM tournament_matches WHERE tournament_id = $1 ORDER BY round, match_number",
      [tournament.id]
    );

    tournament.participants = participants;
    tournament.matches = matches;

    res.json({
      data: { tournament },
    });
  } catch (error) {
    console.error("Get tournament error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get tournament",
    });
  }
});

// Update match result
router.put("/matches/:matchId", isAuthenticated, async (req, res) => {
  try {
    const { matchId } = req.params;
    const { winnerId, winnerNickname, tournamentCode, gameId } = req.body;

    // Update match
    await execute(
      `UPDATE tournament_matches 
       SET winner_id = $1, winner_nickname = $2, status = $3, tournament_code = $4, game_id = $5, completed_at = CURRENT_TIMESTAMP
       WHERE id = $6`,
      [winnerId, winnerNickname, "completed", tournamentCode, gameId, matchId]
    );

    // Eliminate loser
    const match = await getOne(
      "SELECT * FROM tournament_matches WHERE id = $1",
      [matchId]
    );

    const loserId =
      match.player1_id === winnerId ? match.player2_id : match.player1_id;
    await execute(
      "UPDATE tournament_participants SET eliminated = true WHERE tournament_id = $1 AND user_id = $2",
      [match.tournament_id, loserId]
    );

    // Check if tournament is complete
    const remainingParticipants = await getOne(
      "SELECT COUNT(*) as count FROM tournament_participants WHERE tournament_id = $1 AND eliminated = false",
      [match.tournament_id]
    );

    if (remainingParticipants.count === 1) {
      // Tournament is complete
      const winner = await getOne(
        "SELECT * FROM tournament_participants WHERE tournament_id = $1 AND eliminated = false",
        [match.tournament_id]
      );

      await execute(
        "UPDATE tournaments SET status = $1, winner_id = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
        ["completed", winner.user_id, match.tournament_id]
      );

      // Update game status to completed
      const tournament = await getOne(
        "SELECT game_id FROM tournaments WHERE id = $1",
        [match.tournament_id]
      );

      await execute(
        "UPDATE custom_games SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        ["completed", tournament.game_id]
      );
    }

    res.json({
      message: "Match result updated successfully",
    });
  } catch (error) {
    console.error("Update match result error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to update match result",
    });
  }
});

// Get tournament bracket
router.get("/:tournamentId/bracket", async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const tournament = await getOne("SELECT * FROM tournaments WHERE id = $1", [
      tournamentId,
    ]);

    if (!tournament) {
      return res.status(404).json({
        error: "Not Found",
        message: "Tournament not found",
      });
    }

    const participants = await getMany(
      "SELECT * FROM tournament_participants WHERE tournament_id = $1 ORDER BY seed",
      [tournamentId]
    );

    const matches = await getMany(
      "SELECT * FROM tournament_matches WHERE tournament_id = $1 ORDER BY round, match_number",
      [tournamentId]
    );

    // Group matches by round
    const rounds = [];
    for (let round = 1; round <= tournament.total_rounds; round++) {
      const roundMatches = matches.filter((m) => m.round === round);
      rounds.push({
        round,
        name: getRoundName(round, tournament.total_rounds),
        matches: roundMatches,
      });
    }

    res.json({
      data: {
        tournament,
        participants,
        rounds,
      },
    });
  } catch (error) {
    console.error("Get tournament bracket error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get tournament bracket",
    });
  }
});

function getRoundName(round, totalRounds) {
  const roundNames = {
    1: "1라운드",
    2: "2라운드",
    3: "3라운드",
    4: "4라운드",
  };

  if (round === totalRounds) return "결승";
  if (round === totalRounds - 1) return "준결승";
  if (round === totalRounds - 2) return "8강";
  if (round === totalRounds - 3) return "16강";

  return roundNames[round] || `${round}라운드`;
}

module.exports = router;
