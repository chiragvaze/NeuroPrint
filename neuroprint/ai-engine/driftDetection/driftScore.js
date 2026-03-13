export const computeDriftScore = (baselineVector, currentVector) => {
  if (!baselineVector?.length || baselineVector.length !== currentVector?.length) {
    return 0;
  }

  const distance = baselineVector.reduce((sum, baseValue, index) => {
    const delta = (currentVector[index] || 0) - baseValue;
    return sum + delta * delta;
  }, 0);

  return Math.sqrt(distance);
};
