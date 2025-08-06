const express = require("express");
const { getOne, getMany, execute } = require("../config/database");
const { isAuthenticated } = require("../config/passport");

const router = express.Router();

// Get all messages for the user
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    const messages = await getMany(
      `SELECT m.*, 
        sender.nexus_nickname as sender_nickname,
        sender.avatar_url as sender_avatar,
        receiver.nexus_nickname as receiver_nickname,
        receiver.avatar_url as receiver_avatar
       FROM messages m
       JOIN users sender ON m.sender_id = sender.id
       JOIN users receiver ON m.receiver_id = receiver.id
       WHERE m.sender_id = $1 OR m.receiver_id = $1
       ORDER BY m.timestamp DESC
       LIMIT $2 OFFSET $3`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    res.json({
      data: messages.reverse(),
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get messages",
    });
  }
});

// Get conversations list
router.get("/conversations", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all conversations for the user
    const conversations = await getMany(
      `SELECT DISTINCT 
        CASE 
          WHEN m.sender_id = $1 THEN m.receiver_id
          ELSE m.sender_id
        END as other_user_id,
        u.nexus_nickname,
        u.avatar_url,
        u.is_online,
        u.last_seen,
        MAX(m.timestamp) as last_message_time,
        COUNT(CASE WHEN m.is_read = false AND m.receiver_id = $1 THEN 1 END) as unread_count
       FROM messages m
       JOIN users u ON (
         CASE 
           WHEN m.sender_id = $1 THEN m.receiver_id
           ELSE m.sender_id
         END = u.id
       )
       WHERE m.sender_id = $1 OR m.receiver_id = $1
       GROUP BY other_user_id, u.nexus_nickname, u.avatar_url, u.is_online, u.last_seen
       ORDER BY last_message_time DESC`,
      [userId]
    );

    res.json({
      data: conversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get conversations",
    });
  }
});

// Get messages between two users
router.get("/conversation/:otherUserId", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const messages = await getMany(
      `SELECT m.*, 
        sender.nexus_nickname as sender_nickname,
        sender.avatar_url as sender_avatar,
        receiver.nexus_nickname as receiver_nickname,
        receiver.avatar_url as receiver_avatar
       FROM messages m
       JOIN users sender ON m.sender_id = sender.id
       JOIN users receiver ON m.receiver_id = receiver.id
       WHERE (m.sender_id = $1 AND m.receiver_id = $2)
          OR (m.sender_id = $2 AND m.receiver_id = $1)
       ORDER BY m.timestamp DESC
       LIMIT $3 OFFSET $4`,
      [userId, otherUserId, parseInt(limit), parseInt(offset)]
    );

    res.json({
      data: messages.reverse(),
    });
  } catch (error) {
    console.error("Get conversation error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get conversation",
    });
  }
});

// Send message
router.post("/send", isAuthenticated, async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, content } = req.body;

    if (!content || !receiverId) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Receiver ID and content are required",
      });
    }

    // Check if receiver exists
    const receiver = await getOne("SELECT id FROM users WHERE id = $1", [
      receiverId,
    ]);
    if (!receiver) {
      return res.status(404).json({
        error: "Not Found",
        message: "Receiver not found",
      });
    }

    // Save message
    const message = await getOne(
      `INSERT INTO messages (sender_id, receiver_id, content, created_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       RETURNING *`,
      [senderId, receiverId, content]
    );

    // Get sender info
    const sender = await getOne(
      "SELECT nexus_nickname, avatar_url FROM users WHERE id = $1",
      [senderId]
    );

    const messageWithSender = {
      ...message,
      sender_nickname: sender.nexus_nickname,
      sender_avatar: sender.avatar_url,
      receiver_nickname: receiver.nexus_nickname,
      receiver_avatar: receiver.avatar_url,
    };

    res.status(201).json({
      message: "Message sent successfully",
      data: messageWithSender,
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to send message",
    });
  }
});

// Mark messages as read
router.post("/mark-read/:userId", isAuthenticated, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { userId } = req.params;

    await execute(
      `UPDATE messages 
       SET is_read = true 
       WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false`,
      [userId, currentUserId]
    );

    res.json({
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Mark messages as read error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to mark messages as read",
    });
  }
});

// Get unread message count
router.get("/unread-count", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await getOne(
      "SELECT COUNT(*) as count FROM messages WHERE receiver_id = $1 AND is_read = false",
      [userId]
    );

    res.json({
      data: { count: parseInt(result.count) },
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get unread count",
    });
  }
});

// Get chat messages for a game
router.get("/game/:gameId", isAuthenticated, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Check if user is a participant
    const participant = await getOne(
      "SELECT * FROM custom_game_participants WHERE game_id = $1 AND user_id = $2",
      [gameId, req.user.id]
    );

    if (!participant) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Not a participant in this game",
      });
    }

    // Get chat messages
    const messages = await getMany(
      `SELECT cm.*, u.nexus_nickname, u.avatar_url
       FROM chat_messages cm
       JOIN users u ON cm.sender_id = u.id
       WHERE cm.game_id = $1
       ORDER BY cm.created_at DESC
       LIMIT $2 OFFSET $3`,
      [gameId, parseInt(limit), parseInt(offset)]
    );

    res.json({
      data: { messages: messages.reverse() },
    });
  } catch (error) {
    console.error("Get chat messages error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get chat messages",
    });
  }
});

// Save chat message
router.post("/game/:gameId", isAuthenticated, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { message } = req.body;

    // Check if user is a participant
    const participant = await getOne(
      "SELECT * FROM custom_game_participants WHERE game_id = $1 AND user_id = $2",
      [gameId, req.user.id]
    );

    if (!participant) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Not a participant in this game",
      });
    }

    // Save message to database
    const savedMessage = await getOne(
      `INSERT INTO chat_messages (game_id, sender_id, message, created_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       RETURNING *`,
      [gameId, req.user.id, message]
    );

    // Get sender info
    const sender = await getOne(
      "SELECT nexus_nickname, avatar_url FROM users WHERE id = $1",
      [req.user.id]
    );

    const messageWithSender = {
      ...savedMessage,
      nexus_nickname: sender.nexus_nickname,
      avatar_url: sender.avatar_url,
    };

    res.status(201).json({
      message: "Message sent successfully",
      data: { message: messageWithSender },
    });
  } catch (error) {
    console.error("Save chat message error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to save chat message",
    });
  }
});

module.exports = router;
