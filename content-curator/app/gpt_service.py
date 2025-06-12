import os
import json
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def extract_keywords(
    text: str,
    max_keywords: int = 5,
    model: str = "gpt-3.5-turbo"
) -> dict:
    extract_prompt = (
        f"Extraia até {max_keywords} palavras-chave relevantes do seguinte texto "
        f"relacionado à programação. Responda apenas com uma lista JSON simples "
        f"(por exemplo: [\"for\", \"while\", \"automatizar tarefas\"]). "
        f"Não use formatação markdown como ``` ou campos como 'palavras-chave'.\n\nTexto:\n{text}"
    )

    translate_prompt = (
        "Traduza as palavras-chave a seguir para o inglês. "
        "Responda apenas com uma lista JSON de palavras ou expressões.\n\n"
    )

    try:
        # Etapa 1: Extração
        response_extract = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "Você é um assistente técnico que responde com listas JSON válidas."},
                {"role": "user", "content": extract_prompt}
            ],
            temperature=0.3
        )

        content = response_extract.choices[0].message.content.strip()
        if content.startswith("```"):
            content = "\n".join(line for line in content.splitlines() if not line.strip().startswith("```"))

        try:
            keywords_pt = json.loads(content)
        except Exception:
            print("Erro ao interpretar lista extraída:", content)
            keywords_pt = [kw.strip("-• ") for kw in content.splitlines() if kw.strip()]

        # Etapa 2: Tradução
        translate_prompt += json.dumps(keywords_pt)
        response_translate = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "Você traduz listas de palavras para o inglês, respondendo com listas JSON simples."},
                {"role": "user", "content": translate_prompt}
            ],
            temperature=0.2
        )

        translated_content = response_translate.choices[0].message.content.strip()
        if translated_content.startswith("```"):
            translated_content = "\n".join(line for line in translated_content.splitlines() if not line.strip().startswith("```"))

        try:
            keywords_en = json.loads(translated_content)
        except Exception:
            print("Erro ao interpretar lista traduzida:", translated_content)
            keywords_en = [kw.strip("-• ") for kw in translated_content.splitlines() if kw.strip()]

        return {
            "pt": keywords_pt,
            "en": keywords_en
        }

    except Exception as e:
        print("Erro ao extrair ou traduzir palavras-chave:", e)
        return {"pt": [], "en": []}
