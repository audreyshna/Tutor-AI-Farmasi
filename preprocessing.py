import os
import re
import json
import pandas as pd
from docling import DocumentConverter

# ====== Folder ======
input_folder = r"C:/KULIAH/Semester 5/magang/last chatbot/backend/uploads/materials" # PDF mentah
output_folder = "materi" # JSONL hasil preprocessing

os.makedirs(output_folder, exist_ok=True)

# Ambil semua file PDF di folder raw_materi
pdf_files = [f for f in os.listdir(input_folder) if f.lower().endswith(".pdf")]

for idx, pdf_file in enumerate(pdf_files, start=1):
    pdf_path = os.path.join(input_folder, pdf_file)
    print(f"📄 Memproses: {pdf_file} ...")

    # === 2. Konversi PDF pakai DocLings ===
    converter = DocumentConverter()
    try:
        result = converter.convert(pdf_path)
    except Exception as e:
        print(f"⚠️ Gagal konversi PDF {pdf_file}: {e}")
        continue

    # === 3. Ambil teks utama, tabel, dan gambar ===
    text_content = ""
    try:
        text_content = result.document.export_to_text()
    except Exception as e:
        print("⚠️ Gagal ekstrak teks:", e)

    table_content = ""
    if hasattr(result.document, "tables") and result.document.tables:
        try:
            table_content = "\n\n".join(
                [tbl.export_to_markdown() for tbl in result.document.tables]
            )
        except Exception as e:
            print("⚠️ Gagal ekstrak tabel:", e)

    figure_content = ""
    if hasattr(result.document, "figures") and result.document.figures:
        try:
            figure_content = "\n".join(
                [fig.caption for fig in result.document.figures if getattr(fig, "caption", None)]
            )
        except Exception as e:
            print("⚠️ Gagal ekstrak gambar:", e)

    # === 4. Gabungkan semua hasil ekstraksi ===
    combined_text = "\n\n".join([text_content, table_content, figure_content]).strip()

    # === 5. Preprocessing teks ===
    def clean_text(text):
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'[^\w\s.,;:!?()-]', '', text)
        return text.strip()

    cleaned_text = clean_text(combined_text)
    formatted_text = f"passage: {cleaned_text}"

    # === 6. Simpan ke JSONL ===
    jsonl_filename = os.path.splitext(pdf_file)[0] + ".jsonl"  # contoh: materi1.pdf -> materi1.jsonl
    jsonl_path = os.path.join(output_folder, jsonl_filename)

    with open(jsonl_path, "w", encoding="utf-8") as f:
        json.dump({"id": str(idx), "text": formatted_text}, f, ensure_ascii=False)
        f.write("\n")

    print(f"✅ Hasil preprocessing {pdf_file} disimpan di: {jsonl_path}")

print("🎉 Semua PDF di raw_materi selesai diproses!")
