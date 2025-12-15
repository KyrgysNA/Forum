import React, { useState } from "react";
import { Paper, TextField, Button, Typography, Box } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate("/");
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 400, mx: "auto" }}>
      <Typography variant="h5" gutterBottom>Вход</Typography>
      {error && <Typography color="error" role="alert" sx={{ mb: 1 }}>{error}</Typography>}
      <Box component="form" onSubmit={onSubmit}>
        <TextField label="Email" type="email" fullWidth margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <TextField label="Пароль" type="password" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Войти</Button>
      </Box>
      <Typography sx={{ mt: 2 }}>Нет аккаунта? <RouterLink to="/register">Зарегистрироваться</RouterLink></Typography>
    </Paper>
  );
};
