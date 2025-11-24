"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  IconButton,
  Collapse,
  Divider,
  Chip,
  Paper,
} from "@mui/material"
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  DirectionsCar as CarIcon,
  Build as BuildIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  ManageAccounts as ManageAccountsIcon,
  ExpandLess,
  ExpandMore,
  Close as CloseIcon,
  Tune as TuneIcon,
  Business as BusinessIcon,
  PersonAdd as PersonAddIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  ShoppingCart as ShoppingCartIcon,
  Receipt as ReceiptIcon,
  AccountBalance as AccountBalanceIcon,
  CreditCard as CreditCardIcon,
  History as HistoryIcon, // Added History icon import
} from "@mui/icons-material"

const drawerWidth = 280

function Sidebar({ open, onClose, isMobile }) {
  const navigate = useNavigate()

  return (
    <>
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              border: "none",
              boxShadow: 4,
            },
          }}
        >
          <SidebarContent onNavigation={(path) => navigate(path)} onClose={onClose} showCloseButton={false} />
        </Drawer>
      )}

      {isMobile && (
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", lg: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              border: "none",
              boxShadow: 4,
            },
          }}
        >
          <SidebarContent onNavigation={(path) => navigate(path)} onClose={onClose} showCloseButton={true} />
        </Drawer>
      )}
    </>
  )
}

function SidebarContent({ onNavigation, onClose, showCloseButton }) {
  const location = useLocation()
  const { isAdmin } = useAuth()
  const [configOpen, setConfigOpen] = useState(false)
  const [reportsOpen, setReportsOpen] = useState(false)

  const menuItems = [
    { text: "Dashboard", icon: DashboardIcon, path: "/dashboard" },
    { text: "Clientes", icon: PeopleIcon, path: "/clientes" },
    { text: "Vehículos", icon: CarIcon, path: "/vehiculos" },
    { text: "Servicios", icon: BuildIcon, path: "/servicios" },
    { text: "Stock", icon: InventoryIcon, path: "/stock" },
    { text: "Ventas", icon: ShoppingCartIcon, path: "/ventas" },
    { text: "Caja", icon: AccountBalanceIcon, path: "/caja" },
  ]

  const reportItems = [
    { text: "Reporte de Servicios", path: "/reportes", icon: BuildIcon },
    { text: "Reporte de Ventas", path: "/reportes/ventas", icon: ReceiptIcon },
    { text: "Historial de Caja", path: "/caja/historial", icon: HistoryIcon }, // Added Historial de Caja to reportItems
  ]

  const configItems = isAdmin()
    ? [
        { text: "General", path: "/configuracion", icon: SettingsIcon },
        { text: "Tipos de Servicios", path: "/configuracion/tipos-servicios", icon: TuneIcon },
        { text: "Categorías", path: "/configuracion/categorias", icon: CategoryIcon },
        { text: "Empleados", path: "/configuracion/empleados", icon: PersonAddIcon },
        { text: "Sucursales", path: "/configuracion/sucursales", icon: BusinessIcon },
        { text: "Tarjetas de Crédito", path: "/configuracion/tarjetas", icon: CreditCardIcon },
        { text: "Usuarios", path: "/configuracion/usuarios", icon: ManageAccountsIcon },
      ]
    : []

  const isConfigPath = () => {
    return location.pathname.startsWith("/configuracion")
  }

  const isReportsPath = () => {
    return location.pathname.startsWith("/reportes")
  }

  const isActivePath = (path) => {
    return location.pathname === path
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Paper
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
          p: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderRadius: 0,
          position: "sticky",
          top: 0,
          zIndex: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.2)",
              width: 42,
              height: 42,
              fontWeight: "bold",
              fontSize: "1.1rem",
            }}
          >
            M
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "white", fontSize: "1.1rem" }}>
              Nina
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.9)", mt: -0.5, fontSize: "0.8rem" }}>
              Lubricantes
            </Typography>
          </Box>
        </Box>
        {showCloseButton && (
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "rgba(255, 255, 255, 0.8)",
              bgcolor: "rgba(255, 255, 255, 0.1)",
              "&:hover": {
                bgcolor: "rgba(220, 38, 38, 0.2)",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Paper>

      <Box
        sx={{
          flexGrow: 1,
          p: 1.5,
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "rgba(0,0,0,0.1)",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(220, 38, 38, 0.3)",
            borderRadius: "3px",
            "&:hover": {
              background: "rgba(220, 38, 38, 0.5)",
            },
          },
        }}
      >
        <List sx={{ pt: 0 }}>
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = isActivePath(item.path)

            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => onNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    px: 1.5,
                    bgcolor: isActive ? "#dc2626" : "transparent",
                    color: isActive ? "white" : "#171717",
                    "&:hover": {
                      bgcolor: isActive ? "#b91c1c" : "rgba(220, 38, 38, 0.1)",
                    },
                    boxShadow: isActive ? 2 : 0,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Icon sx={{ color: isActive ? "white" : "#dc2626", fontSize: 22 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: isActive ? "bold" : "medium",
                      fontSize: "0.9rem",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            )
          })}

          <Divider sx={{ my: 1.5 }} />

          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => setReportsOpen(!reportsOpen)}
              sx={{
                borderRadius: 2,
                py: 1.2,
                px: 1.5,
                bgcolor: isReportsPath() ? "#dc2626" : "transparent",
                color: isReportsPath() ? "white" : "#171717",
                "&:hover": {
                  bgcolor: isReportsPath() ? "#b91c1c" : "rgba(220, 38, 38, 0.1)",
                },
                boxShadow: isReportsPath() ? 2 : 0,
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <BarChartIcon sx={{ color: isReportsPath() ? "white" : "#dc2626", fontSize: 22 }} />
              </ListItemIcon>
              <ListItemText
                primary="Reportes"
                primaryTypographyProps={{
                  fontWeight: isReportsPath() ? "bold" : "medium",
                  fontSize: "0.9rem",
                }}
              />
              {reportsOpen ? (
                <ExpandLess sx={{ color: isReportsPath() ? "white" : "#666", fontSize: 20 }} />
              ) : (
                <ExpandMore sx={{ color: isReportsPath() ? "white" : "#666", fontSize: 20 }} />
              )}
            </ListItemButton>
          </ListItem>

          <Collapse in={reportsOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 1.5 }}>
              {reportItems.map((item) => {
                const Icon = item.icon
                const isActive = isActivePath(item.path)

                return (
                  <ListItem key={item.text} disablePadding sx={{ mb: 0.3 }}>
                    <ListItemButton
                      onClick={() => onNavigation(item.path)}
                      sx={{
                        borderRadius: 2,
                        py: 0.8,
                        px: 1.5,
                        bgcolor: isActive ? "#dc2626" : "transparent",
                        color: isActive ? "white" : "#666",
                        "&:hover": {
                          bgcolor: isActive ? "#b91c1c" : "rgba(220, 38, 38, 0.1)",
                          color: isActive ? "white" : "#171717",
                        },
                        boxShadow: isActive ? 1 : 0,
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Icon sx={{ fontSize: 18, color: isActive ? "white" : "#dc2626" }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontSize: "0.85rem",
                          fontWeight: isActive ? "bold" : "medium",
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                )
              })}
            </List>
          </Collapse>

          <Divider sx={{ my: 1.5 }} />

          {isAdmin() && (
            <>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => setConfigOpen(!configOpen)}
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    px: 1.5,
                    bgcolor: isConfigPath() ? "#dc2626" : "transparent",
                    color: isConfigPath() ? "white" : "#171717",
                    "&:hover": {
                      bgcolor: isConfigPath() ? "#b91c1c" : "rgba(220, 38, 38, 0.1)",
                    },
                    boxShadow: isConfigPath() ? 2 : 0,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <SettingsIcon sx={{ color: isConfigPath() ? "white" : "#dc2626", fontSize: 22 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Configuración"
                    primaryTypographyProps={{
                      fontWeight: isConfigPath() ? "bold" : "medium",
                      fontSize: "0.9rem",
                    }}
                  />
                  {configOpen ? (
                    <ExpandLess sx={{ color: isConfigPath() ? "white" : "#666", fontSize: 20 }} />
                  ) : (
                    <ExpandMore sx={{ color: isConfigPath() ? "white" : "#666", fontSize: 20 }} />
                  )}
                </ListItemButton>
              </ListItem>

              <Collapse in={configOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ pl: 1.5 }}>
                  {configItems.map((item) => {
                    const Icon = item.icon
                    const isActive = isActivePath(item.path)

                    return (
                      <ListItem key={item.text} disablePadding sx={{ mb: 0.3 }}>
                        <ListItemButton
                          onClick={() => onNavigation(item.path)}
                          sx={{
                            borderRadius: 2,
                            py: 0.8,
                            px: 1.5,
                            bgcolor: isActive ? "#dc2626" : "transparent",
                            color: isActive ? "white" : "#666",
                            "&:hover": {
                              bgcolor: isActive ? "#b91c1c" : "rgba(220, 38, 38, 0.1)",
                              color: isActive ? "white" : "#171717",
                            },
                            boxShadow: isActive ? 1 : 0,
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Icon sx={{ fontSize: 18, color: isActive ? "white" : "#dc2626" }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={item.text}
                            primaryTypographyProps={{
                              fontSize: "0.85rem",
                              fontWeight: isActive ? "bold" : "medium",
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    )
                  })}
                </List>
              </Collapse>
            </>
          )}
        </List>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: "rgba(220, 38, 38, 0.05)",
          borderTop: "1px solid rgba(220, 38, 38, 0.2)",
          textAlign: "center",
          borderRadius: 0,
          position: "sticky",
          bottom: 0,
          zIndex: 1,
        }}
      >
        <Chip
          label="Sistema v1.0"
          size="small"
          sx={{
            bgcolor: "white",
            color: "#dc2626",
            border: "1px solid rgba(220, 38, 38, 0.3)",
            fontWeight: "medium",
            mb: 0.5,
            fontSize: "0.7rem",
            height: 24,
          }}
        />
        <Typography variant="caption" sx={{ display: "block", color: "#666", fontSize: "0.7rem" }}>
          © 2025 Nina Lubricantes
        </Typography>
      </Paper>
    </Box>
  )
}

export default Sidebar
