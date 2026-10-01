from typing import Optional
import re

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="JanVaani AI API", version="0.3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
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

class VisionRequest(BaseModel):
    image_base64: str
    filename: str = "evidence.jpg"
    complaint_id: str = "JV-IND-0482"

class ResolutionProofRequest(BaseModel):
    complaint_id: str
    after_image_base64: str
    verification_mode: str = "demo"

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

# Dialect modes intentionally return dialect-form text.
# Browser TTS will use the closest available Indic voice.
# For production-quality native dialect audio, connect a
# dialect ASR/TTS provider such as BHASHINI using server credentials.
DIALECT_LABELS = {
    "hi-IN": "Hindi",
    "en-IN": "English",
    "mal-IN": "Malvi",
    "bnd-IN": "Bundeli",
    "nim-IN": "Nimadi",
    "bag-IN": "Bagheli",
    "gon-IN": "Gondi",
    "kha-IN": "Khandi",
}

def dialect_for(language: str) -> str:
    return language if language in DIALECT_LABELS else "hi-IN"

def contains(text: str, patterns) -> bool:
    return any(re.search(p, text, re.I) for p in patterns)

def dialect_reply(kind: str, language: str, c=DEMO_COMPLAINT) -> str:
    lang = dialect_for(language)

    if lang == "en-IN":
        if kind == "status":
            return (f"Your complaint {c['id']} is with {c['department']}, {c['ward']}, {c['city']}. "
                    f"It is currently in site inspection. The next action is expected in about "
                    f"{c['next_hours']} hours.")
        if kind == "eta":
            return f"The expected resolution time is around {c['eta_days']} days."
        if kind == "department":
            return f"Your complaint is assigned to {c['department']} in {c['ward']}, {c['city']}."
        if kind == "report":
            return "Sure. Tell me the civic problem in your own words and mention a nearby landmark if possible."
        return "Hello. I am Saathi. Tell me your civic problem or ask about your complaint status."

    if lang == "mal-IN":
        if kind == "status":
            return (f"राम राम। थारी शिकायत {c['id']} अभी {c['department']} विभाग में है, "
                    f"{c['ward']}, {c['city']} में। अभी जगह की जाँच चाल री है। "
                    f"अगली कार्रवाई करीब {c['next_hours']} घंटा में होसी।")
        if kind == "eta":
            return f"ई शिकायत को निपटारो करीब {c['eta_days']} दिन में होवो है।"
        if kind == "department":
            return f"थारी शिकायत {c['department']} विभाग देख रियो है, {c['ward']}, {c['city']} में।"
        if kind == "report":
            return "हां, बोलो। थारी समस्या आपणी बोली में बतावो, अर पास को ठिकाणो भी बतावो।"
        return "राम राम। हूं साथी। थारी शिकायत के बारे में पूछो या नई समस्या बतावो।"

    if lang == "bnd-IN":
        if kind == "status":
            return (f"राम राम। तुमाओ शिकायत {c['id']} {c['department']} विभाग में पहुँची है, "
                    f"{c['ward']}, {c['city']} में। अभी जाँच चल रई है। अगली कारवाही करीब "
                    f"{c['next_hours']} घंटा में होई।")
        if kind == "eta":
            return f"ई शिकायत के निपटारे में करीब {c['eta_days']} दिन लगैं।"
        if kind == "department":
            return f"तुमाओ शिकायत {c['department']} विभाग देख रओ है, {c['ward']}, {c['city']} में।"
        if kind == "report":
            return "हां, बतावौ। तुम अपनी दिक्कत आपनी बोली में कहौ और नजदीक की जगह भी बतावौ।"
        return "राम राम। मैं साथी हौं। तुम अपनी शिकायत या दिक्कत बतावौ।"

    if lang == "nim-IN":
        if kind == "status":
            return (f"राम राम। म्हारी तरफ सूं बताऊँ—थारी शिकायत {c['id']} {c['department']} में है, "
                    f"{c['ward']}, {c['city']} में। अभी जाँच चाल री है। अगली कारवाही करीब "
                    f"{c['next_hours']} घंटा में होसी।")
        if kind == "eta":
            return f"ई काम करीब {c['eta_days']} दिन में निपट जासी।"
        if kind == "department":
            return f"थारी शिकायत {c['department']} विभाग देख रियो है, {c['ward']}, {c['city']} में।"
        if kind == "report":
            return "हां, काय दिक्कत है वो बताओ। नजदीक रो ठिकाणो भी कह द्यो।"
        return "राम राम। हूं साथी। थारी बात सुण रियो हूं।"

    if lang == "bag-IN":
        if kind == "status":
            return (f"राम राम। तोहार शिकायत {c['id']} {c['department']} लगे पहुँची है, "
                    f"{c['ward']}, {c['city']} में। अभी जाँच चलत है। अगिला काम करीब "
                    f"{c['next_hours']} घंटा में होई।")
        if kind == "eta":
            return f"ई शिकायत के समाधान मा करीब {c['eta_days']} दिन लागी।"
        if kind == "department":
            return f"तोहार शिकायत {c['department']} विभाग देखत है, {c['ward']}, {c['city']} में।"
        if kind == "report":
            return "हां, आपन दिक्कत बतावा। लगे के जगह या चिन्ह भी बतावा।"
        return "राम राम। हम साथी हई। आपन दिक्कत बतावा या शिकायत के हाल पूछावा।"

    if lang == "gon-IN":
        # Gondi varies by region; keep a short community-facing form
        # and preserve civic terms where a standardized form is needed.
        if kind == "status":
            return (f"राम राम। नावा शिकायत {c['id']} अभी {c['department']} विभाग दगा आहे। "
                    f"{c['ward']}, {c['city']} मं जाँच चल रहा आहे। अगला काम करीब "
                    f"{c['next_hours']} घंटा मं होई।")
        if kind == "eta":
            return f"ई काम करीब {c['eta_days']} दिन मं पूरा होई।"
        if kind == "department":
            return f"नावा शिकायत {c['department']} विभाग दगा आहे, {c['ward']}, {c['city']} मं।"
        if kind == "report":
            return "हां, नावा दिक्कत बतावा। लगेच के जगह के नाम भी बतावा।"
        return "राम राम। हम साथी। आपन दिक्कत बतावा।"

    if lang == "kha-IN":
        if kind == "status":
            return (f"राम राम। तुमची तक्रार {c['id']} {c['department']} कडे आहे, "
                    f"{c['ward']}, {c['city']} मध्ये। आत्ता जागेची तपासणी चालू आहे। "
                    f"पुढची कारवाई सुमारे {c['next_hours']} तासांत होईल।")
        if kind == "eta":
            return f"ही तक्रार साधारण {c['eta_days']} दिवसांत निकाली निघेल।"
        if kind == "department":
            return f"तुमची तक्रार {c['department']} विभागाकडे आहे, {c['ward']}, {c['city']} मध्ये।"
        if kind == "report":
            return "हो, तुमची अडचण तुमच्या भाषेत सांगा आणि जवळची जागा सांगा।"
        return "राम राम। मी साथी आहे। तुमची अडचण सांगा।"

    if kind == "status":
        return (f"जी, आपकी शिकायत {c['id']} की स्थिति यह है। यह {c['ward']}, {c['city']} में "
                f"{c['department']} को भेजी गई है और अभी site inspection में है। अगला action लगभग "
                f"{c['next_hours']} घंटे में expected है।")
    if kind == "eta":
        return f"इस शिकायत के समाधान में लगभग {c['eta_days']} दिन लग सकते हैं।"
    if kind == "department":
        return f"आपकी शिकायत {c['department']} विभाग के पास है, {c['ward']}, {c['city']} में।"
    if kind == "report":
        return "बिल्कुल। अपनी समस्या अपने शब्दों में बताइए और संभव हो तो नज़दीकी landmark भी बताइए।"
    return "नमस्ते। मैं साथी हूँ। अपनी नागरिक समस्या बताइए या शिकायत की स्थिति पूछिए।"

def voice_reply(text: str, language: str) -> str:
    t = text.lower()
    if contains(t, [r"status", r"स्थिति", r"रिपोर्ट.*स्थिति", r"शिकायत.*स्थिति", r"क्या हुआ", r"track", r"ट्रैक"]):
        kind="status"
    elif contains(t, [r"how long", r"कब तक", r"कितना समय", r"कितने दिन", r"eta", r"days", r"दिन"]):
        kind="eta"
    elif contains(t, [r"department", r"विभाग", r"कौन.*देख", r"कौन.*जिम्मेदार", r"officer", r"अधिकारी"]):
        kind="department"
    elif contains(t, [r"report", r"नई शिकायत", r"शिकायत दर्ज", r"register", r"दर्ज कर", r"problem", r"समस्या", r"दिक्कत"]):
        kind="report"
    else:
        kind="hello"
    return dialect_reply(kind, language)

@app.get("/health")
def health():
    return {"status":"ok","service":"janvaani-api","voice_bot":True,"dialect_modes":list(DIALECT_LABELS)}

@app.post("/api/v1/complaints/draft")
def draft_complaint(payload: ComplaintDraft):
    return {
        "category":"Road Infrastructure",
        "sub_category":"Pothole",
        "urgency":"High",
        "standardized_summary":payload.text,
        "language":dialect_for(payload.language),
        "next":"vision-and-routing",
    }

@app.post("/api/v1/voice/respond")
def voice_respond(payload: VoiceRequest):
    lang=dialect_for(payload.language)
    return {
        "reply_text":voice_reply(payload.text,lang),
        "mode":"voice",
        "language":lang,
        "dialect":DIALECT_LABELS[lang],
        "complaint_id":DEMO_COMPLAINT["id"],
        "tts_note":"Browser uses the closest available Indic voice; connect a native dialect TTS adapter for production audio."
    }

@app.post("/api/v1/vision/analyze")
def analyze_vision(payload: VisionRequest):
    name=payload.filename.lower()
    if any(k in name for k in ["garbage","waste","kachra"]):
        return {"category":"Garbage / Waste Accumulation","severity":"3.6/5","confidence":"92%","actions":["Dispatch sanitation collection team.","Inspect whether the site is a recurring dumping hotspot.","Upload an after-image after removal and cleaning."],"mode":"demo-cv"}
    if any(k in name for k in ["water","flood","drain","pani"]):
        return {"category":"Waterlogging / Drainage","severity":"4.5/5","confidence":"93%","actions":["Dispatch drainage response team.","Inspect blockage and public-safety risk.","Clear the obstruction and upload resolution evidence."],"mode":"demo-cv"}
    return {"category":"Pothole / Road Damage","severity":"4.2/5","confidence":"94%","actions":["Dispatch road-maintenance inspection team.","Place temporary hazard warning if traffic risk is high.","Repair the surface and capture an after-image."],"mode":"demo-cv"}

@app.post("/api/v1/complaints/{complaint_id}/resolution-proof")
def resolution_proof(complaint_id: str, payload: ResolutionProofRequest):
    return {"complaint_id":complaint_id,"verification":"passed","verification_score":94,"status":"ready_for_officer_closure","message":"Resolution evidence received. Final closure remains an authorized officer action."}
