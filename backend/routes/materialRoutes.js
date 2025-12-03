import express from "express";
import multer from "multer";
import path from "path";
import { db } from "../db.js";
import { exec } from "child_process";

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
router.post("/upload", upload.single("file"), async (req, res) => {
  const { title, user_id } = req.body;
  const filePath = `uploads/materials/${req.file.filename}`;
  
  if (!title || !user_id || !req.file) {
    return res.status(400).json({ error: "Semua data wajib diisi" });
  }

  try {
    const sql = "INSERT INTO materials (title, user_id, file_path) VALUES (?, ?, ?)";
    await db.query(sql, [title, user_id, filePath]);

    const absolutePdfPath = path.join(process.cwd(), filePath);
    const scriptPath = path.join(process.cwd(), "process_single.py");

    console.log("PDF Path:", absolutePdfPath);
    console.log("Python Script Path:", scriptPath);

    const pythonPath = path.join(process.cwd(), "../venv/Scripts/python.exe");
    // jalankan embedding setelah insert
    exec(`"${pythonPath}" "${scriptPath}" "${absolutePdfPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error("❌ Error processing PDF:", stderr);
        return; // tidak mengganggu respon
      }
      console.log(stdout);
    });
    res.json({
      message: "✅ Materi berhasil diupload & diproses ke ChromaDB",
      file_path: filePath
    });

  } catch (err) {
    console.error("❌ Upload error:", err);
    return res.status(500).json({ error: "Gagal menyimpan materi" });
  }
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

router.delete("/:id", async (req, res) => {
  const materialId = req.params.id;

  try {
    // 1. Ambil data materi
    const [rows] = await db.query(
      "SELECT file_path FROM materials WHERE material_id = ?",
      [materialId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Materi tidak ditemukan" });
    }

    const filePath = rows[0].file_path;
    const fileName = path.basename(filePath);

    // 2. Hapus file dari folder uploads
    const absolutePath = path.join(process.cwd(), filePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    // 3. Hapus row MySQL
    await db.query("DELETE FROM materials WHERE material_id = ?", [materialId]);

    // 4. Hapus embedding dari ChromaDB berdasarkan metadata 'source'
    const client = new PersistentClient({ path: process.env.CHROMA_DIR });
    const col = await client.getCollection("materi");

    await col.delete({
      where: { source: fileName }
    });

    res.json({ message: "Materi & embedding berhasil dihapus" });

  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Gagal menghapus materi" });
  }
});

export default router;
