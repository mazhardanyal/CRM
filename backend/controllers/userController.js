import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const createUser = async (req, res) => {
  try {
    // 1️⃣ Extract input
    const { name, email, password, role } = req.body;

    // 2️⃣ Required fields check
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    // 3️⃣ Trim & normalize
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const userRole = role ? role.trim().toLowerCase() : "employee";

    // 4️⃣ Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // 5️⃣ Password strength validation
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(trimmedPassword)) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long and contain at least one letter and one number"
      });
    }

    // 6️⃣ Role validation
    const allowedRoles = ["employee", "manager", "admin"];
    if (!allowedRoles.includes(userRole)) {
      return res.status(400).json({ message: `Role must be one of: ${allowedRoles.join(", ")}` });
    }

    // 7️⃣ Check for duplicate email
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // 8️⃣ Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(trimmedPassword, saltRounds);

    // 9️⃣ Save user
    const newUser = new User({
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword,
      role: userRole
    });

    const savedUser = await newUser.save();

    // 🔟 Generate JWT token
    const token = jwt.sign(
      { id: savedUser._id, role: savedUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 1️⃣1️⃣ Return response + log
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

    console.log(
      `[${new Date().toISOString()}] User created: ${savedUser.name} (ID: ${savedUser._id}), role: ${savedUser.role}`
    );

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};


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