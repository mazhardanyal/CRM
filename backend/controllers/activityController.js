import Activity from "../models/ActivityLog.js";

/**
 * Logs an activity for a user and lead
 */
export const logActivity = async ({ userId, leadId, action }) => {
  try {
    const activity = await Activity.create({
      user: userId,
      lead: leadId,
      action,
    });
    console.log("Activity logged:", action);
    return activity;
  } catch (error) {
    console.error("Activity log error:", error.message);
  }
};

/**
 * Fetch all activities for a lead
 */
export const getLeadActivities = async (req, res) => {
  try {
    const leadId = req.params.leadId;
    const activities = await Activity.find({ lead: leadId })
      .populate("user", "name email")
      .sort({ timestamp: -1 });

    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};