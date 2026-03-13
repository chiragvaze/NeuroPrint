export const extractBehaviorFeatures = ({ typingMetrics = {}, mouseMetrics = {} }) => {
  return [
    Number(typingMetrics.avgKeyLatencyMs || 0),
    Number(typingMetrics.errorRate || 0),
    Number(typingMetrics.burstVariance || 0),
    Number(mouseMetrics.avgSpeed || 0),
    Number(mouseMetrics.pathDeviation || 0),
    Number(mouseMetrics.clickIntervalMs || 0)
  ];
};
