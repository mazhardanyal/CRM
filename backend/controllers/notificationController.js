// controllers/notificationController.js
import Notification from "../models/Notification.js";
import Lead from "../models/Lead.js";

// Send notification function
export const sendNotification = async ({ userId, leadId, message }) => {
  try {
    const notification = new Notification({
      user: userId,
      lead: leadId,
      message
    });
    await notification.save();
  } catch (error) {
    console.error("Notification error:", error.message);
  }
};

// Generate follow-up notifications for leads with followUpDate = today
export const generateFollowUp = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const leads = await Lead.find({
      followUpDate: { $gte: today, $lt: tomorrow }
    }).populate("assignedTo", "name email");

    for (const lead of leads) {
      if (lead.assignedTo) {
        const message = `Reminder: Follow-up for lead ${lead.name} is scheduled for today.`;

        // send the notification
        await sendNotification({
          userId: lead.assignedTo._id,
          leadId: lead._id,
          message,
        });

        console.log(`Follow-up notification sent for lead: ${lead.name}`);
      }
    }
  } catch (error) {
    console.error("Follow-up generation error:", error.message);
  }
};