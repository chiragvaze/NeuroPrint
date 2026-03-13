import { Router } from "express";
import biometricRoutes from "./biometricRoutes.js";

const router = Router();

router.use("/biometrics", biometricRoutes);

export default router;
