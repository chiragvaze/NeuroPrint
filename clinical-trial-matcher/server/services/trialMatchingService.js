import { parseEligibilityCriteria } from "./aiOrchestrationService.js";

export async function generateTrialMatches(patientRecord = {}) {
  const parsed = await parseEligibilityCriteria(patientRecord);

  // Placeholder scoring until full retrieval and embedding pipeline is integrated.
  return [
    { trialId: "T-102", score: 88, rationale: parsed.summary },
    { trialId: "T-041", score: 80, rationale: parsed.summary },
    { trialId: "T-310", score: 74, rationale: parsed.summary }
  ];
}
