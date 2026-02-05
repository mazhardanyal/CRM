import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getAllUsers } from "./userController.js";
import router from "../routes/authRoutes.js";

export const loginUser = async (req, res) => {
  try {
    // 1️⃣ Extract input
    const { email, password } = req.body;

    // 2️⃣ Required fields check
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 3️⃣ Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // 4️⃣ Check if user exists in DB
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 5️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 6️⃣ Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 7️⃣ Send response to frontend
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      },
      token
    });

    // 8️⃣ Optional: log login event
    console.log(
      `[${new Date().toISOString()}] User logged in: ${user.name} (ID: ${user._id}), role: ${user.role}`
    );

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};
router.get("/users", protect, authorizeRoles("admin"), getAllUsers);