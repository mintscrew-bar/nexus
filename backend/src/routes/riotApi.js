const express = require("express");
const { getOne, execute } = require("../config/database");
const { isAuthenticated } = require("../config/passport");
const { setRiotCache, getRiotCache } = require("../config/redis");
const axios = require("axios");

const router = express.Router();

// Get summoner by name
router.get("/summoner/:name/:tag", async (req, res) => {
  try {
    const { name, tag } = req.params;
    const cacheKey = `summoner:${name}:${tag}`;

    // Check cache first
    let summonerData = await getRiotCache(cacheKey);

    if (!summonerData) {
      // Fetch from Riot API
      const response = await axios.get(
        `${
          process.env.RIOT_API_BASE_URL
        }/lol/summoner/v4/summoners/by-name/${encodeURIComponent(name)}`,
        {
          headers: {
            "X-Riot-Token": process.env.RIOT_API_KEY,
          },
        }
      );

      summonerData = response.data;

      // Cache the result
      await setRiotCache(cacheKey, summonerData, 300); // 5 minutes
    }

    res.json({ summoner: summonerData });
  } catch (error) {
    console.error("Get summoner error:", error);

    if (error.response?.status === 404) {
      return res.status(404).json({
        error: "Not Found",
        message: "Summoner not found",
      });
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get summoner data",
    });
  }
});

// Get league entries
router.get("/league/:summonerId", async (req, res) => {
  try {
    const { summonerId } = req.params;
    const cacheKey = `league:${summonerId}`;

    // Check cache first
    let leagueData = await getRiotCache(cacheKey);

    if (!leagueData) {
      // Fetch from Riot API
      const response = await axios.get(
        `${process.env.RIOT_API_BASE_URL}/lol/league/v4/entries/by-summoner/${summonerId}`,
        {
          headers: {
            "X-Riot-Token": process.env.RIOT_API_KEY,
          },
        }
      );

      leagueData = response.data;

      // Cache the result
      await setRiotCache(cacheKey, leagueData, 600); // 10 minutes
    }

    res.json({ league: leagueData });
  } catch (error) {
    console.error("Get league entries error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get league data",
    });
  }
});

// Get match history
router.get("/matches/:puuid", async (req, res) => {
  try {
    const { puuid } = req.params;
    const { count = 20 } = req.query;
    const cacheKey = `matches:${puuid}:${count}`;

    // Check cache first
    let matchIds = await getRiotCache(cacheKey);

    if (!matchIds) {
      // Fetch from Riot API
      const response = await axios.get(
        `${process.env.RIOT_API_ASIA_URL}/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`,
        {
          headers: {
            "X-Riot-Token": process.env.RIOT_API_KEY,
          },
        }
      );

      matchIds = response.data;

      // Cache the result
      await setRiotCache(cacheKey, matchIds, 300); // 5 minutes
    }

    res.json({ matchIds });
  } catch (error) {
    console.error("Get match history error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get match history",
    });
  }
});

// Get match details
router.get("/match/:matchId", async (req, res) => {
  try {
    const { matchId } = req.params;
    const cacheKey = `match:${matchId}`;

    // Check cache first
    let matchData = await getRiotCache(cacheKey);

    if (!matchData) {
      // Fetch from Riot API
      const response = await axios.get(
        `${process.env.RIOT_API_ASIA_URL}/lol/match/v5/matches/${matchId}`,
        {
          headers: {
            "X-Riot-Token": process.env.RIOT_API_KEY,
          },
        }
      );

      matchData = response.data;

      // Cache the result
      await setRiotCache(cacheKey, matchData, 1800); // 30 minutes
    }

    res.json({ match: matchData });
  } catch (error) {
    console.error("Get match details error:", error);

    if (error.response?.status === 404) {
      return res.status(404).json({
        error: "Not Found",
        message: "Match not found",
      });
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get match details",
    });
  }
});

// Get static data (champions)
router.get("/static/champions", async (req, res) => {
  try {
    const cacheKey = "static:champions";

    // Check cache first
    let championsData = await getRiotCache(cacheKey);

    if (!championsData) {
      // Fetch from Riot API
      const response = await axios.get(
        `${process.env.RIOT_API_BASE_URL}/lol/static-data/v4/champions`,
        {
          headers: {
            "X-Riot-Token": process.env.RIOT_API_KEY,
          },
        }
      );

      championsData = response.data;

      // Cache the result for longer (static data doesn't change often)
      await setRiotCache(cacheKey, championsData, 86400); // 24 hours
    }

    res.json({ champions: championsData });
  } catch (error) {
    console.error("Get champions error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get champions data",
    });
  }
});

// Get static data (items)
router.get("/static/items", async (req, res) => {
  try {
    const cacheKey = "static:items";

    // Check cache first
    let itemsData = await getRiotCache(cacheKey);

    if (!itemsData) {
      // Fetch from Riot API
      const response = await axios.get(
        `${process.env.RIOT_API_BASE_URL}/lol/static-data/v4/items`,
        {
          headers: {
            "X-Riot-Token": process.env.RIOT_API_KEY,
          },
        }
      );

      itemsData = response.data;

      // Cache the result for longer (static data doesn't change often)
      await setRiotCache(cacheKey, itemsData, 86400); // 24 hours
    }

    res.json({ items: itemsData });
  } catch (error) {
    console.error("Get items error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get items data",
    });
  }
});

// Get static data (summoner spells)
router.get("/static/summoner-spells", async (req, res) => {
  try {
    const cacheKey = "static:summoner-spells";

    // Check cache first
    let spellsData = await getRiotCache(cacheKey);

    if (!spellsData) {
      // Fetch from Riot API
      const response = await axios.get(
        `${process.env.RIOT_API_BASE_URL}/lol/static-data/v4/summoner-spells`,
        {
          headers: {
            "X-Riot-Token": process.env.RIOT_API_KEY,
          },
        }
      );

      spellsData = response.data;

      // Cache the result for longer (static data doesn't change often)
      await setRiotCache(cacheKey, spellsData, 86400); // 24 hours
    }

    res.json({ spells: spellsData });
  } catch (error) {
    console.error("Get summoner spells error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get summoner spells data",
    });
  }
});

// Get static data (runes)
router.get("/static/runes", async (req, res) => {
  try {
    const cacheKey = "static:runes";

    // Check cache first
    let runesData = await getRiotCache(cacheKey);

    if (!runesData) {
      // Fetch from Riot API
      const response = await axios.get(
        `${process.env.RIOT_API_BASE_URL}/lol/static-data/v4/runes`,
        {
          headers: {
            "X-Riot-Token": process.env.RIOT_API_KEY,
          },
        }
      );

      runesData = response.data;

      // Cache the result for longer (static data doesn't change often)
      await setRiotCache(cacheKey, runesData, 86400); // 24 hours
    }

    res.json({ runes: runesData });
  } catch (error) {
    console.error("Get runes error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get runes data",
    });
  }
});

// Save match to database
router.post("/matches/save", isAuthenticated, async (req, res) => {
  try {
    const { matchId, matchData } = req.body;
    const userId = req.user.id;

    // Check if match already exists
    let match = await getOne("SELECT * FROM matches WHERE match_id = $1", [
      matchId,
    ]);

    if (!match) {
      // Create new match
      match = await getOne(
        `INSERT INTO matches (match_id, game_mode, game_type, game_duration, 
                             game_creation, is_custom_game, participants, teams)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          matchId,
          matchData.info.gameMode,
          matchData.info.gameType,
          matchData.info.gameDuration,
          new Date(matchData.info.gameCreation),
          false,
          JSON.stringify(matchData.info.participants),
          JSON.stringify(matchData.info.teams),
        ]
      );
    }

    // Find user's participant data
    const userParticipant = matchData.info.participants.find(
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
