import mongoose from "mongoose";

// 1️⃣ Define schema
const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who performed the action
  lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },                  // which lead is affected
  action: { type: String, required: true },                                      // description of action
  timestamp: { type: Date, default: Date.now }                                   // when the action occurred
});

// 2️⃣ Export model
export default mongoose.model("ActivityLog", activityLogSchema);