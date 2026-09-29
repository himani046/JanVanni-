# JanVaani AI Backend

FastAPI scaffold for the JanVaani voice-first citizen grievance platform.

## Run

~~~bash
cd JanVanni-
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
~~~

## Endpoints

### GET /health

Returns API and voice-bot health.

### POST /api/v1/voice/respond

Voice-first response endpoint.

Request:

~~~json
{
  "text": "मेरी रिपोर्ट दर्ज करी थी, उसकी क्या स्थिति है?",
  "language": "hi-IN"
}
~~~

Response:

~~~json
{
  "reply_text": "जी, आपकी शिकायत JV-IND-0482 ...",
  "mode": "voice",
  "complaint_id": "JV-IND-0482"
}
~~~

The current endpoint is intentionally deterministic for the MVP. Replace voice_reply() with a production intent/LLM service and connect the response to a real complaint database.

### POST /api/v1/complaints/draft

Creates a structured complaint draft from recognized speech/text.

## Production adapter plan

~~~text
Mic
 ↓
Indic ASR / Bhashini
 ↓
Language + dialect detection
 ↓
LLM intent extraction
 ↓
Complaint DB + PostGIS
 ↓
Department / ward routing
 ↓
Response generation
 ↓
Indic TTS
 ↓
Citizen hears response
~~~

CORS is enabled for the local static frontend on ports 5500 and 5501. Restrict the origin list before production deployment.
