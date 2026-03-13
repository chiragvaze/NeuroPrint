const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const safeNumber = (value) => Number(value || 0);

const linearRegression = (points) => {
  const n = points.length;

  if (n === 1) {
    return { slope: 0, intercept: points[0].y };
  }

  const sumX = points.reduce((sum, point) => sum + point.x, 0);
  const sumY = points.reduce((sum, point) => sum + point.y, 0);
  const sumXY = points.reduce((sum, point) => sum + point.x * point.y, 0);
  const sumXX = points.reduce((sum, point) => sum + point.x * point.x, 0);

  const denominator = n * sumXX - sumX * sumX;

  if (denominator === 0) {
    return { slope: 0, intercept: sumY / n };
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
};

export const predictStabilityIn30Days = (stabilityHistory) => {
  const normalizedHistory = stabilityHistory.map(safeNumber).map((score) => clamp(score, 0, 100));

  if (!normalizedHistory.length) {
    return {
      predictedStability: 0,
      trend: "Stable",
      forecastSeries: []
    };
  }

  const points = normalizedHistory.map((score, index) => ({ x: index, y: score }));

  if (normalizedHistory.length < 2) {
    const currentScore = normalizedHistory[normalizedHistory.length - 1];
    return {
      predictedStability: Number(currentScore.toFixed(2)),
      trend: "Stable",
      forecastSeries: [
        { point: "Now", stability: Number(currentScore.toFixed(2)) },
        { point: "+30d", stability: Number(currentScore.toFixed(2)) }
      ]
    };
  }

  const { slope, intercept } = linearRegression(points);

  const currentIndex = normalizedHistory.length - 1;
  const futureIndex = currentIndex + 30;
  const currentScore = normalizedHistory[currentIndex];

  const predicted = clamp(intercept + slope * futureIndex, 0, 100);
  const delta = predicted - currentScore;

  let trend = "Stable";
  if (delta > 3) {
    trend = "Improving";
  } else if (delta < -3) {
    trend = "Declining";
  }

  return {
    predictedStability: Number(predicted.toFixed(2)),
    trend,
    forecastSeries: [
      { point: "Now", stability: Number(currentScore.toFixed(2)) },
      { point: "+30d", stability: Number(predicted.toFixed(2)) }
    ]
  };
};
