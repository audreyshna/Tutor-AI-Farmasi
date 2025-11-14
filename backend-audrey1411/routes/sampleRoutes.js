import express from "express";
import multer from "multer";
import path from "path";
import { db } from "../db.js";

const router = express.Router();

// === Konfigurasi penyimpanan file ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/samples/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// === Endpoint upload sample ===
router.post("/upload", upload.single("image"), (req, res) => {
  const { sample_name, user_id, test_date, metal_type, concentration } = req.body;

  if (!req.file) return res.status(400).json({ error: "Gambar wajib diupload" });
  if (!sample_name || !user_id || !test_date || !metal_type || !concentration)
    return res.status(400).json({ error: "Data sample belum lengkap" });

  const image_path = `/uploads/samples/${req.file.filename}`;

  const sql = `
    INSERT INTO samples (sample_name, user_id, test_date, metal_type, concentration, image_path)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [sample_name, user_id, test_date, metal_type, concentration, image_path], (err) => {
    if (err) {
      console.error("❌ Gagal menyimpan sample:", err);
      return res.status(500).json({ error: "Gagal menyimpan data sample" });
    }
    res.json({ message: "Sample berhasil diupload", image_path });
  });
});

// === Endpoint ambil semua sample ===
router.get("/", (req, res) => {
  const sql = `
    SELECT s.sample_id, s.sample_name, s.test_date, s.metal_type, s.concentration,
           s.image_path, u.username AS tester
    FROM samples s
    JOIN users u ON s.user_id = u.user_id
    ORDER BY s.test_date DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Gagal mengambil data sample" });
    res.json(results);
  });
});

export default router;