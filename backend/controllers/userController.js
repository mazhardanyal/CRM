import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Create user (admin only)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const userRole = role ? role.trim().toLowerCase() : "employee";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(trimmedPassword)) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long and contain at least one letter and one number"
      });
    }

    const allowedRoles = ["employee", "manager", "admin"];
    if (!allowedRoles.includes(userRole)) {
      return res.status(400).json({ message: `Role must be one of: ${allowedRoles.join(", ")}` });
    }

    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);

    const newUser = new User({
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword,
      role: userRole
    });

    const savedUser = await newUser.save();

    const token = jwt.sign(
      { id: savedUser._id, role: savedUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        isActive: savedUser.isActive,
        createdAt: savedUser.createdAt
      },
      token
    });

    console.log(`[${new Date().toISOString()}] User created: ${savedUser.name} (ID: ${savedUser._id}), role: ${savedUser.role}`);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({
      message: "Users fetched successfully",
      count: users.length,
      users,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Deactivate user (admin only)
export const deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

// ✅ ADD THIS
if (req.user.id === user.id) {
  return res.status(400).json({
    message: "Admin cannot deactivate himself"
  });
}

    user.isActive = false;
    await user.save();

    res.json({ message: "User deactivated successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single user (admin only)
export const getSingleUser = async (req, res) => {
  try {
    // 1️⃣ Get ID from URL params
    const userId = req.params.id;

    // 2️⃣ Find user in DB
    const user = await User.findById(userId).select("-password");

    // 3️⃣ If user not found
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 4️⃣ Send response
    res.status(200).json({
      message: "User fetched successfully",
      user,
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user (admin only)
export const updateUser = async (req, res) => {
  try {
    // 1️⃣ Get user ID from params
    const userId = req.params.id;

    // 2️⃣ Extract fields from body
    const { name, email, role } = req.body;

    // 3️⃣ Find user in DB
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 4️⃣ If email is being updated → check duplicate
    if (email && email.trim().toLowerCase() !== user.email) {
      const existingUser = await User.findOne({
        email: email.trim().toLowerCase(),
      });

      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Email already in use by another user" });
      }

      user.email = email.trim().toLowerCase();
    }

    // 5️⃣ Update name if provided
    if (name) {
      user.name = name.trim();
    }

    // 6️⃣ Update role if provided
    if (role) {
      const allowedRoles = ["admin", "manager", "employee"];

      if (!allowedRoles.includes(role.toLowerCase())) {
        return res.status(400).json({
          message: `Role must be one of: ${allowedRoles.join(", ")}`,
        });
      }

      user.role = role.toLowerCase();
    }

    // 7️⃣ Save updated user
    const updatedUser = await user.save();

    // 8️⃣ Send response
    res.status(200).json({
      message: "User updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};