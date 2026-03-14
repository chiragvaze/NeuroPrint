import { matchPatientToTrialByEmbedding } from "../../ai-services/embedding-engine/matcher.js";
import { evaluateEligibilityWithScore } from "./ruleEngine.js";

const RULE_WEIGHT = 0.55;
const SIMILARITY_WEIGHT = 0.30;
const GEO_WEIGHT = 0.15;

function clampUnit(value) {
  if (!Number.isFinite(Number(value))) return 0;
  const numeric = Number(value);
  if (numeric < 0) return 0;
  if (numeric > 1) return 1;
  return numeric;
}

function normalizeLocation(location) {
  return String(location || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeLocation(location) {
  return normalizeLocation(location)
    .split(/[\s,]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function computeGeographicProximity(patientLocation, trialLocation) {
  const normalizedPatientLocation = normalizeLocation(patientLocation);
  const normalizedTrialLocation = normalizeLocation(trialLocation);

  if (!normalizedPatientLocation || !normalizedTrialLocation) return 0;
  if (normalizedPatientLocation === normalizedTrialLocation) return 1;

  const patientTokens = new Set(tokenizeLocation(patientLocation));
  const trialTokens = new Set(tokenizeLocation(trialLocation));

  if (patientTokens.size === 0 || trialTokens.size === 0) return 0;

  let overlap = 0;
  for (const token of patientTokens) {
    if (trialTokens.has(token)) overlap += 1;
  }

  const union = new Set([...patientTokens, ...trialTokens]).size;
  return union > 0 ? overlap / union : 0;
}

function buildScoreMap(matchingScores = []) {
  const map = new Map();

  for (const item of matchingScores) {
    const trialId = String(item?.trialId || "").trim();
    if (!trialId) continue;

    map.set(trialId, {
      ruleScore: clampUnit(item?.ruleScore),
      similarityScore: clampUnit(item?.similarityScore)
    });
  }

  return map;
}

function toRankScore(unitScore) {
  return Math.round(clampUnit(unitScore) * 100);
}

export async function rankTrialsForPatient({ patient, trials, matchingScores = [] }) {
  if (!patient || typeof patient !== "object") {
    const error = new Error("patient profile is required.");
    error.statusCode = 400;
    throw error;
  }

  if (!Array.isArray(trials) || trials.length === 0) {
    const error = new Error("trials must be a non-empty array.");
    error.statusCode = 400;
    throw error;
  }

  const scoreMap = buildScoreMap(matchingScores);

  const ranked = await Promise.all(
    trials.map(async (trial) => {
      const trialId = String(trial?.trialId || trial?._id || "").trim();
      if (!trialId) {
        const error = new Error("Each trial must include trialId.");
        error.statusCode = 400;
        throw error;
      }

      const supplied = scoreMap.get(trialId);
      const evaluatedRule = evaluateEligibilityWithScore(patient, trial);
      const ruleScore = supplied ? supplied.ruleScore : clampUnit(evaluatedRule.ruleScore);

      let similarityScore = supplied
        ? supplied.similarityScore
        : clampUnit(trial?.similarityScore);

      if (!supplied && !Number.isFinite(Number(trial?.similarityScore))) {
        try {
          const semantic = await matchPatientToTrialByEmbedding(patient, trial);
          similarityScore = clampUnit(semantic.similarityScore);
        } catch (_error) {
          // Fallback: use the rule score as a proxy when embedding fails
          similarityScore = clampUnit(ruleScore * 0.85);
        }
      }

      const geographicScore = computeGeographicProximity(patient.location, trial.location);

      let combinedScore =
        (ruleScore * RULE_WEIGHT) +
        (similarityScore * SIMILARITY_WEIGHT) +
        (geographicScore * GEO_WEIGHT);

      return {
        trialId,
        score: toRankScore(combinedScore)
      };
    })
  );

  return ranked.sort((a, b) => b.score - a.score);
}
