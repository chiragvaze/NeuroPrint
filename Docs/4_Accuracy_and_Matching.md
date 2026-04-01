# Accuracy Logic and Matching Algorithm

The matching calculation evaluates patients on deterministic constraints, semantic similarity, and proximity. According to predefined targets, the **Overall Operational Target Accuracy is ~98%** (as reflected in UI marketing metrics). The actual algorithmic calculation relies on the following engine distributions:

## 1. Top-Level Ranking Equation
Each clinical trial is scored for an individual patient using a clamped [0, 1] weight logic multiplied down to a final confidence percentage out of 100%.

**Formula:**
`Total Score = (Rule Engine * 55%) + (Similarity * 30%) + (Geographic Proximity * 15%)`

## 2. Rule Engine Breakdown (`ruleEngine.js`)
If `ruleScore` accounts for 55% of the overall decision, its internal mechanism is further fractionated into exact constraints:

- **Condition Matching (45% of Rule Check):** Verifies if required criteria exist in the patient's conditions array. Grants varying credit based on fuzzy token overlap (e.g. >=0.8 overlap is marked 'Strong', >=0.5 'Partial').
- **Exclusion Verification (30% of Rule Check):** Automatically deducts and marks the patient permanently ineligible if condition strings intersect with explicitly prohibited `excludedConditions`.
- **Age Criteria (25% of Rule Check):** Complete inclusion if `minAge <= patientAge <= maxAge`. Partial penalty calculation linearly limits score if the patient's age misses bounds.

## 3. Geographic Constraints
Proximity evaluates overlapping tokens. If locations match precisely, a 1.0 multiplier is appended. Otherwise, string sets are generated and mathematically intersected via Jaccard-like union division. By attributing 15% weight to geography, patients are favored towards localized institutions, preventing irrelevant overseas mappings.

## 4. NLP Semantic Fallback
AI similarity via `matchPatientToTrialByEmbedding` contributes 30%. By generating Cohere vector embeddings against textual blocks (the patient's clinical synopsis versus the trial abstract), patients with unclassified synonyms or non-standard conditions will organically push similarity scores higher. If the AI service fails, the engine falls back to mirroring 85% of the Rule engine score as a heuristic placeholder.
