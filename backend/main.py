from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="JanVaani AI API", version="0.1.0")

class Location(BaseModel):
    lat: float
    lon: float

class ComplaintDraft(BaseModel):
    text: str
    language: str = "hi"
    location: Optional[Location] = None

@app.get("/health")
def health():
    return {"status": "ok", "service": "janvaani-api"}

@app.post("/api/v1/complaints/draft")
def draft_complaint(payload: ComplaintDraft):
    return {"category":"Road Infrastructure","sub_category":"Pothole","urgency":"High","standardized_summary":payload.text,"next":"vision-and-routing"}
