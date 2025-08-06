const express = require("express");
const { getOne, getMany, execute } = require("../config/database");
const { isAuthenticated } = require("../config/passport");
const Joi = require("joi");

const router = express.Router();

// Validation schemas
const friendRequestSchema = Joi.object({
  friendUserId: Joi.number().integer().required(),
});

// Get friends list
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;

    const friends = await getMany(
      `SELECT f.*, u.nexus_nickname, u.avatar_url, u.is_online, u.last_seen
       FROM friends f
       JOIN users u ON f.friend_user_id = u.id
       WHERE f.user_id = $1 AND f.status = $2
       ORDER BY u.is_online DESC, u.last_seen DESC`,
      [userId, "accepted"]
    );

    res.json({
      data: { friends },
    });
  } catch (error) {
    console.error("Get friends error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get friends",
    });
  }
});

// Get friend requests
router.get("/requests", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await getMany(
      `SELECT f.*, u.nexus_nickname, u.avatar_url
       FROM friends f
       JOIN users u ON f.user_id = u.id
       WHERE f.friend_user_id = $1 AND f.status = $2
       ORDER BY f.created_at DESC`,
      [userId, "pending"]
    );

    res.json({
      data: { requests },
    });
  } catch (error) {
    console.error("Get friend requests error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get friend requests",
    });
  }
});

// Send friend request
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const { error, value } = friendRequestSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation Error",
        message: error.details[0].message,
      });
    }

    const { friendUserId } = value;
    const userId = req.user.id;

    // Check if friend request already exists
    const existingRequest = await getOne(
      "SELECT * FROM friends WHERE user_id = $1 AND friend_user_id = $2",
      [userId, friendUserId]
    );

    if (existingRequest) {
      return res.status(409).json({
        error: "Conflict",
        message: "Friend request already exists",
      });
    }

    // Check if reverse request exists
    const reverseRequest = await getOne(
      "SELECT * FROM friends WHERE user_id = $1 AND friend_user_id = $2",
      [friendUserId, userId]
    );

    if (reverseRequest) {
      // Accept the reverse request
      await execute(
        "UPDATE friends SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND friend_user_id = $3",
        ["accepted", friendUserId, userId]
      );

      // Create accepted friend relationship
      await execute(
        "INSERT INTO friends (user_id, friend_user_id, status) VALUES ($1, $2, $3)",
        [userId, friendUserId, "accepted"]
      );

      res.json({
        message: "Friend request accepted",
        status: "accepted",
      });
    } else {
      // Create new friend request
      await execute(
        "INSERT INTO friends (user_id, friend_user_id, status) VALUES ($1, $2, $3)",
        [userId, friendUserId, "pending"]
      );

      res.status(201).json({
        message: "Friend request sent",
        status: "pending",
      });
    }
  } catch (error) {
    console.error("Send friend request error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to send friend request",
    });
  }
});

// Accept friend request
router.put("/:friendUserId/accept", isAuthenticated, async (req, res) => {
  try {
    const { friendUserId } = req.params;
    const userId = req.user.id;

    // Update the friend request status
    const result = await execute(
      "UPDATE friends SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND friend_user_id = $3",
      ["accepted", friendUserId, userId]
    );

    if (result === 0) {
      return res.status(404).json({
        error: "Not Found",
        message: "Friend request not found",
      });
    }

    // Create reverse friend relationship
    await execute(
      "INSERT INTO friends (user_id, friend_user_id, status) VALUES ($1, $2, $3)",
      [userId, friendUserId, "accepted"]
    );

    res.json({
      message: "Friend request accepted",
    });
  } catch (error) {
    console.error("Accept friend request error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to accept friend request",
    });
  }
});

// Reject friend request
router.put("/:friendUserId/reject", isAuthenticated, async (req, res) => {
  try {
    const { friendUserId } = req.params;
    const userId = req.user.id;

    const result = await execute(
      "UPDATE friends SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND friend_user_id = $3",
      ["rejected", friendUserId, userId]
    );

    if (result === 0) {
      return res.status(404).json({
        error: "Not Found",
        message: "Friend request not found",
      });
    }

    res.json({
      message: "Friend request rejected",
    });
  } catch (error) {
    console.error("Reject friend request error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to reject friend request",
    });
  }
});

// Remove friend
router.delete("/:friendUserId", isAuthenticated, async (req, res) => {
  try {
    const { friendUserId } = req.params;
    const userId = req.user.id;

    // Remove both friend relationships
    await execute(
      "DELETE FROM friends WHERE (user_id = $1 AND friend_user_id = $2) OR (user_id = $2 AND friend_user_id = $1)",
      [userId, friendUserId]
    );

    res.json({
      message: "Friend removed",
    });
  } catch (error) {
    console.error("Remove friend error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to remove friend",
    });
  }
});

module.exports = router;