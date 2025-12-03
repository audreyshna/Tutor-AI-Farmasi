# process_single.py
import sys
import os
import uuid
from dotenv import load_dotenv
from unstructured.partition.pdf import partition_pdf
import chromadb
from chromadb import PersistentClient
import google.generativeai as genai

load_dotenv()

CHROMA_DIR = os.getenv("CHROMA_DIR", "./chroma_db")
COLLECTION_NAME = "materi"

# ambil argumen path PDF
pdf_path = sys.argv[1]
print("process_single.py STARTED")

def chunk_text(text, max_tokens=2000, overlap=300):
    words = text.split()
    start = 0
    while start < len(words):
        end = start + max_tokens
        yield " ".join(words[start:end])
        start = end - overlap

def load_pdf(path):
    elements = partition_pdf(
        filename=path,
        strategy="hi_res",
        infer_table_structure=True,
        extract_images_in_pdf=True,
        language="id"
    )

    chunks = []
    metas = []

    for el in elements:
        text = getattr(el, "text", None)
        if not text:
            continue

        meta = {
            "page": getattr(el.metadata, "page_number", None),
            "source": os.path.basename(path),
        }

        for idx, ch in enumerate(chunk_text(text)):
            m = meta.copy()
            m["chunk_idx"] = idx

            chunks.append(ch)
            metas.append(m)

    return chunks, metas

def embed_texts(texts):
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
    res = genai.embed_content(
        model="text-embedding-004",
        content=texts,
        task_type="semantic_similarity"
    )
    return res["embedding"]

def save_to_chroma(ids, docs, embeds, metas):
    client = PersistentClient(path=CHROMA_DIR)
    col = client.get_or_create_collection(COLLECTION_NAME)

    col.add(
        ids=ids,
        documents=docs,
        embeddings=embeds,
        metadatas=metas
    )

# RUN
texts, metas = load_pdf(pdf_path)
emb = embed_texts(texts)
ids = [str(uuid.uuid4()) for _ in texts]

save_to_chroma(ids, texts, emb, metas)

print("OK: PDF processed and saved to ChromaDB")
