import express from "express";
import { db } from "../db/db.js";

const router = express.Router();

router.get("/", (_req, res) => {
  db.all("SELECT * FROM messages ORDER BY created_at DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ message: "Ошибка чтения сообщений" });
    res.json(rows);
  });
});

router.post("/", (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: "Текст обязателен" });
  db.run("INSERT INTO messages (text) VALUES (?)", [text], function (err) {
    if (err) return res.status(500).json({ message: "Ошибка записи сообщения" });
    db.get("SELECT * FROM messages WHERE id = ?", [this.lastID], (err2, row) => {
      if (err2) return res.status(500).json({ message: "Ошибка чтения сообщения" });
      res.status(201).json(row);
    });
  });
});

export default router;
