export const classifyRiskBand = (driftScore) => {
  if (driftScore < 10) return "low";
  if (driftScore < 25) return "moderate";
  return "high";
};
