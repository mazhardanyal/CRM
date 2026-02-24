import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js"; // ← add this
import cron from "node-cron";
import { generateFollowUp } from "./controllers/notificationController.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Create test admin if not exists
const createTestAdmin = async () => {
  const existing = await User.findOne({ email: "admin@test.com" });
  if (!existing) {
    const hashed = await bcrypt.hash("Admin123", 10);
    const admin = new User({
      name: "Test Admin",
      email: "admin@test.com",
      password: hashed,
      role: "admin",
      isActive: true,
    });
    await admin.save();
    console.log("✅ Test admin created: admin@test.com / Admin123");
  }
};
createTestAdmin();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes); // ← mount notifications

// Test route
app.get("/", (req, res) => {
  res.send("CRM API is running...");
});

// Cron job: run every day at 8:00 AM
cron.schedule("0 8 * * *", () => {
  console.log("Generating follow-up notifications...");
  generateFollowUp();
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));