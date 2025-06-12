from typing import List, Union
from datetime import datetime, timedelta
import httpx
import os

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
BASE_URL = "https://www.googleapis.com/youtube/v3/search"

async def search_videos(keywords_by_lang: dict, max_results: int = 3) -> Union[List[dict], dict]:
    videos = []
    region = "BR"
    relevance_language = "pt"
    published_after = (datetime.utcnow() - timedelta(days=365)).isoformat("T") + "Z"

    all_keywords = keywords_by_lang.get("pt", []) + keywords_by_lang.get("en", [])

    async with httpx.AsyncClient() as client:
        for keyword in all_keywords:
            params = {
                "part": "snippet",
                "q": keyword,
                "type": "video",
                "key": YOUTUBE_API_KEY,
                "maxResults": max_results,
                "order": "viewCount",
                "regionCode": region,
                "relevanceLanguage": relevance_language,
                "videoCaption": "any",
                "publishedAfter": published_after
            }

            try:
                response = await client.get(BASE_URL, params=params)
                data = response.json()

                # ❗ Se a resposta contém erro
                if "error" in data:
                    error = data["error"]
                    reason = error.get("errors", [{}])[0].get("reason", "")
                    if reason == "quotaExceeded":
                        return {
                            "error": "quota_exceeded",
                            "message": "A cota da API do YouTube foi excedida. Tente novamente mais tarde."
                        }
                    return {
                        "error": "youtube_api_error",
                        "message": error.get("message", "Erro desconhecido da API do YouTube.")
                    }

                items = data.get("items", [])

                if not items:
                    print(f"Nenhum vídeo encontrado para '{keyword}' com filtros. Tentando sem restrições.")
                    params.pop("regionCode", None)
                    params.pop("relevanceLanguage", None)
                    params.pop("publishedAfter", None)
                    response = await client.get(BASE_URL, params=params)
                    data = response.json()
                    items = data.get("items", [])

                for item in items:
                    video = {
                        "title": item["snippet"]["title"],
                        "channel": item["snippet"]["channelTitle"],
                        "publishedAt": item["snippet"]["publishedAt"],
                        "url": f"https://www.youtube.com/watch?v={item['id']['videoId']}"
                    }
                    videos.append(video)

            except Exception as e:
                print(f"Erro ao buscar vídeos para '{keyword}': {e}")

    return videos[:max_results]
