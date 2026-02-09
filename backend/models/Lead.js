import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
  },
  company: {
    type: String,
  },
  source: {
    type: String,
  },
  status: {
    type: String,
    default: "New",
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  notes: {
    type: String,
  },
  followUpDate: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

history: [
  {
    
    action: { type: String, required: true },
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now }
  }
],
stage: { 
  type: String, 
  enum: ["New", "Contacted", "Demo Scheduled", "Negotiation", "Won", "Lost"], 
  default: "New" 
},

},
{ timestamps: true 

}



);

export default mongoose.model("Lead", leadSchema);