import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Typography, Box } from "@mui/material"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function MovimientosTable({ movimientos }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number.parseFloat(value))
  }

  const formatMetodoPago = (metodo) => {
    if (!metodo) return "N/A"
    const formatos = {
      EFECTIVO: "Efectivo",
      TRANSFERENCIA: "Transferencia",
      TARJETA_CREDITO: "Tarjeta Crédito",
      TARJETA: "Tarjeta Crédito",
      CREDITO: "Tarjeta Crédito",
      CUENTA_CORRIENTE: "Cuenta Corriente",
    }
    return formatos[metodo] || metodo
  }

  const getMetodoPagoColor = (metodo) => {
    const colores = {
      EFECTIVO: { bgcolor: "#dbeafe", color: "#1e40af" },
      TRANSFERENCIA: { bgcolor: "#f3e8ff", color: "#6b21a8" },
      TARJETA_CREDITO: { bgcolor: "#fef3c7", color: "#92400e" },
      TARJETA: { bgcolor: "#fef3c7", color: "#92400e" },
      CREDITO: { bgcolor: "#fef3c7", color: "#92400e" },
      CUENTA_CORRIENTE: { bgcolor: "#e0e7ff", color: "#3730a3" },
    }
    return colores[metodo] || { bgcolor: "#f1f5f9", color: "#475569" }
  }

  if (!movimientos || movimientos.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography sx={{ color: "#94a3b8", fontSize: "0.875rem" }}>No hay movimientos registrados</Typography>
      </Box>
    )
  }

  return (
    <TableContainer>
      <Table size="small" sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow
            sx={{
              bgcolor: "#f8fafc",
              "& th": {
                color: "#64748b",
                fontWeight: 600,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                py: 1.5,
                borderBottom: "1px solid #e5e7eb",
              },
            }}
          >
            <TableCell>Fecha/Hora</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Concepto</TableCell>
            <TableCell>Referencia</TableCell>
            <TableCell>Método de Pago</TableCell>
            <TableCell align="right">Monto</TableCell>
            <TableCell>Usuario</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {movimientos.map((mov, index) => (
            <TableRow
              key={mov.id}
              sx={{
                "&:hover": { bgcolor: "#f8fafc" },
                "& td": {
                  py: 1.5,
                  fontSize: "0.875rem",
                  borderBottom: index === movimientos.length - 1 ? "none" : "1px solid #f1f5f9",
                },
              }}
            >
              <TableCell sx={{ color: "#0f172a" }}>
                {format(new Date(mov.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
              </TableCell>
              <TableCell>
                <Chip
                  label={mov.tipo}
                  size="small"
                  sx={{
                    bgcolor: mov.tipo === "INGRESO" ? "#dcfce7" : "#fee2e2",
                    color: mov.tipo === "INGRESO" ? "#166534" : "#991b1b",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                    height: 22,
                    borderRadius: 1,
                  }}
                />
              </TableCell>
              <TableCell sx={{ color: "#0f172a" }}>{mov.concepto}</TableCell>
              <TableCell>
                {mov.referencia_tipo && mov.referencia_id ? (
                  <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.875rem" }}>
                    {mov.referencia_tipo} #{mov.referencia_id}
                  </Typography>
                ) : (
                  <Typography variant="body2" sx={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                    Manual
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                {mov.metodo_pago ? (
                  <Chip
                    label={formatMetodoPago(mov.metodo_pago)}
                    size="small"
                    sx={{
                      ...getMetodoPagoColor(mov.metodo_pago),
                      fontWeight: 500,
                      fontSize: "0.75rem",
                      height: 22,
                      borderRadius: 1,
                    }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                    N/A
                  </Typography>
                )}
              </TableCell>
              <TableCell align="right">
                <Typography
                  variant="body2"
                  sx={{
                    color: mov.tipo === "INGRESO" ? "#166534" : "#991b1b",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                  }}
                >
                  {mov.tipo === "INGRESO" ? "+" : "-"}${formatCurrency(mov.monto)}
                </Typography>
              </TableCell>
              <TableCell sx={{ color: "#64748b" }}>{mov.usuario_nombre || "N/A"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
