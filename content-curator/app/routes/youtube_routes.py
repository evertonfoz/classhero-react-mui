from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import openai
import os
import traceback
import re

router = APIRouter()

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class YouTubeQuery(BaseModel):
    title: str
    description: str

@router.post("/youtube-links")
async def generate_youtube_links(payload: YouTubeQuery):
    try:
        system_prompt = (
            "Você é um especialista em SEO para YouTube. Receba um título e uma descrição de um conteúdo técnico "
            "e gere uma única linha com as palavras-chave otimizadas para busca, SEM repeti-las, focando nos termos "
            "mais relevantes da área de tecnologia e programação. A resposta deve conter apenas os termos em formato de busca, "
            "separados por espaço."
        )

        # 🔹 Prompt em português
        messages_pt = [
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": f"Título: {payload.title}\nDescrição: {payload.description}\n\nResponda em português."
            },
        ]

        # 🔹 Prompt em inglês
        messages_en = [
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": f"Título: {payload.title}\nDescrição: {payload.description}\n\nResponda em inglês."
            },
        ]

        # 🧠 GPT-4 chama separado
        completion_pt = client.chat.completions.create(
            model="gpt-4",
            messages=messages_pt
        )

        completion_en = client.chat.completions.create(
            model="gpt-4",
            messages=messages_en
        )

        query_pt = completion_pt.choices[0].message.content.strip().replace(" ", "+")
        query_en = completion_en.choices[0].message.content.strip().replace(" ", "+")

        return {
            "pt": f"https://www.youtube.com/results?search_query={query_pt}",
            "en": f"https://www.youtube.com/results?search_query={query_en}"
        }

    except Exception as e:
        print("🛑 Erro ao gerar links do YouTube:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
