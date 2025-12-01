"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Alert,
  Typography,
  Divider,
  IconButton,
  Paper,
  Card,
  Grid,
  LinearProgress,
} from "@mui/material"
import {
  Close as CloseIcon,
  Block as BlockIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
} from "@mui/icons-material"
import { NumericFormat } from "react-number-format"
import cajaService from "../../services/cajaService"

export default function CerrarCajaModal({ open, onClose, onCerrarCaja, sesionActual }) {
  const [montoFinal, setMontoFinal] = useState("")
  const [observaciones, setObservaciones] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [detalleIngresos, setDetalleIngresos] = useState(null)
  const [loadingDetalle, setLoadingDetalle] = useState(false)
  const [movimientos, setMovimientos] = useState([])

  // Cargar detalle de ingresos cuando se abre el modal
  useEffect(() => {
    if (open && sesionActual) {
      cargarDetalleIngresos()
      cargarMovimientos()
    }
  }, [open, sesionActual])

  const cargarDetalleIngresos = async () => {
    setLoadingDetalle(true)
    try {
      const response = await cajaService.getDetalleIngresos(sesionActual.id)
      setDetalleIngresos(response)
    } catch (error) {
      console.error("Error al cargar detalle:", error)
    } finally {
      setLoadingDetalle(false)
    }
  }

  const cargarMovimientos = async () => {
    try {
      const response = await cajaService.getMovimientos(sesionActual.id)
      setMovimientos(response.movimientos || [])
    } catch (error) {
      console.error("Error al cargar movimientos:", error)
      setMovimientos([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!montoFinal || Number.parseFloat(montoFinal) < 0) {
      setError("El monto final debe ser mayor o igual a 0")
      return
    }

    setLoading(true)
    try {
      await onCerrarCaja({
        montoFinal: Number.parseFloat(montoFinal),
        observaciones: observaciones.trim(),
      })
      setMontoFinal("")
      setObservaciones("")
      onClose()
    } catch (err) {
      setError(err.message || "Error al cerrar caja")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setMontoFinal("")
      setObservaciones("")
      setError("")
      onClose()
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number.parseFloat(value || 0))
  }

  const montoInicial = sesionActual ? Number.parseFloat(sesionActual.monto_inicial || 0) : 0
  const totalIngresos = detalleIngresos?.total_general || 0
  const totalEgresos = movimientos
    .filter((m) => m.tipo === "EGRESO")
    .reduce((sum, m) => sum + Number.parseFloat(m.monto || 0), 0)
  const saldoEsperado = montoInicial + totalIngresos - totalEgresos

  const montoFinalNum = montoFinal ? Number.parseFloat(montoFinal) : 0
  const diferencia = montoFinalNum - saldoEsperado
  const haySobrante = diferencia > 0
  const hayFaltante = diferencia < 0

  const desglose = detalleIngresos?.desglose || []

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
      default:
        return { label: metodo || "N/A", icon: MoneyIcon, color: "#64748b", bg: "#f1f5f9" }
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 0,
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            width: 4,
            height: 56,
            bgcolor: "#dc2626",
            borderRadius: "0 4px 4px 0",
          }}
        />
        <Box
          sx={{
            flex: 1,
            px: 3,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <BlockIcon sx={{ color: "#dc2626", fontSize: 24 }} />
          <Box>
            <Box sx={{ fontWeight: 600, fontSize: "1.1rem" }}>Cerrar Caja</Box>
          </Box>
        </Box>
        <IconButton onClick={handleClose} disabled={loading} sx={{ mr: 1 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 3 }}>
        {loadingDetalle && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress sx={{ bgcolor: "#fee2e2", "& .MuiLinearProgress-bar": { bgcolor: "#dc2626" } }} />
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {error && (
              <Alert severity="error" sx={{ borderRadius: 1.5 }}>
                {error}
              </Alert>
            )}

            {/* Resumen de la Sesión */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                bgcolor: "#f8fafc",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1.5,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: "#0f172a" }}>
                Resumen de la Sesión
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "#64748b", display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <MoneyIcon sx={{ fontSize: 16 }} />
                      Monto Inicial
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: "#0f172a" }}>
                      ${formatCurrency(montoInicial)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "#047857", display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <TrendingUpIcon sx={{ fontSize: 16 }} />
                      Total Ingresos
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: "#047857" }}>
                      ${formatCurrency(totalIngresos)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "#b91c1c", display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <TrendingDownIcon sx={{ fontSize: 16 }} />
                      Total Egresos
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: "#b91c1c" }}>
                      ${formatCurrency(totalEgresos)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      p: 2,
                      bgcolor: "#dbeafe",
                      borderLeft: "4px solid #2563eb",
                      boxShadow: "none",
                    }}
                  >
                    <Typography variant="caption" sx={{ color: "#1e40af", fontWeight: 500 }}>
                      Saldo Esperado del Sistema
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e40af", mt: 0.5 }}>
                      ${formatCurrency(saldoEsperado)}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </Paper>

            {/* Desglose por Método de Pago */}
            {desglose.length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  bgcolor: "#f8fafc",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1.5,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: "#0f172a" }}>
                  Desglose por Método de Pago
                </Typography>
                <Grid container spacing={1.5}>
                  {desglose.map((item) => {
                    const config = getMetodoPagoConfig(item.metodo_pago)
                    const Icon = config.icon
                    const porcentaje = totalIngresos > 0 ? (item.total / totalIngresos) * 100 : 0

                    return (
                      <Grid item xs={12} sm={6} key={item.metodo_pago}>
                        <Box
                          sx={{
                            p: 1.5,
                            bgcolor: config.bg,
                            borderRadius: 1,
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              bgcolor: "white",
                              borderRadius: 1,
                              p: 0.75,
                              display: "flex",
                            }}
                          >
                            <Icon sx={{ fontSize: 18, color: config.color }} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="caption"
                              sx={{ color: config.color, fontWeight: 600, display: "block" }}
                            >
                              {config.label}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: config.color }}>
                              ${formatCurrency(item.total)}
                            </Typography>
                            <Typography variant="caption" sx={{ color: config.color, opacity: 0.8 }}>
                              {item.cantidad} op. ({porcentaje.toFixed(1)}%)
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )
                  })}
                </Grid>
              </Paper>
            )}

            {/* Input Monto Real en Caja */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}>
                Monto Real en Caja
              </Typography>
              <NumericFormat
                value={montoFinal}
                onValueChange={(values) => setMontoFinal(values.floatValue || "")}
                customInput={TextField}
                thousandSeparator="."
                decimalSeparator=","
                decimalScale={2}
                fixedDecimalScale={false}
                allowNegative={false}
                prefix="$"
                placeholder="Ingrese el monto final real"
                fullWidth
                size="medium"
                required
                autoFocus
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                    fontSize: "1.25rem",
                    fontWeight: 600,
                  },
                }}
              />
            </Box>

            {/* Cálculo de Diferencia */}
            {montoFinal && (
              <Card
                sx={{
                  p: 2.5,
                  bgcolor: hayFaltante ? "#fee2e2" : haySobrante ? "#fef3c7" : "#d1fae5",
                  borderLeft: `4px solid ${hayFaltante ? "#dc2626" : haySobrante ? "#f59e0b" : "#059669"}`,
                  boxShadow: "none",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                  {hayFaltante ? (
                    <WarningIcon sx={{ color: "#dc2626", fontSize: 24 }} />
                  ) : haySobrante ? (
                    <WarningIcon sx={{ color: "#f59e0b", fontSize: 24 }} />
                  ) : (
                    <CheckCircleIcon sx={{ color: "#059669", fontSize: 24 }} />
                  )}
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#0f172a" }}>
                    {hayFaltante ? "Faltante Detectado" : haySobrante ? "Sobrante Detectado" : "Cuadra Perfectamente"}
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      Monto del Sistema
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>
                      ${formatCurrency(saldoEsperado)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      Monto Real
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>
                      ${formatCurrency(montoFinalNum)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      Diferencia
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: hayFaltante ? "#dc2626" : haySobrante ? "#f59e0b" : "#059669",
                      }}
                    >
                      {diferencia > 0 ? "+" : ""}${formatCurrency(Math.abs(diferencia))}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b", mt: 0.5, display: "block" }}>
                      {hayFaltante && "Hay un faltante en caja"}
                      {haySobrante && "Hay un sobrante en caja"}
                      {!hayFaltante && !haySobrante && "El monto coincide exactamente"}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>
            )}

            {/* Observaciones */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: "#0f172a" }}>
                Observaciones (opcional)
              </Typography>
              <TextField
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                multiline
                rows={3}
                fullWidth
                placeholder="Agregue cualquier observación sobre el cierre..."
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                  },
                }}
              />
            </Box>

            {/* Botones */}
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}>
              <Button
                onClick={handleClose}
                disabled={loading}
                variant="outlined"
                size="large"
                sx={{
                  borderRadius: 1.5,
                  textTransform: "none",
                  px: 3,
                  borderColor: "divider",
                  color: "text.secondary",
                  "&:hover": {
                    borderColor: "text.secondary",
                    bgcolor: "action.hover",
                  },
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading || !montoFinal}
                sx={{
                  borderRadius: 1.5,
                  textTransform: "none",
                  px: 4,
                  bgcolor: "#dc2626",
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor: "#b91c1c",
                  },
                  "&:disabled": {
                    bgcolor: "#fca5a5",
                    color: "white",
                  },
                }}
              >
                {loading ? "Cerrando Caja..." : "Confirmar Cierre"}
              </Button>
            </Box>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  )
}
