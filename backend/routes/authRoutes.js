import express from "express";
const router = express.Router();

import { loginUser } from "../controllers/authController.js";
import {
  createUser,
  getAllUsers,
  deactivateUser,
  getSingleUser,
  updateUser
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";

// Public route
router.post("/login", loginUser);

// Admin only
router.post("/register", protect, authorizeRoles("admin"), createUser);
router.get("/users", protect, authorizeRoles("admin"), getAllUsers);
router.put("/deactivate/:id", protect, authorizeRoles("admin"), deactivateUser);

router.get(
  "/users/:id",
  protect,
  authorizeRoles("admin"),
  getSingleUser
);
router.put(
  "/users/:id",
  protect,
  authorizeRoles("admin"),
  updateUser
);
export default router;