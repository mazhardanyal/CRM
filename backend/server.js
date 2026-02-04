import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Load environment variables from .env
dotenv.config();

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Enable CORS (allow frontend to call APIs)
app.use(cors());

// Test route
app.get("/", (req, res) => {
  res.send("CRM API is running...");
});

// Listen on port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
