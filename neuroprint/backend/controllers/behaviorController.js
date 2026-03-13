import BehaviorData from "../models/BehaviorData.js";
import User from "../models/User.js";
import { analyzeDrift } from "../services/driftDetection.js";

const toNumber = (value) => Number(value || 0);

const normalizeBehaviorMetrics = (entry) => {
  const typingSpeed = toNumber(entry.typingSpeed);
  const avgKeyDelay = toNumber(entry.avgKeyDelay);
  const clickLatency = toNumber(entry.clickLatency);

  // Backward compatibility: old captures stored mouse speed in px/ms.
  const rawMouseSpeed = toNumber(entry.mouseSpeed);
  const mouseSpeed = rawMouseSpeed > 0 && rawMouseSpeed < 10 ? rawMouseSpeed * 1000 : rawMouseSpeed;

  return {
    typingSpeed,
    avgKeyDelay,
    mouseSpeed,
    clickLatency
  };
};

export const collectBehaviorData = async (req, res, next) => {
  try {
    const {
      typingSpeed,
      avgKeyDelay,
      mouseSpeed,
      clickLatency,
      keyHoldVariance,
      mouseAcceleration,
      movementJitter
    } = req.body;

    const resolvedUserId = req.userId;

    if (!resolvedUserId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const payload = {
      userId: resolvedUserId,
      typingSpeed: Number(typingSpeed || 0),
      avgKeyDelay: Number(avgKeyDelay || 0),
      mouseSpeed: Number(mouseSpeed || 0),
      clickLatency: Number(clickLatency || 0),
      keyHoldVariance: Number(keyHoldVariance || 0),
      mouseAcceleration: Number(mouseAcceleration || 0),
      movementJitter: Number(movementJitter || 0),
      timestamp: new Date()
    };

    const behaviorData = await BehaviorData.create(payload);

    return res.status(201).json({
      message: "Behavior data collected",
      data: behaviorData
    });
  } catch (error) {
    next(error);
  }
};

export const getBehaviorHistory = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("baselineProfile");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const baselineVector = [
      toNumber(user.baselineProfile?.typingSpeed),
      toNumber(user.baselineProfile?.avgKeyDelay),
      toNumber(user.baselineProfile?.mouseSpeed),
      toNumber(user.baselineProfile?.clickLatency)
    ];

    const entries = await BehaviorData.find({ userId: req.userId })
      .sort({ timestamp: 1 })
      .limit(50)
      .lean();

    const history = entries.map((entry) => {
      const normalized = normalizeBehaviorMetrics(entry);
      const currentVector = [
        normalized.typingSpeed,
        normalized.avgKeyDelay,
        normalized.mouseSpeed,
        normalized.clickLatency
      ];

      const hasBaseline = baselineVector.some((value) => value > 0);
      const analysis = hasBaseline
        ? analyzeDrift({ baselineVector, currentVector })
        : { driftScore: 0, stabilityScore: 100, riskLevel: "LOW" };

      return {
        ...entry,
        typingSpeed: normalized.typingSpeed,
        avgKeyDelay: normalized.avgKeyDelay,
        mouseSpeed: normalized.mouseSpeed,
        clickLatency: normalized.clickLatency,
        driftScore: analysis.driftScore,
        stabilityScore: analysis.stabilityScore,
        riskLevel: analysis.riskLevel
      };
    });

    return res.json({ history });
  } catch (error) {
    next(error);
  }
};

export const clearBehaviorHistory = async (req, res, next) => {
  try {
    const result = await BehaviorData.deleteMany({ userId: req.userId });

    return res.json({
      message: "Behavior history cleared",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};
