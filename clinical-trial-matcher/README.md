# Clinical Trial Eligibility & Matching Engine

An AI-powered platform that analyzes anonymized patient health records and matches patients to relevant clinical trials.

## System Purpose

The system helps research teams and clinicians:
- Parse patient records into standardized eligibility signals.
- Compare trial criteria against patient characteristics.
- Generate explainable eligibility and ranking results.
- Reduce manual screening time while improving trial fit.

## Tech Stack

### Frontend
- React
- TailwindCSS
- Axios
- Recharts

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

### AI Layer
- OpenAI API
- Cohere Embeddings API

## Project Structure

```text
clinical-trial-matcher
├── client
├── server
└── ai-services
```

## Quick Start

### 1) Frontend
```bash
cd client
npm install
npm run dev
```

### 2) Backend
```bash
cd server
npm install
npm run dev
```

### 3) Environment Variables (server)
Copy `.env.example` to `.env` in `server` and provide keys:
- `PORT`
- `MONGODB_URI`
- `OPENAI_API_KEY`
- `COHERE_API_KEY`

## Notes

This scaffold includes base models, routes, controllers, and service placeholders for extending patient-to-trial matching logic and explainable AI outputs.

## Patient Data Module

### APIs
- `POST /api/patient/create`
- `POST /api/patient/upload`
- `GET /api/patient/:id`

### Patient Schema
- `patientId`
- `age`
- `gender`
- `conditions` (array)
- `medications` (array)
- `location`
- `createdAt`

### Upload Support
- CSV upload via multipart form field: `file`
- JSON upload via multipart form field: `file`

### Anonymization Guardrails
- Requests are rejected if identifiable keys are detected (for example: `name`, `phone`, `email`, `address`, `ssn`).
- Requests are rejected if value patterns look like phone numbers or email addresses.

## Clinical Trial Database Module

### APIs
- `POST /api/trial/create`
- `GET /api/trial/all`
- `GET /api/trial/:id`
- `POST /api/trial/import` (JSON dataset upload, multipart field: `file`)

### Trial Schema
- `trialId`
- `title`
- `condition`
- `location`
- `minAge`
- `maxAge`
- `inclusionCriteria` (text)
- `exclusionCriteria` (text)
- `phase`
- `sponsor`

### Frontend Features
- Trial table view
- Filters by condition, location, and phase
- Expandable full-text inclusion and exclusion criteria

## AI Criteria Parsing Module

### AI Service
- `ai-services/criteria-parser/parser.js`
- Function: `parseEligibilityText(criteriaText)`

### API
- `POST /api/ai/parse-criteria`

### Request Body
```json
{
	"trialId": "TRIAL-001",
	"criteriaText": "Inclusion: Patients aged 40-65 with Type 2 Diabetes. Exclusion: kidney disease."
}
```

### Response Shape
```json
{
	"trialId": "TRIAL-001",
	"parsedRules": {
		"ageRange": [40, 65],
		"requiredConditions": ["Type 2 Diabetes"],
		"excludedConditions": ["Kidney Disease"]
	}
}
```

### Validation
- AI JSON response is validated to ensure required keys and types:
	- `ageRange`: `[minAge, maxAge]`
	- `requiredConditions`: `string[]`
	- `excludedConditions`: `string[]`
- Parsed rules are stored in the corresponding trial document under `parsedEligibility`.
