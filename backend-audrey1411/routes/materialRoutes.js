import express from "express";
import multer from "multer";
import path from "path";
import { db } from "../db.js";

const router = express.Router();

// === konfigurasi penyimpanan file ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/materials/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// === endpoint upload materi (hanya untuk admin) ===
router.post("/upload", upload.single("file"), (req, res) => {
  const { title, user_id } = req.body;
  const filePath = `/uploads/materials/${req.file.filename}`;

  if (!title || !user_id || !req.file) {
    return res.status(400).json({ error: "Semua data wajib diisi" });
  }

  const sql = "INSERT INTO materials (title, user_id, file_path) VALUES (?, ?, ?)";
  db.query(sql, [title, user_id, filePath], (err) => {
    if (err) {
      console.error("❌ Upload error:", err);
      return res.status(500).json({ error: "Gagal menyimpan materi" });
    }
    res.json({ message: "✅ Materi berhasil diupload", file_path: filePath });
  });
});

// === endpoint ambil semua materi ===
router.get("/", (req, res) => {
  const sql = `
    SELECT m.material_id AS id, m.title, m.file_path, m.uploaded_At AS uploaded_at, 
            u.username AS uploader
    FROM materials m
    JOIN users u ON m.user_id = u.user_id
    ORDER BY m.uploaded_At DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Gagal mengambil data materi" });
    res.json(results);
  });
});

export default router;