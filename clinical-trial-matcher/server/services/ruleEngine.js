function toLowerList(values) {
  if (!Array.isArray(values)) return [];
  return values
    .map((item) => String(item || "").trim().toLowerCase())
    .filter(Boolean);
}

function splitConditions(conditionStr) {
  if (!conditionStr) return [];
  return String(conditionStr)
    .split(/[,;/]+/)
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

function getTrialRequiredConditions(trial = {}) {
  if (Array.isArray(trial?.parsedEligibility?.requiredConditions) && trial.parsedEligibility.requiredConditions.length > 0) {
    return trial.parsedEligibility.requiredConditions;
  }
  // Fallback: use the trial's main 'condition' field
  if (trial.condition) {
    return splitConditions(trial.condition);
  }
  return trial.requiredConditions || [];
}

function getTrialExcludedConditions(trial = {}) {
  if (Array.isArray(trial?.parsedEligibility?.excludedConditions) && trial.parsedEligibility.excludedConditions.length > 0) {
    return trial.parsedEligibility.excludedConditions;
  }
  if (trial.exclusionCriteria) {
    return splitConditions(trial.exclusionCriteria);
  }
  return trial.excludedConditions || [];
}

function getTrialAgeRange(trial = {}) {
  if (Array.isArray(trial?.parsedEligibility?.ageRange) && trial.parsedEligibility.ageRange.length === 2) {
    return [Number(trial.parsedEligibility.ageRange[0]), Number(trial.parsedEligibility.ageRange[1])];
  }
  return [Number(trial.minAge), Number(trial.maxAge)];
}

function validateInput(patient, trial) {
  if (!patient || typeof patient !== "object") {
    const error = new Error("patient object is required.");
    error.statusCode = 400;
    throw error;
  }

  if (!trial || typeof trial !== "object") {
    const error = new Error("trial object is required.");
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isFinite(Number(patient.age))) {
    const error = new Error("patient.age must be a valid number.");
    error.statusCode = 400;
    throw error;
  }
}

/**
 * Fuzzy token-overlap match: checks if any of the patient's condition tokens
 * appear inside a required condition string, or vice versa.
 */
function fuzzyConditionMatch(patientConditions, requiredConditions) {
  if (!requiredConditions.length) return { matched: true, overlap: 1.0 };
  if (!patientConditions.length) return { matched: false, overlap: 0 };

  let matchCount = 0;

  for (const required of requiredConditions) {
    const requiredTokens = required.split(/\s+/).filter(t => t.length > 2);
    let bestTokenOverlap = 0;

    for (const patientCond of patientConditions) {
      // Word boundary match
      const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const reqRegex = new RegExp(`\\b${escapeRegExp(required)}\\b`, 'i');
      const patRegex = new RegExp(`\\b${escapeRegExp(patientCond)}\\b`, 'i');
      if (reqRegex.test(patientCond) || patRegex.test(required)) {
        bestTokenOverlap = 1;
        break;
      }

      // Token overlap
      const patientTokens = patientCond.split(/\s+/).filter(t => t.length > 2);
      if (requiredTokens.length === 0) { bestTokenOverlap = 1; break; }
      let tokenMatches = 0;
      for (const rt of requiredTokens) {
        const tokenRegex = new RegExp(`\\b${escapeRegExp(rt)}\\b`, 'i');
        if (patientTokens.some(pt => tokenRegex.test(pt))) {
          tokenMatches++;
        }
      }
      const tokenRatio = tokenMatches / requiredTokens.length;
      bestTokenOverlap = Math.max(bestTokenOverlap, tokenRatio);
    }

    if (bestTokenOverlap >= 0.5) matchCount++;
  }

  return {
    matched: matchCount > 0,
    overlap: requiredConditions.length > 0 ? matchCount / requiredConditions.length : 0
  };
}

export function evaluateEligibility(patient, trial) {
  const { eligible, reasons } = evaluateEligibilityWithScore(patient, trial);
  return { eligible, reasons };
}

export function evaluateEligibilityWithScore(patient, trial) {
  validateInput(patient, trial);

  const reasons = [];
  let eligible = true;
  let totalWeight = 0;
  let earnedWeight = 0;

  // ── Age check (weight: 0.25) ──
  const AGE_WEIGHT = 0.25;
  const [minAge, maxAge] = getTrialAgeRange(trial);
  const age = Number(patient.age);
  totalWeight += AGE_WEIGHT;

  if (Number.isFinite(minAge) && Number.isFinite(maxAge) && minAge > 0 && maxAge > 0) {
    if (age >= minAge && age <= maxAge) {
      reasons.push("Age within range");
      earnedWeight += AGE_WEIGHT;
    } else {
      // Partial credit if close to boundary
      const distance = age < minAge ? minAge - age : age - maxAge;
      const range = maxAge - minAge || 1;
      const penalty = Math.min(1, distance / range);
      const partial = AGE_WEIGHT * Math.max(0, 1 - penalty);
      earnedWeight += partial;
      eligible = false;
      reasons.push(`Age outside eligible range (${minAge}-${maxAge})`);
    }
  } else {
    // No age data on trial — give full credit (no restriction)
    earnedWeight += AGE_WEIGHT;
    reasons.push("No age restriction on trial");
  }

  // ── Condition match check (weight: 0.45) ──
  const CONDITION_WEIGHT = 0.45;
  const patientConditions = toLowerList(patient.conditions);
  const requiredConditions = toLowerList(getTrialRequiredConditions(trial));
  totalWeight += CONDITION_WEIGHT;

  const condMatch = fuzzyConditionMatch(patientConditions, requiredConditions);

  if (condMatch.matched) {
    earnedWeight += CONDITION_WEIGHT * condMatch.overlap;
    if (condMatch.overlap >= 0.8) {
      reasons.push("Strong condition match");
    } else if (condMatch.overlap >= 0.5) {
      reasons.push("Partial condition match");
    } else {
      reasons.push("Weak condition overlap");
    }
  } else {
    eligible = false;
    reasons.push("Missing required condition");
  }

  // ── Exclusion check (weight: 0.30) ──
  const EXCLUSION_WEIGHT = 0.30;
  const excludedConditions = toLowerList(getTrialExcludedConditions(trial));
  totalWeight += EXCLUSION_WEIGHT;

  if (!excludedConditions.length) {
    earnedWeight += EXCLUSION_WEIGHT;
    reasons.push("No exclusion criteria defined");
  } else {
    const hasExcluded = excludedConditions.some((excluded) =>
      patientConditions.some(pc => pc.includes(excluded) || excluded.includes(pc))
    );

    if (!hasExcluded) {
      reasons.push("No excluded conditions detected");
      earnedWeight += EXCLUSION_WEIGHT;
    } else {
      eligible = false;
      reasons.push("Excluded condition detected");
    }
  }

  const ruleScore = totalWeight > 0 ? earnedWeight / totalWeight : 0;

  return {
    eligible,
    reasons,
    ruleScore
  };
}
