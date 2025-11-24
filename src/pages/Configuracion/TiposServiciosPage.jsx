"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Tooltip,
  Snackbar,
  Alert,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material"
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from "@mui/icons-material"
import { useTiposServicios } from "../../hooks/useTiposServicios"

const TiposServiciosPage = () => {
  const {
    tiposServicios,
    loading,
    pagination,
    loadTiposServicios,
    createTipoServicio,
    updateTipoServicio,
    deleteTipoServicio,
    handlePageChange,
  } = useTiposServicios()

  const [searchTerm, setSearchTerm] = useState("")
  const [searchCriteria, setSearchCriteria] = useState("nombre")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTipoServicio, setEditingTipoServicio] = useState(null)
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tipoServicioToDelete, setTipoServicioToDelete] = useState(null)
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  })

  useEffect(() => {
    loadTiposServicios()
  }, [])

  const showNotification = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity,
    })
  }

  const handleSearch = () => {
    loadTiposServicios(1, searchTerm)
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setSearchCriteria("nombre")
    loadTiposServicios(1, "")
  }

  const handleOpenDialog = (tipoServicio = null) => {
    if (tipoServicio) {
      setEditingTipoServicio(tipoServicio)
      setFormData({
        nombre: tipoServicio.nombre,
        descripcion: tipoServicio.descripcion || "",
      })
    } else {
      setEditingTipoServicio(null)
      setFormData({
        nombre: "",
        descripcion: "",
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingTipoServicio(null)
    setFormData({
      nombre: "",
      descripcion: "",
    })
  }

  const handleSubmit = async () => {
    try {
      if (editingTipoServicio) {
        await updateTipoServicio(editingTipoServicio.id, formData)
        showNotification("Tipo de servicio actualizado exitosamente")
      } else {
        await createTipoServicio(formData)
        showNotification("Tipo de servicio creado exitosamente")
      }
      handleCloseDialog()
    } catch (error) {
      showNotification("Error al procesar la solicitud", "error")
    }
  }

  const handleDeleteClick = (tipoServicio) => {
    setTipoServicioToDelete(tipoServicio)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (tipoServicioToDelete) {
      try {
        await deleteTipoServicio(tipoServicioToDelete.id)
        setDeleteDialogOpen(false)
        setTipoServicioToDelete(null)
        showNotification("Tipo de servicio eliminado exitosamente")
      } catch (error) {
        showNotification("Error al eliminar el tipo de servicio", "error")
      }
    }
  }

  const handlePageChangeLocal = (event, newPage) => {
    handlePageChange(newPage + 1, pagination.limit)
  }

  const handleRowsPerPageChange = (event) => {
    const newLimit = Number.parseInt(event.target.value, 10)
    handlePageChange(1, newLimit)
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
              Tipos de Servicios
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
                <MenuItem value="descripcion">Descripción</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder="Buscar tipos de servicios..."
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
              onClick={() => handleOpenDialog()}
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
              Nuevo Tipo de Servicio
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
                      Descripción
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
                      <TableCell colSpan={4} sx={{ textAlign: "center", py: 4 }}>
                        <span className="text-gray-500 text-sm">Cargando tipos de servicios...</span>
                      </TableCell>
                    </TableRow>
                  ) : Array.isArray(tiposServicios) && tiposServicios.length > 0 ? (
                    tiposServicios.map((tipoServicio) => (
                      <TableRow
                        key={tipoServicio.id}
                        sx={{
                          "&:hover": { bgcolor: "#f8fafc" },
                          opacity: tipoServicio.activo ? 1 : 0.5,
                        }}
                      >
                        <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                          <span className="font-medium text-sm text-slate-900">{tipoServicio.nombre}</span>
                        </TableCell>
                        <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                          {tipoServicio.descripcion ? (
                            <span className="text-xs text-slate-700">{tipoServicio.descripcion}</span>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                          <Chip
                            label={tipoServicio.activo ? "Activo" : "Inactivo"}
                            size="small"
                            sx={{
                              bgcolor: tipoServicio.activo ? "#dcfce7" : "#f3f4f6",
                              color: tipoServicio.activo ? "#166534" : "#6b7280",
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
                                onClick={() => handleOpenDialog(tipoServicio)}
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
                                onClick={() => handleDeleteClick(tipoServicio)}
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
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ textAlign: "center", py: 4 }}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            p: 4,
                          }}
                        >
                          <span className="text-gray-500 mb-2 text-sm">No hay tipos de servicios registrados</span>
                          <span className="text-xs text-gray-400">
                            Utiliza "Nuevo Tipo de Servicio" para agregar registros
                          </span>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={pagination?.total || 0}
              page={(pagination?.page || 1) - 1}
              onPageChange={handlePageChangeLocal}
              rowsPerPage={pagination?.limit || 10}
              onRowsPerPageChange={handleRowsPerPageChange}
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

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            height: "auto",
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#fff",
            borderBottom: "1px solid #e5e7eb",
            p: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 8,
                height: 32,
                backgroundColor: "#dc2626",
                borderRadius: 1,
              }}
            />
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600, color: "#171717" }}>
              {editingTipoServicio ? "Editar Tipo de Servicio" : "Nuevo Tipo de Servicio"}
            </Typography>
          </Box>
          <IconButton
            onClick={handleCloseDialog}
            size="small"
            sx={{
              color: "#6b7280",
              "&:hover": {
                backgroundColor: "#f3f4f6",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 4, px: 3, pb: 3, backgroundColor: "#fafafa" }}>
          <Box mt={2}>
            {/* Información Básica */}
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    bgcolor: "#dc2626",
                  }}
                >
                  <Typography sx={{ fontSize: 12, color: "white", fontWeight: 600 }}>T</Typography>
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                  Información del Tipo de Servicio
                </Typography>
              </Box>
              <Box
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: 1.5,
                  p: 2.5,
                  border: "1px solid #e5e7eb",
                }}
              >
                <TextField
                  fullWidth
                  label="Nombre del Tipo de Servicio *"
                  value={formData.nombre}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej: Cambio de aceite"
                  size="small"
                  required
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                      backgroundColor: "#fafafa",
                      "&:hover fieldset": {
                        borderColor: "#cbd5e1",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#dc2626",
                        borderWidth: "1px",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#dc2626",
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Descripción (Opcional)"
                  value={formData.descripcion}
                  onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Describe brevemente este tipo de servicio..."
                  size="small"
                  multiline
                  rows={4}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                      backgroundColor: "#fafafa",
                      "&:hover fieldset": {
                        borderColor: "#cbd5e1",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#dc2626",
                        borderWidth: "1px",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#dc2626",
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2.5,
            backgroundColor: "#fff",
            borderTop: "1px solid #e5e7eb",
            gap: 1.5,
          }}
        >
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            size="medium"
            sx={{
              borderColor: "#d1d5db",
              color: "#6b7280",
              borderRadius: 1.5,
              px: 3,
              py: 1,
              fontWeight: 500,
              textTransform: "none",
              fontSize: "0.875rem",
              "&:hover": {
                backgroundColor: "#f9fafb",
                borderColor: "#9ca3af",
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            size="medium"
            disabled={!formData.nombre.trim()}
            sx={{
              backgroundColor: "#dc2626",
              borderRadius: 1.5,
              px: 3,
              py: 1,
              fontWeight: 500,
              textTransform: "none",
              fontSize: "0.875rem",
              boxShadow: "0 1px 3px rgba(220, 38, 38, 0.3)",
              "&:hover": {
                backgroundColor: "#b91c1c",
                boxShadow: "0 2px 6px rgba(220, 38, 38, 0.4)",
              },
              "&:disabled": {
                opacity: 0.6,
                backgroundColor: "#cbd5e1",
                color: "#9ca3af",
              },
            }}
          >
            {editingTipoServicio ? "Actualizar" : "Crear Tipo de Servicio"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#fff",
            borderBottom: "1px solid #e5e7eb",
            p: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 8,
                height: 32,
                backgroundColor: "#dc2626",
                borderRadius: 1,
              }}
            />
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600, color: "#171717" }}>
              Confirmar Eliminación
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 3, px: 3, pb: 2, backgroundColor: "#fafafa" }}>
          <Box
            sx={{
              backgroundColor: "#fff",
              borderRadius: 1.5,
              p: 2.5,
              border: "1px solid #e5e7eb",
            }}
          >
            <Typography variant="body1" sx={{ mb: 1.5, color: "#374151" }}>
              ¿Estás seguro de que deseas eliminar el tipo de servicio <strong>{tipoServicioToDelete?.nombre}</strong>?
            </Typography>
            <Typography variant="body2" sx={{ color: "#6b7280" }}>
              Esta acción marcará el tipo de servicio como inactivo.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2.5,
            backgroundColor: "#fff",
            borderTop: "1px solid #e5e7eb",
            gap: 1.5,
          }}
        >
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            size="medium"
            sx={{
              borderColor: "#d1d5db",
              color: "#6b7280",
              borderRadius: 1.5,
              px: 3,
              py: 1,
              fontWeight: 500,
              textTransform: "none",
              fontSize: "0.875rem",
              "&:hover": {
                backgroundColor: "#f9fafb",
                borderColor: "#9ca3af",
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            size="medium"
            sx={{
              backgroundColor: "#dc2626",
              borderRadius: 1.5,
              px: 3,
              py: 1,
              fontWeight: 500,
              textTransform: "none",
              fontSize: "0.875rem",
              boxShadow: "0 1px 3px rgba(220, 38, 38, 0.3)",
              "&:hover": {
                backgroundColor: "#b91c1c",
                boxShadow: "0 2px 6px rgba(220, 38, 38, 0.4)",
              },
            }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
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

export default TiposServiciosPage
