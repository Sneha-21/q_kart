import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import "./Header.css";
import { Link, useHistory } from "react-router-dom";

const Header = ({ children, hasHiddenAuthButtons }) => {
  const history = useHistory();

  const handleExplore = () => {
    history.push("/");
  };

  const handleRegister = () => {
    history.push("/register");
  };

  const handleLogin = () => {
    history.push("/login");
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <Box className="header">
      <Box className="header-title">
        <img src="logo_light.svg" alt="QKart-icon"></img>
      </Box>
      {hasHiddenAuthButtons ? (
        <Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={handleExplore}
        >
          Back to explore
        </Button>
      ) : (
        <>
          <div>{children} </div>{" "}
          {localStorage.getItem("username") ? (
            <Stack direction="row" spacing={2}>
              <Avatar alt={localStorage.getItem("username")} src="avatar.png" />
              <span
                className="username-text"
                style={{ margin: "auto", paddingLeft: "10px" }}
              >
                {localStorage.getItem("username")}
              </span>
              <Button onClick={handleLogout} className="link">
                LOGOUT
              </Button>
            </Stack>
          ) : (
            <Stack direction="row" spacing={2}>
              <Button onClick={handleLogin} className="link">
                LOGIN
              </Button>
              <Button variant="contained" onClick={handleRegister}>
                REGISTER
              </Button>
            </Stack>
          )}
        </>
      )}
    </Box>
  );
};

export default Header;
