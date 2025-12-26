import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from services.vectorstore import vectordb
from utils.gemini_client import generate_answer_from_context
from routes import chatbot, predict

# ==========================
# CONFIG
# ==========================
MAX_CHARS = 15000
TOP_K = 30

# ==========================
# APP INIT
# ==========================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
# INJECT DEPENDENCY
# ==========================
chatbot.vectordb = vectordb
chatbot.MAX_CHARS = MAX_CHARS
chatbot.TOP_K = TOP_K
chatbot.generate_answer_from_context = generate_answer_from_context
chatbot.chat_sessions = {}

# ==========================
# REGISTER ROUTER
# ==========================
app.include_router(chatbot.router)
app.include_router(predict.router)
    
# MAIN RUNNER (UNTUK UVICORN)
# Jalankan dengan: uvicorn app:app --reload --port 5001
