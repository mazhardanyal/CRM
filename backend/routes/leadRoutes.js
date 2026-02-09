import express from "express";
const router = express.Router();

import { createLead } from "../controllers/leadController.js";
import { protect } from "../middleware/authMiddleware.js";

router.post("/", protect, createLead);

export default router;