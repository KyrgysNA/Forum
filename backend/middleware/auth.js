import { verifyToken } from "../db/tokens.js";

export function optionalAuth(req, _res, next) {
  const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(" ")[1]);
  if (!token) return next();
  try {
    req.user = verifyToken(token);
  } catch {

  }
  next();
}

export function authRequired(req, res, next) {
  const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(" ")[1]);
  if (!token) return res.status(401).json({ message: "Требуется авторизация" });
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ message: "Неверный или просроченный токен" });
  }
}

export function adminRequired(req, res, next) {
  if (!req.user || req.user.role !== "admin") return res.status(403).json({ message: "Доступ запрещен" });
  next();
}
