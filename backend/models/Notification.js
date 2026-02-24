import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // recipient
  lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },                  // related lead
  message: { type: String, required: true },                                    // text
  read: { type: Boolean, default: false },                                       // read status
  timestamp: { type: Date, default: Date.now }                                   // created at
});

export default mongoose.model("Notification", notificationSchema);