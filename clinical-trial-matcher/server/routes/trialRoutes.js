import { Router } from "express";
import multer from "multer";
import {
  createTrialRecord,
  importTrialDataset,
  listTrials,
  getTrialRecord
} from "../controllers/trialController.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/create", createTrialRecord);
router.post("/import", upload.single("file"), importTrialDataset);
router.get("/all", listTrials);
router.get("/:id", getTrialRecord);

export default router;
