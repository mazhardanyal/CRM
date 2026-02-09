import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";
import leadRoutes from "./routes/leadRoutes.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();



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

// Middleware to parse JSON
app.use(express.json());

// Enable CORS
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("CRM API is running...");
});

app.use("/api/leads", leadRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));