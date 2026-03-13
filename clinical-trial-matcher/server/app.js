import express from "express";
import cors from "cors";
import matchingRoutes from "./routes/matchingRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import trialRoutes from "./routes/trialRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/matching", matchingRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/trial", trialRoutes);
app.use("/api/ai", aiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
