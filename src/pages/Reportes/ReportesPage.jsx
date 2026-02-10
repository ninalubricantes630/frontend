"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  Chip,
} from "@mui/material"
import { Search as SearchIcon, FilterList as FilterListIcon, Close as CloseIcon } from "@mui/icons-material"
import { useServicios } from "../../hooks/useServicios.js"
import ServiciosList from "../../components/Servicios/ServiciosList.jsx"
import ServicioDetalleModal from "../../components/Servicios/ServicioDetalleModal.jsx"
import serviciosService from "../../services/serviciosService.js"
import { useAuth } from "../../contexts/AuthContext"
import { useSucursales } from "../../hooks/useSucursales"
import PermissionGuard from "../../components/Auth/PermissionGuard"

const ReportesPage = () => {
  const { user } = useAuth()
  const { sucursales, loadSucursales } = useSucursales()

  const {
    servicios,
    loading,
    error,
    pagination,
    loadServicios,
    updateServicio,
    deleteServicio,
    searchServicios,
    handlePageChange,
  } = useServicios()

  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    sucursal_id: "",
    searchCriteria: "numero",
    tipo_pago: "",
    estado: "",
    fecha_desde: "",
    fecha_hasta: "",
  })
  const [usuarioTieneMultiplesSucursales, setUsuarioTieneMultiplesSucursales] = useState(false)

  const [selectedServicio, setSelectedServicio] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [servicioToDelete, setServicioToDelete] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })
  const [detalleModalOpen, setDetalleModalOpen] = useState(false)
  const [servicioDetalle, setServicioDetalle] = useState(null)
  const [clienteFilter, setClienteFilter] = useState(null)
  const [clienteFilterName, setClienteFilterName] = useState("")
  const [vehiculoFilter, setVehiculoFilter] = useState(null)

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [servicioToCancel, setServicioToCancel] = useState(null)
  const [motivoCancelacion, setMotivoCancelacion] = useState("")
  const loadServiciosDataRef = useRef(null)

  useEffect(() => {
    if (user?.sucursales && user.sucursales.length > 0) {
      if (user.sucursales.length === 1) {
        setFilters((prev) => ({
          ...prev,
          sucursal_id: user.sucursales[0].id,
        }))
        setUsuarioTieneMultiplesSucursales(false)
      } else {
        setUsuarioTieneMultiplesSucursales(true)
      }
    }
  }, [user])

  useEffect(() => {
    loadSucursales({ limit: 100 })
    if (!user?.sucursales || user.sucursales.length === 0) return
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("cliente")) return
    loadServiciosData()
  }, [user])

  loadServiciosDataRef.current = loadServiciosData

  useEffect(() => {
    if (!user?.sucursales || user.sucursales.length === 0) return
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("cliente")) return

    const timeoutId = setTimeout(() => {
      if (loadServiciosDataRef.current) loadServiciosDataRef.current()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, filters, user, loadServiciosData])

  const handleViewMore = (servicio) => {
    loadSpecificService(servicio.id, true)
  }

  const handlePageChangeReportes = (page, newLimit) => {
    loadServiciosData(page, newLimit || pagination.limit)
  }

  const loadServiciosData = useCallback(
    async (page = 1, limit = 10, clienteIdParam = null) => {
      if (!user?.sucursales || user.sucursales.length === 0) return

      try {
        const additionalParams = {}

        if (filters.sucursal_id) {
          additionalParams.sucursal_id = filters.sucursal_id
        } else if (user.sucursales.length === 1) {
          additionalParams.sucursal_id = user.sucursales[0].id
        } else {
          additionalParams.sucursales_ids = user.sucursales.map((s) => s.id).join(",")
        }

        if (filters.tipo_pago) {
          additionalParams.tipo_pago = filters.tipo_pago
        }

        if (filters.estado) {
          additionalParams.estado = filters.estado
        }

        if (filters.fecha_desde) {
          additionalParams.fecha_desde = filters.fecha_desde
        }

        if (filters.fecha_hasta) {
          additionalParams.fecha_hasta = filters.fecha_hasta
        }

        const clienteIdToUse = clienteIdParam ?? clienteFilter
        if (clienteIdToUse) {
          additionalParams.clienteId = String(clienteIdToUse)
        }

        await loadServicios(page, searchTerm, limit, additionalParams)
      } catch (err) {
        showSnackbar("Error al cargar los servicios", "error")
      }
    },
    [searchTerm, filters, user, loadServicios, clienteFilter],
  )

  useEffect(() => {
    if (!user?.sucursales || user.sucursales.length === 0) return

    const urlParams = new URLSearchParams(window.location.search)
    const clienteId = urlParams.get("cliente")
    const vehiculoPatente = urlParams.get("vehiculo")
    const servicioId = urlParams.get("servicio")
    const autoOpen = urlParams.get("autoOpen")

    if (clienteId) {
      setClienteFilter(clienteId)
      loadServiciosData(1, 10, clienteId)
    } else if (vehiculoPatente) {
      loadServiciosByVehiculo(vehiculoPatente)
    } else if (servicioId) {
      loadSpecificService(servicioId, autoOpen === "true")
    } else {
      loadServiciosData()
    }
  }, [user])

  useEffect(() => {
    if (clienteFilter && servicios.length > 0 && servicios[0].cliente_nombre) {
      const nombre = `${servicios[0].cliente_nombre} ${servicios[0].cliente_apellido || ""}`.trim()
      setClienteFilterName((prev) => (prev === nombre ? prev : nombre))
    } else if (clienteFilter && servicios.length === 0) {
      setClienteFilterName("")
    }
  }, [clienteFilter, servicios])

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity })
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    const newFilters = {
      sucursal_id: "",
      searchCriteria: "numero",
      tipo_pago: "",
      estado: "",
      fecha_desde: "",
      fecha_hasta: "",
    }

    if (user?.sucursales && user.sucursales.length === 1) {
      newFilters.sucursal_id = user.sucursales[0].id
    }

    setFilters(newFilters)
    setClienteFilter(null)
    setVehiculoFilter(null)
    setShowFilters(false)

    window.history.replaceState({}, document.title, window.location.pathname)
    loadServiciosData(1)
  }

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const activeFiltersCount = () => {
    let count = 0
    if (usuarioTieneMultiplesSucursales && filters.sucursal_id) count++
    if (filters.tipo_pago) count++
    if (filters.estado) count++
    if (filters.fecha_desde || filters.fecha_hasta) count++
    return count
  }

  const handleEditServicio = (servicio) => {
    setSelectedServicio(servicio)
  }

  const handleDeleteServicio = (servicio) => {
    setServicioToDelete(servicio)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    try {
      const servicioId = servicioToDelete.id || servicioToDelete.servicio_id || servicioToDelete.ID
      if (!servicioId) {
        throw new Error("No se pudo obtener el ID del servicio")
      }

      await deleteServicio(servicioId)
      showSnackbar("Servicio eliminado correctamente", "success")
    } catch (error) {
      showSnackbar("Error al eliminar servicio: " + error.message, "error")
    } finally {
      setDeleteDialogOpen(false)
      setServicioToDelete(null)
    }
  }

  const handleCancelarServicio = (servicio) => {
    setServicioToCancel(servicio)
    setMotivoCancelacion("")
    setCancelDialogOpen(true)
  }

  const confirmCancel = async () => {
    try {
      await serviciosService.cancel(servicioToCancel.id, motivoCancelacion)
      showSnackbar("Servicio cancelado correctamente", "success")
      setCancelDialogOpen(false)
      setServicioToCancel(null)
      setMotivoCancelacion("")
      loadServiciosData()
    } catch (error) {
      console.error("Error al cancelar servicio:", error)
      showSnackbar("Error al cancelar el servicio: " + (error.response?.data?.message || error.message), "error")
    }
  }

  const loadSpecificService = async (servicioId, shouldAutoOpen = false) => {
    try {
      const response = await serviciosService.getServicioById(servicioId)

      if (response && Object.keys(response).length > 0) {
        setServicioDetalle(response)
        if (shouldAutoOpen) {
          setDetalleModalOpen(true)
        }
      } else {
        console.error("Response is empty or undefined")
        showSnackbar("Error: No se recibieron datos del servicio", "error")
      }
    } catch (error) {
      console.error("Error al cargar servicio específico:", error)
      showSnackbar("Error al cargar el servicio específico", "error")
    }
  }

  const loadServiciosByVehiculo = async (patente) => {
    try {
      const response = await serviciosService.getServiciosByVehiculo(patente)
      const serviciosData = Array.isArray(response) ? response : response.data || []

      if (serviciosData.length > 0) {
        const vehicleName = `${serviciosData[0].patente} - ${serviciosData[0].marca} ${serviciosData[0].modelo}`
        setClienteFilterName(`Vehículo: ${vehicleName}`)
      }
    } catch (error) {
      console.error("Error al cargar servicios del vehículo:", error)
      showSnackbar("Error al cargar los servicios del vehículo", "error")
    }
  }

  if (!user?.sucursales || user.sucursales.length === 0) {
    return (
      <Box sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
        <Alert severity="warning">No tienes sucursales asignadas. Por favor contacta al administrador.</Alert>
      </Box>
    )
  }

  return (
    <PermissionGuard requiredPermission="view_servicios">
      <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", bgcolor: "#f8fafc" }}>
        <Box
          sx={{
            bgcolor: "white",
            borderBottom: "1px solid #e5e7eb",
            px: { xs: 2, sm: 2, md: 2 },
            py: { xs: 2, sm: 2.5 },
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "stretch", md: "center" },
              gap: { xs: 2, md: 0 },
            }}
          >
            <Box sx={{ mb: { xs: 0, md: 0 } }}>
              <Typography
                variant="h5"
                component="h1"
                sx={{ fontWeight: 700, color: "#0f172a", mb: 0.5, letterSpacing: "-0.025em" }}
              >
                Reportes de Servicios
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.875rem" }}>
                {pagination.total} {pagination.total === 1 ? "registro" : "registros"}
                {clienteFilterName && ` - ${clienteFilterName}`}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 1.5,
                alignItems: { xs: "stretch", sm: "center" },
                flexWrap: "wrap",
              }}
            >
              <TextField
                size="small"
                placeholder="Buscar servicios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: "#64748b" }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <CloseIcon
                        sx={{ fontSize: 18, color: "#64748b", cursor: "pointer" }}
                        onClick={() => setSearchTerm("")}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: { xs: "100%", sm: 280 },
                  flex: { xs: "1 1 auto", sm: "0 0 auto" },
                  bgcolor: "#f8fafc",
                  fontSize: "0.875rem",
                  "& .MuiOutlinedInput-root": {
                    fontSize: "0.875rem",
                    "& fieldset": {
                      borderColor: "#e5e7eb",
                    },
                    "&:hover fieldset": {
                      borderColor: "#cbd5e1",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#dc2626",
                      borderWidth: "1px",
                    },
                  },
                }}
              />

              <Button
                variant="outlined"
                startIcon={<FilterListIcon sx={{ fontSize: 18 }} />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{
                  minWidth: { xs: "100%", sm: "auto" },
                  px: 2.5,
                  py: 0.75,
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  borderColor: showFilters ? "#dc2626" : "#e5e7eb",
                  color: showFilters ? "#dc2626" : "#475569",
                  bgcolor: showFilters ? "#fef2f2" : "#f8fafc",
                  textTransform: "none",
                  position: "relative",
                  "&:hover": {
                    borderColor: "#dc2626",
                    bgcolor: "#fef2f2",
                  },
                }}
              >
                Filtros
                {activeFiltersCount() > 0 && (
                  <Chip
                    label={activeFiltersCount()}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      height: 20,
                      minWidth: 20,
                      bgcolor: "#dc2626",
                      color: "white",
                      fontSize: "0.688rem",
                      fontWeight: 700,
                      "& .MuiChip-label": {
                        px: 0.75,
                      },
                    }}
                  />
                )}
              </Button>
            </Box>
          </Box>

          <Collapse in={showFilters}>
            <Box
              sx={{
                mt: 2,
                pt: 2,
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                flexWrap: "wrap",
                gap: 1.5,
                alignItems: "center",
              }}
            >
              {usuarioTieneMultiplesSucursales && (
                <FormControl
                  size="small"
                  sx={{
                    minWidth: { xs: "100%", sm: 180 },
                    flex: { xs: "1 1 auto", sm: "0 0 auto" },
                  }}
                >
                  <InputLabel>Sucursal</InputLabel>
                  <Select
                    value={filters.sucursal_id}
                    label="Sucursal"
                    onChange={(e) => handleFilterChange("sucursal_id", e.target.value)}
                    sx={{
                      bgcolor: "#f8fafc",
                      fontSize: "0.875rem",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#e5e7eb",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#cbd5e1",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#dc2626",
                        borderWidth: "1px",
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>Todas las sucursales</em>
                    </MenuItem>
                    {sucursales.map((sucursal) => (
                      <MenuItem key={sucursal.id} value={sucursal.id}>
                        {sucursal.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <TextField
                size="small"
                type="date"
                label="Desde"
                value={filters.fecha_desde}
                onChange={(e) => handleFilterChange("fecha_desde", e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  width: { xs: "100%", sm: 150 },
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#f8fafc",
                    fontSize: "0.875rem",
                    "& fieldset": {
                      borderColor: "#e5e7eb",
                    },
                    "&:hover fieldset": {
                      borderColor: "#cbd5e1",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#dc2626",
                      borderWidth: "1px",
                    },
                  },
                }}
              />

              <TextField
                size="small"
                type="date"
                label="Hasta"
                value={filters.fecha_hasta}
                onChange={(e) => handleFilterChange("fecha_hasta", e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  width: { xs: "100%", sm: 150 },
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#f8fafc",
                    fontSize: "0.875rem",
                    "& fieldset": {
                      borderColor: "#e5e7eb",
                    },
                    "&:hover fieldset": {
                      borderColor: "#cbd5e1",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#dc2626",
                      borderWidth: "1px",
                    },
                  },
                }}
              />

              <FormControl
                size="small"
                sx={{
                  minWidth: { xs: "100%", sm: 140 },
                  flex: { xs: "1 1 auto", sm: "0 0 auto" },
                }}
              >
                <InputLabel>Tipo de Pago</InputLabel>
                <Select
                  value={filters.tipo_pago}
                  label="Tipo de Pago"
                  onChange={(e) => handleFilterChange("tipo_pago", e.target.value)}
                  sx={{
                    bgcolor: "#f8fafc",
                    fontSize: "0.875rem",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#e5e7eb",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#cbd5e1",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#dc2626",
                      borderWidth: "1px",
                    },
                  }}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="EFECTIVO">Efectivo</MenuItem>
                  <MenuItem value="TARJETA_CREDITO">Tarjeta de Crédito</MenuItem>
                  <MenuItem value="TRANSFERENCIA">Transferencia</MenuItem>
                  <MenuItem value="CUENTA_CORRIENTE">Cuenta Corriente</MenuItem>
                  <MenuItem value="PAGO_MULTIPLE">Pago Múltiple</MenuItem>
                </Select>
              </FormControl>

              <FormControl
                size="small"
                sx={{
                  minWidth: { xs: "100%", sm: 120 },
                  flex: { xs: "1 1 auto", sm: "0 0 auto" },
                }}
              >
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filters.estado}
                  label="Estado"
                  onChange={(e) => handleFilterChange("estado", e.target.value)}
                  sx={{
                    bgcolor: "#f8fafc",
                    fontSize: "0.875rem",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#e5e7eb",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#cbd5e1",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#dc2626",
                      borderWidth: "1px",
                    },
                  }}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="COMPLETADA">Completada</MenuItem>
                  <MenuItem value="CANCELADA">Cancelada</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                onClick={handleClearFilters}
                sx={{
                  minWidth: { xs: "100%", sm: "auto" },
                  px: 2.5,
                  py: 0.75,
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  borderColor: "#e5e7eb",
                  color: "#475569",
                  bgcolor: "#f8fafc",
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "#cbd5e1",
                    bgcolor: "white",
                  },
                }}
              >
                Limpiar Filtros
              </Button>
            </Box>
          </Collapse>
        </Box>

        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", py: 2, overflow: "hidden" }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, py: 0.5 }}>
              {error}
            </Alert>
          )}

          {clienteFilter && (
            <Alert
              severity="info"
              sx={{ mb: 2, borderRadius: 2, border: "1px solid #dbeafe" }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={handleClearFilters}
                  sx={{ fontWeight: 600, color: "#1e40af" }}
                >
                  Limpiar Filtro
                </Button>
              }
            >
              Mostrando servicios: {clienteFilterName}
            </Alert>
          )}

          <Box
            sx={{
              flex: 1,
              maxHeight: "calc(100vh - 220px)",
              overflow: "hidden",
              bgcolor: "white",
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
            }}
          >
            <ServiciosList
              servicios={servicios}
              loading={loading}
              pagination={pagination}
              onPageChange={handlePageChangeReportes}
              onEdit={handleEditServicio}
              onDelete={handleDeleteServicio}
              onView={handleViewMore}
              onCancel={handleCancelarServicio}
            />
          </Box>
        </Box>

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              border: "1px solid #e5e7eb",
            },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              borderBottom: "1px solid #e5e7eb",
              pb: 2,
            }}
          >
            <Box
              sx={{
                width: 4,
                height: 32,
                bgcolor: "#dc2626",
                borderRadius: 1,
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#0f172a" }}>
              Confirmar Eliminación
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Typography sx={{ color: "#475569", mb: 1 }}>
              ¿Estás seguro de que deseas eliminar el servicio <strong>#{servicioToDelete?.numero}</strong>?
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Esta acción marcará el servicio como inactivo pero conservará su historial.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, gap: 1, borderTop: "1px solid #e5e7eb" }}>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              variant="outlined"
              sx={{
                borderColor: "#e5e7eb",
                color: "#475569",
                borderRadius: 2,
                px: 3,
                "&:hover": {
                  borderColor: "#cbd5e1",
                  bgcolor: "#f8fafc",
                },
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmDelete}
              variant="contained"
              sx={{
                bgcolor: "#dc2626",
                borderRadius: 2,
                px: 3,
                "&:hover": { bgcolor: "#b91c1c" },
              }}
            >
              Confirmar Eliminación
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={cancelDialogOpen}
          onClose={() => setCancelDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              border: "1px solid #e5e7eb",
            },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              borderBottom: "1px solid #e5e7eb",
              pb: 2,
            }}
          >
            <Box
              sx={{
                width: 4,
                height: 32,
                bgcolor: "#dc2626",
                borderRadius: 1,
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#0f172a" }}>
              Cancelar Servicio
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Typography sx={{ color: "#475569", mb: 2 }}>
              ¿Estás seguro de que deseas cancelar el servicio <strong>#{servicioToCancel?.numero}</strong>?
            </Typography>
            <TextField
              fullWidth
              label="Motivo de Cancelación"
              value={motivoCancelacion}
              onChange={(e) => setMotivoCancelacion(e.target.value)}
              multiline
              rows={3}
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#e5e7eb",
                  },
                  "&:hover fieldset": {
                    borderColor: "#cbd5e1",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#dc2626",
                    borderWidth: "1px",
                  },
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5, gap: 1, borderTop: "1px solid #e5e7eb" }}>
            <Button
              onClick={() => setCancelDialogOpen(false)}
              variant="outlined"
              sx={{
                borderColor: "#e5e7eb",
                color: "#475569",
                borderRadius: 2,
                px: 3,
                "&:hover": {
                  borderColor: "#cbd5e1",
                  bgcolor: "#f8fafc",
                },
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmCancel}
              variant="contained"
              disabled={!motivoCancelacion.trim()}
              sx={{
                bgcolor: "#dc2626",
                borderRadius: 2,
                px: 3,
                "&:hover": { bgcolor: "#b91c1c" },
                "&:disabled": {
                  bgcolor: "#cbd5e1",
                  color: "#94a3b8",
                },
              }}
            >
              Confirmar Cancelación
            </Button>
          </DialogActions>
        </Dialog>

        {detalleModalOpen && servicioDetalle && (
          <ServicioDetalleModal
            open={detalleModalOpen}
            onClose={() => {
              setDetalleModalOpen(false)
              setServicioDetalle(null)
            }}
            servicio={servicioDetalle}
          />
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </PermissionGuard>
  )
}

export default ReportesPage
