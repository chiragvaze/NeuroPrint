# Architecture and Technology Stack

The system embraces a decoupled, API-driven monolithic architecture that isolates the client interface, back-end APIs, and AI integrations.

## 1. Technology Engine Stack

| Layer | Framework & Tools |
|-------|-------------------|
| **Frontend UI** | React, TailwindCSS, Axios, Recharts |
| **Backend API** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose ODM |
| **AI LLM Parsing**| OpenAI API |
| **AI Embeddings** | Cohere API |

## 2. System Architecture Outline

### `client/` (Frontend)
A Single Page Application (SPA) driven by React that serves as the end-user clinical portal. Responsible for state management, API request handling, charting evaluation metrics (using Recharts), and presenting data neatly.

### `server/` (Backend Edge)
Standard MVC-like REST interface. Intercepts incoming requests, processes initial validations, interacts with MongoDB, handles dataset imports (CSV parsing), and serves as the intermediary controller that dispatches payload requests to the AI service engines.

### `ai-services/` (Data Processing Engine)
Decoupled modules that execute intense computational algorithms:
- `criteria-parser`: Generates prompt payloads against OpenAI to convert textual clinical guidelines into mathematical matrices operations (`ageRange: [x,y]`).
- `embedding-engine`: Reaches out to Cohere to pull vector representations and compares spatial similarity.
- `explanation-engine`: Generates plain-text natural language summaries of matching confidence.

## 3. Database Layer Models

### Patient Schema
- `patientId`: String (Unique index)
- `age`: Number
- `gender`: String
- `conditions`: Array of Strings
- `medications`: Array of Strings
- `location`: String

### Trial Schema
- `trialId`: String (Unique Reference)
- `title`, `condition`, `phase`, `sponsor`: Standard String definitions
- `minAge`, `maxAge`: Numeric Bounds
- `inclusionCriteria`, `exclusionCriteria`: Unstructured String Text
- `parsedEligibility`: JSON Sub-document containing `requiredConditions`, `excludedConditions`, and `ageRange`.
