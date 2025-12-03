import os
import re
import joblib
import numpy as np
from dotenv import load_dotenv
load_dotenv()
from PIL import Image
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import UploadFile, File, Form
from utils.gemini_client import generate_answer_from_context, generate_embedding

from langchain_chroma import Chroma


# KONFIGURASI
CHROMA_DIR = os.getenv("CHROMA_DIR", "./chroma_db")
COLLECTION_NAME = "materi"
MAX_CHARS = 15000
TOP_K = 30
UPLOAD_DIR = "./uploads/samples"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# APP INITIALIZATION
app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
#  USE GEMINI EMBEDDING (768d)
# ==========================

class GeminiEmbeddingWrapper:
    """Supaya bisa dipakai sebagai embedding_function di Chroma LangChain."""
    def embed_documents(self, texts):
        return [generate_embedding(t) for t in texts]

    def embed_query(self, text):
        return generate_embedding(text)

embedding_model = GeminiEmbeddingWrapper()

# Vectorstore
vectordb = Chroma(
    collection_name=COLLECTION_NAME,
    persist_directory=CHROMA_DIR,
    embedding_function=embedding_model
)

def extract_rgb(pil_image, sample_size=50):
    """Ambil area cairan di bagian bawah tengah gambar."""
    w, h = pil_image.size
    cx, cy = w // 2, int(h * 0.75)
    half = sample_size // 2
    crop = pil_image.crop((cx - half, cy - half, cx + half, cy + half))
    arr = np.array(crop)
    mean_rgb = arr.reshape(-1, 3).mean(axis=0)
    return [int(x) for x in mean_rgb]


def predict_concentration_full(rgb, test_type):
    """Prediksi konsentrasi tembaga/ besi."""
    try:
        model_path = f"models/model_{'fe' if test_type.lower() == 'besi' else 'cu'}.pkl"
        model = joblib.load(model_path)

        r, g, b = rgb
        total = r + g + b if (r + g + b) != 0 else 1

        r_norm = r / total
        g_norm = g / total
        b_norm = b / total

        r_g_ratio = r / (g + 1)
        r_b_ratio = r / (b + 1)
        g_b_ratio = g / (b + 1)

        features = np.array([[r, g, b,
                              r_norm, g_norm, b_norm,
                              r_g_ratio, r_b_ratio, g_b_ratio]], dtype=float)

        pred = model.predict(features)[0]
        return round(float(pred), 3)

    except Exception as e:
        raise Exception(f"Error prediksi: {str(e)}")


def evaluate_safety(conc, test_type):
    """Evaluasi aman/tidak aman berdasarkan ambang batas."""
    thresholds = {
        'tembaga': 2.0,
        'besi': 0.3
    }
    thr = thresholds.get(test_type, 1.0)
    return "AMAN" if conc <= thr else "TIDAK AMAN"

chat_sessions = {}

# API: ASK QUESTION
@app.post("/api/ask")
async def api_ask(request: Request):
    data = await request.json()
    question = data.get("question", "").strip()
    session_id = data.get("session_id")
    user_id = data.get("user_id")

    if not question:
        return JSONResponse({"error": "Pertanyaan kosong"}, status_code=400)
    
    if user_id is None:
        return JSONResponse({"error": "user_id wajib ada"}, status_code=400)
    
    if session_id not in chat_sessions:
        chat_sessions[session_id] = []
    
    chat_sessions[session_id].append({"role": "user", "content": question})
    history = chat_sessions[session_id]

    # Cari chunk paling relevan
    similar_docs_with_scores = vectordb.similarity_search_with_score(question, k=TOP_K)

    # Fallback kalau kosong
    if not similar_docs_with_scores:
        keywords = " ".join(re.findall(r"\b[a-zA-Z]+\b", question))
        semantic_query = (
            f"Penjelasan atau definisi tentang {keywords}"
            if len(keywords.split()) <= 4
            else keywords
        )

        similar_docs_with_scores = vectordb.similarity_search_with_score(
            semantic_query, k=TOP_K
        )

    if not similar_docs_with_scores:
        return JSONResponse({
            "answer": "Informasinya tidak tersedia dalam materi ini.",
            "sources": []
        })

    # Menggabungkan konteks
    context_chunks = []
    total_chars = 0
    for doc, score in similar_docs_with_scores:
        if total_chars + len(doc.page_content) > MAX_CHARS:
            break
        context_chunks.append(doc.page_content)
        total_chars += len(doc.page_content)

    # Generate jawaban
    answer = generate_answer_from_context(question, context_chunks, history=history)
    sources = [d.metadata for d, _ in similar_docs_with_scores]

    chat_sessions[session_id].append({"role": "assistant", "content": answer})

    return {
        "answer": answer,
        "sources": sources,
        "distances": None
    }

@app.post("/api/predict")
async def api_predict(
    file: UploadFile = File(...),
    test_type: str = Form("besi")  # "besi" atau "tembaga"
):
    try:
        # Simpan gambar
        filepath = os.path.join(UPLOAD_DIR, file.filename)
        with open(filepath, "wb") as f:
            f.write(await file.read())

        # Proses gambar
        img = Image.open(filepath).convert("RGB")
        rgb = extract_rgb(img)

        # Prediksi
        conc = predict_concentration_full(rgb, test_type)
        status = evaluate_safety(conc, test_type)

        return {
            "rgb": rgb,
            "concentration_mg_per_L": conc,
            "status": status
        }

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
    
# MAIN RUNNER (UNTUK UVICORN)
# Jalankan dengan: uvicorn app:app --reload --port 5001
