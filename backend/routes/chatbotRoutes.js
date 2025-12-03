//chatbotRoutes.js
import express from "express";
import { db } from "../db.js";
import axios from "axios";

const router = express.Router();

// ===============================
// 1. Ambil history user
// ===============================
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

// ===============================
// 2. Kirim pertanyaan ke FastAPI
// ===============================
router.post("/ask", async (req, res) => {
  const { question, user_id, session_id} = req.body;

  if (!question) return res.status(400).json({ error: "Pertanyaan kosong" });
  if (!user_id) return res.status(400).json({ error: "user_id wajib ada" });
  if (!session_id) return res.status(400).json({ error: "session_id wajib ada" });

  try {
    // === Kirim pertanyaan ke FastAPI ===
    const llm = await axios.post("http://localhost:5001/api/ask", {
      question,
      user_id,
      session_id,
    });

    const answer = llm.data.answer;

    // === Simpan pesan ke database ===
    const [userResult] = await db.query(
      `INSERT INTO chat_history (user_id, session_id, role, message, timestamp)
      VALUES (?, ?, ?, ?, NOW())`,
      [user_id, session_id, 'user', question]
    );
    console.log("User message inserted:", userResult);

    const [assistantResult] = await db.query(
      `INSERT INTO chat_history (user_id, session_id, role, message, timestamp)
      VALUES (?, ?, ?, ?, NOW())`,
      [user_id, session_id, 'assistant', answer]
    );
    console.log("Assistant message inserted:", assistantResult);

    res.json({ answer });
  } catch (err) {
    console.error("Error /ask:", err.message);
    res.status(500).json({ error: "Server error (Node → FastAPI gagal)" });
  }
});

// ===============================
// 3. Ambil semua session user
// ===============================
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
    res.json({ sessions: rows }); // hanya kembalikan data
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal ambil sessions" });
  }
});

// Buat session baru
router.post("/new", async (req, res) => {
  const { user_id } = req.body;
  try {
    const session_id = Date.now(); // bisa diganti UUID
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

// ===============================
// 3. Ambil semua pesan dari session tertentu
// ===============================
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
