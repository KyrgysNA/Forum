import React from "react";
import { AppBar, Toolbar, Typography, Button, Container, Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1 }}
            component={RouterLink}
            to="/"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            Форум
          </Typography>

          {user ? (
            <>
              <Typography sx={{ mx: 2 }}>Привет, {user.username}</Typography>
              <Button color="inherit" onClick={() => logout()}>Выйти</Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">Вход</Button>
              <Button color="inherit" component={RouterLink} to="/register">Регистрация</Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>{children}</Box>
      </Container>
    </>
  );
};
