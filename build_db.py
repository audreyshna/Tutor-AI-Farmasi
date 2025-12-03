# build_db.py — Extract PDF → Chunk → Gemini Embeddings → ChromaDB

import os
from dotenv import load_dotenv
import uuid
from typing import List

# Unstructured untuk ekstraksi PDF
from unstructured.partition.pdf import partition_pdf

# Chroma
import chromadb
from chromadb.config import Settings
from chromadb import PersistentClient

import google.generativeai as genai


# ============================
# KONFIGURASI
# ============================
load_dotenv()
MATERI_DIR = os.getenv("MATERI_DIR", "materi")  # folder PDF
CHROMA_DIR = os.getenv("CHROMA_DIR", "./chroma_db")
COLLECTION_NAME = "materi"

# Gemini config
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_BASE_URL = os.getenv(
    "GEMINI_BASE_URL",
    "https://generativelanguage.googleapis.com/v1beta/openai/"
)
EMBED_MODEL = "gemini-embedding-004"

# ============================
# Chunking generator yang aman
# ============================
MAX_TOKENS = 2000     # ganti 500 atau 600 jika PDF sangat besar
CHUNK_OVERLAP = 300

def approx_token_len(text: str) -> int:
    """Hitung perkiraan token berdasarkan kata"""
    return len(text.split())

def chunk_text_generator(text: str, max_tokens=MAX_TOKENS, overlap=CHUNK_OVERLAP):
    """Membuat potongan teks (chunk) sebagai generator agar hemat memori"""
    words = text.split()
    if not words:
        return

    start = 0
    while start < len(words):
        end = start + max_tokens
        chunk_words = words[start:end]
        yield " ".join(chunk_words)

        # Geser start index untuk overlap
        start = end - overlap
        if start < 0:
            start = 0
        if start >= len(words):
            break

# ============================
# STEP 1: Extract PDF with unstructured
# ============================
def load_pdf_unstructured(path: str):
    print(f"➡️ Memproses PDF via unstructured: {path}")

    elements = partition_pdf(
        filename=path,
        strategy="hi_res",
        infer_table_structure=True,
        extract_images_in_pdf=True,
        language="id"
    )

    pairs = []  # (text, metadata)

    for el in elements:
        text = getattr(el, "text", None)
        if not text:
            continue

        metadata = {}
        try:
            metadata["page_number"] = el.metadata.page_number
        except:
            metadata["page_number"] = None

        metadata["element_type"] = getattr(el, "category", "unknown")

        chunks = chunk_text_generator(text)

        for idx, ch in enumerate(chunk_text_generator(text)):
            md = metadata.copy()
            md["chunk_index"] = idx
            md["source"] = os.path.basename(path)
            pairs.append((ch, md))
    
    for i, el in enumerate(elements):
        if i >= 60:  # hanya 60 elemen pertama
            break
        text = getattr(el, "text", None)
        if text:
            print(f"=== ELEMENT {i+1} ===")
            print(text)
            print("--- END OF ELEMENT ---\n")
        else:
            print(f"=== ELEMENT {i+1} === (tidak ada teks)\n")
    return pairs


# ============================
# STEP 2: Gemini Embeddings (embed_content)
# ============================
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

def embed_with_gemini(texts: List[str], batch_size=100):
    all_embeddings = []

    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]

        res = genai.embed_content(
            model="text-embedding-004",
            content=batch,
            task_type="semantic_similarity"
        )

        all_embeddings.extend(res["embedding"])

        print(f"✔ Batch {i//batch_size + 1} selesai (isi: {len(batch)})")

    return all_embeddings

# ============================
# STEP 3: Save to ChromaDB
# ============================
def save_to_chroma(ids, docs, embeds, metas, batch_size=1000):
    client = PersistentClient(path=CHROMA_DIR)

    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )
    print("📂 Collection siap — menambahkan data baru...")

    # Simpan dalam batch agar tidak boros memori
    for i in range(0, len(ids), batch_size):
        batch_ids = ids[i:i + batch_size]
        batch_docs = docs[i:i + batch_size]
        batch_embeds = embeds[i:i + batch_size]
        batch_metas = metas[i:i + batch_size]

        collection.add(
            ids=batch_ids,
            documents=batch_docs,
            embeddings=batch_embeds,
            metadatas=batch_metas
        )

        print(f"✔ Batch {i // batch_size + 1} selesai ({len(batch_ids)} items)")
    
    print("💾 ChromaDB updated (persist otomatis dengan PersistentClient).")



# ============================
# MAIN: Build collection
# ============================
def build_collection():
    pdf_files = [
        f for f in os.listdir(MATERI_DIR)
        if f.lower().endswith(".pdf")
    ]

    if not pdf_files:
        print("⚠ Tidak ada file PDF ditemukan.")
        return

    all_texts = []
    all_metas = []

    for pdf in pdf_files:
        path = os.path.join(MATERI_DIR, pdf)
        pairs = load_pdf_unstructured(path)

        for text, meta in pairs:
            all_texts.append(text)
            all_metas.append(meta)

    print(f"📄 Total chunk: {len(all_texts)}")
    print("🧠 Mengambil embeddings dari Gemini...")

    embeddings = embed_with_gemini(all_texts)

    ids = [str(uuid.uuid4()) for _ in all_texts]

    print("💾 Menyimpan ke ChromaDB...")
    save_to_chroma(ids, all_texts, embeddings, all_metas)

    print("✅ Selesai membangun database!")


if __name__ == "__main__":
    build_collection()
