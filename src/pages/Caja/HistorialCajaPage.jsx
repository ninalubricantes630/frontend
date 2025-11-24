"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Box,
  Typography,
  TextField,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  Chip,
  Button,
} from "@mui/material"
import { FilterList as FilterListIcon, Refresh as RefreshIcon } from "@mui/icons-material"
import { useAuth } from "../../contexts/AuthContext"
import cajaService from "../../services/cajaService"
import SesionesList from "../../components/Caja/SesionesList"
import DetalleSesionModal from "../../components/Caja/DetalleSesionModal"

export default function HistorialCajaPage() {
  const { user } = useAuth()

  const [sesiones, setSesiones] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })

  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    sucursal_id: "",
    estado: "",
    fecha_desde: "",
    fecha_hasta: "",
  })
  const [usuarioTieneMultiplesSucursales, setUsuarioTieneMultiplesSucursales] = useState(false)
  const [sesionSeleccionada, setSesionSeleccionada] = useState(null)
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false)

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
    if (user?.sucursales && user.sucursales.length > 0) {
      loadSesiones()
    }
  }, [user])

  useEffect(() => {
    if (!user?.sucursales || user.sucursales.length === 0) return

    const timeoutId = setTimeout(() => {
      loadSesiones()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, filters, user])

  const loadSesiones = useCallback(
    async (page = 1, limit = 10) => {
      if (!user?.sucursales || user.sucursales.length === 0) return

      try {
        setLoading(true)
        setError(null)

        const params = {
          page,
          limit,
        }

        if (filters.sucursal_id) {
          params.sucursalId = filters.sucursal_id
        } else if (user.sucursales.length === 1) {
          params.sucursalId = user.sucursales[0].id
        }

        if (filters.estado) {
          params.estado = filters.estado
        }

        if (filters.fecha_desde) {
          params.fechaDesde = filters.fecha_desde
        }

        if (filters.fecha_hasta) {
          params.fechaHasta = filters.fecha_hasta
        }


        const response = await cajaService.getHistorial(params)


        if (response && response.sesiones) {
          const sesionesData = response.sesiones || []
          const paginationData = response.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
          }


          setSesiones(sesionesData)
          setPagination(paginationData)
        } else {
          console.error("[v0] Estructura de respuesta inesperada:", response)
          setSesiones([])
          setPagination({ page: 1, limit: 10, total: 0, totalPages: 0 })
        }
      } catch (err) {
        console.error("[v0] Error al cargar sesiones:", err)
        console.error("[v0] Error completo:", {
          message: err.message,
          response: err.response,
          data: err.response?.data,
        })
        setError("Error al cargar el historial de sesiones")
        setSesiones([])
      } finally {
        setLoading(false)
      }
    },
    [filters, user],
  )

  const handleLoadMovimientos = async (sesionId) => {
    try {
      const response = await cajaService.getMovimientos(sesionId, { limit: 100 })
      return response.data?.movimientos || []
    } catch (error) {
      console.error("Error al cargar movimientos:", error)
      return []
    }
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    const newFilters = {
      sucursal_id: "",
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
    if (filters.estado) count++
    if (filters.fecha_desde || filters.fecha_hasta) count++
    return count
  }

  const handlePageChange = (page, newLimit = null) => {
    if (newLimit) {
      loadSesiones(1, newLimit)
    } else {
      loadSesiones(page, pagination.limit)
    }
  }

  const handleVerDetalle = (sesion) => {
    setSesionSeleccionada(sesion)
    setModalDetalleOpen(true)
  }

  const handleCloseDetalle = () => {
    setModalDetalleOpen(false)
    setSesionSeleccionada(null)
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
              Historial de Caja
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.875rem" }}>
              {pagination.total} {pagination.total === 1 ? "sesión registrada" : "sesiones registradas"}
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
            <Button
              variant="outlined"
              startIcon={<RefreshIcon sx={{ fontSize: 18 }} />}
              onClick={() => loadSesiones(pagination.page, pagination.limit)}
              disabled={loading}
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
              Actualizar
            </Button>

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
                <MenuItem value="ABIERTA">Abierta</MenuItem>
                <MenuItem value="CERRADA">Cerrada</MenuItem>
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
          <SesionesList
            sesiones={sesiones}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onViewDetalle={handleVerDetalle}
          />
        </Box>
      </Box>

      <DetalleSesionModal open={modalDetalleOpen} onClose={handleCloseDetalle} sesion={sesionSeleccionada} />
    </Box>
  )
}
