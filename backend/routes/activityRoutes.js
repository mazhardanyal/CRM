import express from "express";
import { getLeadActivities } from "../controllers/activityController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Fetch all activities for a specific lead
router.get("/:leadId", protect, getLeadActivities);

export default router;