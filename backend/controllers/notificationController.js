import Lead from "../models/Lead.js";
import Notification from "../models/Notification.js";

export const generateFollowUpNotifications = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // 1️⃣ Find all follow-ups due today
    const leadsDueToday = await Lead.find({
      followUpDate: { $gte: today, $lt: tomorrow }
    }).populate("assignedTo", "name email");

    // 2️⃣ Create notifications for each employee
    for (const lead of leadsDueToday) {
      // Check if notification already exists to avoid duplicates
      const exists = await Notification.findOne({
        lead: lead._id,
        user: lead.assignedTo._id,
        message: `Follow-up with ${lead.name} is scheduled today at ${lead.followUpDate.toLocaleTimeString()}`
      });

      if (!exists) {
        const notification = new Notification({
          lead: lead._id,
          user: lead.assignedTo._id,
          message: `Follow-up with ${lead.name} is scheduled today at ${lead.followUpDate.toLocaleTimeString()}`
        });
        await notification.save();
      }
    }

  } catch (error) {
    console.error("Error generating notifications:", error.message);
  }
};