import { Router } from "express";
import { parseCriteria } from "../controllers/aiController.js";

const router = Router();

router.post("/parse-criteria", parseCriteria);

export default router;
