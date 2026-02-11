import express from "express";
const router = express.Router();

import { loginUser } from "../controllers/authController.js";
import {
  createUser,
  getAllUsers,
  deactivateUser,
  getSingleUser,
  updateUser,
  reactivateUser
} from "../controllers/userController.js";
import { verifyToken } from "../controllers/authController.js";
import { deleteUser } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import { changePassword, adminResetPassword } from "../controllers/userController.js";

router.get("/verify", protect, (req, res) => {
  // If we are here, token is valid
  res.status(200).json({ success: true, user: req.user });
});
// Public route
router.post("/login", loginUser);

// Admin only
router.post("/register", protect, authorizeRoles("admin"), createUser);

router.get("/users", protect, authorizeRoles("admin"), getAllUsers);

router.put(
  "/deactivate/:id",
  protect,
  authorizeRoles("admin"),
  deactivateUser
);

router.put(
  "/reactivate/:id",
  protect,
  authorizeRoles("admin"),
  reactivateUser
);

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
router.delete(
  "/users/:id",
  protect,
  authorizeRoles("admin"),
  deleteUser
);


// Admin resets user password
router.put(
  "/reset-password/:id",
  protect,
  authorizeRoles("admin"),
  adminResetPassword
);

// User changes own password
router.put(
  "/change-password",
  protect,
  changePassword
);



export default router;