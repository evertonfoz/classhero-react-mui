from fastapi import FastAPI, Request
from app.gpt_service import extract_keywords
from app.youtube_service import search_videos
from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

class CurateRequest(BaseModel):
    text: str

@app.post("/api/curate")
async def curate(req: CurateRequest):
    keywords = await extract_keywords(req.text)
    pt_videos = await search_videos(keywords, lang="pt")
    en_videos = await search_videos(keywords, lang="en")
    return {"keywords": keywords, "videos": {"portuguese": pt_videos, "english": en_videos}}
