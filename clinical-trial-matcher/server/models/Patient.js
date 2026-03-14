import mongoose from "mongoose";

const PatientSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0, max: 140 },
    gender: { type: String, required: true, trim: true },
    conditions: [{ type: String, trim: true }],
    medications: [{ type: String, trim: true }],
    location: { type: String, required: true, trim: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

export default mongoose.model("Patient", PatientSchema);
