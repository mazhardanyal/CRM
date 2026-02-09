import Lead from "../models/Lead.js";
import mongoose from "mongoose";

// GET /api/dashboard
export const getDashboardData = async (req, res) => {
  try {
    let matchCondition = {};

    // Employee sees only their leads
    if (req.user.role === "employee") {
      matchCondition.assignedTo = req.user._id;
    }

    // 1️⃣ Total Leads
    const totalLeads = await Lead.countDocuments(matchCondition);

    // 2️⃣ Leads by Status
    const leadsByStatus = await Lead.aggregate([
      { $match: matchCondition },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // 3️⃣ Leads by Source
    const leadsBySource = await Lead.aggregate([
      { $match: matchCondition },
      { $group: { _id: "$source", count: { $sum: 1 } } }
    ]);

    // 4️⃣ Leads per Employee (only for admin/manager)
    let leadsPerEmployee = [];
    if (req.user.role !== "employee") {
      leadsPerEmployee = await Lead.aggregate([
        { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
        { $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "employee"
        }},
        { $unwind: "$employee" },
        { $project: { _id: 0, name: "$employee.name", email: "$employee.email", count: 1 } }
      ]);
    }

    // 5️⃣ Follow-ups due today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const followUpsToday = await Lead.find({
      ...matchCondition,
      followUpDate: { $gte: today, $lt: tomorrow }
    }).populate("assignedTo", "name email");

    // Send response
    res.status(200).json({
      totalLeads,
      leadsByStatus,
      leadsBySource,
      leadsPerEmployee,
      followUpsToday
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};