"use client"

import { useState } from "react"
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
  Lock as LockIcon,
} from "@mui/icons-material"
import { useUsuarios } from "../../hooks/useUsuarios"
import UsuarioForm from "../../components/Usuarios/UsuarioForm"
import PermisosModal from "../../components/Configuracion/PermisosModal"

const GestionUsuariosPage = () => {
  const {
    usuarios,
    loading,
    error,
    pagination,
    loadUsuarios,
    handlePageChange,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    clearError,
  } = useUsuarios()

  const [searchTerm, setSearchTerm] = useState("")
  const [searchBy, setSearchBy] = useState("nombre")
  const [roleFilter, setRoleFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })
  const [formLoading, setFormLoading] = useState(false)
  const [openPermisosModal, setOpenPermisosModal] = useState(false)
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null)

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: "", severity: "success" })
    clearError()
  }

  const handleSearch = () => {
    const filters = {}
    if (searchTerm) filters.search = searchTerm
    if (roleFilter) filters.rol = roleFilter
    if (statusFilter) filters.activo = statusFilter === "activo"

    loadUsuarios(filters)
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setRoleFilter("")
    setStatusFilter("")
    setSearchBy("nombre")
    loadUsuarios()
  }

  const handleCreate = () => {
    setEditingUser(null)
    setModalOpen(true)
  }

  const handleEdit = (usuario) => {
    setEditingUser(usuario)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingUser(null)
  }

  const handleSave = async (formData) => {
    setFormLoading(true)
    try {
      if (editingUser) {
        await updateUsuario(editingUser.id, formData)
        setSnackbar({
          open: true,
          message: "Usuario actualizado correctamente",
          severity: "success",
        })
      } else {
        await createUsuario(formData)
        setSnackbar({
          open: true,
          message: "Usuario creado correctamente",
          severity: "success",
        })
      }
      handleCloseModal()
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Error al guardar usuario",
        severity: "error",
      })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (usuario) => {
    if (window.confirm(`¿Está seguro de eliminar al usuario ${usuario.nombre}?`)) {
      try {
        await deleteUsuario(usuario.id)
        setSnackbar({
          open: true,
          message: "Usuario eliminado correctamente",
          severity: "success",
        })
      } catch (err) {
        setSnackbar({
          open: true,
          message: err.message || "Error al eliminar usuario",
          severity: "error",
        })
      }
    }
  }

  const handlePageChangeLocal = (event, newPage) => {
    handlePageChange(newPage + 1, pagination.limit)
  }

  const handleRowsPerPageChangeLocal = (event) => {
    const newLimit = Number.parseInt(event.target.value, 10)
    handlePageChange(1, newLimit)
  }

  const handleOpenPermisosModal = (usuario) => {
    if (usuario.rol === "empleado") {
      setUsuarioSeleccionado(usuario)
      setOpenPermisosModal(true)
    }
  }

  const handleClosePermisosModal = () => {
    setOpenPermisosModal(false)
    setUsuarioSeleccionado(null)
  }

  const handlePermisosExitoso = () => {
    // Refrescar la lista de usuarios
    loadUsuarios()
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
              Usuarios
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
                <MenuItem value="email">Email</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder="Buscar usuarios..."
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
              onClick={handleCreate}
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
              Nuevo Usuario
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
                      Usuario
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
                      Email
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
                      Rol
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
                      Sucursales
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
                        <span className="text-gray-500 text-sm">Cargando usuarios...</span>
                      </TableCell>
                    </TableRow>
                  ) : usuarios.length === 0 ? (
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
                          <span className="text-gray-500 mb-2 text-sm">No se encontraron usuarios</span>
                          <span className="text-xs text-gray-400">Utiliza "Nuevo Usuario" para agregar registros</span>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    usuarios.map((usuario) => (
                      <TableRow
                        key={usuario.id}
                        sx={{
                          "&:hover": { bgcolor: "#f8fafc" },
                          opacity: usuario.activo ? 1 : 0.5,
                        }}
                      >
                        <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                          <span className="font-medium text-sm text-slate-900">
                            {usuario.nombre} {usuario.apellido}
                          </span>
                        </TableCell>
                        <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                          <span className="text-xs text-slate-700">{usuario.email}</span>
                        </TableCell>
                        <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                          <Chip
                            label={usuario.rol === "admin" ? "Administrador" : "Empleado"}
                            size="small"
                            sx={{
                              bgcolor: usuario.rol === "admin" ? "#eff6ff" : "#f3f4f6",
                              color: usuario.rol === "admin" ? "#1e40af" : "#6b7280",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              height: "24px",
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                            {usuario.sucursales && usuario.sucursales.length > 0 ? (
                              usuario.sucursales.map((sucursal) => (
                                <Chip
                                  key={sucursal.id}
                                  label={sucursal.nombre}
                                  size="small"
                                  sx={{
                                    bgcolor: sucursal.es_principal ? "#fee2e2" : "#f3f4f6",
                                    color: sucursal.es_principal ? "#991b1b" : "#6b7280",
                                    fontSize: "0.7rem",
                                    fontWeight: 500,
                                    height: "22px",
                                  }}
                                />
                              ))
                            ) : (
                              <span className="text-xs text-gray-400">Sin sucursales</span>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                          <Chip
                            label={usuario.activo ? "Activo" : "Inactivo"}
                            size="small"
                            sx={{
                              bgcolor: usuario.activo ? "#dcfce7" : "#fee2e2",
                              color: usuario.activo ? "#166534" : "#991b1b",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              height: "24px",
                            }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                          <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                            {usuario.rol === "empleado" && (
                              <Tooltip title="Asignar Permisos">
                                <IconButton
                                  onClick={() => handleOpenPermisosModal(usuario)}
                                  size="small"
                                  sx={{
                                    color: "#7c3aed",
                                    p: 0.5,
                                    "&:hover": { bgcolor: "#f3e8ff" },
                                  }}
                                >
                                  <LockIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            )}

                            <Tooltip title="Editar">
                              <IconButton
                                onClick={() => handleEdit(usuario)}
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
                                onClick={() => handleDelete(usuario)}
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
              page={(pagination.page || 1) - 1}
              onPageChange={handlePageChangeLocal}
              rowsPerPage={pagination.limit}
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

      <UsuarioForm
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSave}
        usuario={editingUser}
        loading={formLoading}
      />

      <PermisosModal
        open={openPermisosModal}
        usuario={usuarioSeleccionado}
        onClose={handleClosePermisosModal}
        onSuccess={handlePermisosExitoso}
      />

      <Snackbar open={snackbar.open || !!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={error ? "error" : snackbar.severity} sx={{ borderRadius: 2 }}>
          {error || snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default GestionUsuariosPage
