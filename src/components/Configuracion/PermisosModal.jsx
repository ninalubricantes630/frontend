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
} from "@mui/material"
import permisosService from "../../services/permisosService"

const PermisosModal = ({ open, usuario, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [permisosAgrupados, setPermisosAgrupados] = useState({})
  const [permisosSeleccionados, setPermisosSeleccionados] = useState(new Set())

  // Mapa de etiquetas en español para los módulos
  const moduloLabels = {
    dashboard: "📊 Panel Principal",
    stock: "📦 Stock y Productos",
    usuarios: "👥 Gestión de Usuarios",
    ventas: "🛍️ Ventas",
    servicios: "🔧 Servicios",
    caja: "💰 Caja",
    clientes: "👤 Clientes",
    reportes: "📋 Reportes",
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
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "#dc2626",
          color: "white",
          fontWeight: 700,
          fontSize: "1.25rem",
          p: 3,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        🔐 Permisos de {usuario?.nombre}
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
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
                sm: "1fr 1fr",
              },
              gap: 2,
              mt: 4
            }}
          >
            {Object.entries(permisosAgrupados).map(([modulo, permisos]) => (
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
                    boxShadow: "0 4px 12px rgba(220, 38, 38, 0.08)",
                  },
                }}
              >
                {/* Encabezado del módulo */}
                <Box
                  sx={{
                    bgcolor: "#f9fafb",
                    p: 2,
                    borderBottom: "2px solid #e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: "#1f2937",
                      fontSize: "1rem",
                      flex: 1,
                    }}
                  >
                    {moduloLabels[modulo] || modulo}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      bgcolor: "#dc2626",
                      color: "white",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {permisos.filter((p) => permisosSeleccionados.has(p.id)).length}/{permisos.length}
                  </Typography>
                </Box>

                {/* Permisos del módulo */}
                <FormGroup sx={{ p: 2, gap: 1 }}>
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
                            flexShrink: 0,
                          }}
                        />
                      }
                      label={
                        <Box sx={{ ml: 1 }}>
                          <Typography
                            sx={{
                              fontSize: "0.875rem",
                              fontWeight: 500,
                              color: permisosSeleccionados.has(permiso.id) ? "#1f2937" : "#6b7280",
                              transition: "color 0.2s ease",
                            }}
                          >
                            {permiso.nombre}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "0.75rem",
                              color: "#9ca3af",
                              mt: 0.25,
                            }}
                          >
                            {permiso.descripcion}
                          </Typography>
                        </Box>
                      }
                      sx={{
                        m: 0,
                        py: 1,
                        px: 1,
                        borderRadius: "6px",
                        transition: "all 0.2s ease",
                        backgroundColor: permisosSeleccionados.has(permiso.id) ? "#fef2f2" : "transparent",
                        "&:hover": {
                          backgroundColor: "#f9fafb",
                        },
                      }}
                    />
                  ))}
                </FormGroup>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions
        sx={{
          p: 3,
          display: "flex",
          gap: 1.5,
          justifyContent: "flex-end",
          bgcolor: "#fafafa",
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            textTransform: "none",
            color: "#6b7280",
            borderColor: "#e5e7eb",
            px: 3,
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
          {saving ? "Guardando..." : "Guardar Permisos"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PermisosModal
