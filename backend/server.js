import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { initDb } from "./db/db.js";

import authRoutes from "./routes/auth.js";
import topicsRoutes from "./routes/topics.js";
import postsRoutes from "./routes/posts.js";
import messagesRoutes from "./routes/messages.js";
import { optionalAuth } from "./middleware/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());


app.use(optionalAuth);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/topics", topicsRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/messages", messagesRoutes);

initDb();

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}

export default app;
