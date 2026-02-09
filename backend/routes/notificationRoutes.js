import express from "express";
import { getNotifications } from "../controllers/notificationFetchController.js";
import { protect } from "../middleware/authMiddleware.js";
import { markNotificationRead } from "../controllers/notificationFetchController.js";

const router = express.Router();

router.get("/", protect, getNotifications);

// Mark a notification as read
router.put("/:id/read", protect, markNotificationRead);
export default router;