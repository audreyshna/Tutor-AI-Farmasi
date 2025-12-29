import os
from utils.gemini_client import generate_embedding
from langchain_chroma import Chroma

# CONFIG
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROMA_DIR = os.path.join(BASE_DIR, "backend", "chroma_db")
COLLECTION_NAME = "materi"

# EMBEDDING WRAPPER
class GeminiEmbeddingWrapper:
    def embed_documents(self, texts):
        return [generate_embedding(t) for t in texts]

    def embed_query(self, text):
        return generate_embedding(text)

embedding_model = GeminiEmbeddingWrapper()

# VECTOR DB (GLOBAL INSTANCE)
vectordb = Chroma(
    collection_name=COLLECTION_NAME,
    persist_directory=CHROMA_DIR,
    embedding_function=embedding_model
)
