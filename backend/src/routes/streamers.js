const express = require("express");
const { getOne, getMany, execute } = require("../config/database");
const { isAuthenticated } = require("../config/passport");

const router = express.Router();

// Get all streamers
router.get("/", async (req, res) => {
  try {
    const { platform, search, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT si.*, u.nexus_nickname, u.avatar_url, u.is_online, u.last_seen
      FROM streamer_info si
      JOIN users u ON si.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (platform) {
      query += ` AND si.platform = $${params.length + 1}`;
      params.push(platform);
    }

    if (search) {
      query += ` AND (u.nexus_nickname ILIKE $${params.length + 1} OR si.stream_link ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY si.is_live DESC, si.viewer_count DESC, si.updated_at DESC`;
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const streamers = await getMany(query, params);

    res.json({
      data: streamers,
    });
  } catch (error) {
    console.error("Get streamers error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get streamers",
    });
  }
});

// Get streamer info
router.get("/:streamerId", isAuthenticated, async (req, res) => {
  try {
    const { streamerId } = req.params;

    const streamer = await getOne(
      `SELECT si.*, u.nexus_nickname, u.avatar_url, u.is_online, u.last_seen
       FROM streamer_info si
       JOIN users u ON si.user_id = u.id
       WHERE si.id = $1`,
      [streamerId]
    );

    if (!streamer) {
      return res.status(404).json({
        error: "Not Found",
        message: "Streamer not found",
      });
    }

    res.json({
      data: { streamer },
    });
  } catch (error) {
    console.error("Get streamer error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get streamer info",
    });
  }
});

// Update streamer info
router.put("/:streamerId", isAuthenticated, async (req, res) => {
  try {
    const { streamerId } = req.params;
    const userId = req.user.id;
    const { streamLink, platform, recentBroadcast, viewerCount, isLive } =
      req.body;

    // Check if user owns this streamer info
    const streamer = await getOne(
      "SELECT * FROM streamer_info WHERE id = $1 AND user_id = $2",
      [streamerId, userId]
    );

    if (!streamer) {
      return res.status(404).json({
        error: "Not Found",
        message: "Streamer info not found or access denied",
      });
    }

    // Update streamer info
    const updatedStreamer = await getOne(
      `UPDATE streamer_info 
       SET stream_link = $1, platform = $2, recent_broadcast = $3, 
           viewer_count = $4, is_live = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [streamLink, platform, recentBroadcast, viewerCount, isLive, streamerId]
    );

    res.json({
      message: "Streamer info updated successfully",
      data: { streamer: updatedStreamer },
    });
  } catch (error) {
    console.error("Update streamer error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to update streamer info",
    });
  }
});

// Register as streamer
router.post("/register", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const { streamLink, platform, recentBroadcast, viewerCount, isLive } =
      req.body;

    // Check if user is already a streamer
    const existingStreamer = await getOne(
      "SELECT id FROM streamer_info WHERE user_id = $1",
      [userId]
    );

    if (existingStreamer) {
      return res.status(400).json({
        error: "Bad Request",
        message: "User is already registered as a streamer",
      });
    }

    // Create streamer info
    const newStreamer = await getOne(
      `INSERT INTO streamer_info (
        user_id, stream_link, platform, recent_broadcast, 
        viewer_count, is_live
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [userId, streamLink, platform, recentBroadcast, viewerCount, isLive]
    );

    // Update user to be a streamer
    await execute("UPDATE users SET is_streamer = true WHERE id = $1", [
      userId,
    ]);

    res.status(201).json({
      message: "Successfully registered as streamer",
      data: { streamer: newStreamer },
    });
  } catch (error) {
    console.error("Register streamer error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to register as streamer",
    });
  }
});

module.exports = router;

// Submit a streamer application
router.post("/applications", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const { streamer_platform, streamer_url } = req.body;

    // Check if user has already applied
    const existingApplication = await getOne(
      "SELECT id FROM streamer_applications WHERE user_id = $1 AND status = 'pending'",
      [userId]
    );

    if (existingApplication) {
      return res.status(400).json({
        error: "Bad Request",
        message: "You already have a pending application.",
      });
    }

    // Create a new application
    const newApplication = await getOne(
      `INSERT INTO streamer_applications (user_id, streamer_platform, streamer_url)
       VALUES ($1, $2, $3) RETURNING *`,
      [userId, streamer_platform, streamer_url]
    );

    res.status(201).json({
      message: "Application submitted successfully.",
      data: { application: newApplication },
    });
  } catch (error) {
    console.error("Submit application error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to submit application.",
    });
  }
});

// Get all streamer applications (admin only)
router.get("/applications", isAuthenticated, async (req, res) => {
  try {
    // Add admin role check here in a real application

    const applications = await getMany(
      `SELECT sa.*, u.nexus_nickname
       FROM streamer_applications sa
       JOIN users u ON sa.user_id = u.id
       ORDER BY sa.created_at DESC`
    );

    res.json({ data: { applications } });
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get applications.",
    });
  }
});

// Get a user's application status
router.get("/applications/:userId", isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;

    const application = await getOne(
      "SELECT * FROM streamer_applications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
      [userId]
    );

    if (!application) {
      return res.status(404).json({
        error: "Not Found",
        message: "No application found for this user.",
      });
    }

    res.json({ data: { application } });
  } catch (error) {
    console.error("Get application status error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get application status.",
    });
  }
});

// Update an application's status (admin only)
router.put("/applications/:applicationId", isAuthenticated, async (req, res) => {
  try {
    // Add admin role check here in a real application

    const { applicationId } = req.params;
    const { status, admin_notes } = req.body;

    const updatedApplication = await getOne(
      `UPDATE streamer_applications
       SET status = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 RETURNING *`,
      [status, admin_notes, applicationId]
    );

    if (status === 'approved') {
        await execute("UPDATE users SET is_streamer = true WHERE id = $1", [updatedApplication.user_id]);
    }

    res.json({
      message: "Application status updated successfully.",
      data: { application: updatedApplication },
    });
  } catch (error) {
    console.error("Update application status error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to update application status.",
    });
  }
});
