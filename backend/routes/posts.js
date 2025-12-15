import express from "express";
import { db } from "../db/db.js";
import { authRequired, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/topic/:topicId", authRequired, (req, res) => {
  const topicId = req.params.topicId;
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: "Текст сообщения обязателен" });
  db.run(
    "INSERT INTO posts (topic_id, user_id, content) VALUES (?, ?, ?)",
    [topicId, req.user.id, content],
    function (err) {
      if (err) return res.status(500).json({ message: "Ошибка сервера" });
      db.get(
        `SELECT p.*, u.username as author,
            (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) as likesCount,
            (SELECT COUNT(*) FROM post_likes pl2 WHERE pl2.post_id = p.id AND pl2.user_id = ?) as likedByMe
         FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = ?`,
        [req.user.id, this.lastID],
        (err2, post) => {
          if (err2) return res.status(500).json({ message: "Ошибка сервера" });
          res.status(201).json({ ...post, likedByMe: Number(post.likedByMe) > 0 });
        }
      );
    }
  );
});

router.post("/:id/like", authRequired, (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  db.get("SELECT 1 as x FROM post_likes WHERE post_id=? AND user_id=?", [postId, userId], (err, row) => {
    if (err) return res.status(500).json({ message: "Ошибка сервера" });
    if (row) {
      db.run("DELETE FROM post_likes WHERE post_id=? AND user_id=?", [postId, userId], (err2) => {
        if (err2) return res.status(500).json({ message: "Ошибка сервера" });
        db.get("SELECT COUNT(*) as likesCount FROM post_likes WHERE post_id=?", [postId], (err3, r) => {
          if (err3) return res.status(500).json({ message: "Ошибка сервера" });
          res.json({ liked: false, likesCount: r.likesCount });
        });
      });
    } else {
      db.run("INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)", [postId, userId], (err2) => {
        if (err2) return res.status(500).json({ message: "Ошибка сервера" });
        db.get("SELECT COUNT(*) as likesCount FROM post_likes WHERE post_id=?", [postId], (err3, r) => {
          if (err3) return res.status(500).json({ message: "Ошибка сервера" });
          res.json({ liked: true, likesCount: r.likesCount });
        });
      });
    }
  });
});

router.get("/:id/likes", optionalAuth, (req, res) => {
  const postId = req.params.id;
  const userId = req.user?.id ?? -1;
  db.get(
    `SELECT
      (SELECT COUNT(*) FROM post_likes WHERE post_id=?) as likesCount,
      (SELECT COUNT(*) FROM post_likes WHERE post_id=? AND user_id=?) as likedByMe`,
    [postId, postId, userId],
    (err, row) => {
      if (err) return res.status(500).json({ message: "Ошибка сервера" });
      res.json({ likesCount: row.likesCount, likedByMe: Number(row.likedByMe) > 0 });
    }
  );
});

export default router;
