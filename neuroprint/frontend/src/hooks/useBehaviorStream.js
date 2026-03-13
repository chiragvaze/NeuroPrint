import { useMemo } from "react";

export const useBehaviorStream = () => {
  return useMemo(
    () => ({
      typingMetrics: {
        avgKeyLatencyMs: 0,
        errorRate: 0,
        burstVariance: 0
      },
      mouseMetrics: {
        avgSpeed: 0,
        pathDeviation: 0,
        clickIntervalMs: 0
      }
    }),
    []
  );
};
