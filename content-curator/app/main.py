from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import openai
import os
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ou especifique ["http://localhost:5173"] por segurança
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Novo cliente (v1.0+)
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class YouTubeQuery(BaseModel):
    title: str
    description: str

@app.post("/youtube-links")
async def generate_youtube_links(payload: YouTubeQuery):
    query_pt = f"{payload.title} {payload.description}".strip()

    try:
        completion = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "Você é um assistente que traduz títulos e descrições de conteúdo técnico para buscas em inglês no YouTube."},
                {"role": "user", "content": f"Traduza para uma busca eficiente em inglês no YouTube: {query_pt}"}
            ]
        )

        query_en = completion.choices[0].message.content.strip().replace(" ", "+")
        query_pt_final = query_pt.replace(" ", "+")

        return {
            "pt": f"https://www.youtube.com/results?search_query={query_pt_final}",
            "en": f"https://www.youtube.com/results?search_query={query_en}"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
