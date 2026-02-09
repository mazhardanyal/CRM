import Lead from "../models/Lead.js";

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

    res.status(201).json(lead);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};