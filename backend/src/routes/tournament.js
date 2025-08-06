const express = require("express");
const axios = require("axios");
const { isAuthenticated } = require("../config/passport");
const { getOne, execute } = require("../config/database");

const router = express.Router();

// Endpoint to create tournament codes
router.post("/codes", isAuthenticated, async (req, res) => {
  try {
    const { tournamentId, count = 1 } = req.body;
    const RIOT_API_KEY = process.env.RIOT_API_KEY;
    const TOURNAMENT_API_KEY = process.env.TOURNAMENT_API_KEY; // Assuming a separate key for Tournament API

    if (!tournamentId) {
      return res.status(400).json({ message: "tournamentId is required" });
    }

    // Call Riot Tournament API to create codes
    const response = await axios.post(
      `https://americas.api.riotgames.com/lol/tournament/v4/codes`, // Use appropriate region for Tournament API
      {
        mapType: "SUMMONERS_RIFT", // Example: can be dynamic
        pickType: "TOURNAMENT_DRAFT", // Example: can be dynamic
        spectatorType: "ALL", // Example: can be dynamic
        teamSize: 5, // Example: can be dynamic
        metadata: JSON.stringify({ tournamentId, createdBy: req.user.id }),
        allowedSummonerIds: [], // Can be populated with participant PUUIDs
      },
      {
        headers: {
          "X-Riot-Token": TOURNAMENT_API_KEY || RIOT_API_KEY, // Use Tournament API key if available, else main Riot API key
          "Content-Type": "application/json",
        },
        params: {
          count: count,
        },
      }
    );

    const codes = response.data; // Array of tournament codes

    // Optionally, save tournament codes to your database
    for (const code of codes) {
      await execute(
        `INSERT INTO tournament_codes (tournament_id, code, created_by, metadata)
         VALUES ($1, $2, $3, $4) ON CONFLICT (code) DO NOTHING`,
        [tournamentId, code, req.user.id, JSON.stringify({ tournamentId, createdBy: req.user.id })]
      );
    }

    res.json({ codes });
  } catch (error) {
    console.error("Error creating tournament codes:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to create tournament codes", error: error.response?.data || error.message });
  }
});

// Endpoint to get match ID by tournament code
router.get("/match/:tournamentCode", async (req, res) => {
  try {
    const { tournamentCode } = req.params;
    const RIOT_API_KEY = process.env.RIOT_API_KEY;
    const TOURNAMENT_API_KEY = process.env.TOURNAMENT_API_KEY;

    // Call Riot Tournament API to get match ID
    const response = await axios.get(
      `https://americas.api.riotgames.com/lol/tournament/v4/matches/by-code/${tournamentCode}`, // Use appropriate region for Tournament API
      {
        headers: {
          "X-Riot-Token": TOURNAMENT_API_KEY || RIOT_API_KEY,
        },
      }
    );

    const matchId = response.data; // This endpoint usually returns the matchId directly

    // Optionally, update your database with the matchId for the given tournamentCode
    await execute(
      `UPDATE tournament_codes SET match_id = $1 WHERE code = $2`,
      [matchId, tournamentCode]
    );

    res.json({ matchId });
  } catch (error) {
    console.error("Error getting match ID by tournament code:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to get match ID", error: error.response?.data || error.message });
  }
});

module.exports = router;
