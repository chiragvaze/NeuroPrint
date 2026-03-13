import { Router } from "express";
import multer from "multer";
import {
  createPatientRecord,
  uploadPatients,
  getPatientRecord
} from "../controllers/patientController.js";
import {
  validateAnonymizedPatientPayload,
  validateAnonymizedUploadPayload
} from "../middleware/anonymizationValidation.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/create", validateAnonymizedPatientPayload, createPatientRecord);
router.post("/upload", upload.single("file"), validateAnonymizedUploadPayload, uploadPatients);
router.get("/:id", getPatientRecord);

export default router;
