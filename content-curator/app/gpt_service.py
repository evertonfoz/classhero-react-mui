import os
import openai
import httpx

openai.api_key = os.getenv("OPENAI_API_KEY")

async def extract_keywords(text: str, max_keywords: int = 5) -> list[str]:
    prompt = (
        f"Extraia até {max_keywords} palavras-chave relevantes do seguinte texto "
        f"relacionado à programação. Responda em formato de lista JSON:\n\n{text}"
    )

    try:
        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "Você é um assistente educacional que extrai palavras-chave técnicas."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )

        content = response.choices[0].message.content.strip()

        # Tenta interpretar como lista JSON simples
        import json
        keywords = json.loads(content)
        if isinstance(keywords, list):
            return keywords

        # Se não for lista, tenta separar por linha
        return [kw.strip("-• ") for kw in content.splitlines() if kw.strip()]

    except Exception as e:
        print("Erro ao extrair palavras-chave com GPT:", e)
        return []
