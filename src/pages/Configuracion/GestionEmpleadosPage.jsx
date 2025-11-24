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
import useEmpleados from "../../hooks/useEmpleados"
import EmpleadoForm from "../../components/Empleados/EmpleadoForm"

const GestionEmpleadosPage = () => {
  const {
    empleados,
    loading,
    error,
    pagination,
    loadEmpleados,
    handlePageChange,
    createEmpleado,
    updateEmpleado,
    deleteEmpleado,
  } = useEmpleados()

  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState("")
  const [searchBy, setSearchBy] = useState("nombre")
  const [activo, setActivo] = useState("")
  const [openForm, setOpenForm] = useState(false)
  const [selectedEmpleado, setSelectedEmpleado] = useState(null)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [empleadoToDelete, setEmpleadoToDelete] = useState(null)
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" })

  useEffect(() => {
    loadEmpleados({ page, limit: rowsPerPage })
  }, [loadEmpleados, page, rowsPerPage])

  const handleSearch = () => {
    setPage(1)
    loadEmpleados({ page: 1, limit: rowsPerPage, search: search.trim(), ...(activo !== "" && { activo }) })
  }

  const handleClearFilters = () => {
    setSearch("")
    setSearchBy("nombre")
    setActivo("")
    setPage(1)
    loadEmpleados({ page: 1, limit: rowsPerPage })
  }

  const handleCreateEmpleado = () => {
    setSelectedEmpleado(null)
    setOpenForm(true)
  }

  const handleEditEmpleado = (empleado) => {
    setSelectedEmpleado(empleado)
    setOpenForm(true)
  }

  const handleDeleteEmpleado = (empleado) => {
    setEmpleadoToDelete(empleado)
    setOpenDeleteDialog(true)
  }

  const confirmDelete = async () => {
    try {
      await deleteEmpleado(empleadoToDelete.id)
      setNotification({
        open: true,
        message: "Empleado eliminado exitosamente",
        severity: "success",
      })
      loadEmpleados({ page, limit: rowsPerPage, search: search.trim(), ...(activo !== "" && { activo }) })
    } catch (error) {
      setNotification({
        open: true,
        message: error.message || "Error al eliminar empleado",
        severity: "error",
      })
    } finally {
      setOpenDeleteDialog(false)
      setEmpleadoToDelete(null)
    }
  }

  const handleFormSubmit = async (empleadoData) => {
    try {
      if (selectedEmpleado) {
        await updateEmpleado(selectedEmpleado.id, empleadoData)
        setNotification({
          open: true,
          message: "Empleado actualizado exitosamente",
          severity: "success",
        })
      } else {
        await createEmpleado(empleadoData)
        setNotification({
          open: true,
          message: "Empleado creado exitosamente",
          severity: "success",
        })
      }
      setOpenForm(false)
      loadEmpleados({ page, limit: rowsPerPage, search: search.trim(), ...(activo !== "" && { activo }) })
    } catch (error) {
      setNotification({
        open: true,
        message: error.message || "Error al guardar empleado",
        severity: "error",
      })
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("es-AR")
  }

  const handlePageChangeLocal = (event, newPage) => {
    const newPageNumber = newPage + 1
    setPage(newPageNumber)
    handlePageChange(newPageNumber, rowsPerPage)
  }

  const handleRowsPerPageChangeLocal = (event) => {
    const newLimit = Number.parseInt(event.target.value, 10)
    setRowsPerPage(newLimit)
    setPage(1)
    handlePageChange(1, newLimit)
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
              Empleados
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
                <MenuItem value="apellido">Apellido</MenuItem>
                <MenuItem value="telefono">Teléfono</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder="Buscar empleados..."
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
              onClick={handleCreateEmpleado}
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
              Nuevo Empleado
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
                      Empleado
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
                      Sucursal
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
                      Teléfono
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
                      Cargo
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
                      <TableCell colSpan={6} sx={{ textAlign: "center", py: 4 }}>
                        <span className="text-gray-500 text-sm">Cargando empleados...</span>
                      </TableCell>
                    </TableRow>
                  ) : empleados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: "center", py: 4 }}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            p: 4,
                          }}
                        >
                          <span className="text-gray-500 mb-2 text-sm">No se encontraron empleados</span>
                          <span className="text-xs text-gray-400">Utiliza "Nuevo Empleado" para agregar registros</span>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    empleados.map((empleado) => (
                      <TableRow
                        key={empleado.id}
                        sx={{
                          "&:hover": { bgcolor: "#f8fafc" },
                          opacity: empleado.activo ? 1 : 0.5,
                        }}
                      >
                        <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                          <span className="font-medium text-sm text-slate-900">
                            {empleado.nombre} {empleado.apellido}
                          </span>
                        </TableCell>
                        <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                          <span className="text-xs text-slate-700">{empleado.sucursal_nombre || "N/A"}</span>
                        </TableCell>
                        <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                          <span className="text-xs text-slate-700">{empleado.telefono || "N/A"}</span>
                        </TableCell>
                        <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                          <span className="text-xs text-slate-700">{empleado.cargo || "N/A"}</span>
                        </TableCell>
                        <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                          <Chip
                            label={empleado.activo ? "Activo" : "Inactivo"}
                            size="small"
                            sx={{
                              bgcolor: empleado.activo ? "#dcfce7" : "#f3f4f6",
                              color: empleado.activo ? "#166534" : "#6b7280",
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
                                onClick={() => handleEditEmpleado(empleado)}
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
                                onClick={() => handleDeleteEmpleado(empleado)}
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
      <EmpleadoForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleFormSubmit}
        empleado={selectedEmpleado}
      />

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ color: "#171717", fontWeight: "bold" }}>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar al empleado{" "}
            <strong>
              {empleadoToDelete?.nombre} {empleadoToDelete?.apellido}
            </strong>
            ?
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: "#666" }}>
            Esta acción marcará al empleado como inactivo.
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

export default GestionEmpleadosPage
