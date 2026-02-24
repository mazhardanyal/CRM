import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getNotifications,
  markNotificationRead
} from "../controllers/notificationFetchController.js";
import { createNotification } from "../controllers/notificationController.js";

const router = express.Router();

// Fetch notifications for logged-in user
router.get("/", protect, getNotifications);

// Mark notification as read
router.put("/:id/read", protect, markNotificationRead);

// Admin can create notification
router.post("/", protect, createNotification);

export default router;