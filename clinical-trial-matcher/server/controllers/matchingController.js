import { generateTrialMatches } from "../services/trialMatchingService.js";

export async function getTrialMatches(_req, res, next) {
  try {
    const matches = await generateTrialMatches();
    res.json({ matches });
  } catch (error) {
    next(error);
  }
}

export async function runMatchForPatient(req, res, next) {
  try {
    const { patientRecord } = req.body;
    const matches = await generateTrialMatches(patientRecord);
    res.status(200).json({ matches });
  } catch (error) {
    next(error);
  }
}
