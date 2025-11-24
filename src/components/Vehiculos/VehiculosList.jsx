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
  TablePagination,
  Tooltip,
} from "@mui/material"
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  DirectionsCar as CarIcon,
  Speed as SpeedIcon,
} from "@mui/icons-material"

const VehiculosList = ({ vehiculos, loading, pagination, onEdit, onDelete, onPageChange }) => {
  const handleChangePage = (event, newPage) => {
    onPageChange(newPage + 1)
  }

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = Number.parseInt(event.target.value, 10)
    onPageChange(1, newRowsPerPage)
  }

  const formatKilometraje = (km) => {
    return new Intl.NumberFormat("es-AR").format(km) + " km"
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <span className="text-gray-500 text-sm">Cargando...</span>
      </Box>
    )
  }

  if (!vehiculos || !Array.isArray(vehiculos) || vehiculos.length === 0) {
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
        <CarIcon sx={{ fontSize: 64, color: "#cbd5e1", mb: 2 }} />
        <span className="text-gray-500 mb-2 text-sm">No se encontraron vehículos</span>
        <span className="text-xs text-gray-400">Utiliza "Nuevo Vehículo" para agregar registros</span>
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
                Patente
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
                Marca/Modelo
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
                Año
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
                Kilometraje
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
            {vehiculos.map((vehiculo) => (
              <TableRow
                key={vehiculo.id}
                sx={{
                  "&:hover": { bgcolor: "#f8fafc" },
                  opacity: vehiculo.activo ? 1 : 0.5,
                }}
              >
                <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                  <span className="font-medium text-sm text-slate-900">{vehiculo.patente}</span>
                </TableCell>

                <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                  <span className="text-xs text-slate-700">{vehiculo.cliente_nombre || "Cliente no encontrado"}</span>
                </TableCell>

                <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                  <span className="font-medium text-xs text-slate-900">
                    {vehiculo.marca} {vehiculo.modelo}
                  </span>
                </TableCell>

                <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                  <span className="text-xs text-slate-700">{vehiculo.año}</span>
                </TableCell>

                <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <SpeedIcon sx={{ fontSize: 14, color: "#64748b" }} />
                    <span className="text-xs text-slate-700">{formatKilometraje(vehiculo.kilometraje)}</span>
                  </Box>
                </TableCell>

                <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                  <Chip
                    label={vehiculo.activo ? "Activo" : "Inactivo"}
                    size="small"
                    sx={{
                      bgcolor: vehiculo.activo ? "#dcfce7" : "#fee2e2",
                      color: vehiculo.activo ? "#166534" : "#991b1b",
                      fontWeight: 500,
                      fontSize: "0.6875rem",
                      height: 22,
                      "& .MuiChip-label": { px: 1 },
                    }}
                  />
                </TableCell>

                <TableCell align="right" sx={{ py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                  <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                    <Tooltip title="Editar">
                      <IconButton
                        onClick={() => onEdit(vehiculo)}
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
                        onClick={() => onDelete(vehiculo)}
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={pagination?.total ?? 0}
        page={(pagination?.page ?? 1) - 1}
        onPageChange={handleChangePage}
        rowsPerPage={pagination?.limit ?? 10}
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

export default VehiculosList
