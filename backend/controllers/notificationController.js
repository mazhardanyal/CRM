  import Notification from "../models/Notification.js";
  import Lead from "../models/Lead.js";

  // Send a notification (used internally)
  export const sendNotification = async ({ userId, leadId, message }) => {
    try {
      const notification = new Notification({
        user: userId,
        lead: leadId,
        message
      });
      await notification.save();
      console.log(`Notification sent to user ${userId}`);
    } catch (error) {
      console.error("Notification error:", error.message);
    }
  };

  // Create a notification via API
  export const createNotification = async (req, res) => {
  try {
    const { userId, leadId, message } = req.body;
    if (!userId || !message) {
      return res.status(400).json({ message: "userId and message are required" });
    }

    const notification = new Notification({
      user: userId,
      lead: leadId || null,
      message,
    });

    await notification.save();
    res.status(201).json({ message: "Notification created", notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
          await sendNotification({
            userId: lead.assignedTo._id,
            leadId: lead._id,
            message: `Reminder: Follow-up for lead ${lead.name} is scheduled for today.`
          });
        }
      }
    } catch (error) {
      console.error("Follow-up generation error:", error.message);
    }
  };