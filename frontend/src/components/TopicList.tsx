import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { Topic } from "../types";
import {
  Paper, List, ListItem, ListItemText, Typography, TextField, InputAdornment,
  IconButton, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Stack
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const muiColors: Array<"default" | "primary" | "secondary" | "success" | "warning" | "info"> =
  ["primary","secondary","success","warning","info","default"];

function colorFromString(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return muiColors[h % muiColors.length];
}

export const TopicList: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTags, setNewTags] = useState("react, node");

  const { user } = useAuth();

  const load = async (q?: string) => {
    setLoading(true);
    setError(null);
    try {
      setTopics(await api.getTopics(q));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const parsedNewTags = useMemo(() => {
    return newTags.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 10);
  }, [newTags]);

  const handleCreate = async () => {
    try {
      await api.createTopic(newTitle, newDescription, parsedNewTags);
      setOpenDialog(false);
      setNewTitle("");
      setNewDescription("");
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: "flex", mb: 2, gap: 2 }}>
        <TextField
          label="Поиск по темам"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton aria-label="Поиск" onClick={() => load(search)}>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        {user && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
            Новая тема
          </Button>
        )}
      </Box>

      {error && <Typography color="error" role="alert" sx={{ mb: 1 }}>{error}</Typography>}

      {loading ? (
        <Typography>Загрузка...</Typography>
      ) : topics.length === 0 ? (
        <Typography>Тем пока нет</Typography>
      ) : (
        <List>
          {topics.map((topic) => (
            <ListItem key={topic.id} button component={RouterLink} to={`/topics/${topic.id}`} alignItems="flex-start">
              <ListItemText
                primary={
                  <Box>
                    <Typography variant="subtitle1">{topic.title}</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: "wrap" }}>
                      {topic.tags.map((t) => (
                        <Chip key={t} label={`#${t}`} size="small" color={colorFromString(t)} sx={{ mb: 0.5 }} />
                      ))}
                    </Stack>
                  </Box>
                }
                secondary={
                  <>
                    <Typography component="span" variant="body2">
                      Автор: {topic.author} • {new Date(topic.created_at).toLocaleString()}
                    </Typography>
                    <br />
                    <Typography component="span" variant="body2" color="text.secondary">
                      {topic.description}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Создать новую тему</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Заголовок" fullWidth value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          <TextField margin="dense" label="Описание" fullWidth multiline minRows={3} value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
          <TextField margin="dense" label="Теги (через запятую)" fullWidth value={newTags} onChange={(e) => setNewTags(e.target.value)} />
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
            {parsedNewTags.map((t) => (
              <Chip key={t} label={`#${t}`} size="small" color={colorFromString(t)} sx={{ mb: 0.5 }} />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button onClick={handleCreate} disabled={!newTitle.trim()}>Создать</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
