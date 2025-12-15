import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFile = process.env.DATABASE_FILE || path.join(__dirname, "..", "forum.db");

sqlite3.verbose();
export const db = new sqlite3.Database(dbFile);

function ensureColumn(table, column, ddl) {
  return new Promise((resolve) => {
    db.all(`PRAGMA table_info(${table})`, (err, rows) => {
      if (err) return resolve(false);
      const exists = rows.some((r) => r.name === column);
      if (exists) return resolve(true);
      db.run(ddl, (e2) => resolve(!e2));
    });
  });
}

export async function initDb() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (topic_id) REFERENCES topics(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS post_likes (
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES posts(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  });

  await ensureColumn("topics", "tags", "ALTER TABLE topics ADD COLUMN tags TEXT NOT NULL DEFAULT '[]'");

  db.get("SELECT COUNT(*) as count FROM users WHERE role='admin'", (err, row) => {
    if (err) return;
    if (row.count === 0) {
      const hash = bcrypt.hashSync("admin123", 10);
      db.run(
        "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, 'admin')",
        ["admin", "admin@example.com", hash]
      );
    }
  });

  
  db.get("SELECT COUNT(*) as count FROM topics", (err, row) => {
    if (err) return;
    if (row.count === 0) {
      db.run(
        "INSERT INTO topics (title, description, tags, user_id) VALUES (?, ?, ?, 1)",
        ["Добро пожаловать", "Первый топик форума", JSON.stringify(["welcome","rules"]),],
        function (err2) {
          if (err2) return;
          const topicId = this.lastID;
          db.run("INSERT INTO posts (topic_id, user_id, content) VALUES (?, 1, ?)", [topicId, "Пишите сообщения и ставьте лайки ❤️"]);
        }
      );
    }
  });
}
