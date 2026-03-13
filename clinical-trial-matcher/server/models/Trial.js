import mongoose from "mongoose";

const TrialSchema = new mongoose.Schema(
  {
    trialId: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    condition: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    minAge: { type: Number, required: true, min: 0, max: 140 },
    maxAge: { type: Number, required: true, min: 0, max: 140 },
    inclusionCriteria: { type: String, required: true, trim: true },
    exclusionCriteria: { type: String, required: true, trim: true },
    phase: { type: String, required: true, trim: true },
    sponsor: { type: String, required: true, trim: true }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export default mongoose.model("Trial", TrialSchema);
