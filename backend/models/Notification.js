import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who receives the notification
  lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },                  // related lead
  message: { type: String, required: true },                                    // notification text
  read: { type: Boolean, default: false },                                       // has the user read it?
  timestamp: { type: Date, default: Date.now }                                   // when created
});

export default mongoose.model("Notification", notificationSchema);