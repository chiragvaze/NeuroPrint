# NeuroPrint Architecture

## Overview
NeuroPrint combines behavioral telemetry capture, backend persistence, and AI feature analysis to estimate cognitive drift over time.

## Layers
1. Frontend React app captures and visualizes typing and mouse biometrics.
2. Backend API validates and persists snapshots in MongoDB.
3. AI engine extracts vectors, computes drift, and classifies risk bands.

## Data Flow
1. User interaction telemetry is converted to typing and mouse metrics.
2. Frontend posts snapshots to `/api/biometrics/snapshot`.
3. Backend stores snapshots in `CognitiveProfile` documents.
4. AI engine computes drift score against baseline and returns risk classification.
