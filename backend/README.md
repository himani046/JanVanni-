# JanVaani Backend Blueprint

Provider-agnostic backend layer for ASR, multimodal vision, embeddings, PostGIS, routing, SLA prediction and resolution-proof verification.

## Core endpoints
- POST /api/v1/complaints/voice
- POST /api/v1/complaints/vision
- POST /api/v1/complaints/match
- POST /api/v1/complaints/route
- GET /api/v1/complaints/{id}
- POST /api/v1/complaints/{id}/resolution-proof
- GET /api/v1/dashboard/metrics

Use FastAPI + PostgreSQL/PostGIS. Keep all provider secrets on the server.