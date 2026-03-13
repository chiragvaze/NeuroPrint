import { Router } from "express";
import {
  createBehaviorSnapshot,
  getProfileByUserId
} from "../controllers/biometricController.js";

const router = Router();

router.post("/snapshot", createBehaviorSnapshot);
router.get("/profile/:userId", getProfileByUserId);

export default router;
