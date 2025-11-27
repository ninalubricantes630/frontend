"use client"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Box,
  Tooltip,
  TablePagination,
  Chip,
  CircularProgress,
} from "@mui/material"
import { Visibility, Cancel } from "@mui/icons-material"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useAuth } from "../../contexts/AuthContext"

const ServiciosList = ({ servicios, onView, loading, pagination, onPageChange, onDelete, onCancel }) => {
  const { hasPermissionSlug } = useAuth()

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount || 0)
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
    }
    return colors[tipo] || "default"
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

  if (servicios.length === 0) {
    return (
      <Box textAlign="center" p={3}>
        <Typography variant="h6" color="textSecondary">
          No hay servicios registrados
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Crea tu primer servicio para comenzar
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
                Vehículo
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
                Total Servicios
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
            {servicios.map((servicio) => (
              <TableRow
                key={servicio.id}
                sx={{
                  "&:hover": { bgcolor: "#f8fafc" },
                }}
              >
                <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                  <Typography variant="body2" fontWeight="600" sx={{ color: "#dc2626", fontSize: "0.813rem" }}>
                    {servicio.numero}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                  <Typography variant="body2" sx={{ fontSize: "0.813rem", color: "#64748b" }}>
                    {formatDate(servicio.created_at)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                  <Typography variant="body2" sx={{ color: "#0f172a", fontWeight: 500, fontSize: "0.813rem" }}>
                    {servicio.cliente_nombre && servicio.cliente_apellido
                      ? `${servicio.cliente_nombre} ${servicio.cliente_apellido}`
                      : "Cliente no encontrado"}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                  <Typography variant="body2" sx={{ color: "#0f172a", fontWeight: 500, fontSize: "0.813rem" }}>
                    {servicio.patente || "N/A"}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                  <Typography variant="body2" sx={{ color: "#0f172a", fontSize: "0.813rem" }}>
                    {servicio.sucursal_nombre || "N/A"}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                  <Typography variant="body2" fontWeight="600" sx={{ color: "#dc2626", fontSize: "0.813rem" }}>
                    {formatCurrency(
                      servicio.total_con_interes_tarjeta || servicio.total_con_interes || servicio.total || 0,
                    )}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                  <Chip
                    label={servicio.tipo_pago || "N/A"}
                    size="small"
                    color={getTipoPagoColor(servicio.tipo_pago)}
                    sx={{ fontWeight: 500, fontSize: "0.688rem", height: 22 }}
                  />
                </TableCell>
                <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                  <Chip
                    label={servicio.estado || "COMPLETADA"}
                    size="small"
                    color={getEstadoColor(servicio.estado || "COMPLETADA")}
                    sx={{ fontWeight: 500, fontSize: "0.688rem", height: 22 }}
                  />
                </TableCell>
                <TableCell align="right" sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                  <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                    {hasPermissionSlug("view_detalle_servicio") && (
                      <Tooltip title="Ver Detalle">
                        <IconButton
                          size="small"
                          onClick={() => onView(servicio)}
                          sx={{
                            color: "#1976d2",
                            p: 0.5,
                            "&:hover": { bgcolor: "#e3f2fd" },
                          }}
                        >
                          <Visibility sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                    {servicio.estado === "COMPLETADA" && servicio.sesion_caja_estado === "ABIERTA" && onCancel && (
                      <Tooltip title="Cancelar servicio">
                        <IconButton
                          size="small"
                          onClick={() => onCancel(servicio)}
                          sx={{
                            color: "#d32f2f",
                            p: 0.5,
                            "&:hover": { bgcolor: "#ffebee" },
                          }}
                        >
                          <Cancel sx={{ fontSize: 16 }} />
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

      {pagination && (
        <TablePagination
          component="div"
          count={pagination.total || 0}
          page={(pagination.page || 1) - 1}
          onPageChange={handleChangePage}
          rowsPerPage={pagination.limit || 10}
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
      )}
    </Box>
  )
}

export default ServiciosList
