import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { db } from "../db.js";

const router = express.Router();

/* Config Upload PDF */
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

/* Upload Materi */
router.post("/upload", upload.single("file"), async (req, res) => {
  const { title, user_id } = req.body;

  if (!title || !user_id || !req.file) {
    return res.status(400).json({ error: "Semua data wajib diisi" });
  }

  const filePath = `uploads/materials/${req.file.filename}`;

  try {
    // simpan ke DB
    await db.query(
      "INSERT INTO materials (title, user_id, file_path) VALUES (?, ?, ?)",
      [title, user_id, filePath]
    );

    // jalankan proses embedding (python)
    const absolutePdfPath = path.join(process.cwd(), filePath);
    const scriptPath = path.join(process.cwd(), "process_single.py");
    const pythonPath = path.join(process.cwd(), "../venv/Scripts/python.exe");

    exec(
      `"${pythonPath}" "${scriptPath}" "${absolutePdfPath}"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("❌ Error processing PDF:", stderr);
          return;
        }
        console.log(stdout);
      }
    );

    res.json({
      message: "Materi berhasil diupload",
      file_path: filePath,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Gagal menyimpan materi" });
  }
});

/* Mengambil data materi (admin) */
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        m.material_id,
        m.title,
        m.file_path,
        m.uploaded_at,
        u.username
      FROM materials m
      JOIN users u ON m.user_id = u.user_id
      ORDER BY m.uploaded_at DESC
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data materi" });
  }
});

/* Mengambil data materi (dosen) */
router.get("/user/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT material_id, title, file_path, uploaded_at
      FROM materials
      WHERE user_id = ?
      ORDER BY uploaded_at DESC
    `,
      [user_id]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil materi" });
  }
});

/* Edit Materi */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Judul wajib diisi" });
  }

  try {
    const [result] = await db.query(
      "UPDATE materials SET title = ? WHERE material_id = ?",
      [title, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Materi tidak ditemukan" });
    }

    res.json({ message: "Materi berhasil diperbarui" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Gagal update materi" });
  }
});

/* Delete materi + file + chroma */
router.delete("/:id", async (req, res) => {
  const materialId = req.params.id;

  try {
    const [rows] = await db.query(
      "SELECT file_path FROM materials WHERE material_id = ?",
      [materialId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Materi tidak ditemukan" });
    }

    const filePath = rows[0].file_path;
    const absolutePath = path.join(process.cwd(), filePath);

    // hapus file
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    // hapus database
    await db.query("DELETE FROM materials WHERE material_id = ?", [materialId]);

    res.json({ message: "Materi berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menghapus materi" });
  }
});

export default router;