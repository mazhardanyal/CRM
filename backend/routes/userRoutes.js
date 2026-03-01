import express from "express";
import {
  createUser,
  getAllUsers,
  deactivateUser,
  reactivateUser,
  deleteUser,
  updateUser,
  adminResetPassword,
  getAssignableUsers,
} from "../controllers/userController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js"; 
import { authorizeRoles } from "../middleware/authorizeRoles.js";

const router = express.Router();

// Create user & get all users (admin/manager)
router.route("/")
  .post(protect, adminOnly, createUser)
  .get(protect, authorizeRoles("admin", "manager"), getAllUsers);

// Assignable users dropdown (only active, not deleted)
router.get("/assignable", protect, authorizeRoles("admin", "manager"), getAssignableUsers);

// Update user (admin only)
router.put("/:id", protect, adminOnly, updateUser);

// Admin resets user password
router.put("/reset-password/:id", protect, adminOnly, adminResetPassword);

// Deactivate/reactivate/delete users
router.put("/deactivate/:id", protect, adminOnly, deactivateUser);
router.put("/reactivate/:id", protect, adminOnly, reactivateUser);
router.delete("/:id", protect, adminOnly, deleteUser);

export default router;