import mongoose from "mongoose";

const snapshotSchema = new mongoose.Schema(
  {
    typingMetrics: {
      avgKeyLatencyMs: { type: Number, default: 0 },
      errorRate: { type: Number, default: 0 },
      burstVariance: { type: Number, default: 0 }
    },
    mouseMetrics: {
      avgSpeed: { type: Number, default: 0 },
      pathDeviation: { type: Number, default: 0 },
      clickIntervalMs: { type: Number, default: 0 }
    },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const cognitiveProfileSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    baselineScore: { type: Number, default: 0 },
    driftScore: { type: Number, default: 0 },
    snapshots: { type: [snapshotSchema], default: [] }
  },
  { timestamps: true }
);

const CognitiveProfile = mongoose.model("CognitiveProfile", cognitiveProfileSchema);

export default CognitiveProfile;
