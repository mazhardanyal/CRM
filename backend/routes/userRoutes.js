        import express from "express";
import {
  createUser,
  getAllUsers,
  deactivateUser,
  reactivateUser,
  deleteUser,
} from "../controllers/userController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js"; // make sure these exist

const router = express.Router();

// Create user & get all users (admin only)
router.route("/")
  .post(protect, adminOnly, createUser)
  .get(protect, adminOnly, getAllUsers);

// Deactivate, reactivate, delete
router.put("/deactivate/:id", protect, adminOnly, deactivateUser);
router.put("/reactivate/:id", protect, adminOnly, reactivateUser);
router.delete("/:id", protect, adminOnly, deleteUser);

export default router;