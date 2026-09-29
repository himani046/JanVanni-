from typing import Optional
import re

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="JanVaani AI API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:5501",
        "http://localhost:5501",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Location(BaseModel):
    lat: float
    lon: float


class ComplaintDraft(BaseModel):
    text: str
    language: str = "hi"
    location: Optional[Location] = None


class VoiceRequest(BaseModel):
    text: str
    language: str = "hi-IN"


DEMO_COMPLAINT = {
    "id": "JV-IND-0482",
    "ward": "Ward 22",
    "city": "Indore",
    "department": "Road Maintenance",
    "reports": 23,
    "next_hours": 18,
    "risk": 68,
    "eta_days": 4,
}


@app.get("/health")
def health():
    return {"status": "ok", "service": "janvaani-api", "voice_bot": True}


@app.post("/api/v1/complaints/draft")
def draft_complaint(payload: ComplaintDraft):
    return {
        "category": "Road Infrastructure",
        "sub_category": "Pothole",
        "urgency": "High",
        "standardized_summary": payload.text,
        "next": "vision-and-routing",
    }


def is_hindi(language: str, text: str) -> bool:
    return language.startswith("hi") or bool(
        re.search(r"[ऀ-ॿ]|शिकायत|रिपोर्ट|स्थिति|कब तक|विभाग|गड्ढा|पानी", text.lower())
    )


def voice_reply(text: str, language: str) -> str:
    t = text.lower()
    hi = is_hindi(language, text)
    c = DEMO_COMPLAINT

    if re.search(r"status|स्थिति|रिपोर्ट.*स्थिति|शिकायत.*स्थिति|क्या हुआ|track|ट्रैक", t):
        if hi:
            return (
                f"जी, आपकी शिकायत {c['id']} की स्थिति यह है। "
                f"यह {c['ward']}, {c['city']} में {c['department']} को भेजी गई है और अभी "
                f"site inspection के चरण में है। अगला action लगभग {c['next_hours']} घंटे में expected है। "
                f"इस शिकायत में {c['reports']} लोगों की समान reports जुड़ी हैं और अभी SLA risk "
                f"{c['risk']} प्रतिशत है।"
            )
        return (
            f"Your complaint {c['id']} is with {c['department']}, {c['ward']}, {c['city']}. "
            f"It is currently in the site inspection stage. The next action is expected in about "
            f"{c['next_hours']} hours. {c['reports']} similar citizen reports are linked to the "
            f"same incident, and the current SLA risk is {c['risk']} percent."
        )

    if re.search(r"how long|कब तक|कितना समय|कितने दिन|समय|eta|days|दिन", t):
        if hi:
            return (
                f"इस तरह की शिकायत के लिए अनुमानित resolution time लगभग {c['eta_days']} दिन है। "
                f"अभी अगला field action लगभग {c['next_hours']} घंटे में expected है।"
            )
        return (
            f"The estimated resolution time for this type of complaint is around {c['eta_days']} days. "
            f"The next field action is expected in about {c['next_hours']} hours."
        )

    if re.search(r"department|विभाग|कौन.*देख|कौन.*जिम्मेदार|officer|अधिकारी", t):
        if hi:
            return (
                f"आपकी शिकायत {c['department']} विभाग के पास है, {c['ward']}, {c['city']} में। "
                "JanVaani location और issue type के आधार पर इसे सही civic authority तक route करता है।"
            )
        return (
            f"Your complaint is assigned to {c['department']}, {c['ward']}, {c['city']}. "
            "JanVaani uses the location and issue type to route it to the responsible civic authority."
        )

    if re.search(r"report|नई शिकायत|शिकायत दर्ज|file|register|दर्ज कर|problem|समस्या", t):
        if hi:
            return (
                "बिल्कुल। मैं आपके साथ voice में शिकायत दर्ज करूँगा। "
                "पहले अपने शब्दों में समस्या बताइए और अगर संभव हो तो नज़दीकी जगह या landmark भी बताइए।"
            )
        return (
            "Absolutely. I can take the complaint by voice. "
            "Tell me the problem in your own words and, if possible, mention the nearest landmark or area."
        )

    if re.search(r"hello|hi|hey|namaste|नमस्ते|नमस्कार", t):
        if hi:
            return (
                "नमस्ते। मैं साथी हूँ। आप अपनी शिकायत की स्थिति, विभाग या समाधान का अनुमान पूछ सकते हैं। "
                "या बस अपनी नई समस्या बोल सकते हैं।"
            )
        return (
            "Hello. I’m Saathi. You can ask about your complaint status, responsible department, "
            "expected time, or simply tell me a new civic problem."
        )

    if hi:
        return (
            "जी, मैं सुन रहा हूँ। आप सीधे बोल सकते हैं — जैसे, मेरी शिकायत की स्थिति क्या है, "
            "कितने दिन लगेंगे, या कौन सा विभाग इसे देख रहा है?"
        )
    return (
        "I’m listening. You can ask directly about your complaint status, expected time, "
        "or the responsible department."
    )


@app.post("/api/v1/voice/respond")
def voice_respond(payload: VoiceRequest):
    return {
        "reply_text": voice_reply(payload.text, payload.language),
        "mode": "voice",
        "complaint_id": DEMO_COMPLAINT["id"],
    }
