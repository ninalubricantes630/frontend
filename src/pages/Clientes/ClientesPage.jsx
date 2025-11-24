"use client"

import { useState, useEffect } from "react"
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
  Select,
  MenuItem,
} from "@mui/material"
import { Add as AddIcon, Search as SearchIcon, Close as CloseIcon } from "@mui/icons-material"
import { useClientes } from "../../hooks/useClientes.js"
import ClientesList from "../../components/Clientes/ClientesList.jsx"
import ClienteForm from "../../components/Clientes/ClienteForm.jsx"
import ClienteDetalleModal from "../../components/Clientes/ClienteDetalleModal.jsx"

const ClientesPage = () => {
  const {
    clientes,
    loading,
    error,
    pagination,
    loadClientes,
    createCliente,
    updateCliente,
    deleteCliente,
    handlePageChange, // Usando el nuevo handler unificado
  } = useClientes()

  const [searchTerm, setSearchTerm] = useState("")
  const [searchCriteria, setSearchCriteria] = useState("nombre")
  const [formOpen, setFormOpen] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clienteToDelete, setClienteToDelete] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })
  const [detalleModalOpen, setDetalleModalOpen] = useState(false)
  const [clienteDetalle, setClienteDetalle] = useState(null)

  useEffect(() => {
    loadClientes()
  }, [])

  const handleSearch = () => {
    loadClientes(1, pagination.limit, searchTerm, searchCriteria)
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setSearchCriteria("nombre")
    loadClientes(1, pagination.limit, "", "")
  }

  const handleNewCliente = () => {
    setSelectedCliente(null)
    setFormOpen(true)
  }

  const handleEditCliente = (cliente) => {
    setSelectedCliente(cliente)
    setFormOpen(true)
  }

  const handleDeleteCliente = (cliente) => {
    setClienteToDelete(cliente)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    try {
      const result = await deleteCliente(clienteToDelete.id)
      if (result.success) {
        setSnackbar({
          open: true,
          message: "Cliente eliminado correctamente",
          severity: "success",
        })
      } else {
        setSnackbar({
          open: true,
          message: result.error || "Error al eliminar cliente",
          severity: "error",
        })
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error al eliminar cliente",
        severity: "error",
      })
    } finally {
      setDeleteDialogOpen(false)
      setClienteToDelete(null)
    }
  }

  const handleFormSubmit = async (data) => {
    try {
      let result
      if (selectedCliente) {
        result = await updateCliente(selectedCliente.id, data)
      } else {
        result = await createCliente(data)
      }

      if (result.success) {
        setSnackbar({
          open: true,
          message: selectedCliente ? "Cliente actualizado correctamente" : "Cliente creado correctamente",
          severity: "success",
        })
        setFormOpen(false)
        setTimeout(() => {
          loadClientes(pagination.currentPage, pagination.limit, searchTerm, searchCriteria)
        }, 500)
      } else {
        setSnackbar({
          open: true,
          message: result.error || "Error al guardar cliente",
          severity: "error",
        })
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error al guardar cliente",
        severity: "error",
      })
    }
  }

  const handleViewMore = (cliente) => {
    setClienteDetalle(cliente)
    setDetalleModalOpen(true)
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
              Clientes
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.875rem" }}>
              {pagination.total} registros en total
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
                minWidth: { xs: "100%", sm: 140 },
                flex: { xs: "1 1 auto", sm: "0 0 auto" },
              }}
            >
              <Select
                value={searchCriteria}
                onChange={(e) => setSearchCriteria(e.target.value)}
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
                <MenuItem value="nombre">Nombre</MenuItem>
                <MenuItem value="dni">DNI</MenuItem>
                <MenuItem value="telefono">Teléfono</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder="Buscar clientes..."
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
              onClick={handleNewCliente}
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
              Nuevo Cliente
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
          <ClientesList
            clientes={clientes}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onEdit={handleEditCliente}
            onDelete={handleDeleteCliente}
            onViewMore={handleViewMore}
          />
        </Box>
      </Box>

      <ClienteForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        cliente={selectedCliente}
        loading={loading}
      />

      <ClienteDetalleModal
        open={detalleModalOpen}
        onClose={() => setDetalleModalOpen(false)}
        cliente={clienteDetalle}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ color: "#171717", fontWeight: "bold" }}>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar al cliente{" "}
            <strong>
              {clienteToDelete?.nombre} {clienteToDelete?.apellido}
            </strong>
            ?
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: "#666" }}>
            Esta acción marcará al cliente como inactivo pero conservará su historial.
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

export default ClientesPage
