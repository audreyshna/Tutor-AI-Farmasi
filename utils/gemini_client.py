import os
import re
import google.generativeai as genai

# KONFIGURASI GEMINI API
_api_key = os.getenv("GEMINI_API_KEY")
if _api_key:
    genai.configure(api_key=_api_key)
else:
    print("GEMINI_API_KEY tidak ditemukan di environment variables.")

# Variabel global untuk menyimpan pertanyaan terakhir (konteks percakapan)
_last_question = None

def generate_embedding(text: str):
    """
    Menghasilkan embedding 768 dimensi menggunakan model Gemini text-embedding-004.
    Dipakai oleh build_db.py dan app.py.
    """
    try:
        response = genai.embed_content(
            model="text-embedding-004",
            content=text
        )
        return response["embedding"]  # hasil vektor 768 dimensi
    except Exception as e:
        print("❌ Error generate_embedding:", e)
        return [0.0] * 768   # fallback aman (tidak error saat add ke Chroma)

def _normalize_question(question: str) -> str:
    """
    Membersihkan pertanyaan dari kata-kata tambahan seperti 'itu apa', 'apa itu', atau 'jelaskan tentang'.
    """
    q = question.lower().strip()
    # Hilangkan frasa umum yang membuat embedding tidak akurat
    q = re.sub(r"\b(itu apa|apa itu|jelaskan tentang|apa yang dimaksud dengan|apa saja)\b", "", q)
    q = q.strip(" ?")
    return q


def generate_answer_from_context(question: str, context_chunks: list, history=None, model: str = "gemini-2.0-flash") -> str:
    if history is None:
        history = []

    """
    Menghasilkan jawaban berdasarkan konteks teks menggunakan model Gemini,
    dengan dukungan normalisasi pertanyaan dan konteks percakapan.
    """
    global _last_question

    # Simpan versi asli pertanyaan
    original_question = question.strip()

    # Normalisasi pertanyaan
    normalized_question = _normalize_question(original_question)

    # Jika user bertanya "itu apa" dan tidak menyebut kata baru, gunakan konteks pertanyaan sebelumnya
    if normalized_question == "" and _last_question:
        normalized_question = _last_question

    # Tambahkan debugging untuk melihat potongan konteks
    print("\n=== DEBUGGING: KONTEN KONTEKS ===")
    for i, chunk in enumerate(context_chunks[:2]):  # tampilkan 2 chunk pertama saja
        print(f"Chunk {i+1}:\n{chunk[:500]}\n---")
    print("=== END OF KONTEN KONTEKS ===\n")

    # Gabungkan semua potongan konteks
    context_text = "\n\n---\n\n".join(context_chunks)

    # Simpan pertanyaan saat ini sebagai konteks untuk pertanyaan berikutnya
    _last_question = normalized_question

    role_map = {
    "user": "Mahasiswa",
    "assistant": "Asisten"
    }

    history_text = ""
    for h in history:
        label = role_map.get(h["role"], h["role"])
        history_text += f"{label}: {h['content']}\n"
    
    # Prompt untuk model
    prompt = f"""
Kamu adalah **asisten pembelajaran farmasi profesional**, 
yang memiliki keahlian mendalam dalam bidang **titrasi** dan konsep-konsep analisis kimia dasar di laboratorium farmasi.  
Peranmu adalah menjawab pertanyaan mahasiswa berdasarkan konteks materi di bawah ini.

**Tugasmu:**
1. Jawab **hanya berdasarkan konteks** dari materi yang diberikan di bawah (hasil dari database).  
2. Jika informasi tidak ditemukan di konteks, berikan jawaban:
   *"Informasinya tidak tersedia dalam materi ini."*
3. Jika mahasiswa bertanya **di luar topik titrasi atau farmasi**, jawab dengan sopan:
   *"Saya hanya dapat membantu menjawab pertanyaan seputar titrasi dan bidang farmasi."*
4. Kamu boleh **menyempurnakan kalimat jawaban** menggunakan pengetahuan umummu tentang farmasi, 
   tetapi **tidak boleh menambahkan informasi baru yang tidak relevan dengan konteks**.
5. Gunakan bahasa yang **ilmiah namun mudah dipahami oleh mahasiswa**.
6. Jangan menampilkan isi konteks mentah dan jelaskan dengan gaya pengajar yang ramah dan rapi.

RIWAYAT PERCAKAPAN:
{history_text}

KONTEKS:
{context_text}

PERTANYAAN:
{normalized_question}

**JAWABAN YANG DIHARAPKAN:**
- Jelas, padat, dan berdasarkan konteks.
- Gunakan bahasa Indonesia formal tapi komunikatif.
- Hindari spekulasi atau jawaban di luar konteks.
"""

    try:
        model_instance = genai.GenerativeModel(model)

        response = model_instance.generate_content(
            prompt,
            generation_config={
                "temperature": 0.2, 
                "top_p": 0.3,
                "region": "us-central1"
            }
        )

        return response.text.strip()

    except Exception as e:
        try:
            response = model_instance.generate_content(prompt)
            return response.text.strip()
        except Exception as inner_e:
            return f"⚠️ Terjadi error saat generate: {inner_e}"
