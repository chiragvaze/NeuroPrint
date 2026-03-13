# NeuroPrint - Cognitive Drift Intelligence System

NeuroPrint is a full stack platform that uses behavioral biometrics (typing rhythm + mouse dynamics) to generate a cognitive fingerprint and detect cognitive drift over time.

## Monorepo Structure

- `frontend/` - React dashboard with Tailwind, Framer Motion, and Recharts
- `backend/` - Express + MongoDB API for biometric ingestion and profile retrieval
- `ai-engine/` - Feature extraction and drift scoring utilities
- `docs/` - Architecture documentation

## Quick Start

### 1) Backend

```bash
cd backend
npm install
npm run dev
```

Create a `.env` from `.env.example` values before starting backend.

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

## Backend API Endpoints

- `GET /health` - service health check
- `POST /api/biometrics/snapshot` - store behavior snapshot
- `GET /api/biometrics/profile/:userId` - get cognitive profile for user

## Core Concept

1. Capture interaction data from keyboard and mouse events.
2. Extract feature vectors for each session.
3. Compare against baseline behavior profile.
4. Produce drift score and risk band for monitoring.
