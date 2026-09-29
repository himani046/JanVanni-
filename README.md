# JanVaani AI (जनवाणी AI)

JanVaani is a multilingual, multimodal citizen grievance platform designed for local urban governance in Madhya Pradesh.

## Vision

Let a citizen speak naturally in **Hindi, Bundelkhandi, Malvi, Nimadi or English**, attach a photo, share/derive location and receive a complaint that is intelligently classified, geographically routed and trackable.

## MVP modules

- 🎙️ **Saathi Voice Assistant** — conversational complaint intake with follow-up questions and browser speech recognition.
- 🌐 **Bilingual / multilingual UI** — English + Hindi across the citizen experience, with a structure ready for additional MP dialect content.
- 📷 **Computer Vision evidence intake** — photo upload surface for potholes, garbage, waterlogging, streetlights and other civic issues.
- 📍 **GPS + Ward routing** — architecture for mapping the incident to a ward and responsible authority.
- 🧠 **AI triage** — severity, category, urgency and structured complaint extraction.
- 🧩 **Incident deduplication** — master incidents can absorb nearby semantically similar complaints.
- ⏱️ **SLA risk** — prioritize cases before breach and support escalation workflows.
- 🗺️ **Live MP command map** — incident hotspots, filters and citizen location context.
- ✅ **Proof of resolution** — before/after evidence workflow for AI-assisted closure verification.
- 🏛️ **Command Center** — officer queue, risk, AI severity and closure verification.

## Important

This repository currently contains a **frontend MVP / demo layer**. Browser speech recognition and visual upload UI are implemented, while production integrations such as Bhashini/AI4Bharat ASR, vision inference, PostGIS, reverse geocoding, authority APIs/webhooks, messaging gateways and real SLA models should be connected through the backend.

## Suggested production architecture

```
Citizen Voice / Text / Photo / GPS
          ↓
Indic ASR + language detection
          ↓
LLM normalization + structured entities
          ↓
Vision model + EXIF/GPS validation
          ↓
Embeddings + PostGIS deduplication
          ↓
Ward / authority routing engine
          ↓
SLA prediction + escalation
          ↓
Officer Command Center
          ↓
Proof-of-resolution + citizen notification
```

## Run locally

Open `index.html` directly, or serve the folder using any static server:

```bash
python -m http.server 5500
```

Then open `http://localhost:5500`.

## Backend blueprint

See `backend/README.md` for proposed FastAPI endpoints and provider adapter architecture.
