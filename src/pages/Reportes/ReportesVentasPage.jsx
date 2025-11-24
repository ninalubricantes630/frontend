"use client"

import { useState, useEffect, useCallback } from "react"
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
import ventasService from "../../services/ventasService.js"
import VentasList from "../../components/Ventas/VentasList.jsx"
import VentaDetalleModal from "../../components/Ventas/VentaDetalleModal.jsx"
import { useAuth } from "../../contexts/AuthContext"
import { useSucursales } from "../../hooks/useSucursales"

const ReportesVentasPage = () => {
  const { user } = useAuth()
  const { sucursales, loadSucursales } = useSucursales()

  const [ventas, setVentas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })

  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    sucursal_id: "",
    tipo_pago: "",
    estado: "",
    fecha_desde: "",
    fecha_hasta: "",
  })
  const [usuarioTieneMultiplesSucursales, setUsuarioTieneMultiplesSucursales] = useState(false)

  const [selectedVenta, setSelectedVenta] = useState(null)
  const [detalleModalOpen, setDetalleModalOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [ventaToCancel, setVentaToCancel] = useState(null)
  const [motivoCancelacion, setMotivoCancelacion] = useState("")

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })

  useEffect(() => {
    if (user?.sucursales && user.sucursales.length > 0) {
      if (user.sucursales.length === 1) {
        // User has only one sucursal - set it as default filter
        setFilters((prev) => ({
          ...prev,
          sucursal_id: user.sucursales[0].id,
        }))
        setUsuarioTieneMultiplesSucursales(false)
      } else {
        // User has multiple sucursales - allow filtering
        setUsuarioTieneMultiplesSucursales(true)
      }
    }
  }, [user])

  useEffect(() => {
    if (user?.sucursales && user.sucursales.length > 0) {
      loadVentas()
    }
    loadSucursales({ limit: 100 })
  }, [user])

  useEffect(() => {
    if (!user?.sucursales || user.sucursales.length === 0) return

    const timeoutId = setTimeout(() => {
      loadVentas()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, filters, user])

  const loadVentas = useCallback(
    async (page = 1, limit = 10) => {
      if (!user?.sucursales || user.sucursales.length === 0) return

      try {
        setLoading(true)
        setError(null)

        const params = {
          page,
          limit,
        }

        if (searchTerm) {
          params.search = searchTerm
        }

        if (filters.sucursal_id) {
          params.sucursal_id = filters.sucursal_id
        } else if (user.sucursales.length === 1) {
          params.sucursal_id = user.sucursales[0].id
        } else {
          params.sucursales_ids = user.sucursales.map((s) => s.id).join(",")
        }

        if (filters.tipo_pago) {
          params.tipo_pago = filters.tipo_pago
        }

        if (filters.estado) {
          params.estado = filters.estado
        }

        if (filters.fecha_desde) {
          params.fecha_desde = filters.fecha_desde
        }

        if (filters.fecha_hasta) {
          params.fecha_hasta = filters.fecha_hasta
        }

        const response = await ventasService.getAll(params)

        if (response.data && response.data.ventas) {
          setVentas(response.data.ventas)
          setPagination({
            page: response.data.pagination.page,
            limit: response.data.pagination.limit,
            total: response.data.pagination.total,
            totalPages: response.data.pagination.totalPages,
          })
        }
      } catch (err) {
        console.error("Error al cargar ventas:", err)
        setError("Error al cargar las ventas")
        showSnackbar("Error al cargar las ventas", "error")
      } finally {
        setLoading(false)
      }
    },
    [searchTerm, filters, user],
  )

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity })
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    const newFilters = {
      sucursal_id: "",
      tipo_pago: "",
      estado: "",
      fecha_desde: "",
      fecha_hasta: "",
    }

    if (user?.sucursales && user.sucursales.length === 1) {
      newFilters.sucursal_id = user.sucursales[0].id
    }

    setFilters(newFilters)
    setShowFilters(false)
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

  const handlePageChange = (page, newLimit = null) => {
    if (newLimit) {
      loadVentas(1, newLimit)
    } else {
      loadVentas(page, pagination.limit)
    }
  }

  const handleViewMore = async (venta) => {
    try {
      const response = await ventasService.getById(venta.id)
      setSelectedVenta(response.data)
      setDetalleModalOpen(true)
    } catch (error) {
      console.error("Error al cargar detalles de la venta:", error)
      showSnackbar("Error al cargar los detalles de la venta", "error")
    }
  }

  const handleCancelVenta = (venta) => {
    setVentaToCancel(venta)
    setMotivoCancelacion("")
    setCancelDialogOpen(true)
  }

  const confirmCancel = async () => {
    try {
      await ventasService.cancel(ventaToCancel.id, motivoCancelacion)
      showSnackbar("Venta cancelada correctamente", "success")
      setCancelDialogOpen(false)
      setVentaToCancel(null)
      setMotivoCancelacion("")
      loadVentas(pagination.page, pagination.limit)
    } catch (error) {
      console.error("Error al cancelar venta:", error)
      showSnackbar("Error al cancelar la venta: " + (error.response?.data?.message || error.message), "error")
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
              Reportes de Ventas
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.875rem" }}>
              {pagination.total} {pagination.total === 1 ? "registro" : "registros"}
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
              placeholder="Buscar ventas..."
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
                    fontWeight: 600,
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
                  <MenuItem value="">Todas las sucursales</MenuItem>
                  {user.sucursales.map((sucursal) => (
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
          <VentasList
            ventas={ventas}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onView={handleViewMore}
            onCancel={handleCancelVenta}
          />
        </Box>
      </Box>

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
            Cancelar Venta
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography sx={{ color: "#475569", mb: 2 }}>
            ¿Estás seguro de que deseas cancelar la venta <strong>#{ventaToCancel?.numero}</strong>?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Motivo de cancelación"
            value={motivoCancelacion}
            onChange={(e) => setMotivoCancelacion(e.target.value)}
            placeholder="Describe el motivo de la cancelación..."
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
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
            sx={{
              bgcolor: "#dc2626",
              borderRadius: 2,
              px: 3,
              "&:hover": { bgcolor: "#b91c1c" },
            }}
          >
            Confirmar Cancelación
          </Button>
        </DialogActions>
      </Dialog>

      <VentaDetalleModal open={detalleModalOpen} onClose={() => setDetalleModalOpen(false)} venta={selectedVenta} />

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ReportesVentasPage
