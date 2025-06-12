from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import openai
import os
from fastapi.middleware.cors import CORSMiddleware
import traceback  # ✅ Importa para exibir o traceback completo no log

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

def simplificar_para_busca(texto: str) -> str:
    return texto.replace(" ", "+")

@app.post("/youtube-links")
async def generate_youtube_links(payload: YouTubeQuery):
    query_original = f"{payload.title} {payload.description}".strip()

    try:
        completion = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "Você é um especialista em YouTube SEO técnico. Sua tarefa é transformar um título e uma descrição em termos de busca otimizados para encontrar vídeos no YouTube, focando em palavras-chave relevantes da área de tecnologia e programação."
                },
                {
                    "role": "user",
                    "content": f"Título: {payload.title}\nDescrição: {payload.description}\n\nGere uma única linha com palavras-chave otimizadas para busca no YouTube em inglês."
                }
            ]
        )

        query_en = completion.choices[0].message.content.strip().replace(" ", "+")
        query_pt = simplificar_para_busca(query_original)

        return {
            "pt": f"https://www.youtube.com/results?search_query={query_pt}",
            "en": f"https://www.youtube.com/results?search_query={query_en}"
        }

    except Exception as e:
        print("🛑 Erro ao gerar links do YouTube:")
        traceback.print_exc()  # ✅ Mostra o stack trace no terminal
        raise HTTPException(status_code=500, detail=str(e))
