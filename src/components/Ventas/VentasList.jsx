"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Box,
  Typography,
  CircularProgress,
  TablePagination,
  Tooltip,
} from "@mui/material"
import { Visibility as VisibilityIcon, Cancel as CancelIcon } from "@mui/icons-material"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useAuth } from "../../contexts/AuthContext"

const VentasList = ({ ventas, loading, pagination, onPageChange, onView, onCancel }) => {
  const { hasPermissionSlug } = useAuth()

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount)
  }

  const formatDate = (date) => {
    if (!date) return "-"
    try {
      return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: es })
    } catch (error) {
      return "-"
    }
  }

  const getTipoPagoColor = (tipo) => {
    const colors = {
      EFECTIVO: "success",
      CREDITO: "info",
      TARJETA_CREDITO: "info",
      TRANSFERENCIA: "primary",
      CUENTA_CORRIENTE: "warning",
      TARJETA: "info",
      PAGO_MULTIPLE: "secondary",
    }
    return colors[tipo] || "default"
  }

  const getTipoPagoLabel = (tipo) => {
    const labels = {
      EFECTIVO: "Efectivo",
      CREDITO: "Tarjeta",
      TARJETA_CREDITO: "Tarjeta",
      TRANSFERENCIA: "Transferencia",
      CUENTA_CORRIENTE: "Cta. Corriente",
      TARJETA: "Tarjeta",
      PAGO_MULTIPLE: "Pago Múltiple",
    }
    return labels[tipo] || tipo
  }

  const getEstadoColor = (estado) => {
    return estado === "COMPLETADA" ? "success" : "error"
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
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress sx={{ color: "#dc2626" }} />
      </Box>
    )
  }

  if (!ventas || ventas.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h6" color="textSecondary">
          No se encontraron ventas
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Intenta ajustar los filtros de búsqueda
        </Typography>
      </Box>
    )
  }

  return (
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
                Número
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
                Fecha
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
                Cliente
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
                Total
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
                Tipo Pago
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
            {ventas.map((venta) => (
              <TableRow key={venta.id} sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#dc2626", fontSize: "0.813rem" }}>
                    {venta.numero}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                  <Typography variant="body2" sx={{ fontSize: "0.813rem", color: "#64748b" }}>
                    {formatDate(venta.fecha || venta.created_at)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                  <Typography variant="body2" sx={{ fontSize: "0.813rem" }}>
                    {venta.cliente_nombre || "Consumidor Final"}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                  <Typography variant="body2" sx={{ fontSize: "0.813rem", color: "#64748b" }}>
                    {venta.sucursal_nombre || "-"}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.813rem" }}>
                    {formatCurrency(
                      venta.total_con_interes_tarjeta && venta.total_con_interes_tarjeta !== venta.total
                        ? venta.total_con_interes_tarjeta
                        : venta.total_final || venta.total,
                    )}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                  <Chip
                    label={getTipoPagoLabel(venta.tipo_pago || (venta.tarjeta_id ? "TARJETA_CREDITO" : "N/A"))}
                    size="small"
                    color={getTipoPagoColor(venta.tipo_pago || (venta.tarjeta_id ? "TARJETA_CREDITO" : ""))}
                    sx={{ fontWeight: 500, fontSize: "0.688rem", height: 22 }}
                  />
                </TableCell>
                <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                  <Chip
                    label={venta.estado}
                    size="small"
                    color={getEstadoColor(venta.estado)}
                    sx={{ fontWeight: 500, fontSize: "0.688rem", height: 22 }}
                  />
                </TableCell>
                <TableCell align="right" sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                  <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                    {hasPermissionSlug("view_detalle_ventas") && (
                      <Tooltip title="Ver detalles">
                        <IconButton
                          size="small"
                          onClick={() => onView(venta)}
                          sx={{
                            color: "#1976d2",
                            p: 0.5,
                            "&:hover": { bgcolor: "#e3f2fd" },
                          }}
                        >
                          <VisibilityIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                    {venta.estado === "COMPLETADA" && venta.sesion_caja_estado === "ABIERTA" && (
                      <Tooltip title="Cancelar venta">
                        <IconButton
                          size="small"
                          onClick={() => onCancel(venta)}
                          sx={{
                            color: "#d32f2f",
                            p: 0.5,
                            "&:hover": { bgcolor: "#ffebee" },
                          }}
                        >
                          <CancelIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
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
        page={(pagination?.page || 1) - 1}
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
  )
}

export default VentasList
