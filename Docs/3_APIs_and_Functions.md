# APIs and Internal Functions

## 1. Express Endpoints Map

### Patient Management
- `POST /api/patient/create` - Instantiates a single patient profile.
- `POST /api/patient/upload` - Handles CSV uploads via `multipart/form-data` and sanitizes incoming datasets.
- `GET /api/patient/:id` - Fetches the normalized profile layout.

### Trial Provisioning
- `POST /api/trial/create` - Saves a new trial protocol to DB.
- `GET /api/trial/all` - Exposes indexed trials with optional query filters (condition, location, phase).
- `POST /api/trial/import` - Handles JSON-driven bulk inserts of trial data.

### AI Processing Endpoints
- `POST /api/ai/parse-criteria` - Extracts parameters via OpenAI. Payload: `{"trialId": "T-1", "criteriaText": "..."}`.
- `POST /api/match/semantic` - Returns embedding-based comparisons.

### Core Match Engine Endpoints
- `POST /api/match/rule-check` - Dry-runs a deterministic profile validation without semantic overlap.
- `POST /api/match/recommendations` - The master orchestration endpoint returning sorted, mathematically scored trials for a given patient.
- `POST /api/match/explanation` - Generates a contextual justification for an established match score.

## 2. Key Internal Functions

### `evaluateEligibilityWithScore(patient, trial)`
_Located in `server/services/ruleEngine.js`_
- Performs rigid checks. Calculates an earned weight value by verifying rule boundaries: Age (25%), Condition Overlap (45%), and Exclusion Presence (30%). Returns a `ruleScore` bounded between 0 and 1.

### `fuzzyConditionMatch(patientConditions, requiredConditions)`
_Located in `server/services/ruleEngine.js`_
- Evaluates arrays of patient symptoms versus trial requirements using bounding Regex tokenization checks. Avoids strict boolean mismatches due to minor typos.

### `rankTrialsForPatient({ patient, trials, matchingScores })`
_Located in `server/services/rankingEngine.js`_
- The orchestrator orchestrating array mapping. Accumulates the `ruleScore`, `similarityScore` (from AI embeddings), and a proprietary geographic proximity calculation. Sorts array descending based on algorithmic score logic.
