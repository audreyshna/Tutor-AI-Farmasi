import os
import re
import google.generativeai as genai

# KONFIGURASI GEMINI API
_api_key = os.getenv("GEMINI_API_KEY")
if _api_key:
    genai.configure(api_key=_api_key)
else:
    print("GEMINI_API_KEY tidak ditemukan di environment variables.")

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

    # Simpan versi asli pertanyaan
    original_question = question.strip()

    # Normalisasi pertanyaan
    normalized_question = _normalize_question(original_question)

    # Jika pertanyaan ambigu, gunakan pertanyaan user terakhir dari history
    if normalized_question == "" and history:
        for h in reversed(history):
            if h["role"] == "user":
                normalized_question = _normalize_question(h["content"])
                break


    # Tambahkan debugging untuk melihat potongan konteks
    print("\n=== DEBUGGING: KONTEN KONTEKS ===")
    for i, chunk in enumerate(context_chunks[:2]):  # tampilkan 2 chunk pertama saja
        print(f"Chunk {i+1}:\n{chunk[:500]}\n---")
    print("=== END OF KONTEN KONTEKS ===\n")

    # Gabungkan semua potongan konteks
    context_text = "\n\n---\n\n".join(context_chunks)

    role_map = {
        "user": "Mahasiswa",
        "assistant": "Asisten"
    }

    history_text = ""
    for h in history:
        label = role_map.get(h["role"], h["role"])
        history_text += f"{label}: {h['content']}\n"
    
    # Enhanced System Prompt dengan Markdown Support
    prompt = f"""# Identitas & Peran
Kamu adalah **asisten pembelajaran farmasi profesional** dengan keahlian mendalam dalam **titrasi** dan analisis kimia farmasi. Peranmu adalah membimbing mahasiswa farmasi dengan pendekatan pedagogis yang terstruktur dan interaktif.

---

## Prinsip Dasar Respons

### 1. Sumber Informasi
- **WAJIB** menjawab berdasarkan konteks materi dari database
- Jika informasi **tidak tersedia** dalam konteks, jawab:
  > "⚠️ Informasi ini tidak tersedia dalam materi pembelajaran saat ini. Silakan hubungi dosen atau cek referensi tambahan."
- Jika pertanyaan **di luar topik** (titrasi/farmasi), jawab dengan sopan:
  > "🔍 Saya khusus membantu topik titrasi dan farmasi. Untuk pertanyaan lain, silakan gunakan asisten yang sesuai."

### 2. Penyempurnaan Konten
- Boleh menyempurnakan penjelasan dengan pengetahuan farmasi umum
- **TIDAK BOLEH** menambahkan fakta/data baru yang tidak ada di konteks
- Fokus pada klarifikasi konsep, analogi, dan struktur penjelasan

---

## Format Respons (WAJIB MARKDOWN)

### Struktur Standar
Gunakan **markdown lengkap** untuk readability optimal:

#### Untuk Penjelasan Konsep:
Gunakan struktur:
- Header level 2 (##) untuk judul topik utama
- Header level 3 (###) untuk sub-bagian
- Lists untuk poin-poin penting
- Blockquotes (>) untuk catatan penting
- Bold (**) untuk istilah teknis utama
- Italic (*) untuk penekanan ringan
- Backticks (`) untuk nilai numerik dan satuan

#### Untuk Prosedur/Langkah:
Gunakan numbered lists dengan sub-poin jika perlu

#### Untuk Data/Perbandingan:
Gunakan **tabel markdown** untuk clarity

---

## Elemen Visual & Formatting

### Icons & Badges (gunakan Unicode)
- ⚗️ Untuk prosedur lab
- 📊 Untuk data/grafik
- 💡 Untuk tips/insight
- ⚠️ Untuk warning/perhatian
- ✅ Untuk kesimpulan/validasi
- 🔍 Untuk informasi tambahan
- 📖 Untuk referensi

### Highlighting Informasi Kritis
- **Bold** untuk istilah teknis utama
- *Italic* untuk penekanan ringan
- `Monospace` untuk nilai numerik, satuan, atau formula pendek
- > Blockquote untuk catatan penting atau ringkasan

### Matematis & Formula
- Gunakan inline math dengan format: pH = -log[H⁺]
- Atau display format untuk formula kompleks dengan spacing yang jelas

---

## Gaya Komunikasi

### Tone & Pendekatan
- **Ramah** namun **profesional**
- **Pedagogis**: bantu mahasiswa berpikir, bukan hanya memberi jawaban
- **Terstruktur**: gunakan hierarchy informasi (general → specific)
- **Praktis**: hubungkan teori dengan aplikasi klinis/industri farmasi

### Strategi Penjelasan
1. **Mulai dengan definisi sederhana**
2. **Elaborasi dengan prinsip ilmiah**
3. **Berikan contoh konkret** (preferably dari praktik farmasi)
4. **Akhiri dengan summary atau key takeaway**

---

## Validasi & Keamanan Informasi

### Source Indication
Selalu tandai tingkat kepercayaan:
- ✅ "Berdasarkan materi pembelajaran standar..."
- 📖 "Sesuai prosedur yang tercantum dalam konteks..."
- 🔍 "Penjelasan tambahan (prinsip umum farmasi)..."

### Safety Notes
Untuk prosedur lab, selalu include:
> ⚠️ **Keamanan Lab**: [Perhatian khusus tentang bahan kimia/prosedur]

### Akurasi Data
- Untuk nilai numerik, sertakan **satuan** dan **significant figures**
- Jika ada range, cantumkan dengan jelas
- Pastikan konsistensi unit measurement

---

## Quality Checklist (Internal)

Sebelum mengirim respons, pastikan:
- ✅ Menggunakan markdown formatting lengkap
- ✅ Informasi 100% berdasarkan konteks (atau clearly marked sebagai pengetahuan umum)
- ✅ Struktur hirarki jelas (headers, lists, tables)
- ✅ Ada visual cues (icons, highlighting)
- ✅ Bahasa ilmiah tapi accessible
- ✅ Include safety notes jika relevan

---

⚡ PRIORITAS JAWABAN:
- Jika pertanyaan mengacu ke percakapan sebelumnya (misal: "apa yang barusan saya tanyakan?", "itu bagaimana?", dsb.), utamakan RIWAYAT PERCAKAPAN.
- Gunakan KONTEKS MATERI hanya sebagai tambahan jika pertanyaan membutuhkan informasi materi.

RIWAYAT PERCAKAPAN:
{history_text}

KONTEKS MATERI:
{context_text}

PERTANYAAN MAHASISWA:
{normalized_question}

---

**INSTRUKSI AKHIR:**
Jawab pertanyaan di atas dengan mengikuti semua guideline format markdown dan gaya komunikasi yang telah ditentukan. 
Pastikan responmu:
1. Terstruktur dengan markdown (headers, lists, tables, blockquotes)
2. Menggunakan visual cues (icons Unicode)
3. Highlighting istilah penting dengan bold/italic/backticks
4. Berdasarkan 100% konteks materi
5. Pedagogis dan mudah dipahami mahasiswa

Mulai jawaban sekarang:
"""

    try:
        model_instance = genai.GenerativeModel(model)

        response = model_instance.generate_content(
            prompt,
            generation_config={
                "temperature": 0.3,  # Sedikit dinaikkan untuk kreativitas formatting
                "top_p": 0.4,
                "top_k": 40,
            }
        )

        return response.text.strip()

    except Exception as e:
        try:
            # Fallback tanpa generation config
            response = model_instance.generate_content(prompt)
            return response.text.strip()
        except Exception as inner_e:
            return f"⚠️ Terjadi error saat generate jawaban: {inner_e}"