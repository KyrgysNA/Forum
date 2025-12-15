import express from "express";
import bcrypt from "bcrypt";
import { db } from "../db/db.js";
import { createToken, verifyToken } from "../db/tokens.js";

const router = express.Router();

router.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ message: "Заполните все поля" });
  const passwordHash = bcrypt.hashSync(password, 10);
  db.run(
    "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
    [username, email, passwordHash],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE")) return res.status(409).json({ message: "Пользователь с таким именем или email уже существует" });
        return res.status(500).json({ message: "Ошибка сервера" });
      }
      const user = { id: this.lastID, username, email, role: "user" };
      const token = createToken(user);
      res.cookie("token", token, { httpOnly: true, sameSite: "lax", maxAge: 7*24*60*60*1000 });
      res.status(201).json({ user });
    }
  );
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Заполните все поля" });
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) return res.status(500).json({ message: "Ошибка сервера" });
    if (!user) return res.status(401).json({ message: "Неверный email или пароль" });
    if (!bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ message: "Неверный email или пароль" });
    const payload = { id: user.id, username: user.username, email: user.email, role: user.role };
    const token = createToken(payload);
    res.cookie("token", token, { httpOnly: true, sameSite: "lax", maxAge: 7*24*60*60*1000 });
    res.json({ user: payload });
  });
});

router.post("/logout", (_req, res) => {
  res.clearCookie("token");
  res.json({ message: "Вы вышли из системы" });
});

router.get("/me", (req, res) => {
  const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(" ")[1]);
  if (!token) return res.json({ user: null });
  try {
    return res.json({ user: verifyToken(token) });
  } catch {
    return res.json({ user: null });
  }
});

export default router;
