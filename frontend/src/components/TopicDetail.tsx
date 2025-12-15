import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import { Post, Topic } from "../types";
import {
  Paper, Typography, Box, TextField, Button, Chip, Stack, IconButton
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useAuth } from "../context/AuthContext";

const muiColors: Array<"default" | "primary" | "secondary" | "success" | "warning" | "info"> =
  ["primary","secondary","success","warning","info","default"];

function colorFromString(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return muiColors[h % muiColors.length];
}

export const TopicDetail: React.FC = () => {
  const { id } = useParams();
  const topicId = Number(id);
  const { user } = useAuth();

  const [topic, setTopic] = useState<Topic | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    try {
      const data = await api.getTopic(topicId);
      setTopic(data.topic);
      setPosts(data.posts);
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => { if (!Number.isNaN(topicId)) load(); }, [topicId]);

  const handleSend = async () => {
    try {
      await api.createPost(topicId, newPost);
      setNewPost("");
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const toggleLike = async (postId: number) => {
    try {
      const res = await api.toggleLike(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likedByMe: res.liked, likesCount: res.likesCount } : p
        )
      );
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (error && !topic) return <Typography color="error">{error}</Typography>;
  if (!topic) return <Typography>Загрузка...</Typography>;

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5">{topic.title}</Typography>
      <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
        {topic.tags.map((t) => (
          <Chip key={t} label={`#${t}`} size="small" color={colorFromString(t)} sx={{ mb: 0.5 }} />
        ))}
      </Stack>

      <Typography sx={{ mt: 1 }} color="text.secondary">
        Автор: {topic.author} • {new Date(topic.created_at).toLocaleString()}
      </Typography>
      <Typography sx={{ mt: 1, mb: 2 }}>{topic.description}</Typography>

      {error && <Typography color="error" role="alert" sx={{ mb: 1 }}>{error}</Typography>}

      <Typography variant="h6">Сообщения</Typography>
      {posts.length === 0 ? (
        <Typography>Пока нет сообщений</Typography>
      ) : (
        posts.map((p) => (
          <Paper key={p.id} sx={{ p: 1.5, mt: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="subtitle2">
                  {p.author} • {new Date(p.created_at).toLocaleString()}
                </Typography>
                <Typography>{p.content}</Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <IconButton
                  aria-label="like"
                  onClick={() => toggleLike(p.id)}
                  disabled={!user}
                >
                  {p.likedByMe ? <FavoriteIcon sx={{ color: "red" }} /> : <FavoriteBorderIcon />}
                </IconButton>
                <Typography>{p.likesCount ?? 0}</Typography>
              </Box>
            </Box>

            {!user && (
              <Typography variant="caption" color="text.secondary">
                Войдите, чтобы ставить лайки ❤️
              </Typography>
            )}
          </Paper>
        ))
      )}

      <Box sx={{ mt: 2 }}>
        {user ? (
          <>
            <Typography variant="h6">Написать сообщение</Typography>
            <TextField fullWidth multiline minRows={3} value={newPost} onChange={(e) => setNewPost(e.target.value)} />
            <Button sx={{ mt: 1 }} variant="contained" disabled={!newPost.trim()} onClick={handleSend}>
              Отправить
            </Button>
          </>
        ) : (
          <Typography>Войдите, чтобы писать сообщения.</Typography>
        )}
      </Box>
    </Paper>
  );
};
