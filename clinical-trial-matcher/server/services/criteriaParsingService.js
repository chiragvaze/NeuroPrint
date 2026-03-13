import { parseEligibilityText } from "../../ai-services/criteria-parser/parser.js";
import { getTrialById, updateTrialParsedEligibility } from "./trialService.js";

function combineCriteriaText(trial, criteriaText) {
  if (criteriaText && String(criteriaText).trim()) {
    return String(criteriaText).trim();
  }

  return `Inclusion: ${trial.inclusionCriteria}. Exclusion: ${trial.exclusionCriteria}.`;
}

export async function parseAndStoreTrialCriteria({ trialId, criteriaText }) {
  if (!trialId || !String(trialId).trim()) {
    const error = new Error("trialId is required.");
    error.statusCode = 400;
    throw error;
  }

  const trial = await getTrialById(String(trialId).trim());
  if (!trial) {
    const error = new Error("Trial not found.");
    error.statusCode = 404;
    throw error;
  }

  const sourceCriteriaText = combineCriteriaText(trial, criteriaText);
  const parsedRules = await parseEligibilityText(sourceCriteriaText);

  const updatedTrial = await updateTrialParsedEligibility(trial.trialId, parsedRules, sourceCriteriaText);

  return {
    trial: updatedTrial,
    parsedRules
  };
}
