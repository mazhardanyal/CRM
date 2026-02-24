import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: String,

    phone: {
      type: String,
      required: true,
    },

    company: String,
    source: String,

    status: {
      type: String,
      default: "New",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // ✅ Notes as ARRAY (Correct Structure)
    notes: [
      {
        text: {
          type: String,
          required: true,
        },
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    followUpDate: Date,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    history: [
      {
        action: { type: String, required: true },
        by: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        date: { type: Date, default: Date.now },
      },
    ],

    stage: {
      type: String,
      enum: [
        "New",
        "Contacted",
        "Demo Scheduled",
        "Negotiation",
        "Won",
        "Lost",
      ],
      default: "New",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Lead", leadSchema);