"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TablePagination,
} from "@mui/material"
import {
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  SwapHoriz as SwapHorizIcon,
  History as HistoryIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import movimientosStockService from "../../services/movimientosStockService"
import { formatQuantity } from "../../utils/formatters"

const HistorialMovimientosModal = ({ open, onClose, producto }) => {
  const [movimientos, setMovimientos] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)

  const unidadMedida = producto?.unidad_medida || "unidad"
  const isLitro = unidadMedida === "litro"

  useEffect(() => {
    if (open && producto?.id) {
      setPage(1)
      loadMovimientos(producto.id, 1, rowsPerPage)
    }
  }, [open, producto?.id])

  useEffect(() => {
    if (open && producto?.id && page > 1) {
      loadMovimientos(producto.id, page, rowsPerPage)
    }
  }, [page, rowsPerPage])

  const loadMovimientos = async (productoId, currentPage, limit) => {
    setLoading(true)
    try {
      const response = await movimientosStockService.getByProducto(productoId, currentPage, limit)

      setMovimientos(response.data || [])
      setTotalItems(response.pagination?.totalItems || 0)
    } catch (error) {
      console.error("Error al cargar movimientos:", error)
      setMovimientos([])
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1)
  }

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = Number.parseInt(event.target.value, 10)
    setRowsPerPage(newRowsPerPage)
    setPage(1)
  }

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case "ENTRADA":
        return <TrendingUpIcon />
      case "SALIDA":
        return <TrendingDownIcon />
      case "AJUSTE":
        return <SwapHorizIcon />
      default:
        return <HistoryIcon />
    }
  }

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case "ENTRADA":
        return "success"
      case "SALIDA":
        return "error"
      case "AJUSTE":
        return "warning"
      default:
        return "default"
    }
  }

  const formatFecha = (fecha) => {
    try {
      return format(new Date(fecha), "dd/MM/yyyy HH:mm", { locale: es })
    } catch (error) {
      return fecha
    }
  }

  const getUnidadLabel = () => {
    return isLitro ? "litros" : "unidades"
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, height: "auto", maxHeight: "90vh" } }}
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
          <Box>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600, color: "#171717" }}>
              Historial de Movimientos
            </Typography>
            {producto && (
              <Typography variant="body2" sx={{ color: "#6b7280", fontSize: "0.875rem" }}>
                {producto.nombre} - Stock actual: {formatQuantity(producto.stock, unidadMedida)} {getUnidadLabel()}
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
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

      <DialogContent sx={{ p: 0, backgroundColor: "#fafafa" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <Typography sx={{ color: "#6b7280" }}>Cargando movimientos...</Typography>
          </Box>
        ) : movimientos.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="300px"
            textAlign="center"
            sx={{ p: 4 }}
          >
            <InventoryIcon sx={{ fontSize: 64, color: "#d1d5db", mb: 2 }} />
            <Typography variant="h6" sx={{ color: "#6b7280", fontWeight: 500, mb: 1 }}>
              No hay movimientos registrados
            </Typography>
            <Typography variant="body2" sx={{ color: "#9ca3af" }}>
              Los movimientos de stock aparecerán aquí
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer
              component={Paper}
              sx={{
                boxShadow: 0,
                maxHeight: "calc(90vh - 180px)",
                backgroundColor: "#fff",
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "#374151",
                        fontSize: "0.875rem",
                        backgroundColor: "#f9fafb",
                        py: 1.5,
                      }}
                    >
                      Fecha
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "#374151",
                        fontSize: "0.875rem",
                        backgroundColor: "#f9fafb",
                        py: 1.5,
                      }}
                    >
                      Tipo
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "#374151",
                        fontSize: "0.875rem",
                        backgroundColor: "#f9fafb",
                        py: 1.5,
                      }}
                    >
                      Cantidad
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "#374151",
                        fontSize: "0.875rem",
                        backgroundColor: "#f9fafb",
                        py: 1.5,
                      }}
                    >
                      Stock Anterior
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "#374151",
                        fontSize: "0.875rem",
                        backgroundColor: "#f9fafb",
                        py: 1.5,
                      }}
                    >
                      Stock Nuevo
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "#374151",
                        fontSize: "0.875rem",
                        backgroundColor: "#f9fafb",
                        py: 1.5,
                      }}
                    >
                      Motivo
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "#374151",
                        fontSize: "0.875rem",
                        backgroundColor: "#f9fafb",
                        py: 1.5,
                      }}
                    >
                      Usuario
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movimientos.map((movimiento) => (
                    <TableRow
                      key={movimiento.id}
                      sx={{
                        "&:hover": { bgcolor: "#fef2f2" },
                        borderBottom: "1px solid #f3f4f6",
                      }}
                    >
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2" sx={{ color: "#374151", fontSize: "0.8125rem" }}>
                          {formatFecha(movimiento.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Chip
                          icon={getTipoIcon(movimiento.tipo)}
                          label={movimiento.tipo}
                          color={getTipoColor(movimiento.tipo)}
                          size="small"
                          sx={{ fontSize: "0.75rem", height: 24 }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          sx={{ color: "#171717", fontSize: "0.8125rem" }}
                        >
                          {formatQuantity(movimiento.cantidad, unidadMedida)} {getUnidadLabel()}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2" sx={{ color: "#6b7280", fontSize: "0.8125rem" }}>
                          {formatQuantity(movimiento.stock_anterior, unidadMedida)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ color: "#171717", fontSize: "0.8125rem" }}>
                          {formatQuantity(movimiento.stock_nuevo, unidadMedida)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2" sx={{ color: "#6b7280", fontSize: "0.8125rem" }}>
                          {movimiento.motivo || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2" sx={{ color: "#6b7280", fontSize: "0.8125rem" }}>
                          {movimiento.usuario_nombre || "Sistema"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ backgroundColor: "#fff", borderTop: "1px solid #e5e7eb" }}>
              <TablePagination
                component="div"
                count={totalItems}
                page={page - 1}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                }
                labelRowsPerPage="Filas por página:"
                sx={{
                  ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
                    fontSize: "0.8125rem",
                    color: "#6b7280",
                  },
                  ".MuiTablePagination-select": {
                    color: "#374151",
                    fontSize: "0.8125rem",
                  },
                  ".MuiIconButton-root": {
                    color: "#6b7280",
                    "&:hover": {
                      bgcolor: "#fef2f2",
                    },
                    "&.Mui-disabled": {
                      color: "#d1d5db",
                    },
                  },
                }}
              />
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default HistorialMovimientosModal
