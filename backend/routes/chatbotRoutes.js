//chatbotRoutes.js
import express from "express";
import { db } from "../db.js";
import axios from "axios";

const router = express.Router();

// Ambil history user
router.get("/history/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT * FROM chat_history 
       WHERE user_id = ?
       ORDER BY timestamp ASC`,
      [user_id]
    );

    res.json({ history: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil history" });
  }
});

// Kirim pertanyaan ke FastAPI
router.post("/ask", async (req, res) => {
  const { question, user_id, session_id } = req.body;

  try {
    // Ambil history dari database
    const [rows] = await db.query(
      `SELECT role, message
       FROM chat_history
       WHERE session_id = ?
         AND role IN ('user', 'assistant')
       ORDER BY timestamp ASC`,
      [session_id]
    );

    const history = rows.map(r => ({
      role: r.role,
      content: r.message
    }));

    const newHistory = [...history, { role: 'user', content: question }];

    // Kirim ke FastAPI
    const llm = await axios.post("http://localhost:5001/api/ask", {
      question,
      user_id,
      session_id,
      history: newHistory
    });

    const answer = llm.data.answer;

    // Simpan ke database
    await db.query(
      `INSERT INTO chat_history (user_id, session_id, role, message)
       VALUES (?, ?, 'user', ?)`,
      [user_id, session_id, question]
    );

    await db.query(
      `INSERT INTO chat_history (user_id, session_id, role, message)
       VALUES (?, ?, 'assistant', ?)`,
      [user_id, session_id, answer]
    );

    res.json({ answer });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Ambil semua session user
router.get("/sessions/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT ch.session_id, ch.message AS first_message, ch.timestamp AS created_at
      FROM chat_history ch
      INNER JOIN (
          SELECT session_id, MIN(timestamp) AS first_ts
          FROM chat_history
          WHERE user_id = ? AND role = 'user'
          GROUP BY session_id
      ) AS first_msg
      ON ch.session_id = first_msg.session_id AND ch.timestamp = first_msg.first_ts
      ORDER BY created_at ASC;`,
      [user_id]
    );
    res.json({ sessions: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal ambil sessions" });
  }
});

// Buat session baru
router.post("/new", async (req, res) => {
  const { user_id } = req.body;
  try {
    const session_id = Date.now();
    await db.query(
      `INSERT INTO chat_history (user_id, session_id, role, message, timestamp)
       VALUES (?, ?, 'system', 'Session baru dibuat', NOW())`,
      [user_id, session_id]
    );
    res.json({
      session: { session_id, user_id, created_at: new Date(), first_message: "Session baru dibuat" }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal buat session baru" });
  }
});

// Ambil semua pesan dari session tertentu
router.get("/messages/:session_id", async (req, res) => {
  const { session_id } = req.params;

  if (!session_id) {
    return res.status(400).json({ error: "session_id wajib ada" });
  }

  try {
    const [rows] = await db.query(
      `SELECT * FROM chat_history WHERE session_id = ? ORDER BY timestamp ASC`,
      [session_id]
    );

    res.json({ messages: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal ambil messages" });
  }
});

// Hapus 1 session: semua pesan dalam session_id
router.delete("/delete/:session_id", async (req, res) => {
  const { session_id } = req.params;

  try {
    const [result] = await db.query(
      `DELETE FROM chat_history WHERE session_id = ?`,
      [session_id]
    );

    res.json({
      success: true,
      deleted: result.affectedRows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menghapus session" });
  }
});

export default router;