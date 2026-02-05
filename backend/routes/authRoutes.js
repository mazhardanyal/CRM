import express from "express";
const router = express.Router();

import { loginUser } from "../controllers/authController.js";
import { createUser } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";

// Login (public)
router.post("/login", loginUser);

// Register (admin only)
router.post(
  "/register",
  protect,
  authorizeRoles("admin"),
  createUser
);

export default router;