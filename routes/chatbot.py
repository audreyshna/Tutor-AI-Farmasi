import re
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

router = APIRouter()

# Injected dependencies (dari app.py)
vectordb = None
MAX_CHARS = None
TOP_K = None
generate_answer_from_context = None

# Daftar pertanyaan meta yang mengacu ke percakapan sebelumnya
META_QUESTIONS = [
    "apa yang baru saya tanyakan?",
    "apa yang baru saya tanyakan",
    "pertanyaan terakhir yang aku tanya apaan",
    "pertanyaan terakhir yang aku tanya apaan?",
    "tadi aku tanya apa?",
    "tadi aku tanya apa",
    "sebelumnya apa yang baru saya tanyakan?",
    "sebelumnya apa yang baru saya tanyakan",
    "apa sebelumnya yang saya tanyakan?",
    "apa sebelumnya yang saya tanyakan",
    "barusan saya nanya apa?",
    "barusan aku nanya apa?",
    "tanya apa aku tadi?",
    "barusan aku nanya apa",
    "tadi aku tanya apaan?",
    "apa itu tadi?",
    "pertanyaan terakhir saya apa?",
    "itu bagaimana?"
]

def get_last_real_question(history):
    """
    Ambil pertanyaan terakhir user yang **bukan meta-question**.
    """
    for h in reversed(history):
        if h["role"] == "user" and h["content"].strip().lower() not in META_QUESTIONS:
            return h["content"]
    return None

def get_last_topic(history):
    for msg in reversed(history):
        if msg["role"] == "user":
            return msg["content"]
    return ""


@router.post("/api/ask")
async def api_ask(request: Request):
    data = await request.json()

    question = data.get("question", "").strip()
    user_id = data.get("user_id")
    session_id = data.get("session_id")
    history = data.get("history", [])

    print("DEBUG history:")
    for h in history:
        print(h)


    last_topic = get_last_topic(history)

    if len(question.split()) <= 3 and last_topic:
        question = f"{last_topic}. {question}"

    if not question:
        return JSONResponse({"error": "Pertanyaan kosong"}, status_code=400)

    if user_id is None:
        return JSONResponse({"error": "user_id wajib ada"}, status_code=400)
    
    # Cek apakah pertanyaan meta (mengacu ke percakapan sebelumnya)
    if question.lower() in META_QUESTIONS:
        last_real_q = get_last_real_question(history)
        if last_real_q:
            return {"answer": f"Pertanyaan terakhir Anda adalah: '{last_real_q}'", "sources": []}
        else:
            return {"answer": "Sepertinya ini pertanyaan pertama Anda, jadi belum ada pertanyaan sebelumnya.", "sources": []}


    # Tambahkan pertanyaan baru ke history
    history = history + [
        {"role": "user", "content": question}
    ]

    # Similarity Search (RAG)
    similar_docs_with_scores = vectordb.similarity_search_with_score(
        question, k=TOP_K
    )

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
    
    if not similar_docs_with_scores and history:
        last_user = [h['content'] for h in reversed(history) if h['role'] == 'user']
        answer = f"Pertanyaan terakhir Anda adalah: '{last_user[0]}'" if last_user else "History kosong"
        return {"answer": answer, "sources": []}

    if not similar_docs_with_scores:
        return {
            "answer": "⚠️ Informasi ini tidak tersedia dalam materi pembelajaran saat ini.",
            "sources": []
        }

    similar_docs_with_scores.sort(key=lambda x: x[1])

    # Ambil context chunks
    context_chunks = []
    total_chars = 0

    for doc, _ in similar_docs_with_scores:
        if total_chars + len(doc.page_content) > MAX_CHARS:
            break
        context_chunks.append(doc.page_content)
        total_chars += len(doc.page_content)

    # Generate Answer (Pakai history)
    answer = generate_answer_from_context(
        question=question,
        context_chunks=context_chunks,
        history=history
    )

    sources = [d.metadata for d, _ in similar_docs_with_scores]

    return {
        "answer": answer,
        "sources": sources
    }