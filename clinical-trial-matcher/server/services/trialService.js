import Trial from "../models/Trial.js";
import mongoose from "mongoose";
import {
  createTrialMemory,
  importTrialsMemory,
  getAllTrialsMemory,
  getTrialByIdMemory,
  updateTrialParsedEligibilityMemory
} from "./devMemoryStore.js";

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

function normalizeTrial(input = {}) {
  const normalized = {
    trialId: String(input.trialId || "").trim(),
    title: String(input.title || "").trim(),
    condition: String(input.condition || "").trim(),
    location: String(input.location || "").trim(),
    minAge: Number(input.minAge),
    maxAge: Number(input.maxAge),
    inclusionCriteria: String(input.inclusionCriteria || "").trim(),
    exclusionCriteria: String(input.exclusionCriteria || "").trim(),
    phase: String(input.phase || "").trim(),
    sponsor: String(input.sponsor || "").trim()
  };
  if (input.uploadedBy) normalized.uploadedBy = input.uploadedBy;
  return normalized;
}

function validateTrial(trial) {
  if (!trial.trialId) return "trialId is required";
  if (!trial.title) return "title is required";
  if (!trial.condition) return "condition is required";
  if (!trial.location) return "location is required";
  if (!Number.isFinite(trial.minAge)) return "minAge must be a number";
  if (!Number.isFinite(trial.maxAge)) return "maxAge must be a number";
  if (trial.minAge > trial.maxAge) return "minAge cannot be greater than maxAge";
  if (!trial.inclusionCriteria) return "inclusionCriteria is required";
  if (!trial.exclusionCriteria) return "exclusionCriteria is required";
  if (!trial.phase) return "phase is required";
  if (!trial.sponsor) return "sponsor is required";
  return null;
}

export function prepareTrial(input) {
  const normalized = normalizeTrial(input);
  const errorMessage = validateTrial(normalized);

  if (errorMessage) {
    const error = new Error(errorMessage);
    error.statusCode = 400;
    throw error;
  }

  return normalized;
}

export async function createTrial(trialPayload) {
  const prepared = prepareTrial(trialPayload);
  if (!isDbConnected()) {
    return createTrialMemory(prepared);
  }

  return Trial.create(prepared);
}

export async function importTrials(trialPayloadList = [], userId) {
  const prepared = trialPayloadList.map((t) => {
    const p = prepareTrial(t);
    if (userId) p.uploadedBy = userId;
    return p;
  });
  if (!isDbConnected()) {
    return importTrialsMemory(prepared);
  }

  return Trial.insertMany(prepared, { ordered: false });
}

export async function getAllTrials(filters = {}) {
  if (!isDbConnected()) {
    return getAllTrialsMemory(filters);
  }

  const query = {};

  if (filters.uploadedBy) {
    query.uploadedBy = filters.uploadedBy;
  }

  if (filters.condition) {
    query.condition = { $regex: filters.condition, $options: "i" };
  }

  if (filters.location) {
    query.location = { $regex: filters.location, $options: "i" };
  }

  if (filters.phase) {
    query.phase = { $regex: filters.phase, $options: "i" };
  }

  return Trial.find(query).sort({ createdAt: -1 }).lean();
}

export async function getTrialById(id) {
  if (!isDbConnected()) {
    return getTrialByIdMemory(id);
  }

  const byTrialId = await Trial.findOne({ trialId: id }).lean();
  if (byTrialId) return byTrialId;

  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    return Trial.findById(id).lean();
  }

  return null;
}

export async function updateTrialParsedEligibility(id, parsedRules, sourceText) {
  if (!isDbConnected()) {
    return updateTrialParsedEligibilityMemory(id, parsedRules, sourceText);
  }

  const query = id.match(/^[0-9a-fA-F]{24}$/)
    ? { $or: [{ trialId: id }, { _id: id }] }
    : { trialId: id };

  return Trial.findOneAndUpdate(
    query,
    {
      $set: {
        parsedEligibility: {
          ageRange: parsedRules.ageRange,
          requiredConditions: parsedRules.requiredConditions,
          excludedConditions: parsedRules.excludedConditions,
          sourceText,
          parsedAt: new Date()
        }
      }
    },
    { new: true }
  ).lean();
}
