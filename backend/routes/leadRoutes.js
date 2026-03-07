import express from "express";
const router = express.Router();

import { createLead } from "../controllers/leadController.js";
import { protect } from "../middleware/authMiddleware.js";
import { getLeads } from "../controllers/leadController.js";
import { updateLead } from "../controllers/leadController.js";
import { deleteLead } from "../controllers/leadController.js";
import { updateLeadStage } from "../controllers/leadController.js";
import { searchLeads } from "../controllers/leadController.js";
import { getSingleLead, addNoteToLead } from "../controllers/leadController.js";
router.post("/", protect, createLead);
router.get("/search", protect, searchLeads);
router.get("/", protect, getLeads);
router.get("/:id", protect, getSingleLead);
router.put("/:id", protect, updateLead);
router.delete("/:id", protect, deleteLead);
router.put("/:id/stage", protect, updateLeadStage);


router.post("/:id/notes", protect, addNoteToLead);
export default router;