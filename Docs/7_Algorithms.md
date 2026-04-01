# Core Algorithms

The Matcher relies heavily on custom programmatic algorithms to process logic far beyond standard SQL `WHERE` clauses.

## 1. Fuzzy Token Overlap Algorithm
**Location:** `server/services/ruleEngine.js`
**Purpose:** Ensure clinicians are not penalized for slight misspellings or varying disease vocabularies (e.g., "Mellitus Diabetes" vs "Type 2 Diabetes").

**How it works:**
1. Strips all conditions from cases and punctuation.
2. Breaks multiple-word conditions into independent tokens (discarding noise words `< 2` characters).
3. Executes a Word Boundary Regex (`\bTOKEN\b`) check.
4. If a word match isn't directly identical, it iterates across a **Token Set Overlap Check**:
    - Calculates the intersection ratio: `Matches / Total Tokens in Required Condition`.
    - If `TokenRatio >= 0.5`, it is marked as a successful partial logic match string.
5. Returns a boolean array validation mapped for weight distribution scoring.

## 2. Jaccard Index Geographic Proximity Algorithm
**Location:** `server/services/rankingEngine.js`
**Purpose:** Rather than enforcing rigid Haversine distances bounded by absolute GPS Coordinates, locations are checked for conceptual token overlaps via mathematical sets.

**How it works:**
1. Normalizes the user string (`"Mumbai, Maharashtra"` $\rightarrow$ `["mumbai", "maharashtra"]`).
2. Generates two mathematical Sets (Trial Set and Patient Set).
3. Defines Intersection Size: The number of exactly matching strings across both Sets.
4. Defines Union Size: The size of combining both Sets.
5. Returns Output: `Intersection / Union`.
*If a complete match is found, score is `1.0`. Pure mismatch is `0.0`.*

## 3. NLP Semantic Vector Space (Cosine Similarity)
**Location:** `ai-services/embedding-engine/matcher.js`
**Purpose:** Solves the semantic equivalence problem.

**How it works:**
1. Text is mapped to `n`-dimensional floating arrays.
2. Computes **Cosine Similarity Equation**: Given vectors $A$ and $B$, $Similarity = \frac{A \cdot B}{||A|| \times ||B||}$.
3. High similarity angles map out to roughly `0.85 - 0.99`. This serves as the AI proxy score fallback if Rule Engine rigid parameters are undefined.

## 4. Multi-Criteria Additive Weighting Ranking Model
**Location:** `server/services/rankingEngine.js`
**Purpose:** Consolidates all varying subsystems into one final unified prediction metric.

**How it works:**
1. Validates all unit scores exist between numeric bounds `[0, 1]`.
2. Applies predefined weight heuristics:
   - **$W_1$ (Rule Engine):** $0.55$ (Broken further into Age [0.25], Condition [0.45], Exclusion [0.30]).
   - **$W_2$ (Similarity Space):** $0.30$.
   - **$W_3$ (Geographic Index):** $0.15$.
3. Equation: $Final = (R \times W_1) + (S \times W_2) + (G \times W_3)$
4. Output is scaled back up to 100 as the final Confidence Percentage.
