import { parseAndStoreTrialCriteria } from "../services/criteriaParsingService.js";

export async function parseCriteria(req, res, next) {
  try {
    const { trialId, criteriaText } = req.body || {};
    const result = await parseAndStoreTrialCriteria({ trialId, criteriaText });

    return res.status(200).json({
      trialId: result.trial.trialId,
      parsedRules: result.parsedRules,
      trial: result.trial
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      error.statusCode = 500;
      error.message = "AI returned malformed JSON.";
    }
    return next(error);
  }
}
