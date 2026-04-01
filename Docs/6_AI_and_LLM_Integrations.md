# AI and LLM Integrations

The Clinical Trial Matcher relies on two core Machine Learning implementations to intelligently bridge textual gaps.

## 1. OpenAI Integration (Criteria Extraction)
_Directory: `ai-services/criteria-parser`_

Clinical trials are published with unstructured, heterogeneous textual paragraphs for eligibility. Instead of building endless Regex patterns to parse them, the system leverages OpenAI's LLM APIs.

**Process Workflow:**
- The backend takes the raw trial criteria string.
- It is injected into an extraction prompt targeting specific outputs: `ageRange`, `requiredConditions`, and `excludedConditions`.
- The prompt strictly mandates a localized pure JSON response.
- The JSON is subsequently validated by the Express middleware to prevent hallucinated structures and then committed to MongoDB.

**Benefits:**
- Dynamically converts phrases like "Individuals aged fifty to sixty" into `ageRange: [50, 60]`.
- Strips off extraneous wording to output standard condition taxonomy.

## 2. Cohere API Integration (Semantic Vector Matching)
_Directory: `ai-services/embedding-engine`_

Traditional boolean rule engines fail when patients have synonyms or granularly specific sub-variants of a condition (e.g., matching "Pre-Diabetes" against "Type 2 Diabetes"). 

**Process Workflow:**
- Textual descriptors of both the patient profiles (symptoms, history) and the clinical trial abstracts are pushed to Cohere's embedding endpoints.
- Cohere returns dense mathematical Float arrays (Embeddings) representing the semantic spatial location of the texts.
- A local `cosineSimilarity` mathematical algorithm calculates the angular distance between the vectors.
- A value closer to `1.0` implies semantic textual equivalence; a value closer to `0.0` or `-1.0` denotes complete mismatch.

**Impact on Accuracy:**
By blending deterministic scores (Rule Check 55%) with this probabilistic Vector Search score (Similarity Check 30%), the matching engine overcomes the brittleness of standard keyword queries.

## 3. Explainable AI (XAI) Engine
_Directory: `ai-services/explanation-engine`_

To build trust with clinicians, predictions cannot be "black box".
- The system feeds the Patient Profile, the Trial criteria, and the generated Matching calculations back into a final generative LLM prompt.
- The prompt instructs the LLM to output a 2-3 sentence English explanation articulating distinctly _why_ the match is recommended, citing specific condition overlaps mapped during the algorithm phases.
