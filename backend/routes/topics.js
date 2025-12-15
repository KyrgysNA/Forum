import express from "express";
import { db } from "../db/db.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

router.get("/", (req, res) => {
  const { q } = req.query;
  const params = [];
  let sql = "SELECT t.*, u.username as author FROM topics t JOIN users u ON t.user_id = u.id";
  if (q) {
    sql += " WHERE t.title LIKE ? OR t.description LIKE ?";
    params.push(`%${q}%`, `%${q}%`);
  }
  sql += " ORDER BY t.created_at DESC";
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ message: "Ошибка сервера" });
    res.json(rows);
  });
});

router.post("/", authRequired, (req, res) => {
  const { title, description, tags } = req.body;
  if (!title) return res.status(400).json({ message: "Заголовок обязателен" });

  let tagsJson = "[]";
  if (Array.isArray(tags)) {
    tagsJson = JSON.stringify(tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 10));
  }

  db.run(
    "INSERT INTO topics (title, description, tags, user_id) VALUES (?, ?, ?, ?)",
    [title, description || "", tagsJson, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ message: "Ошибка сервера" });
      db.get(
        "SELECT t.*, u.username as author FROM topics t JOIN users u ON t.user_id = u.id WHERE t.id = ?",
        [this.lastID],
        (err2, topic) => {
          if (err2) return res.status(500).json({ message: "Ошибка сервера" });
          res.status(201).json(topic);
        }
      );
    }
  );
});

router.get("/:id", (req, res) => {
  const id = req.params.id;
  db.get(
    "SELECT t.*, u.username as author FROM topics t JOIN users u ON t.user_id = u.id WHERE t.id = ?",
    [id],
    (err, topic) => {
      if (err) return res.status(500).json({ message: "Ошибка сервера" });
      if (!topic) return res.status(404).json({ message: "Тема не найдена" });
      db.all(
        `SELECT p.*, u.username as author,
            (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) as likesCount,
            (SELECT COUNT(*) FROM post_likes pl2 WHERE pl2.post_id = p.id AND pl2.user_id = COALESCE(?, -1)) as likedByMe
         FROM posts p JOIN users u ON p.user_id = u.id
         WHERE p.topic_id = ?
         ORDER BY p.created_at ASC`,
        [req.user?.id ?? -1, id],
        (err2, posts) => {
          if (err2) return res.status(500).json({ message: "Ошибка сервера" });
          const normalized = posts.map((p) => ({ ...p, likedByMe: Number(p.likedByMe) > 0 }));
          res.json({ topic, posts: normalized });
        }
      );
    }
  );
});

export default router;
