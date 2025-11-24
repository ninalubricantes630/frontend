"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"
import { Add as AddIcon, Search as SearchIcon, Close as CloseIcon } from "@mui/icons-material"
import { useVehiculos } from "../../hooks/useVehiculos"
import clientesService from "../../services/clientesService"
import VehiculoForm from "../../components/Vehiculos/VehiculoForm"
import VehiculosList from "../../components/Vehiculos/VehiculosList"
import logger from "../../utils/logger"

const VehiculosPage = () => {
  const {
    vehiculos,
    loading,
    error,
    pagination,
    loadVehiculos,
    createVehiculo,
    updateVehiculo,
    deleteVehiculo,
    handlePageChange,
  } = useVehiculos()

  const [formOpen, setFormOpen] = useState(false)
  const [selectedVehiculo, setSelectedVehiculo] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchCriteria, setSearchCriteria] = useState("patente")
  const [clientes, setClientes] = useState([])
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [vehiculoToDelete, setVehiculoToDelete] = useState(null)

  useEffect(() => {
    loadVehiculos({ page: 1, limit: 10 })
    if (searchCriteria === "cliente") {
      loadClientes()
    }
  }, [searchCriteria])

  const loadClientes = async () => {
    try {
      const result = await clientesService.getClientes(1, 1000)
      if (result && result.data && Array.isArray(result.data)) {
        setClientes(result.data.filter((c) => c.activo))
      } else {
        setClientes([])
      }
    } catch (error) {
      logger.error("Error al cargar clientes", error)
      setClientes([])
    }
  }

  const handleSearch = () => {
    loadVehiculos({ page: 1, limit: pagination.limit, search: searchTerm, searchCriteria })
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setSearchCriteria("patente")
    loadVehiculos({ page: 1, limit: pagination.limit, search: "", searchCriteria: "patente" })
  }

  const handleNewVehiculo = () => {
    setSelectedVehiculo(null)
    setFormOpen(true)
  }

  const handleEditVehiculo = (vehiculo) => {
    setSelectedVehiculo(vehiculo)
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setSelectedVehiculo(null)
  }

  const handleSaveVehiculo = async (vehiculoData) => {
    try {
      logger.debug("Guardando vehículo", vehiculoData)
      let result
      if (selectedVehiculo) {
        result = await updateVehiculo(selectedVehiculo.id, vehiculoData)
      } else {
        result = await createVehiculo(vehiculoData)
      }

      logger.debug("Resultado de guardar vehículo", result)
      if (result.success) {
        setSnackbar({
          open: true,
          message: selectedVehiculo ? "Vehículo actualizado correctamente" : "Vehículo creado correctamente",
          severity: "success",
        })
        handleCloseForm()
        setTimeout(() => {
          loadVehiculos({ page: pagination.page, limit: pagination.limit, search: searchTerm, searchCriteria })
        }, 500)
      } else {
        setSnackbar({
          open: true,
          message: result.error || "Error al guardar el vehículo",
          severity: "error",
        })
      }
    } catch (error) {
      logger.error("Error en handleSaveVehiculo", error)
      setSnackbar({
        open: true,
        message: "Error al guardar el vehículo",
        severity: "error",
      })
    }
  }

  const handleDeleteVehiculo = (vehiculo) => {
    setVehiculoToDelete(vehiculo)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    try {
      const result = await deleteVehiculo(vehiculoToDelete.id)
      if (result.success) {
        setSnackbar({
          open: true,
          message: "Vehículo eliminado correctamente",
          severity: "success",
        })
      } else {
        setSnackbar({
          open: true,
          message: result.error || "Error al eliminar el vehículo",
          severity: "error",
        })
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error al eliminar el vehículo",
        severity: "error",
      })
    } finally {
      setDeleteDialogOpen(false)
      setVehiculoToDelete(null)
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const getSearchPlaceholder = () => {
    switch (searchCriteria) {
      case "patente":
        return "Buscar por patente..."
      case "marca_modelo":
        return "Buscar por marca o modelo..."
      case "cliente":
        return "Buscar por cliente..."
      default:
        return "Buscar..."
    }
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
              Vehículos
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.875rem" }}>
              {pagination?.total ?? 0} registros en total
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
            <FormControl
              size="small"
              sx={{
                minWidth: { xs: "100%", sm: 150 },
                flex: { xs: "1 1 auto", sm: "0 0 auto" },
              }}
            >
              <Select
                value={searchCriteria}
                onChange={(e) => {
                  setSearchCriteria(e.target.value)
                  setSearchTerm("")
                }}
                displayEmpty
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
                <MenuItem value="patente">Patente</MenuItem>
                <MenuItem value="marca_modelo">Marca/Modelo</MenuItem>
                <MenuItem value="cliente">Cliente</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder={getSearchPlaceholder()}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
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
                      onClick={handleClearFilters}
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
              onClick={handleSearch}
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
              Buscar
            </Button>

            <Button
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: 18 }} />}
              onClick={handleNewVehiculo}
              sx={{
                bgcolor: "#dc2626",
                color: "white",
                minWidth: { xs: "100%", sm: "auto" },
                px: 2.5,
                py: 0.75,
                fontSize: "0.875rem",
                fontWeight: 600,
                textTransform: "none",
                boxShadow: "0 1px 2px 0 rgba(220, 38, 38, 0.15)",
                "&:hover": {
                  bgcolor: "#b91c1c",
                  boxShadow: "0 4px 6px -1px rgba(220, 38, 38, 0.2)",
                },
              }}
            >
              Nuevo Vehículo
            </Button>
          </Box>
        </Box>
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
          <VehiculosList
            vehiculos={vehiculos}
            loading={loading}
            pagination={pagination}
            onEdit={handleEditVehiculo}
            onDelete={handleDeleteVehiculo}
            onPageChange={handlePageChange}
          />
        </Box>
      </Box>

      <VehiculoForm
        open={formOpen}
        onClose={handleCloseForm}
        vehiculo={selectedVehiculo}
        onSubmit={handleSaveVehiculo}
        loading={loading}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ color: "#171717", fontWeight: "bold" }}>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar el vehículo <strong>{vehiculoToDelete?.patente}</strong>?
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: "#666" }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{
              borderColor: "#171717",
              color: "#171717",
            }}
          >
            Cancelar
          </Button>
          <Button onClick={confirmDelete} variant="contained" color="error" sx={{ borderRadius: 1 }}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default VehiculosPage
