export function parseCriteriaText(rawCriteria = "") {
  return {
    inclusion: [],
    exclusion: [],
    normalizedText: rawCriteria.trim()
  };
}
