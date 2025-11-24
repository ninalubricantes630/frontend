"use client"

import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Chip,
  Divider,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material"
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material"
import ChangePasswordModal from "../Auth/ChangePasswordModal"

function Header({ onMenuClick }) {
  const { user, logout, isAdmin } = useAuth()
  const [anchorEl, setAnchorEl] = useState(null)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const navigate = useNavigate()

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleChangePassword = () => {
    setChangePasswordOpen(true)
    handleMenuClose()
  }

  const handleProfileClick = () => {
    navigate("/configuracion?tab=profile")
    handleMenuClose()
  }

  const handleLogout = () => {
    logout()
    handleMenuClose()
  }

  return (
    <>
      <AppBar
        position="static"
        elevation={2}
        sx={{
          bgcolor: "white",
          borderBottom: "2px solid #e0e0e0",
          height: 80,
        }}
      >
        <Toolbar sx={{ height: "100%", px: 3 }}>
          <IconButton
            edge="start"
            onClick={onMenuClick}
            sx={{
              mr: 2,
              display: { lg: "none" },
              color: "#666",
              bgcolor: "rgba(220, 38, 38, 0.1)",
              "&:hover": {
                bgcolor: "rgba(220, 38, 38, 0.2)",
              },
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1, display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 3 }}>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  color: "#171717",
                  mb: 0.5,
                }}
              >
                Sistema de Gestión
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#666",
                  display: { xs: "none", md: "block" },
                }}
              >
                {new Date().toLocaleDateString("es-AR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 2 }}>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#171717" }}>
                  {user?.nombre || "Usuario"}
                </Typography>
                <Chip
                  label={isAdmin() ? "Administrador" : "Empleado"}
                  size="small"
                  sx={{
                    bgcolor: "rgba(220, 38, 38, 0.1)",
                    color: "#dc2626",
                    border: "1px solid rgba(220, 38, 38, 0.3)",
                    fontWeight: "medium",
                    fontSize: "0.75rem",
                  }}
                />
              </Box>
            </Box>

            <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
              <Avatar
                sx={{
                  bgcolor: "#dc2626",
                  width: 48,
                  height: 48,
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                  boxShadow: 2,
                }}
              >
                {user?.nombre?.charAt(0)?.toUpperCase() || "U"}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                elevation: 8,
                sx: {
                  mt: 1.5,
                  minWidth: 280,
                  borderRadius: 2,
                  border: "1px solid rgba(220, 38, 38, 0.2)",
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <Paper sx={{ p: 3, bgcolor: "rgba(220, 38, 38, 0.05)" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: "#dc2626",
                      width: 56,
                      height: 56,
                      fontWeight: "bold",
                      fontSize: "1.4rem",
                    }}
                  >
                    {user?.nombre?.charAt(0)?.toUpperCase() || "U"}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "#171717" }}>
                      {user?.nombre || "Usuario"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
                      {user?.email}
                    </Typography>
                    <Chip
                      label={isAdmin() ? "Administrador" : "Empleado"}
                      size="small"
                      sx={{
                        bgcolor: "white",
                        color: "#dc2626",
                        border: "1px solid rgba(220, 38, 38, 0.3)",
                        fontWeight: "medium",
                      }}
                    />
                  </Box>
                </Box>
              </Paper>

              <Divider sx={{ my: 1 }} />

              <MenuItem
                onClick={handleProfileClick}
                sx={{
                  py: 1.5,
                  px: 2,
                  "&:hover": {
                    bgcolor: "rgba(220, 38, 38, 0.1)",
                  },
                }}
              >
                <ListItemIcon>
                  <PersonIcon sx={{ color: "#dc2626" }} />
                </ListItemIcon>
                <ListItemText
                  primary="Mi Perfil"
                  primaryTypographyProps={{
                    fontWeight: "medium",
                  }}
                />
              </MenuItem>

              <MenuItem
                onClick={handleChangePassword}
                sx={{
                  py: 1.5,
                  px: 2,
                  "&:hover": {
                    bgcolor: "rgba(220, 38, 38, 0.1)",
                  },
                }}
              >
                <ListItemIcon>
                  <LockIcon sx={{ color: "#dc2626" }} />
                </ListItemIcon>
                <ListItemText
                  primary="Cambiar Contraseña"
                  primaryTypographyProps={{
                    fontWeight: "medium",
                  }}
                />
              </MenuItem>

              {isAdmin() && (
                <MenuItem
                  sx={{
                    py: 1.5,
                    px: 2,
                    "&:hover": {
                      bgcolor: "rgba(220, 38, 38, 0.1)",
                    },
                  }}
                >
                  <ListItemIcon>
                    <SettingsIcon sx={{ color: "#dc2626" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Configuración"
                    primaryTypographyProps={{
                      fontWeight: "medium",
                    }}
                  />
                </MenuItem>
              )}

              <Divider sx={{ my: 1 }} />

              <MenuItem
                onClick={handleLogout}
                sx={{
                  py: 1.5,
                  px: 2,
                  color: "#d32f2f",
                  "&:hover": {
                    bgcolor: "rgba(211, 47, 47, 0.1)",
                  },
                }}
              >
                <ListItemIcon>
                  <LogoutIcon sx={{ color: "#d32f2f" }} />
                </ListItemIcon>
                <ListItemText
                  primary="Cerrar Sesión"
                  primaryTypographyProps={{
                    fontWeight: "medium",
                  }}
                />
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <ChangePasswordModal open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
    </>
  )
}

export default Header
