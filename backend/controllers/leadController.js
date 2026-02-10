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

    const lead = await Lead.create({
      name,
      email,
      phone,
      company,
      source,
      status,
      assignedTo,
      notes,
      followUpDate,
      createdBy: req.user._id,
    });

    // 🔥 Log activity
    await logActivity({
      userId: req.user._id,
      leadId: lead._id,
      action: `Lead created`,
    });

    // 🔔 Send notification if assignedTo exists
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
        .populate("assignedTo", "name email")
        .sort({ followUpDate: 1 });
    }

    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================
   UPDATE LEAD DETAILS
====================== */
export const updateLead = async (req, res) => {
  try {
    const leadId = req.params.id;
    const { status, assignedTo, notes, followUpDate } = req.body;

    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    // Update status
    if (status && status !== lead.status) {
      await logActivity({
        userId: req.user._id,
        leadId: lead._id,
        action: `Status changed from ${lead.status} → ${status}`,
      });
      lead.status = status;
    }

    // Update assignedTo
    if (assignedTo && (!lead.assignedTo || assignedTo !== String(lead.assignedTo))) {
      await logActivity({
        userId: req.user._id,
        leadId: lead._id,
        action: `Assigned to user ${assignedTo}`,
      });

      // 🔔 Send notification
      await sendNotification({
        userId: assignedTo,
        leadId: lead._id,
        message: `You have been assigned to lead ${lead.name}`,
      });

      lead.assignedTo = new mongoose.Types.ObjectId(assignedTo);
    }

    // Update notes
    if (notes) {
      await logActivity({
        userId: req.user._id,
        leadId: lead._id,
        action: `Note added: ${notes}`,
      });
      lead.notes = notes;
    }

    // Update followUpDate
    if (followUpDate) {
      await logActivity({
        userId: req.user._id,
        leadId: lead._id,
        action: `Follow-up date set/changed to ${followUpDate}`,
      });
      lead.followUpDate = followUpDate;
    }

    const updatedLead = await lead.save();
    res.status(200).json(updatedLead);
  } catch (error) {
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

    await lead.remove();

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
      .populate("assignedTo", "name email")
      .sort({ followUpDate: 1 });

    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};