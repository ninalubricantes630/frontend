"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  InputAdornment,
  TablePagination,
} from "@mui/material"
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from "@mui/icons-material"
import useSucursales from "../../hooks/useSucursales"
import SucursalForm from "../../components/Sucursales/SucursalForm"

const GestionSucursalesPage = () => {
  const { sucursales, loading, error, pagination, loadSucursales, createSucursal, updateSucursal, deleteSucursal } =
    useSucursales()

  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState("")
  const [searchBy, setSearchBy] = useState("nombre")
  const [activo, setActivo] = useState("")
  const [openForm, setOpenForm] = useState(false)
  const [selectedSucursal, setSelectedSucursal] = useState(null)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [sucursalToDelete, setSucursalToDelete] = useState(null)
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" })

  useEffect(() => {
    loadSucursales({ page, limit: rowsPerPage })
  }, [loadSucursales, page, rowsPerPage])

  const handleSearch = () => {
    setPage(1)
    const params = {
      page: 1,
      limit: rowsPerPage,
      search: search.trim(),
      ...(activo !== "" && { activo }),
    }
    loadSucursales(params)
  }

  const handleClearFilters = () => {
    setSearch("")
    setSearchBy("nombre")
    setActivo("")
    setPage(1)
    loadSucursales({ page: 1, limit: rowsPerPage })
  }

  const handleCreateSucursal = () => {
    setSelectedSucursal(null)
    setOpenForm(true)
  }

  const handleEditSucursal = (sucursal) => {
    setSelectedSucursal(sucursal)
    setOpenForm(true)
  }

  const handleDeleteSucursal = (sucursal) => {
    setSucursalToDelete(sucursal)
    setOpenDeleteDialog(true)
  }

  const confirmDelete = async () => {
    try {
      await deleteSucursal(sucursalToDelete.id)
      setNotification({
        open: true,
        message: "Sucursal eliminada exitosamente",
        severity: "success",
      })
      loadSucursales({ page, limit: rowsPerPage })
    } catch (error) {
      setNotification({
        open: true,
        message: error.message || "Error al eliminar sucursal",
        severity: "error",
      })
    } finally {
      setOpenDeleteDialog(false)
      setSucursalToDelete(null)
    }
  }

  const handleFormSubmit = async (sucursalData) => {
    try {
      if (selectedSucursal) {
        const dataToUpdate = {
          ...sucursalData,
          activo: Boolean(sucursalData.activo), // Ensure boolean type
        }
        await updateSucursal(selectedSucursal.id, dataToUpdate)
        setNotification({
          open: true,
          message: "Sucursal actualizada exitosamente",
          severity: "success",
        })
      } else {
        const dataToCreate = {
          ...sucursalData,
          activo: Boolean(sucursalData.activo), // Ensure boolean type
        }
        await createSucursal(dataToCreate)
        setNotification({
          open: true,
          message: "Sucursal creada exitosamente",
          severity: "success",
        })
      }
      setOpenForm(false)
      setSelectedSucursal(null)
      loadSucursales({ page, limit: rowsPerPage })
    } catch (error) {
      setNotification({
        open: true,
        message: error.message || "Error al guardar sucursal",
        severity: "error",
      })
    }
  }

  const handlePageChangeLocal = (event, newPage) => {
    const newPageNumber = newPage + 1
    setPage(newPageNumber)
    loadSucursales({ page: newPageNumber, limit: rowsPerPage })
  }

  const handleRowsPerPageChangeLocal = (event) => {
    const newLimit = Number.parseInt(event.target.value, 10)
    setRowsPerPage(newLimit)
    setPage(1)
    loadSucursales({ page: 1, limit: newLimit })
  }

  const totalRegistros = pagination.total

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
              Sucursales
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.875rem" }}>
              {totalRegistros} registros en total
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
                value={searchBy}
                onChange={(e) => setSearchBy(e.target.value)}
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
                <MenuItem value="ubicacion">Ubicación</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder="Buscar sucursales..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: "#64748b" }} />
                  </InputAdornment>
                ),
                endAdornment: search && (
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
              onClick={handleCreateSucursal}
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
              Nueva Sucursal
            </Button>
          </Box>
        </Box>
      </Box>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", py: 2, overflow: "hidden" }}>
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
          <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <TableContainer sx={{ flex: 1, overflow: "auto" }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        bgcolor: "#dc2626",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        py: 1.75,
                        letterSpacing: "0.025em",
                        textTransform: "uppercase",
                      }}
                    >
                      Nombre
                    </TableCell>
                    <TableCell
                      sx={{
                        bgcolor: "#dc2626",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        py: 1.75,
                        letterSpacing: "0.025em",
                        textTransform: "uppercase",
                      }}
                    >
                      Ubicación
                    </TableCell>
                    <TableCell
                      sx={{
                        bgcolor: "#dc2626",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        py: 1.75,
                        letterSpacing: "0.025em",
                        textTransform: "uppercase",
                      }}
                    >
                      Empleados
                    </TableCell>
                    <TableCell
                      sx={{
                        bgcolor: "#dc2626",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        py: 1.75,
                        letterSpacing: "0.025em",
                        textTransform: "uppercase",
                      }}
                    >
                      Estado
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: "#dc2626",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        py: 1.75,
                        letterSpacing: "0.025em",
                        textTransform: "uppercase",
                      }}
                    >
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: "center", py: 4 }}>
                        <span className="text-gray-500 text-sm">Cargando sucursales...</span>
                      </TableCell>
                    </TableRow>
                  ) : sucursales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: "center", py: 4 }}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            p: 4,
                          }}
                        >
                          <span className="text-gray-500 mb-2 text-sm">No se encontraron sucursales</span>
                          <span className="text-xs text-gray-400">Utiliza "Nueva Sucursal" para agregar registros</span>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sucursales.map((sucursal) => (
                      <TableRow
                        key={sucursal.id}
                        sx={{
                          "&:hover": { bgcolor: "#f8fafc" },
                          opacity: sucursal.activo ? 1 : 0.5,
                        }}
                      >
                        <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                          <span className="font-medium text-sm text-slate-900">{sucursal.nombre}</span>
                        </TableCell>
                        <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                          <span className="text-xs text-slate-700">{sucursal.ubicacion || "N/A"}</span>
                        </TableCell>
                        <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                          <Chip
                            label={sucursal.total_empleados || 0}
                            size="small"
                            sx={{
                              bgcolor: "#eff6ff",
                              color: "#1e40af",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              height: "24px",
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                          <Chip
                            label={sucursal.activo ? "Activa" : "Inactiva"}
                            size="small"
                            sx={{
                              bgcolor: sucursal.activo ? "#dcfce7" : "#f3f4f6",
                              color: sucursal.activo ? "#166534" : "#6b7280",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              height: "24px",
                            }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                          <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                            <Tooltip title="Editar">
                              <IconButton
                                onClick={() => handleEditSucursal(sucursal)}
                                size="small"
                                sx={{
                                  color: "#dc2626",
                                  p: 0.5,
                                  "&:hover": { bgcolor: "#fee2e2" },
                                }}
                              >
                                <EditIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Eliminar">
                              <IconButton
                                onClick={() => handleDeleteSucursal(sucursal)}
                                size="small"
                                sx={{
                                  color: "#d32f2f",
                                  p: 0.5,
                                  "&:hover": { bgcolor: "#ffebee" },
                                }}
                              >
                                <DeleteIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={pagination.total}
              page={page - 1}
              onPageChange={handlePageChangeLocal}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleRowsPerPageChangeLocal}
              rowsPerPageOptions={[10, 25, 50, 100]}
              labelRowsPerPage="Por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
              sx={{
                borderTop: "1px solid #e5e7eb",
                bgcolor: "#f8fafc",
                ".MuiTablePagination-toolbar": {
                  minHeight: 52,
                  px: 2,
                },
                ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
                  fontSize: "0.813rem",
                  color: "#64748b",
                  fontWeight: 500,
                  m: 0,
                },
                ".MuiTablePagination-select": {
                  fontSize: "0.813rem",
                  color: "#0f172a",
                  fontWeight: 600,
                },
                ".MuiIconButton-root": {
                  p: 0.75,
                  color: "#64748b",
                  "&:hover": {
                    bgcolor: "#e2e8f0",
                    color: "#dc2626",
                  },
                  "&.Mui-disabled": {
                    color: "#cbd5e1",
                  },
                },
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Modal de formulario */}
      <SucursalForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleFormSubmit}
        sucursal={selectedSucursal}
      />

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ color: "#171717", fontWeight: "bold" }}>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar la sucursal <strong>{sucursalToDelete?.nombre}</strong>?
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: "#666" }}>
            Esta acción marcará la sucursal como inactiva.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
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

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ borderRadius: 2 }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default GestionSucursalesPage
