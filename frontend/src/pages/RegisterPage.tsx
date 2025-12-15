import React, { useState } from "react";
import { Paper, TextField, Button, Typography, Box } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const validateConfirm = (value: string, pwd: string) => {
    if (!value) return "Please confirm your password!";
    if (value !== pwd) return "The new password that you entered do not match!";
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const err = validateConfirm(confirm, password);
    setConfirmError(err);
    if (err) return;
    try {
      await register(username, email, password);
      navigate("/");
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 400, mx: "auto" }}>
      <Typography variant="h5" gutterBottom>Регистрация</Typography>
      {error && <Typography color="error" role="alert" sx={{ mb: 1 }}>{error}</Typography>}
      <Box component="form" onSubmit={onSubmit}>
        <TextField label="Логин" fullWidth margin="normal" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <TextField label="Email" type="email" fullWidth margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <TextField
          label="Пароль"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => {
            const v = e.target.value;
            setPassword(v);
            if (confirm) setConfirmError(validateConfirm(confirm, v));
          }}
          required
        />
        <TextField
          label="Confirm Password"
          type="password"
          fullWidth
          margin="normal"
          value={confirm}
          onChange={(e) => {
            const v = e.target.value;
            setConfirm(v);
            setConfirmError(validateConfirm(v, password));
          }}
          required
          error={!!confirmError}
          helperText={confirmError || ""}
        />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Зарегистрироваться</Button>
      </Box>
      <Typography sx={{ mt: 2 }}>Уже есть аккаунт? <RouterLink to="/login">Войти</RouterLink></Typography>
    </Paper>
  );
};
