# JanVaani AI (जनवाणी AI)

**Voice-first multilingual citizen grievance redressal for Madhya Pradesh.**

JanVaani is designed around one simple interaction: **the citizen speaks, JanVaani listens, understands the request, and answers back in voice.** It is intentionally not built as a chat-window-first experience.

## What changed in the voice-first frontend

- 🎙️ **Saathi Voice Bot** — no chat bubbles and no text input in the citizen assistant.
- 🗣️ **Speak → understand → speak back** — browser Speech Recognition captures the citizen's speech and Speech Synthesis gives a spoken response.
- 🇮🇳 **Hindi + English voice modes** with a structure ready for Indic dialect/ASR adapters.
- 🔊 **Human-style response playback** with a selected browser voice, controlled speaking rate and a visible speaking state.
- 📌 **Complaint status by voice** — e.g. “मेरी रिपोर्ट दर्ज करी थी, उसकी क्या स्थिति है?” returns a spoken status response.
- 🧭 **Status / ETA / department / new complaint intents** are supported in the demo voice flow.
- 📷 **Photo evidence** remains available alongside voice reporting.
- 🗺️ **Citizen tracking, civic map and officer command center** remain part of the frontend.

## Voice flow

~~~text
Citizen speaks
      ↓
Browser Speech Recognition
      ↓
Voice intent + complaint context
      ↓
FastAPI /api/v1/voice/respond
      ↓
Spoken response text
      ↓
Browser Speech Synthesis
      ↓
Citizen hears the answer
~~~

If the backend is unavailable, the frontend has a local fallback so the voice demo still works.

## Current demo vs production

The repository now has a working **voice-first frontend demo** and a FastAPI voice-response endpoint. The demo response data is deterministic (JV-IND-0482) so it can be demonstrated without external credentials.

For production, connect:

- Bhashini / AI4Bharat or another Indic ASR provider for Hindi, Malvi, Nimadi, Bundeli and other dialects.
- Neural TTS for natural Indian-language voices.
- LLM-based intent extraction and response generation.
- Computer vision inference for uploaded evidence.
- GPS/EXIF validation + reverse geocoding.
- PostGIS + embeddings for spatial/semantic duplicate clustering.
- Ward/authority routing APIs.
- Real SLA prediction and escalation.
- Citizen notifications and proof-of-resolution verification.

## Run locally

### Frontend

~~~bash
python3 -m http.server 5500
~~~

Open:

~~~text
http://localhost:5500
~~~

Allow microphone permission when the browser asks.

### Backend

In a second VS Code terminal:

~~~bash
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
~~~

Check:

~~~text
http://127.0.0.1:8000/health
http://127.0.0.1:8000/docs
~~~

The frontend automatically tries the local FastAPI voice endpoint first and falls back to its local demo response if the API is unavailable.

## Repository structure

~~~text
JanVanni-/
├── index.html
├── styles.css
├── app.js
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── README.md
│   └── .env.example
└── data/
    └── mp_issue_catalog.json
~~~

## Project direction

**Voice first. Government action next.**

The citizen should not have to learn how to use a ticketing system. They should be able to speak naturally, receive a clear spoken answer, and only see detailed dashboards when they want them.
