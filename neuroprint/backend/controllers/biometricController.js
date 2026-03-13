import CognitiveProfile from "../models/CognitiveProfile.js";

export const createBehaviorSnapshot = async (req, res, next) => {
  try {
    const { userId, typingMetrics, mouseMetrics } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const profile = await CognitiveProfile.findOneAndUpdate(
      { userId },
      {
        $push: {
          snapshots: {
            typingMetrics: typingMetrics || {},
            mouseMetrics: mouseMetrics || {},
            createdAt: new Date()
          }
        }
      },
      { new: true, upsert: true }
    );

    res.status(201).json({ message: "Snapshot captured", profile });
  } catch (error) {
    next(error);
  }
};

export const getProfileByUserId = async (req, res, next) => {
  try {
    const profile = await CognitiveProfile.findOne({ userId: req.params.userId });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  } catch (error) {
    next(error);
  }
};
