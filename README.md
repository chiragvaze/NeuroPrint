# NeuroPrint: Clinical Trial Eligibility & Matching Engine

Welcome to the **NeuroPrint** repository! This project hosts an AI-powered full-stack application designed to seamlessly match anonymized patient health records to relevant clinical trials.

By leveraging deterministic rule engines and semantic text embedding algorithms (powered by OpenAI and Cohere), this system drastically reduces manual screening time while providing an explainable, confidence-ranked list of relevant trials for diverse patient conditions.

## 📚 Comprehensive Documentation
We have generated extensive, module-specific architectural documentation located in the local `Docs/` directory. For a deep dive into how the system operates at a mathematical and functional level, please navigate to the following files:

- [1. Project Overview](Docs/1_Project_Overview.md) - System workflows and core feature definitions.
- [2. Architecture and Tech Stack](Docs/2_Architecture_and_Tech_Stack.md) - React, Express, and MongoDB schema setups.
- [3. APIs and Functions](Docs/3_APIs_and_Functions.md) - REST API mapping and isolated engine functions.
- [4. Accuracy and Matching](Docs/4_Accuracy_and_Matching.md) - Accuracy metrics and distribution variables.
- [5. Reference Data](Docs/5_Reference_Data.md) - CSV/JSON ingest structures and PII security.
- [6. AI and LLM Integrations](Docs/6_AI_and_LLM_Integrations.md) - How we utilize LLMs for Criteria extraction and Vector Semantics.
- [7. Core Algorithms](Docs/7_Algorithms.md) - Detailed breakdown of Fuzzy Regex math, Jaccard Geographic mapping, and Vector Cosine logic.

## 🚀 Quick Start
The main codebase resides within the `clinical-trial-matcher` directory. 

To run the application locally, you will need to operate both the Frontend (React) and Backend (Express) concurrently:

### 1. Start the Backend API
```bash
cd clinical-trial-matcher/server
# Create your parameters file
cp .env.example .env 
# Fill in your MONGODB_URI, OPENAI_API_KEY, and COHERE_API_KEY

npm install
npm run dev
```

### 2. Start the Provider Dashboard
```bash
cd clinical-trial-matcher/client
npm install
npm run dev
```

## 🧪 Experimental Scripts
The root directory of this repository contains standalone artifacts (`test_matcher.js`, `test_matcher2.js`) and output files (`out.json`, `out2.json`). These are used as sandbox testing environments to execute the matching logic engine in isolation from the Express REST API.
