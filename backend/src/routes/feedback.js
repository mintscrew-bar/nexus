const express = require("express");
const { getOne, getMany, execute } = require("../config/database");
const { isAuthenticated } = require("../config/passport");
const Joi = require("joi");

const router = express.Router();

// Validation schemas
const feedbackSchema = Joi.object({
  featureName: Joi.string().min(1).max(100).required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().max(1000).optional(),
  isAnonymous: Joi.boolean().default(false),
});

const userEvaluationSchema = Joi.object({
  targetUserId: Joi.number().integer().required(),
  evaluationType: Joi.string().valid("like", "dislike").required(),
});

const reportSchema = Joi.object({
  reportedUserId: Joi.number().integer().required(),
  reportType: Joi.string().min(1).max(50).required(),
  reason: Joi.string().min(1).max(500).required(),
  evidence: Joi.string().max(1000).optional(),
});

// Submit feedback
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const { error, value } = feedbackSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation Error",
        message: error.details[0].message,
      });
    }

    const { featureName, rating, comment, isAnonymous } = value;
    const userId = isAnonymous ? null : req.user.id;

    const feedback = await getOne(
      `INSERT INTO user_feedback (user_id, feature_name, rating, comment, is_anonymous)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, featureName, rating, comment, isAnonymous]
    );

    res.status(201).json({
      message: "Feedback submitted successfully",
      feedback,
    });
  } catch (error) {
    console.error("Submit feedback error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to submit feedback",
    });
  }
});

// Get feedback statistics
router.get("/stats", async (req, res) => {
  try {
    const { featureName } = req.query;

    let whereClause = "WHERE 1=1";
    const params = [];
    let paramCount = 1;

    if (featureName) {
      whereClause += ` AND feature_name = $${paramCount}`;
      params.push(featureName);
      paramCount++;
    }

    const stats = await getOne(
      `SELECT 
         feature_name,
         COUNT(*) as total_feedback,
         AVG(rating) as average_rating,
         COUNT(CASE WHEN rating >= 4 THEN 1 END) as positive_count,
         COUNT(CASE WHEN rating <= 2 THEN 1 END) as negative_count
       FROM user_feedback
       ${whereClause}
       GROUP BY feature_name
       ORDER BY average_rating DESC`,
      params
    );

    res.json({ stats });
  } catch (error) {
    console.error("Get feedback stats error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get feedback statistics",
    });
  }
});

// Get all feedback (admin only)
router.get("/", async (req, res) => {
  try {
    const { featureName, limit = 50, offset = 0 } = req.query;

    let whereClause = "WHERE 1=1";
    const params = [];
    let paramCount = 1;

    if (featureName) {
      whereClause += ` AND feature_name = $${paramCount}`;
      params.push(featureName);
      paramCount++;
    }

    const feedback = await getMany(
      `SELECT uf.*, u.nexus_nickname
       FROM user_feedback uf
       LEFT JOIN users u ON uf.user_id = u.id
       ${whereClause}
       ORDER BY uf.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({ feedback });
  } catch (error) {
    console.error("Get feedback error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get feedback",
    });
  }
});

// Evaluate user (like/dislike)
router.post("/evaluate-user", isAuthenticated, async (req, res) => {
  try {
    const { error, value } = userEvaluationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation Error",
        message: error.details[0].message,
      });
    }

    const { targetUserId, evaluationType } = value;
    const evaluatorId = req.user.id;

    // Check if user is evaluating themselves
    if (evaluatorId === targetUserId) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Cannot evaluate yourself",
      });
    }

    // Check if target user exists
    const targetUser = await getOne("SELECT * FROM users WHERE id = $1", [
      targetUserId,
    ]);
    if (!targetUser) {
      return res.status(404).json({
        error: "Not Found",
        message: "Target user not found",
      });
    }

    // Check if evaluation already exists
    const existingEvaluation = await getOne(
      "SELECT * FROM user_evaluations WHERE evaluator_id = $1 AND target_user_id = $2",
      [evaluatorId, targetUserId]
    );

    if (existingEvaluation) {
      // Update existing evaluation
      await execute(
        "UPDATE user_evaluations SET evaluation_type = $1, timestamp = CURRENT_TIMESTAMP WHERE evaluator_id = $2 AND target_user_id = $3",
        [evaluationType, evaluatorId, targetUserId]
      );
    } else {
      // Create new evaluation
      await execute(
        "INSERT INTO user_evaluations (evaluator_id, target_user_id, evaluation_type) VALUES ($1, $2, $3)",
        [evaluatorId, targetUserId, evaluationType]
      );
    }

    res.json({
      message: `User ${evaluationType}d successfully`,
    });
  } catch (error) {
    console.error("Evaluate user error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to evaluate user",
    });
  }
});

// Get user evaluations
router.get("/evaluations/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const evaluations = await getMany(
      `SELECT ue.*, evaluator.nexus_nickname as evaluator_nickname
       FROM user_evaluations ue
       JOIN users evaluator ON ue.evaluator_id = evaluator.id
       WHERE ue.target_user_id = $1
       ORDER BY ue.timestamp DESC`,
      [userId]
    );

    // Count likes and dislikes
    const likeCount = evaluations.filter(
      (e) => e.evaluation_type === "like"
    ).length;
    const dislikeCount = evaluations.filter(
      (e) => e.evaluation_type === "dislike"
    ).length;

    res.json({
      evaluations,
      summary: {
        total: evaluations.length,
        likes: likeCount,
        dislikes: dislikeCount,
      },
    });
  } catch (error) {
    console.error("Get user evaluations error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get user evaluations",
    });
  }
});

// Report user
router.post("/report", isAuthenticated, async (req, res) => {
  try {
    const { error, value } = reportSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation Error",
        message: error.details[0].message,
      });
    }

    const { reportedUserId, reportType, reason, evidence } = value;
    const reporterId = req.user.id;

    // Check if user is reporting themselves
    if (reporterId === reportedUserId) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Cannot report yourself",
      });
    }

    // Check if reported user exists
    const reportedUser = await getOne("SELECT * FROM users WHERE id = $1", [
      reportedUserId,
    ]);
    if (!reportedUser) {
      return res.status(404).json({
        error: "Not Found",
        message: "Reported user not found",
      });
    }

    // Check if report already exists
    const existingReport = await getOne(
      "SELECT * FROM user_reports WHERE reporter_id = $1 AND reported_user_id = $2",
      [reporterId, reportedUserId]
    );

    if (existingReport) {
      return res.status(409).json({
        error: "Conflict",
        message: "You have already reported this user",
      });
    }

    // Create report
    const report = await getOne(
      `INSERT INTO user_reports (reporter_id, reported_user_id, report_type, reason, evidence)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [reporterId, reportedUserId, reportType, reason, evidence]
    );

    res.status(201).json({
      message: "User reported successfully",
      report,
    });
  } catch (error) {
    console.error("Report user error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to report user",
    });
  }
});

// Get user reports (admin only)
router.get("/reports", async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let whereClause = "WHERE 1=1";
    const params = [];
    let paramCount = 1;

    if (status && status !== "all") {
      whereClause += ` AND ur.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    const reports = await getMany(
      `SELECT ur.*, 
              reporter.nexus_nickname as reporter_nickname,
              reported.nexus_nickname as reported_nickname
       FROM user_reports ur
       JOIN users reporter ON ur.reporter_id = reporter.id
       JOIN users reported ON ur.reported_user_id = reported.id
       ${whereClause}
       ORDER BY ur.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({ reports });
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get reports",
    });
  }
});

// Update report status (admin only)
router.put("/reports/:reportId", async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, adminNotes } = req.body;

    const result = await execute(
      "UPDATE user_reports SET status = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
      [status, adminNotes, reportId]
    );

    if (result === 0) {
      return res.status(404).json({
        error: "Not Found",
        message: "Report not found",
      });
    }

    res.json({
      message: "Report status updated successfully",
    });
  } catch (error) {
    console.error("Update report status error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to update report status",
    });
  }
});

module.exports = router;
