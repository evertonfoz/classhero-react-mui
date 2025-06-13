from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.youtube_routes import router as youtube_router
from app.routes.quiz_routes import router as quiz_router


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(youtube_router)
app.include_router(quiz_router)
