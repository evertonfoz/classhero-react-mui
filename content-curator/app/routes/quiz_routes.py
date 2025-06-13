from fastapi import APIRouter, HTTPException, UploadFile, File
import openai
import os
import traceback
import PyPDF2
import json
import re

router = APIRouter()
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    try:
        import io
        reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text
    except Exception as e:
        print("Erro ao extrair texto do PDF:", e)
        return ""

def build_gpt_prompt(texto_pdf):
    return f"""
Você é um gerador de quizzes gamificados para materiais didáticos.
Receba o texto abaixo, extraído de um PDF, e crie:

- Um título para o quiz (máx. 80 caracteres)
- Uma descrição do quiz (máx. 200 caracteres)
- Gere **exatamente 20 perguntas** bem distribuídas e variadas, equilibrando entre os tipos abaixo, de acordo com o conteúdo do PDF. Evite sobreposição de tema.
    1. multiple_choice  (múltipla escolha, 1 correta)
    2. multiple_select  (múltipla seleção, 2 ou mais corretas)
    3. true_false       (Verdadeiro ou Falso)
    4. fill_in_blank    (Complete a lacuna)
    5. matching         (Associação de pares)
    6. ordering         (Ordenação/sequência)
    7. short_answer     (Resposta curta, 1-3 palavras)

Para cada conteúdo possível do PDF, gere perguntas **sem sobreposição de assunto**, utilizando todos os tipos possíveis, variando ao máximo.  
Se algum tipo não for aplicável para algum conteúdo, use múltipla escolha como alternativa.

Para cada pergunta, siga este formato:
- "question_id": uuid fictício
- "type": um dos tipos acima (em inglês)
- "level": básico, intermediário, avançado
- "question": enunciado claro
- "options": array de objetos {{label, text, is_correct, explanation}} para tipos aplicáveis
- "correct_answers": array (ex: ["A"], ["A","C"], ["verdadeiro"], ["palavra"], ["item1","item2"])
- "guidance_on_error": orientação de pesquisa em caso de erro
- "guidance_on_success": sugestão de aprofundamento em caso de acerto
- "times_used": 0
- "status": "draft"
- "extra": objeto opcional para detalhes do tipo (ex: pares para matching, sequência correta para ordering, texto de referência para blank, etc.)

**Responda apenas com o JSON** nesta estrutura (sem explicações, sem comentários, sem texto extra):
{{
  "title": "...",
  "description": "...",
  "questions": [ ... ]
}}

Texto do PDF:
{texto_pdf}
"""

def try_json_load(raw):
    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        print("⚠️ JSONDecodeError: tentando corrigir JSON bruto...")
        # Corrige vírgulas antes de colchete/fecha chave
        fixed = re.sub(r',(\s*[\]}])', r'\1', raw)
        # Remove \r
        fixed = fixed.replace('\r', '')
        try:
            return json.loads(fixed)
        except Exception as e2:
            # Salva o raw para inspeção manual
            with open("/tmp/quiz_raw_error.json", "w") as f:
                f.write(raw)
            print("❌ Falha ao decodificar JSON. Resposta bruta salva em /tmp/quiz_raw_error.json")
            return None

@router.post("/generate-quiz")
async def generate_quiz(file: UploadFile = File(...)):
    print(f"🔔 [generate-quiz] Arquivo recebido: {file.filename}")

    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="O arquivo deve ser um PDF.")

    try:
        pdf_bytes = await file.read()
        texto_pdf = extract_text_from_pdf(pdf_bytes)
        print(f"📄 Texto extraído do PDF ({len(texto_pdf)} caracteres). Primeiras linhas:\n{texto_pdf[:300]}")

        if not texto_pdf.strip():
            raise HTTPException(status_code=422, detail="Não foi possível extrair texto do PDF.")

        prompt = build_gpt_prompt(texto_pdf)
        print(f"🤖 Enviando prompt ao GPT. Tamanho do prompt: {len(prompt)} caracteres.")

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "Você é um gerador de quizzes gamificados para materiais didáticos."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=8192  # Aumente conforme necessário, mas depende do seu plano OpenAI!
        )
        raw = response.choices[0].message.content.strip()

        # Força o GPT a responder somente o JSON, mas ainda assim protege para resposta fora do padrão
        first_brace = raw.find('{')
        last_brace = raw.rfind('}')
        if first_brace != -1 and last_brace != -1:
            raw = raw[first_brace:last_brace + 1]

        print("✅ Resposta recebida do GPT-4o. Tamanho:", len(raw))

        # Tenta carregar o JSON, com fallback para correção
        data = try_json_load(raw)
        if not data:
            raise Exception("Erro ao decodificar JSON do GPT. Verifique /tmp/quiz_raw_error.json.")

        print(f"🎯 Quiz gerado com {len(data.get('questions',[]))} perguntas.")

        if "description" in data:
            data["description"] = data["description"][:200]
        return data

    except Exception as e:
        print("🛑 Erro ao gerar quiz:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao gerar quiz: {str(e)}")
