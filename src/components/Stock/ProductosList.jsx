"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TablePagination,
} from "@mui/material"
import {
  Edit as EditIcon,
  SwapVert as SwapVertIcon,
  ToggleOff as ToggleOffIcon,
  ToggleOn as ToggleOnIcon,
  Inventory as InventoryIcon,
  History as HistoryIcon,
} from "@mui/icons-material"
import { formatCurrency, formatQuantity } from "../../utils/formatters"
import { useAuth } from "../../contexts/AuthContext"

const getStockColor = (stock) => {
  if (stock > 50) {
    return "success"
  } else if (stock > 20) {
    return "warning"
  } else {
    return "error"
  }
}

const ProductosList = ({
  productos,
  loading,
  pagination,
  onEdit,
  onToggleEstado,
  onMovimiento,
  onVerHistorial,
  onPageChange,
}) => {
  const [toggleDialog, setToggleDialog] = useState({ open: false, producto: null })
  const { hasPermissionSlug, isAdmin } = useAuth()

  const handleToggleClick = (producto) => {
    setToggleDialog({ open: true, producto })
  }

  const handleToggleConfirm = () => {
    if (toggleDialog.producto) {
      onToggleEstado(toggleDialog.producto.id)
    }
    setToggleDialog({ open: false, producto: null })
  }

  const handleToggleCancel = () => {
    setToggleDialog({ open: false, producto: null })
  }

  const handleChangePage = (event, newPage) => {
    onPageChange(newPage + 1)
  }

  const handleChangeRowsPerPage = (event) => {
    const newLimit = Number.parseInt(event.target.value, 10)
    onPageChange(1, newLimit)
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <span className="text-gray-500 text-sm">Cargando...</span>
      </Box>
    )
  }

  if (!productos || !Array.isArray(productos) || productos.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          p: 4,
        }}
      >
        <InventoryIcon sx={{ fontSize: 64, color: "#cbd5e1", mb: 2 }} />
        <span className="text-gray-500 mb-2 text-sm">No se encontraron productos</span>
        <span className="text-xs text-gray-400">Utiliza "Nuevo Producto" para agregar registros</span>
      </Box>
    )
  }

  return (
    <>
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
                  Producto
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
                  Categoría
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
                  Fabricante
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
                  Precio
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
                  Stock
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
              {productos.map((producto) => (
                <TableRow
                  key={producto.id}
                  sx={{
                    "&:hover": { bgcolor: "#f8fafc" },
                    opacity: producto.activo ? 1 : 0.5,
                  }}
                >
                  <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                    <Box>
                      <span className="font-medium text-sm text-slate-900">{producto.nombre}</span>
                      {producto.descripcion && (
                        <Typography variant="caption" display="block" sx={{ color: "#64748b" }}>
                          {producto.descripcion}
                        </Typography>
                      )}
                      {producto.codigo && (
                        <Typography variant="caption" display="block" sx={{ color: "#64748b" }}>
                          Código: {producto.codigo}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                    <Chip
                      label={producto.categoria_nombre || "Sin categoría"}
                      size="small"
                      sx={{
                        bgcolor: "#f1f5f9",
                        color: "#475569",
                        fontWeight: 500,
                        fontSize: "0.6875rem",
                        height: 22,
                        "& .MuiChip-label": { px: 1 },
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                    <span className="text-xs text-slate-700">{producto.fabricante || "N/A"}</span>
                  </TableCell>
                  <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                    <span className="text-xs text-slate-700">{producto.sucursal_nombre || "N/A"}</span>
                  </TableCell>
                  <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                    <span className="font-medium text-xs text-slate-900">{formatCurrency(producto.precio)}</span>
                  </TableCell>
                  <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                    <Chip
                      label={`${formatQuantity(producto.stock, producto.unidad_medida)} ${producto.unidad_medida === "litro" ? "L" : "u"}`}
                      color={getStockColor(producto.stock)}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: "0.6875rem",
                        fontWeight: 500,
                        "& .MuiChip-label": { px: 1 },
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                    <Chip
                      label={producto.activo ? "Activo" : "Inactivo"}
                      size="small"
                      sx={{
                        bgcolor: producto.activo ? "#dcfce7" : "#fee2e2",
                        color: producto.activo ? "#166534" : "#991b1b",
                        fontWeight: 500,
                        fontSize: "0.6875rem",
                        height: 22,
                        "& .MuiChip-label": { px: 1 },
                      }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                    <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                      {(isAdmin() || hasPermissionSlug("stock_editar")) && (
                        <IconButton
                          size="small"
                          onClick={() => onEdit(producto)}
                          sx={{
                            color: "#dc2626",
                            p: 0.5,
                            "&:hover": { bgcolor: "#fee2e2" },
                          }}
                        >
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      )}

                      {(isAdmin() || hasPermissionSlug("stock_registrar_movimientos")) && (
                        <IconButton
                          size="small"
                          onClick={() => onMovimiento(producto)}
                          disabled={!producto.activo}
                          sx={{
                            color: "#2563eb",
                            p: 0.5,
                            "&:hover": { bgcolor: "#dbeafe" },
                            "&.Mui-disabled": {
                              color: "#cbd5e1",
                            },
                          }}
                        >
                          <SwapVertIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      )}

                      {(isAdmin() || hasPermissionSlug("stock_ver_movimientos")) && (
                        <IconButton
                          size="small"
                          onClick={() => onVerHistorial(producto)}
                          sx={{
                            color: "#7c3aed",
                            p: 0.5,
                            "&:hover": { bgcolor: "#ede9fe" },
                          }}
                        >
                          <HistoryIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      )}

                      {(isAdmin() || hasPermissionSlug("stock_eliminar")) && (
                        <IconButton
                          size="small"
                          onClick={() => handleToggleClick(producto)}
                          sx={{
                            color: producto.activo ? "#1f2937" : "#16a34a",
                            p: 0.5,
                            "&:hover": {
                              bgcolor: producto.activo ? "#f3f4f6" : "#dcfce7",
                            },
                          }}
                        >
                          {producto.activo ? (
                            <ToggleOnIcon sx={{ fontSize: 16 }} />
                          ) : (
                            <ToggleOffIcon sx={{ fontSize: 16 }} />
                          )}
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={pagination?.total || 0}
          page={(pagination?.currentPage || 1) - 1}
          onPageChange={handleChangePage}
          rowsPerPage={pagination?.limit || 10}
          onRowsPerPageChange={handleChangeRowsPerPage}
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

      <Dialog open={toggleDialog.open} onClose={handleToggleCancel} PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ color: "#171717", fontWeight: "bold" }}>Confirmar Cambio de Estado</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas {toggleDialog.producto?.activo ? "desactivar" : "activar"} el producto{" "}
            <strong>{toggleDialog.producto?.nombre}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={handleToggleCancel}
            variant="outlined"
            sx={{
              borderColor: "#171717",
              color: "#171717",
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleToggleConfirm}
            variant="contained"
            sx={{
              bgcolor: toggleDialog.producto?.activo ? "#dc2626" : "#16a34a",
              "&:hover": {
                bgcolor: toggleDialog.producto?.activo ? "#b91c1c" : "#15803d",
              },
            }}
          >
            {toggleDialog.producto?.activo ? "Desactivar" : "Activar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ProductosList
