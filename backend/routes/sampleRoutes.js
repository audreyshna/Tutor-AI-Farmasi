import express from "express";
import multer from "multer";
import path from "path";
import { db } from "../db.js";
import fs from "fs";
import FormData from "form-data";
import axios from "axios";

const router = express.Router();

// Konfigurasi penyimpanan file
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

// Endpoint analisis sample
router.post("/analyze", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Gambar wajib diupload" });
    }

    const fastApiUrl = "http://localhost:5001/api/predict";
    const formData = new FormData();
    formData.append("file", fs.createReadStream(req.file.path));
    formData.append("test_type", req.body.metal_type.toLowerCase());

    const predictResp = await axios.post(fastApiUrl, formData, {
      headers: formData.getHeaders(),
    });

    const { rgb, concentration_mg_per_L, status } = predictResp.data;

    res.json({
      rgb,
      concentration: concentration_mg_per_L,
      status,
    });
  } catch (err) {
    console.error("ANALYZE ERROR:", err);
    res.status(500).json({ error: "Gagal analisis sample" });
  }
});

// Endpoint save sample
router.post("/save", upload.single("image"), async (req, res) => {
  try {
    const { sample_name, user_id, test_date, metal_type, concentration } = req.body;

    if (!req.file) return res.status(400).json({ error: "Gambar wajib diupload" });
    if (!sample_name || !user_id || !test_date || !metal_type)
      return res.status(400).json({ error: "Data sample belum lengkap" });

    const image_path = `/uploads/samples/${req.file.filename}`;

    const sql = `INSERT INTO samples (sample_name, user_id, test_date, metal_type, concentration, image_path)
                 VALUES (?, ?, ?, ?, ?, ?)`;

    await db.query(sql, [sample_name, user_id, test_date, metal_type, concentration, image_path]);

    res.json({ message: "Sample berhasil diupload" });
  } catch (err) {
    console.error("❌ Gagal menyimpan sample:", err);
    res.status(500).json({ error: "Gagal menyimpan data sample" });
  }
});

// Endpoint ambil semua sample
router.get("/", async (req, res) => {
  try {
    const { user_id } = req.query;

    let sql = `
      SELECT s.sample_id, s.sample_name, s.test_date, s.metal_type, s.concentration,
             s.image_path, u.username AS tester
      FROM samples s
      JOIN users u ON s.user_id = u.user_id
    `;

    const params = [];

    if (user_id) {
      sql += " WHERE s.user_id = ?";
      params.push(user_id);
    }

    sql += " ORDER BY s.test_date DESC";

    const [results] = await db.query(sql, params);
    res.json(results);
  } catch (err) {
    console.error("GET SAMPLES ERROR:", err);
    res.status(500).json({ error: "Gagal mengambil data sample" });
  }
});

export default router;