const express = require("express");
const { getOne, getMany, execute } = require("../config/database");
const { isAuthenticated } = require("../config/passport");
const Joi = require("joi");

const router = express.Router();

// Validation schemas
const createPostSchema = Joi.object({
  category: Joi.string().required(),
  title: Joi.string().min(1).max(255).required(),
  content: Joi.string().min(1).max(5000).required(),
  imageUrl: Joi.string().uri().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  isAnonymous: Joi.boolean().default(false),
});

const createCommentSchema = Joi.object({
  content: Joi.string().min(1).max(1000).required(),
  parentCommentId: Joi.number().integer().optional(),
  isAnonymous: Joi.boolean().default(false),
});

// Get all posts
router.get("/posts", async (req, res) => {
  try {
    const { category, search, limit = 20, offset = 0 } = req.query;

    let whereClause = "WHERE 1=1";
    const params = [];
    let paramCount = 1;

    if (category && category !== "all") {
      whereClause += ` AND cp.category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (search) {
      whereClause += ` AND (cp.title ILIKE $${paramCount} OR cp.content ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    const posts = await getMany(
      `SELECT cp.*, 
              u.nexus_nickname, u.avatar_url,
              COUNT(cc.id) as comment_count
       FROM community_posts cp
       JOIN users u ON cp.user_id = u.id
       LEFT JOIN community_comments cc ON cp.id = cc.post_id
       ${whereClause}
       GROUP BY cp.id, u.nexus_nickname, u.avatar_url
       ORDER BY cp.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({ data: { posts } });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get posts",
    });
  }
});

// Get popular posts
router.get("/posts/popular", async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const posts = await getMany(
      `SELECT cp.*, 
              u.nexus_nickname, u.avatar_url,
              COUNT(cc.id) as comment_count
       FROM community_posts cp
       JOIN users u ON cp.user_id = u.id
       LEFT JOIN community_comments cc ON cp.id = cc.post_id
       GROUP BY cp.id, u.nexus_nickname, u.avatar_url
       ORDER BY (cp.like_count + cp.view_count) DESC, cp.created_at DESC
       LIMIT $1`,
      [parseInt(limit)]
    );

    res.json({ data: { posts } });
  } catch (error) {
    console.error("Get popular posts error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get popular posts",
    });
  }
});

// Get post by ID
router.get("/posts/:postId", async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await getOne(
      `SELECT cp.*, u.nexus_nickname, u.avatar_url
       FROM community_posts cp
       JOIN users u ON cp.user_id = u.id
       WHERE cp.id = $1`,
      [postId]
    );

    if (!post) {
      return res.status(404).json({
        error: "Not Found",
        message: "Post not found",
      });
    }

    // Increment view count
    await execute(
      "UPDATE community_posts SET view_count = view_count + 1 WHERE id = $1",
      [postId]
    );

    // Get comments
    const comments = await getMany(
      `SELECT cc.*, u.nexus_nickname, u.avatar_url
       FROM community_comments cc
       JOIN users u ON cc.user_id = u.id
       WHERE cc.post_id = $1
       ORDER BY cc.created_at ASC`,
      [postId]
    );

    post.comments = comments;

    res.json({ post });
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get post",
    });
  }
});

// Create post
router.post("/posts", isAuthenticated, async (req, res) => {
  try {
    const { error, value } = createPostSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation Error",
        message: error.details[0].message,
      });
    }

    const { category, title, content, imageUrl, tags, isAnonymous } = value;
    const userId = req.user.id;

    const post = await getOne(
      `INSERT INTO community_posts (user_id, category, title, content, image_url, tags, is_anonymous)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, category, title, content, imageUrl, tags || [], isAnonymous]
    );

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to create post",
    });
  }
});

const updatePostSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  content: Joi.string().min(1).max(5000).required(),
  imageUrl: Joi.string().uri().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
});

// Update post
router.put("/posts/:postId", isAuthenticated, async (req, res) => {
  try {
    const { error, value } = updatePostSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation Error",
        message: error.details[0].message,
      });
    }

    const { postId } = req.params;
    const { title, content, imageUrl, tags } = value;
    const userId = req.user.id;

    // Check if user owns the post
    const post = await getOne(
      "SELECT * FROM community_posts WHERE id = $1 AND user_id = $2",
      [postId, userId]
    );
    if (!post) {
      return res.status(404).json({
        error: "Not Found",
        message: "Post not found or you do not have permission to edit it",
      });
    }

    // Update post
    await execute(
      `UPDATE community_posts 
       SET title = $1, content = $2, image_url = $3, tags = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [title, content, imageUrl, tags || [], postId]
    );

    res.json({
      message: "Post updated successfully",
    });
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to update post",
    });
  }
});

// Delete post
router.delete("/posts/:postId", isAuthenticated, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Check if user owns the post
    const post = await getOne(
      "SELECT * FROM community_posts WHERE id = $1 AND user_id = $2",
      [postId, userId]
    );
    if (!post) {
      return res.status(404).json({
        error: "Not Found",
        message: "Post not found or you do not have permission to delete it",
      });
    }

    // Delete post (comments will be deleted due to CASCADE)
    await execute("DELETE FROM community_posts WHERE id = $1", [postId]);

    res.json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to delete post",
    });
  }
});

// Like/Dislike post
router.post("/posts/:postId/:action", isAuthenticated, async (req, res) => {
  try {
    const { postId, action } = req.params;
    const userId = req.user.id;

    if (!["like", "dislike"].includes(action)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid action",
      });
    }

    const field = action === "like" ? "like_count" : "dislike_count";

    await execute(
      `UPDATE community_posts SET "${field}" = "${field}" + 1 WHERE id = $1`,
      [postId]
    );

    res.json({
      message: `Post ${action}d successfully`,
    });
  } catch (error) {
    console.error("Like/Dislike post error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to like/dislike post",
    });
  }
});

// Create comment
router.post("/posts/:postId/comments", isAuthenticated, async (req, res) => {
  try {
    const { postId } = req.params;
    const { error, value } = createCommentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation Error",
        message: error.details[0].message,
      });
    }

    const { content, parentCommentId, isAnonymous } = value;
    const userId = req.user.id;

    // Check if post exists
    const post = await getOne("SELECT * FROM community_posts WHERE id = $1", [
      postId,
    ]);
    if (!post) {
      return res.status(404).json({
        error: "Not Found",
        message: "Post not found",
      });
    }

    const comment = await getOne(
      `INSERT INTO community_comments (post_id, user_id, parent_comment_id, content, is_anonymous)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [postId, userId, parentCommentId || null, content, isAnonymous]
    );

    res.status(201).json({
      message: "Comment created successfully",
      comment,
    });
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to create comment",
    });
  }
});

// Like/Dislike comment
router.post(
  "/comments/:commentId/:action",
  isAuthenticated,
  async (req, res) => {
    try {
      const { commentId, action } = req.params;
      const userId = req.user.id;

      if (!["like", "dislike"].includes(action)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Invalid action",
        });
      }

      const field = action === "like" ? "like_count" : "dislike_count";

      await execute(
        `UPDATE community_comments SET "${field}" = "${field}" + 1 WHERE id = $1`,
        [commentId]
      );

      res.json({
        message: `Comment ${action}d successfully`,
      });
    } catch (error) {
      console.error("Like/Dislike comment error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to like/dislike comment",
      });
    }
  }
);

module.exports = router;
