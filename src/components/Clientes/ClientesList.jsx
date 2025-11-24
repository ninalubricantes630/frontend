"use client"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Box,
  TablePagination,
} from "@mui/material"
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
} from "@mui/icons-material"

const ClientesList = ({ clientes, loading, pagination, onPageChange, onEdit, onDelete, onViewMore }) => {
  const handleRowsPerPageChange = (event) => {
    const newLimit = Number.parseInt(event.target.value, 10)
    onPageChange(1, newLimit)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const isConsumidorFinal = (cliente) => {
    return cliente.id === 1 || cliente.nombre?.toLowerCase().includes("consumidor final")
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <span className="text-gray-500 text-sm">Cargando...</span>
      </Box>
    )
  }

  if (!clientes || clientes.length === 0) {
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
        <span className="text-gray-500 mb-2 text-sm">No se encontraron clientes</span>
        <span className="text-xs text-gray-400">Utiliza "Nuevo Cliente" para agregar registros</span>
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
                DNI
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
                Dirección
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
                Cuenta Corriente
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
            {clientes.map((cliente) => {
              const esConsumidorFinal = isConsumidorFinal(cliente)

              return (
                <TableRow
                  key={cliente.id}
                  sx={{
                    "&:hover": { bgcolor: "#f8fafc" },
                    opacity: cliente.activo ? 1 : 0.5,
                    cursor: esConsumidorFinal ? "default" : "pointer",
                  }}
                  onClick={() => !esConsumidorFinal && onViewMore(cliente)}
                >
                  <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                    <span className="font-medium text-sm text-slate-900">
                      {cliente.nombre} {cliente.apellido}
                    </span>
                  </TableCell>

                  <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                    {cliente.dni ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <BadgeIcon sx={{ fontSize: 14, color: "#64748b" }} />
                        <span className="font-mono text-xs text-slate-700">{cliente.dni}</span>
                      </Box>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </TableCell>

                  <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                    {cliente.telefono ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <PhoneIcon sx={{ fontSize: 14, color: "#64748b" }} />
                        <span className="text-xs text-slate-700">{cliente.telefono}</span>
                      </Box>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </TableCell>

                  <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                    {cliente.direccion ? (
                      <span className="text-xs text-slate-700 line-clamp-2">{cliente.direccion}</span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </TableCell>

                  <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                    {cliente.tiene_cuenta_corriente ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <span className="text-xs font-semibold text-red-500">
                          {formatCurrency(cliente.saldo_cuenta || 0)}
                        </span>
                      </Box>
                    ) : (
                      <span className="text-xs text-gray-500">No</span>
                    )}
                  </TableCell>

                  <TableCell align="right" sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                    {!esConsumidorFinal && (
                      <Box
                        sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Tooltip title="Ver detalle">
                          <IconButton
                            onClick={() => onViewMore(cliente)}
                            size="small"
                            sx={{
                              color: "#1976d2",
                              p: 0.5,
                              "&:hover": { bgcolor: "#e3f2fd" },
                            }}
                          >
                            <VisibilityIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Editar">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation()
                              onEdit(cliente)
                            }}
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
                            onClick={(e) => {
                              e.stopPropagation()
                              onDelete(cliente)
                            }}
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
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={pagination.total}
        page={pagination.page - 1}
        onPageChange={(event, newPage) => onPageChange(newPage + 1)}
        rowsPerPage={pagination.limit}
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
  )
}

export default ClientesList
