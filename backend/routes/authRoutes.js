import express from "express";
import bcrypt from "bcryptjs";
import { db } from "../db.js";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Semua field wajib diisi" });

  try {
    const [result] = await db.query("SELECT * FROM users WHERE username = ?", [username]);

    if (result.length > 0)
      return res.status(400).json({ message: "Username sudah digunakan" });

    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashed]
    );

    res.json({ message: "Registrasi berhasil" });

  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Kesalahan server" });
  }
});

// Login
router.post("/login", async (req, res) => {
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