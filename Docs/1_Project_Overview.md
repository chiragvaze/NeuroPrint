# Clinical Trial Eligibility & Matching Engine: Project Overview

## 1. Project Objective
The **Clinical Trial Matcher** is an AI-powered platform designed to evaluate and map patient health records to clinical trials. The primary goal is to minimize manual screening times by research teams and clinicians while simultaneously maximizing trial-fit confidence through Explainable AI (XAI) and deterministic ranking algorithms.

## 2. Core Features
- **Deterministic Rule Engine Application:** Evaluates hard criteria constraints (e.g., patient age, exact match or exclusion of pre-existing conditions).
- **Semantic Representation Matching:** Utilizes Natural Language Processing (NLP) embeddings to find fuzzy contextual matches between trial inclusion criteria and patient diagnostics.
- **Explainable Recommendation Generation:** Returns transparent, human-readable explanations explaining _why_ a patient matched with a specific clinical trial and how the match scores were calculated. 
- **Automated Criteria Extraction:** Uses Large Language Models (LLMs) to automatically parse raw, unstructured clinical trial texts into deterministic, serialized JSON rules.
- **Data Protection Guardrails:** Automatically anonymizes and strips out PII (Personally Identifiable Information) values such as emails, SSNs, and names upon data ingestion.

## 3. Top-Level Workflow
1. User (Clinician/Researcher) uploads bulk patient records via CSV/JSON through the dashboard.
2. The records are sanitized and indexed in the MongoDB database.
3. The AI extracts trial eligibility clauses into structured schemas.
4. The system calculates matching affinities (combining exact rule bounds and semantic embedding distances).
5. The frontend displays the highest-ranked clinical trials per patient profile, coupled with a localized explanation snippet.
