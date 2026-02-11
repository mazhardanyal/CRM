import express from "express";
const router = express.Router();

import { createLead } from "../controllers/leadController.js";
import { protect } from "../middleware/authMiddleware.js";
import { getLeads } from "../controllers/leadController.js";
import { updateLead } from "../controllers/leadController.js";
import { deleteLead } from "../controllers/leadController.js";
import { updateLeadStage } from "../controllers/leadController.js";
import { searchLeads } from "../controllers/leadController.js";

router.post("/", protect, createLead);
router.get("/", protect, getLeads);
router.put("/:id", protect, updateLead);
router.delete("/:id", protect, deleteLead);
router.put("/:id/stage", protect, updateLeadStage);
router.get("/search", protect, searchLeads);

export default router;