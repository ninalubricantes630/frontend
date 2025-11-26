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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import SaveIcon from "@mui/icons-material/Save"
import CancelIcon from "@mui/icons-material/Close"
import * as permisosService from "../../services/permisosService"

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
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "8px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "#dc2626",
          color: "white",
          fontWeight: 700,
          fontSize: "1.125rem",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        🔐 Asignar Permisos a {usuario?.nombre}
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {Object.entries(permisosAgrupados).map(([modulo, permisos]) => (
              <Accordion
                key={modulo}
                defaultExpanded
                sx={{
                  border: "1px solid #e5e7eb",
                  "&:before": {
                    display: "none",
                  },
                  "&.Mui-expanded": {
                    margin: 0,
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    bgcolor: "#f9fafb",
                    "& .MuiAccordionSummary-content": {
                      margin: "8px 0",
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: "#1f2937",
                      fontSize: "0.95rem",
                    }}
                  >
                    {moduloLabels[modulo] || modulo}
                  </Typography>
                </AccordionSummary>

                <AccordionDetails sx={{ pt: 2, pb: 2 }}>
                  <FormGroup>
                    {permisos.map((permiso) => (
                      <FormControlLabel
                        key={permiso.id}
                        control={
                          <Checkbox
                            checked={permisosSeleccionados.has(permiso.id)}
                            onChange={() => handleTogglePermiso(permiso.id)}
                            size="small"
                            sx={{
                              color: "#dc2626",
                              "&.Mui-checked": {
                                color: "#dc2626",
                              },
                            }}
                          />
                        }
                        label={
                          <Box>
                            <Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>{permiso.nombre}</Typography>
                            <Typography
                              sx={{
                                fontSize: "0.75rem",
                                color: "#6b7280",
                                mt: 0.25,
                              }}
                            >
                              {permiso.descripcion}
                            </Typography>
                          </Box>
                        }
                        sx={{ mb: 1.5 }}
                      />
                    ))}
                  </FormGroup>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions
        sx={{
          p: 2,
          display: "flex",
          gap: 1,
          justifyContent: "flex-end",
        }}
      >
        <Button
          onClick={onClose}
          startIcon={<CancelIcon sx={{ fontSize: 18 }} />}
          sx={{
            textTransform: "none",
            color: "#6b7280",
            borderColor: "#e5e7eb",
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
          startIcon={<SaveIcon sx={{ fontSize: 18 }} />}
          sx={{
            textTransform: "none",
            bgcolor: "#dc2626",
            color: "white",
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
          fullWidth
        >
          {saving ? "Guardando..." : "Guardar Permisos"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PermisosModal
