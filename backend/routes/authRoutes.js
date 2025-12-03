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
  try {
    // cek apakah user sudah ada
    const [result] = await db.query("SELECT * FROM users WHERE username = ?", [username]);

    if (result.length > 0)
      return res.status(400).json({ message: "Username sudah digunakan" });

    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username, hashed, "mahasiswa"]
    );

    res.json({ message: "Registrasi berhasil" });

  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Kesalahan server" });
  }
});

// === LOGIN ===
router.post("/login", async (req, res) => {  // <-- tambahkan async
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Username dan password wajib diisi" });

  try {
    const [result] = await db.query("SELECT * FROM users WHERE username = ?", [username]);

    if (result.length === 0)
      return res.status(404).json({ message: "User tidak ditemukan" });

    const user = result[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Password salah" });

    delete user.password;
    res.json({ message: "Login berhasil", user });

  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Kesalahan server" });
  }
});


export default router;