import { Router } from "express";
import { getTrialMatches, runMatchForPatient } from "../controllers/matchingController.js";

const router = Router();

router.get("/trials", getTrialMatches);
router.post("/run", runMatchForPatient);

export default router;
