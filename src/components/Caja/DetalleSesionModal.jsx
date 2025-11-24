"use client"

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Divider,
  Card,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material"
import {
  Close as CloseIcon,
  AttachMoney as MoneyIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material"
import { format, differenceInMinutes } from "date-fns"
import { es } from "date-fns/locale"
import { useEffect, useState } from "react"
import cajaService from "../../services/cajaService"

export default function DetalleSesionModal({ open, onClose, sesion }) {
  const [movimientos, setMovimientos] = useState([])
  const [detalleIngresos, setDetalleIngresos] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && sesion) {
      cargarDetalles()
    }
  }, [open, sesion])

  const cargarDetalles = async () => {
    setLoading(true)
    try {
      const movimientosRes = await cajaService.getMovimientos(sesion.id)
      setMovimientos(movimientosRes.movimientos || [])

      const ingresosRes = await cajaService.getDetalleIngresos(sesion.id)
      setDetalleIngresos(ingresosRes)
    } catch (error) {
      console.error("Error al cargar detalles:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(Number.parseFloat(value || 0))
  }

  const formatDate = (date) => {
    if (!date) return "-"
    try {
      return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: es })
    } catch (error) {
      return "-"
    }
  }

  const calcularDuracion = () => {
    if (!sesion?.fecha_apertura) return "-"
    const inicio = new Date(sesion.fecha_apertura)
    const fin = sesion.fecha_cierre ? new Date(sesion.fecha_cierre) : new Date()

    const minutos = differenceInMinutes(fin, inicio)
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60

    if (horas > 0) {
      return `${horas}h ${mins}m`
    }
    return `${mins}m`
  }

  const getMetodoPagoConfig = (metodo) => {
    switch (metodo) {
      case "EFECTIVO":
        return { label: "Efectivo", icon: MoneyIcon, color: "#059669", bg: "#d1fae5" }
      case "CREDITO":
      case "TARJETA":
      case "TARJETA_CREDITO":
        return { label: "Tarjeta de Crédito", icon: CreditCardIcon, color: "#2563eb", bg: "#dbeafe" }
      case "TRANSFERENCIA":
        return { label: "Transferencia", icon: BankIcon, color: "#7c3aed", bg: "#ede9fe" }
      case "CUENTA_CORRIENTE":
        return { label: "Cuenta Corriente", icon: ReceiptIcon, color: "#dc2626", bg: "#fee2e2" }
      default:
        return { label: metodo || "N/A", icon: MoneyIcon, color: "#64748b", bg: "#f1f5f9" }
    }
  }

  const getTipoMovimientoColor = (tipo) => {
    return tipo === "INGRESO" ? "success" : "error"
  }

  if (!sesion) return null

  const totalIngresos = sesion.total_ingresos || detalleIngresos?.total_general || 0
  const totalEgresos =
    sesion.total_egresos ||
    movimientos.filter((m) => m.tipo === "EGRESO").reduce((sum, m) => sum + Number.parseFloat(m.monto || 0), 0)
  const montoEsperado =
    sesion.monto_esperado_sistema || Number.parseFloat(sesion.monto_inicial) + totalIngresos - totalEgresos
  const diferencia = sesion.diferencia || 0

  // Desglose de ingresos - usar el guardado o el cargado
  let desgloseData = []
  if (sesion.desglose_ingresos) {
    try {
      const parsed = JSON.parse(sesion.desglose_ingresos)
      desgloseData = Object.keys(parsed).map((metodo) => ({
        metodo_pago: metodo,
        total: parsed[metodo].total,
        cantidad: parsed[metodo].cantidad,
      }))
    } catch (e) {
      desgloseData = detalleIngresos?.desglose || []
    }
  } else {
    desgloseData = detalleIngresos?.desglose || []
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              borderRadius: "50%",
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MoneyIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
              Detalle de Sesión de Caja #{sesion.id}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {sesion.sucursal_nombre}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: "#fafafa" }}>
        {/* Información General */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, height: "100%" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <CalendarIcon sx={{ fontSize: 20, color: "#dc2626" }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#0f172a" }}>
                  Fechas
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>
                    Apertura
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatDate(sesion.fecha_apertura)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>
                    Cierre
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {sesion.fecha_cierre ? formatDate(sesion.fecha_cierre) : "Sesión abierta"}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, height: "100%" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <TimeIcon sx={{ fontSize: 20, color: "#dc2626" }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#0f172a" }}>
                  Duración y Usuario
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>
                    Duración total
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {calcularDuracion()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>
                    Usuario
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {sesion.usuario_nombre || sesion.usuario_apertura_nombre || "-"}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ p: 2, bgcolor: "#dbeafe", borderLeft: "4px solid #2563eb" }}>
              <Typography variant="caption" sx={{ color: "#1e40af", fontWeight: 500 }}>
                Monto Inicial
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e40af" }}>
                {formatCurrency(sesion.monto_inicial)}
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ p: 2, bgcolor: "#d1fae5", borderLeft: "4px solid #059669" }}>
              <Typography variant="caption" sx={{ color: "#047857", fontWeight: 500 }}>
                Total Ingresos
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#047857" }}>
                {formatCurrency(totalIngresos)}
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ p: 2, bgcolor: "#fee2e2", borderLeft: "4px solid #dc2626" }}>
              <Typography variant="caption" sx={{ color: "#b91c1c", fontWeight: 500 }}>
                Total Egresos
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#b91c1c" }}>
                {formatCurrency(totalEgresos)}
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ p: 2, bgcolor: "#f3f4f6", borderLeft: "4px solid #6b7280" }}>
              <Typography variant="caption" sx={{ color: "#374151", fontWeight: 500 }}>
                Saldo Esperado
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#374151" }}>
                {formatCurrency(montoEsperado)}
              </Typography>
            </Card>
          </Grid>

          {sesion.estado === "CERRADA" && (
            <>
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 2, bgcolor: "#ede9fe", borderLeft: "4px solid #7c3aed" }}>
                  <Typography variant="caption" sx={{ color: "#6b21a8", fontWeight: 500 }}>
                    Monto Real (Cierre)
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#6b21a8" }}>
                    {formatCurrency(sesion.monto_final)}
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    p: 2,
                    bgcolor: diferencia < 0 ? "#fee2e2" : diferencia > 0 ? "#fef3c7" : "#d1fae5",
                    borderLeft: `4px solid ${diferencia < 0 ? "#dc2626" : diferencia > 0 ? "#f59e0b" : "#059669"}`,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: diferencia < 0 ? "#991b1b" : diferencia > 0 ? "#92400e" : "#047857",
                      fontWeight: 500,
                    }}
                  >
                    Diferencia (Sobrante/Faltante)
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: diferencia < 0 ? "#991b1b" : diferencia > 0 ? "#92400e" : "#047857",
                    }}
                  >
                    {diferencia > 0 ? "+" : ""}
                    {formatCurrency(diferencia)}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: diferencia < 0 ? "#991b1b" : diferencia > 0 ? "#92400e" : "#047857",
                      opacity: 0.8,
                      display: "block",
                      mt: 0.5,
                    }}
                  >
                    {diferencia < 0 && "Faltante"}
                    {diferencia > 0 && "Sobrante"}
                    {diferencia === 0 && "Exacto"}
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ p: 2, bgcolor: "#f3f4f6", border: "1px solid #e5e7eb" }}>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
                    Cerrado por
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: "#0f172a", mt: 0.5 }}>
                    {sesion.usuario_cierre_nombre || "-"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>
                    {formatDate(sesion.fecha_cierre)}
                  </Typography>
                </Card>
              </Grid>
            </>
          )}
        </Grid>

        {/* Detalle de Ingresos por Método */}
        <Divider sx={{ my: 3 }}>
          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
            INGRESOS POR MÉTODO DE PAGO
          </Typography>
        </Divider>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {desgloseData.length > 0 ? (
            desgloseData.map((item) => {
              const config = getMetodoPagoConfig(item.metodo_pago)
              const Icon = config.icon
              const porcentaje = totalIngresos > 0 ? (item.total / totalIngresos) * 100 : 0

              return (
                <Grid item xs={12} sm={6} md={3} key={item.metodo_pago}>
                  <Card sx={{ p: 2, height: "100%" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <Box
                        sx={{
                          bgcolor: config.bg,
                          borderRadius: 1,
                          p: 0.75,
                          display: "flex",
                        }}
                      >
                        <Icon sx={{ fontSize: 18, color: config.color }} />
                      </Box>
                      <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
                        {config.label}
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: config.color, mb: 0.5 }}>
                      {formatCurrency(item.total)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      {item.cantidad} {item.cantidad === 1 ? "operación" : "operaciones"} ({porcentaje.toFixed(1)}%)
                    </Typography>
                  </Card>
                </Grid>
              )
            })
          ) : (
            <Grid item xs={12}>
              <Box sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  No hay ingresos registrados
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Tabla de Movimientos */}
        <Divider sx={{ my: 3 }}>
          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
            MOVIMIENTOS DE CAJA
          </Typography>
        </Divider>

        <TableContainer sx={{ maxHeight: 400, bgcolor: "white", borderRadius: 1 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: 600, fontSize: "0.75rem" }}>Tipo</TableCell>
                <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: 600, fontSize: "0.75rem" }}>Descripción</TableCell>
                <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: 600, fontSize: "0.75rem" }}>Método de Pago</TableCell>
                <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: 600, fontSize: "0.75rem" }} align="right">
                  Monto
                </TableCell>
                <TableCell sx={{ bgcolor: "#f8fafc", fontWeight: 600, fontSize: "0.75rem" }}>Fecha</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {movimientos.length > 0 ? (
                movimientos.map((mov) => {
                  const config = getMetodoPagoConfig(mov.metodo_pago)
                  return (
                    <TableRow key={mov.id} sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                      <TableCell sx={{ py: 1 }}>
                        <Chip
                          label={mov.tipo}
                          size="small"
                          color={getTipoMovimientoColor(mov.tipo)}
                          sx={{ fontWeight: 500, fontSize: "0.688rem", height: 20 }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: "0.813rem" }}>
                          {mov.descripcion}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Chip
                          label={config.label}
                          size="small"
                          sx={{
                            bgcolor: config.bg,
                            color: config.color,
                            fontWeight: 500,
                            fontSize: "0.688rem",
                            height: 20,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.813rem",
                            color: mov.tipo === "INGRESO" ? "#059669" : "#dc2626",
                          }}
                        >
                          {mov.tipo === "INGRESO" ? "+" : "-"}
                          {formatCurrency(mov.monto)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {formatDate(mov.fecha)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: "center", py: 3 }}>
                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                      No hay movimientos registrados
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  )
}
