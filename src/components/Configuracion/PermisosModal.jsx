"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Collapse,
  IconButton,
} from "@mui/material"
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material"
import permisosService from "../../services/permisosService"

const PermisosModal = ({ open, usuario, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [permisosAgrupados, setPermisosAgrupados] = useState({})
  const [permisosSeleccionados, setPermisosSeleccionados] = useState(new Set())
  const [modulosExpandidos, setModulosExpandidos] = useState({})

  // Mapa de etiquetas en español para los módulos
  const moduloLabels = {
    dashboard: "Panel Principal",
    stock: "Stock y Productos",
    usuarios: "Gestión de Usuarios",
    ventas: "Ventas",
    servicios: "Servicios",
    caja: "Caja",
    clientes: "Clientes",
    reportes: "Reportes",
    vehiculos: "Vehículos",
  }

  const moduloIcons = {
    dashboard: "📊",
    stock: "📦",
    usuarios: "👥",
    ventas: "🛍️",
    servicios: "🔧",
    caja: "💰",
    clientes: "👤",
    reportes: "📋",
    vehiculos: "🚗",
  }

  useEffect(() => {
    if (open && usuario) {
      cargarPermisos()
    }
  }, [open, usuario])

  const cargarPermisos = async () => {
    try {
      setLoading(true)
      setError(null)
      const permisos = await permisosService.getPermisosUsuario(usuario.id)
      setPermisosAgrupados(permisos)

      const expandidos = {}
      Object.keys(permisos).forEach((modulo) => {
        expandidos[modulo] = false
      })
      setModulosExpandidos(expandidos)

      // Obtener permisos seleccionados
      const seleccionados = new Set()
      Object.values(permisos).forEach((modulo) => {
        modulo.forEach((permiso) => {
          if (permiso.asignado) {
            seleccionados.add(permiso.id)
          }
        })
      })
      setPermisosSeleccionados(seleccionados)
    } catch (err) {
      setError("Error al cargar los permisos")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleModulo = (modulo) => {
    setModulosExpandidos((prev) => ({
      ...prev,
      [modulo]: !prev[modulo],
    }))
  }

  const handleTogglePermiso = (permisoId) => {
    const nuevosSeleccionados = new Set(permisosSeleccionados)
    if (nuevosSeleccionados.has(permisoId)) {
      nuevosSeleccionados.delete(permisoId)
    } else {
      nuevosSeleccionados.add(permisoId)
    }
    setPermisosSeleccionados(nuevosSeleccionados)
  }

  const handleGuardar = async () => {
    try {
      setSaving(true)
      setError(null)
      const permisosArray = Array.from(permisosSeleccionados)
      await permisosService.actualizarPermisosUsuario(usuario.id, permisosArray)
      onSuccess?.()
      onClose()
    } catch (err) {
      setError("Error al guardar los permisos")
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "#dc2626",
          color: "white",
          fontWeight: 600,
          fontSize: "1.125rem",
          p: 2.5,
        }}
      >
        Permisos de {usuario?.nombre}
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: "#fafafa" }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              },
              gap: 2,
            }}
          >
            {Object.entries(permisosAgrupados).map(([modulo, permisos]) => {
              const isExpanded = modulosExpandidos[modulo]
              const permisosActivos = permisos.filter((p) => permisosSeleccionados.has(p.id)).length

              return (
                <Box
                  key={modulo}
                  sx={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    overflow: "hidden",
                    bgcolor: "#fff",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "#dc2626",
                      boxShadow: "0 2px 8px rgba(220, 38, 38, 0.1)",
                    },
                  }}
                >
                  <Box
                    onClick={() => handleToggleModulo(modulo)}
                    sx={{
                      bgcolor: isExpanded ? "#fef2f2" : "#fff",
                      p: 2,
                      borderBottom: isExpanded ? "1px solid #fee2e2" : "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: "#fef2f2",
                      },
                    }}
                  >
                    <Typography sx={{ fontSize: "1.25rem" }}>{moduloIcons[modulo]}</Typography>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: "#1f2937",
                          fontSize: "0.875rem",
                          lineHeight: 1.4,
                        }}
                      >
                        {moduloLabels[modulo] || modulo}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          color: permisosActivos > 0 ? "#dc2626" : "#9ca3af",
                          fontWeight: 500,
                        }}
                      >
                        {permisosActivos}/{permisos.length} activos
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      sx={{
                        transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                        color: "#6b7280",
                      }}
                    >
                      <ExpandMoreIcon />
                    </IconButton>
                  </Box>

                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <FormGroup sx={{ p: 2, gap: 0.5 }}>
                      {permisos.map((permiso) => (
                        <FormControlLabel
                          key={permiso.id}
                          control={
                            <Checkbox
                              checked={permisosSeleccionados.has(permiso.id)}
                              onChange={() => handleTogglePermiso(permiso.id)}
                              size="small"
                              sx={{
                                color: "#d1d5db",
                                "&.Mui-checked": {
                                  color: "#dc2626",
                                },
                              }}
                            />
                          }
                          label={
                            <Box>
                              <Typography
                                sx={{
                                  fontSize: "0.8125rem",
                                  fontWeight: 500,
                                  color: permisosSeleccionados.has(permiso.id) ? "#1f2937" : "#6b7280",
                                }}
                              >
                                {permiso.nombre}
                              </Typography>
                              {permiso.descripcion && (
                                <Typography
                                  sx={{
                                    fontSize: "0.6875rem",
                                    color: "#9ca3af",
                                    mt: 0.25,
                                  }}
                                >
                                  {permiso.descripcion}
                                </Typography>
                              )}
                            </Box>
                          }
                          sx={{
                            m: 0,
                            py: 1,
                            px: 1.5,
                            borderRadius: "6px",
                            transition: "all 0.15s ease",
                            backgroundColor: permisosSeleccionados.has(permiso.id) ? "#fef2f2" : "transparent",
                            "&:hover": {
                              backgroundColor: "#f9fafb",
                            },
                          }}
                        />
                      ))}
                    </FormGroup>
                  </Collapse>
                </Box>
              )
            })}
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions
        sx={{
          p: 2.5,
          display: "flex",
          gap: 1.5,
          justifyContent: "flex-end",
          bgcolor: "#fff",
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            textTransform: "none",
            color: "#6b7280",
            borderColor: "#e5e7eb",
            px: 3,
            py: 0.75,
            fontSize: "0.875rem",
            "&:hover": {
              borderColor: "#d1d5db",
              bgcolor: "#f9fafb",
            },
          }}
          variant="outlined"
          disabled={saving}
        >
          Cancelar
        </Button>

        <Button
          onClick={handleGuardar}
          sx={{
            textTransform: "none",
            bgcolor: "#dc2626",
            color: "white",
            px: 3,
            py: 0.75,
            fontSize: "0.875rem",
            fontWeight: 600,
            "&:hover": {
              bgcolor: "#b91c1c",
            },
            "&:disabled": {
              bgcolor: "#fecaca",
              color: "white",
            },
          }}
          variant="contained"
          disabled={loading || saving}
        >
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PermisosModal
