import express from "express";
import bcrypt from "bcryptjs";
import { db } from "../db.js";
import { loginUser, registerUser } from "../controllers/userController.js";

const router = express.Router();

// === REGISTER ===
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Semua field wajib diisi" });

  // cek apakah user sudah ada
  db.query("SELECT * FROM users WHERE username = ?", [username], async (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Kesalahan server" });
    }
    if (result.length > 0)
      return res.status(400).json({ message: "Username sudah digunakan" });

    const hashed = await bcrypt.hash(password, 10);
    db.query(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username, hashed, "mahasiswa"],
      (err2) => {
        if (err2) {
          console.error("Insert Error:", err2);
          return res.status(500).json({ message: "Gagal registrasi" });
        }
        res.json({ message: "Registrasi berhasil" });
      }
    );
  });
});

// === LOGIN ===
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Username dan password wajib diisi" });

  db.query("SELECT * FROM users WHERE username = ?", [username], async (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Kesalahan server" });
    }

    if (result.length === 0)
      return res.status(404).json({ message: "User tidak ditemukan" });

    const user = result[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Password salah" });

    delete user.password;
    res.json({ message: "Login berhasil", user });
  });
});

export default router;