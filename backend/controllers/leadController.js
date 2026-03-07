import Lead from "../models/Lead.js";
import mongoose from "mongoose";
import { logActivity } from "./activityController.js";
import { sendNotification } from "./notificationController.js";

/* ======================
   CREATE LEAD
====================== */
export const createLead = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      source,
      status,
      assignedTo,
      notes,
      followUpDate,
    } = req.body;

    // ✅ Prepare notes properly (convert string to array object)
    let formattedNotes = [];

    if (notes && notes.trim() !== "") {
      formattedNotes.push({
        text: notes,
        addedBy: req.user._id,
      });
    }

    const lead = await Lead.create({
      name,
      email,
      phone,
      company,
      source,
      status,
      assignedTo,
      notes: formattedNotes, // ✅ IMPORTANT FIX
      followUpDate,
      createdBy: req.user._id,
    });

    // 🔥 Log activity
    await logActivity({
      userId: req.user._id,
      leadId: lead._id,
      action: `Lead created`,
    });

    // 🔔 Send notification if assigned
    if (assignedTo) {
      await sendNotification({
        userId: assignedTo,
        leadId: lead._id,
        message: `You have been assigned to lead ${lead.name}`,
      });
    }

    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/* ======================
   GET ALL LEADS
====================== */
export const getLeads = async (req, res) => {
  try {
    let leads;

    if (req.user.role === "admin" || req.user.role === "manager") {
      leads = await Lead.find()
        .populate("assignedTo", "name email")
        .sort({ followUpDate: 1 });
    } else {
      leads = await Lead.find({ assignedTo: req.user._id })
        .populate({
  path: "assignedTo",
  select: "name email role",
  match: { isActive: true, deleted: { $ne: true } } // ✅ Only active users
})        .sort({ followUpDate: 1 });
    }

    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================
   UPDATE LEAD DETAILS
====================== */
// UPDATE LEAD DETAILS
export const updateLead = async (req, res) => {
  try {
    const leadId = req.params.id;
    const { name, company, status, assignedTo, notes, followUpDate } = req.body;

    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    // --- Update name & company ---
    if (name && name !== lead.name) {
      await logActivity({ userId: req.user._id, leadId: lead._id, action: `Name changed: "${lead.name}" → "${name}"` });
      lead.name = name;
    }

    if (company && company !== lead.company) {
      await logActivity({ userId: req.user._id, leadId: lead._id, action: `Company changed: "${lead.company}" → "${company}"` });
      lead.company = company;
    }

    // --- Update status ---
    if (status && status !== lead.status) {
      await logActivity({ userId: req.user._id, leadId: lead._id, action: `Status changed: ${lead.status} → ${status}` });
      lead.status = status;
    }

    // --- Update assignedTo ---
    if (assignedTo !== undefined && String(lead.assignedTo) !== assignedTo) {
      lead.assignedTo = assignedTo ? new mongoose.Types.ObjectId(assignedTo) : null;
      await logActivity({ userId: req.user._id, leadId: lead._id, action: `Assigned to: ${assignedTo || "Unassigned"}` });

      if (assignedTo) await sendNotification({ userId: assignedTo, leadId: lead._id, message: `You have been assigned to lead ${lead.name}` });
    }

    // --- Add new note if provided ---
    if (notes && notes.trim() !== "") {
      if (!Array.isArray(lead.notes)) lead.notes = [];
      lead.notes.push({ text: notes, addedBy: req.user._id });

      await logActivity({ userId: req.user._id, leadId: lead._id, action: `Note added: ${notes}` });

      if (lead.assignedTo) await sendNotification({ userId: lead.assignedTo, leadId: lead._id, message: `New note: ${notes}` });
    }

    // --- Update followUpDate ---
    if (followUpDate) {
      lead.followUpDate = followUpDate;
      await logActivity({ userId: req.user._id, leadId: lead._id, action: `Follow-up date set/changed to ${followUpDate}` });
    }

    const updatedLead = await lead.save();
    res.status(200).json(updatedLead);

  } catch (error) {
    console.error("UPDATE LEAD ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
/* ======================
   UPDATE LEAD STAGE
====================== */
export const updateLeadStage = async (req, res) => {
  try {
    const leadId = req.params.id;
    const { stage } = req.body;

    const validStages = ["New", "Contacted", "Demo Scheduled", "Negotiation", "Won", "Lost"];
    if (!validStages.includes(stage)) {
      return res.status(400).json({ message: "Invalid stage" });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    const oldStage = lead.stage;
    lead.stage = stage;
    const updatedLead = await lead.save();

    await logActivity({
      userId: req.user._id,
      leadId: lead._id,
      action: `Stage changed from ${oldStage} to ${stage}`,
    });

    res.status(200).json(updatedLead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================
   DELETE LEAD
====================== */
export const deleteLead = async (req, res) => {
  try {
    const leadId = req.params.id;
    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can delete leads" });
    }

    await lead.deleteOne();

   await logActivity({
  userId: req.user._id,
  leadId: lead._id,
  action: `Lead deleted`,
});

    res.status(200).json({ message: "Lead deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================
   SEARCH / FILTER LEADS
====================== */
export const searchLeads = async (req, res) => {
  try {
    const { name, company, status, stage, assignedTo, source, followUpDate } = req.query;

    let query = {};

    // Employees see only their leads
    if (req.user.role === "employee") query.assignedTo = req.user._id;

    if (name) query.name = { $regex: name, $options: "i" };
    if (company) query.company = { $regex: company, $options: "i" };
    if (status) query.status = status;
    if (stage) query.stage = stage;
    if (assignedTo && req.user.role !== "employee") query.assignedTo = assignedTo;
    if (source) query.source = source;
    if (followUpDate) {
      const date = new Date(followUpDate);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      query.followUpDate = { $gte: date, $lt: nextDay };
    }

    const leads = await Lead.find(query)
  .populate({
    path: "assignedTo",
    select: "name email role",
    match: { isActive: true, deleted: { $ne: true } } // ✅ Only active users
  })
  .sort({ followUpDate: 1 });

    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getSingleLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("notes.addedBy", "name email");

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.status(200).json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const addNoteToLead = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Note text is required" });
    }

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // ✅ FIX: Ensure notes is always an array
    if (!Array.isArray(lead.notes)) {
      lead.notes = [];
    }

    const newNote = {
      text,
      addedBy: req.user._id,
    };

    lead.notes.push(newNote);

    await logActivity({
      userId: req.user._id,
      leadId: lead._id,
      action: `Note added: ${text}`,
    });

    await lead.save();

    res.status(200).json({ message: "Note added successfully" });

  } catch (error) {
    console.error("ADD NOTE ERROR:", error); // 👈 important for debugging
    res.status(500).json({ message: error.message });
  }
};