import {
  createTrial,
  getAllTrials,
  getTrialById,
  importTrials
} from "../services/trialService.js";

function parseTrialJsonBuffer(file) {
  if (!file) {
    const error = new Error("JSON file is required.");
    error.statusCode = 400;
    throw error;
  }

  const extension = file.originalname.split(".").pop()?.toLowerCase();
  if (extension !== "json") {
    const error = new Error("Unsupported file type. Upload JSON only.");
    error.statusCode = 400;
    throw error;
  }

  const parsed = JSON.parse(file.buffer.toString("utf8"));
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed.trials)) return parsed.trials;
  return [parsed];
}

export async function createTrialRecord(req, res, next) {
  try {
    const trial = await createTrial(req.body || {});
    return res.status(201).json({ trial });
  } catch (error) {
    if (error?.code === 11000) {
      error.statusCode = 409;
      error.message = "trialId already exists.";
    }
    return next(error);
  }
}

export async function importTrialDataset(req, res, next) {
  try {
    const records = parseTrialJsonBuffer(req.file);
    const trials = await importTrials(records);

    return res.status(201).json({
      count: trials.length,
      trials
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      error.statusCode = 400;
      error.message = "Invalid JSON file.";
    }

    if (error?.code === 11000) {
      error.statusCode = 409;
      error.message = "One or more trialId values already exist.";
    }

    return next(error);
  }
}

export async function listTrials(req, res, next) {
  try {
    const trials = await getAllTrials(req.query || {});
    return res.status(200).json({ count: trials.length, trials });
  } catch (error) {
    return next(error);
  }
}

export async function getTrialRecord(req, res, next) {
  try {
    const trial = await getTrialById(req.params.id);
    if (!trial) {
      return res.status(404).json({ message: "Trial not found." });
    }

    return res.status(200).json({ trial });
  } catch (error) {
    return next(error);
  }
}
