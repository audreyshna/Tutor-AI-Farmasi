import bcrypt from "bcryptjs";
import { db } from "../db.js";

// === REGISTER USER ===
export const registerUser = async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: "Semua field wajib diisi!" });
  }

  // Cek apakah username sudah ada
  db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
    if (err) return res.status(500).json({ message: "Error server" });

    if (results.length > 0) {
      return res.status(400).json({ message: "Username sudah digunakan!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username, hashedPassword, role],
      (err2) => {
        if (err2) return res.status(500).json({ message: "Gagal menyimpan user!" });
        res.json({ message: "Registrasi berhasil!" });
      }
    );
  });
};

// === LOGIN USER ===
export const loginUser = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Username dan password wajib diisi!" });

  db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
    if (err) return res.status(500).json({ message: "Error server" });
    if (results.length === 0) {
      return res.status(400).json({ message: "Username tidak ditemukan!" });
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) return res.status(401).json({ message: "Password salah!" });

    res.json({
      message: "Login berhasil",
      user: {
        user_id: user.user_id,
        username: user.username,
        role: user.role,
      },
    });
  });
};
