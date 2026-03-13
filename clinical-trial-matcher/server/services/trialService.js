import Trial from "../models/Trial.js";

function normalizeTrial(input = {}) {
  return {
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
  return Trial.create(prepareTrial(trialPayload));
}

export async function importTrials(trialPayloadList = []) {
  const prepared = trialPayloadList.map(prepareTrial);
  return Trial.insertMany(prepared, { ordered: false });
}

export async function getAllTrials(filters = {}) {
  const query = {};

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
  const byTrialId = await Trial.findOne({ trialId: id }).lean();
  if (byTrialId) return byTrialId;

  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    return Trial.findById(id).lean();
  }

  return null;
}

export async function updateTrialParsedEligibility(id, parsedRules, sourceText) {
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
