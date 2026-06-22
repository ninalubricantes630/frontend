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
  Collapse,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Tooltip,
} from "@mui/material"
import {
  Close as CloseIcon,
  AttachMoney as MoneyIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  Receipt as ReceiptIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Analytics as BalanceIcon,
  Savings as SavingsIcon,
  PointOfSale as PointOfSaleIcon,
  Verified as VerifiedIcon,
} from "@mui/icons-material"
import { alpha } from "@mui/material/styles"
import { format, differenceInMinutes } from "date-fns"
import { es } from "date-fns/locale"
import { useEffect, useMemo, useState } from "react"
import cajaService from "../../services/cajaService"

const MOVIMIENTOS_PAGE_SIZE = 10000

/** Normaliza método de pago para agrupar (alineado con backend). */
function normMetodo(m) {
  const u = (m || "EFECTIVO").toString().trim().toUpperCase()
  return u || "EFECTIVO"
}

/**
 * Ingresos y egresos por método desde movimientos (ACTIVO / sin estado).
 * Neto = ingresos (sin apertura) − egresos del mismo método.
 */
function buildDesgloseNetoPorMovimientos(movimientos) {
  const map = new Map()
  for (const mov of movimientos || []) {
    const est = (mov.estado || "ACTIVO").toString().toUpperCase()
    if (est === "CANCELADO") continue
    const method = normMetodo(mov.metodo_pago)
    if (!map.has(method)) {
      map.set(method, { ing: 0, egr: 0, cIng: 0, cEgr: 0 })
    }
    const o = map.get(method)
    const amt = Number.parseFloat(mov.monto) || 0
    if (mov.tipo === "INGRESO" && mov.concepto !== "Apertura de caja") {
      o.ing += amt
      o.cIng += 1
    } else if (mov.tipo === "EGRESO") {
      o.egr += amt
      o.cEgr += 1
    }
  }
  return [...map.entries()]
    .map(([metodo_pago, v]) => ({
      metodo_pago,
      totalIngresos: v.ing,
      totalEgresos: v.egr,
      neto: v.ing - v.egr,
      cantidadIngresos: v.cIng,
      cantidadEgresos: v.cEgr,
    }))
    .filter((r) => r.totalIngresos > 0 || r.totalEgresos > 0)
    .sort((a, b) => Math.abs(b.neto) - Math.abs(a.neto))
}

export default function DetalleSesionModal({ open, onClose, sesion }) {
  const [movimientos, setMovimientos] = useState([])
  const [detalleIngresos, setDetalleIngresos] = useState(null)
  const [detalleCC, setDetalleCC] = useState(null)
  const [loading, setLoading] = useState(false)
  const [ccExpandido, setCcExpandido] = useState(false)
  const [vistaMetodoPago, setVistaMetodoPago] = useState("neto")

  useEffect(() => {
    if (open && sesion) {
      cargarDetalles()
    }
  }, [open, sesion])

  useEffect(() => {
    setCcExpandido(false)
  }, [sesion?.id])

  const cargarDetalles = async () => {
    setLoading(true)
    try {
      const movimientosRes = await cajaService.getMovimientos(sesion.id, {
        page: 1,
        limit: MOVIMIENTOS_PAGE_SIZE,
      })
      setMovimientos(movimientosRes.movimientos || [])

      const ingresosRes = await cajaService.getDetalleIngresos(sesion.id)
      setDetalleIngresos(ingresosRes)

      if (
        Number(sesion.cantidad_ventas_cuenta_corriente) > 0 ||
        Number(sesion.cantidad_servicios_cuenta_corriente) > 0
      ) {
        const ccRes = await cajaService.getCuentaCorrienteDetalle(sesion.id)
        setDetalleCC(ccRes)
      } else {
        setDetalleCC(null)
      }
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
        return { label: "Efectivo", icon: MoneyIcon, color: "#059669", bg: "#d1fae5", key: "efectivo" }
      case "CREDITO":
      case "TARJETA":
      case "TARJETA_CREDITO":
        return { label: "Tarjeta", icon: CreditCardIcon, color: "#2563eb", bg: "#dbeafe", key: "tarjeta" }
      case "TRANSFERENCIA":
        return { label: "Transferencia", icon: BankIcon, color: "#7c3aed", bg: "#ede9fe", key: "transferencia" }
      case "CUENTA_CORRIENTE":
        return { label: "Cuenta corriente", icon: ReceiptIcon, color: "#dc2626", bg: "#fee2e2", key: "cc" }
      default:
        return { label: metodo || "N/A", icon: MoneyIcon, color: "#64748b", bg: "#f1f5f9", key: "otro" }
    }
  }

  const getTipoMovimientoColor = (tipo) => {
    return tipo === "INGRESO" ? "success" : "error"
  }

  const desgloseNeto = useMemo(() => buildDesgloseNetoPorMovimientos(movimientos), [movimientos])

  const desgloseBruto = useMemo(() => {
    if (!sesion) return []
    if (sesion.desglose_ingresos) {
      try {
        const parsed = JSON.parse(sesion.desglose_ingresos)
        return Object.keys(parsed).map((metodo) => ({
          metodo_pago: metodo,
          total: parsed[metodo].total,
          cantidad: parsed[metodo].cantidad,
        }))
      } catch (e) {
        return detalleIngresos?.desglose || []
      }
    }
    return detalleIngresos?.desglose || []
  }, [sesion, detalleIngresos])

  if (!sesion) return null

  const totalIngresos = sesion.total_ingresos || detalleIngresos?.total_general || 0
  const totalEgresos =
    sesion.total_egresos ||
    movimientos
      .filter((m) => {
        if (m.tipo !== "EGRESO") return false
        const est = (m.estado || "ACTIVO").toString().toUpperCase()
        return est !== "CANCELADO"
      })
      .reduce((sum, m) => sum + Number.parseFloat(m.monto || 0), 0)

  const montoEsperadoSistema =
    sesion.monto_esperado_sistema || Number.parseFloat(sesion.monto_inicial) + totalIngresos - totalEgresos

  const efectivoNeto = desgloseNeto.find((d) => d.metodo_pago === "EFECTIVO")?.neto || 0

  const montoEsperadoCaja =
    sesion.monto_esperado_caja || Number.parseFloat(sesion.monto_inicial) + efectivoNeto

  const diferencia = sesion.diferencia || 0

  const tieneCCReferencia =
    Number(sesion.cantidad_ventas_cuenta_corriente) > 0 || Number(sesion.cantidad_servicios_cuenta_corriente) > 0

  const resumenMetodos = vistaMetodoPago === "neto" ? desgloseNeto : desgloseBruto

  const totalReferenciaBrutoIngresos = desgloseBruto.reduce((s, i) => s + Number.parseFloat(i.total || 0), 0)
  const totalReferenciaNeto = desgloseNeto.reduce((s, i) => s + i.neto, 0)

  const metricCards = [
    {
      key: "inicial",
      title: "Monto inicial",
      value: formatCurrency(sesion.monto_inicial),
      subtitle: "Fondo al abrir",
      icon: SavingsIcon,
      accent: "#b91c1c",
      bg: alpha("#dc2626", 0.08),
    },
    {
      key: "ingresos",
      title: "Total ingresos",
      value: formatCurrency(totalIngresos),
      subtitle: "Suma de ingresos",
      icon: TrendingUpIcon,
      accent: "#059669",
      bg: alpha("#059669", 0.08),
    },
    {
      key: "egresos",
      title: "Total egresos",
      value: formatCurrency(totalEgresos),
      subtitle: "Salidas de caja",
      icon: TrendingDownIcon,
      accent: "#dc2626",
      bg: alpha("#dc2626", 0.1),
    },
    {
      key: "sistema",
      title: "Saldo esperado (sistema)",
      value: formatCurrency(montoEsperadoSistema),
      subtitle: "Inicial + ingresos − egresos",
      icon: BalanceIcon,
      accent: "#991b1b",
      bg: alpha("#991b1b", 0.08),
    },
    {
      key: "caja",
      title: "Saldo esperado (caja física)",
      value: formatCurrency(montoEsperadoCaja),
      subtitle: "Efectivo para arqueo",
      icon: PointOfSaleIcon,
      accent: "#dc2626",
      bg: alpha("#dc2626", 0.06),
    },
  ]

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth scroll="paper">
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 2.25,
          px: 2.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              bgcolor: alpha("#fff", 0.12),
              borderRadius: 2,
              p: 1.25,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MoneyIcon sx={{ fontSize: 26 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.15rem", letterSpacing: "-0.02em" }}>
              Detalle de sesión #{sesion.id}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85, fontSize: "0.8rem" }}>
              {sesion.sucursal_nombre} · {sesion.estado === "CERRADA" ? "Cerrada" : "Abierta"}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "white", bgcolor: alpha("#fff", 0.08), "&:hover": { bgcolor: alpha("#fff", 0.18) } }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#fafafa" }}>
        {/* Contexto: fechas + usuario */}
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider", height: "100%" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <CalendarIcon sx={{ fontSize: 22, color: "#dc2626" }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                  Fechas
                </Typography>
              </Box>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Apertura
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatDate(sesion.fecha_apertura)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Cierre
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {sesion.fecha_cierre ? formatDate(sesion.fecha_cierre) : "—"}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider", height: "100%" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <TimeIcon sx={{ fontSize: 22, color: "#dc2626" }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                  Duración y responsable
                </Typography>
              </Box>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Duración
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {calcularDuracion()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Apertura por
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {sesion.usuario_nombre || sesion.usuario_apertura_nombre || "—"}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* 5 métricas en una fila (desktop) */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(5, minmax(0, 1fr))",
            },
            gap: 2,
            mb: 2.5,
          }}
        >
          {metricCards.map((m) => {
            const Icon = m.icon
            return (
              <Paper
                key={m.key}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: alpha(m.accent, 0.35),
                  bgcolor: m.bg,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  transition: "box-shadow 0.2s, transform 0.2s",
                  "&:hover": {
                    boxShadow: `0 8px 24px ${alpha(m.accent, 0.12)}`,
                    transform: "translateY(-1px)",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: m.accent,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        fontSize: "0.65rem",
                        lineHeight: 1.3,
                        display: "block",
                      }}
                    >
                      {m.title}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        color: "#171717",
                        fontSize: { xs: "1rem", sm: "1.05rem" },
                        lineHeight: 1.25,
                        mt: 0.5,
                        wordBreak: "break-word",
                      }}
                    >
                      {m.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1.5,
                      bgcolor: alpha(m.accent, 0.15),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon sx={{ fontSize: 22, color: m.accent }} />
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem", lineHeight: 1.35 }}>
                  {m.subtitle}
                </Typography>
              </Paper>
            )
          })}
        </Box>

        {/* Cuenta corriente — colapsable, oculto por defecto */}
        {tieneCCReferencia && (
          <Box sx={{ mb: 2.5 }}>
            <Paper
              elevation={0}
              onClick={() => setCcExpandido((v) => !v)}
              sx={{
                px: 2,
                py: 1.25,
                borderRadius: 2,
                border: "1px dashed",
                borderColor: ccExpandido ? alpha("#f59e0b", 0.55) : "divider",
                bgcolor: ccExpandido ? alpha("#fef3c7", 0.35) : "background.paper",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                transition: "background 0.2s, border-color 0.2s",
                "&:hover": { borderColor: alpha("#f59e0b", 0.45), bgcolor: alpha("#fef3c7", 0.25) },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                <ReceiptIcon sx={{ fontSize: 22, color: "#b45309", flexShrink: 0 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#92400e" }}>
                    Referencia cuenta corriente
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    No suma efectivo en caja · {ccExpandido ? "Tocá para ocultar" : "Tocá para ver detalle"}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#b45309", display: { xs: "none", sm: "block" } }}>
                  {formatCurrency((Number(sesion.total_ventas_cuenta_corriente) || 0) + (Number(sesion.total_servicios_cuenta_corriente) || 0))}
                </Typography>
                {ccExpandido ? <ExpandLessIcon sx={{ color: "#92400e" }} /> : <ExpandMoreIcon sx={{ color: "#92400e" }} />}
              </Box>
            </Paper>
            <Collapse in={ccExpandido} timeout="auto" unmountOnExit>
              <Paper
                elevation={0}
                sx={{
                  mt: 1,
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: alpha("#f59e0b", 0.25),
                  bgcolor: alpha("#fffbeb", 0.9),
                }}
              >
                <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: detalleCC ? 1.5 : 0 }}>
                  {Number(sesion.cantidad_ventas_cuenta_corriente) > 0 && (
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#171717" }}>
                      Ventas: {sesion.cantidad_ventas_cuenta_corriente} — {formatCurrency(sesion.total_ventas_cuenta_corriente)}
                    </Typography>
                  )}
                  {Number(sesion.cantidad_servicios_cuenta_corriente) > 0 && (
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#171717" }}>
                      Servicios: {sesion.cantidad_servicios_cuenta_corriente} —{" "}
                      {formatCurrency(sesion.total_servicios_cuenta_corriente)}
                    </Typography>
                  )}
                </Box>

                {detalleCC && (detalleCC.ventas?.length > 0 || detalleCC.servicios?.length > 0) && (
                  <Box sx={{ pt: 1.5, borderTop: "1px solid", borderColor: alpha("#f59e0b", 0.2) }}>
                    {detalleCC.ventas?.length > 0 && (
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" sx={{ color: "#92400e", fontWeight: 700, display: "block", mb: 0.75 }}>
                          Ventas en CC
                        </Typography>
                        {detalleCC.ventas.map((v) => (
                          <Box
                            key={`v-${v.id}`}
                            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.35, gap: 1 }}
                          >
                            <Typography variant="caption" sx={{ color: "#334155" }}>
                              {v.numero} — {v.cliente || "Sin cliente"}
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: "#b45309" }}>
                              {formatCurrency(v.total)}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                    {detalleCC.servicios?.length > 0 && (
                      <Box>
                        <Typography variant="caption" sx={{ color: "#92400e", fontWeight: 700, display: "block", mb: 0.75 }}>
                          Servicios en CC
                        </Typography>
                        {detalleCC.servicios.map((s) => (
                          <Box
                            key={`s-${s.id}`}
                            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.35, gap: 1 }}
                          >
                            <Typography variant="caption" sx={{ color: "#334155" }}>
                              {s.numero} — {s.cliente || "Sin cliente"}
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: "#b45309" }}>
                              {formatCurrency(s.total)}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                )}
              </Paper>
            </Collapse>
          </Box>
        )}

        {/* Cierre — rediseño */}
        {sesion.estado === "CERRADA" && (
          <Paper
            elevation={0}
            sx={{
              mb: 2.5,
              p: { xs: 2, sm: 2.5 },
              borderRadius: 2.5,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
              background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
              boxShadow: "0 4px 24px rgba(15, 23, 42, 0.06)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <VerifiedIcon sx={{ color: "#dc2626", fontSize: 24 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#171717", letterSpacing: "-0.02em" }}>
                Cierre de caja
              </Typography>
              <Chip
                size="small"
                label="Auditoría"
                sx={{ ml: "auto", fontWeight: 600, bgcolor: alpha("#dc2626", 0.12), color: "#b91c1c" }}
              />
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1.15fr 1fr 1fr" },
                gap: 2,
                alignItems: "stretch",
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha("#dc2626", 0.06),
                  border: `1px solid ${alpha("#dc2626", 0.22)}`,
                }}
              >
                <Typography variant="caption" sx={{ color: "#b91c1c", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Monto contado al cierre
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#991b1b", mt: 1, letterSpacing: "-0.03em" }}>
                  {formatCurrency(sesion.monto_final)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                  Lo físicamente registrado al cerrar la sesión.
                </Typography>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor:
                    diferencia < 0 ? alpha("#dc2626", 0.06) : diferencia > 0 ? alpha("#f59e0b", 0.08) : alpha("#059669", 0.08),
                  border: "1px solid",
                  borderColor:
                    diferencia < 0 ? alpha("#dc2626", 0.25) : diferencia > 0 ? alpha("#f59e0b", 0.35) : alpha("#059669", 0.25),
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: diferencia < 0 ? "#b91c1c" : diferencia > 0 ? "#b45309" : "#047857",
                  }}
                >
                  Diferencia vs. esperado
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    mt: 1,
                    letterSpacing: "-0.03em",
                    color: diferencia < 0 ? "#b91c1c" : diferencia > 0 ? "#b45309" : "#047857",
                  }}
                >
                  {diferencia > 0 ? "+" : ""}
                  {formatCurrency(diferencia)}
                </Typography>
                <Chip
                  size="small"
                  sx={{ mt: 1.5, fontWeight: 700 }}
                  label={diferencia < 0 ? "Faltante" : diferencia > 0 ? "Sobrante" : "Cuadre exacto"}
                  color={diferencia < 0 ? "error" : diferencia > 0 ? "warning" : "success"}
                />
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha("#64748b", 0.06),
                  border: "1px solid",
                  borderColor: alpha("#64748b", 0.15),
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <PersonIcon sx={{ color: "#475569" }} />
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Cerrado por
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#171717" }}>
                  {sesion.usuario_cierre_nombre || "—"}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {formatDate(sesion.fecha_cierre)}
                </Typography>
              </Paper>
            </Box>
          </Paper>
        )}

        {/* Ingresos por método — neto vs bruto */}
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { sm: "center" }, justifyContent: "space-between", gap: 2, mb: 2 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#171717", letterSpacing: "-0.02em" }}>
              Por método de pago
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", maxWidth: 560 }}>
              <strong>Neto (recomendado):</strong> ingresos menos egresos del mismo método — coincide con lo que deberías contar (ej.: efectivo
              físico). <strong>Solo ingresos:</strong> suma bruta de ingresos, sin restar devoluciones ni egresos.
            </Typography>
          </Box>
          <ToggleButtonGroup
            value={vistaMetodoPago}
            exclusive
            size="small"
            onChange={(_, v) => v && setVistaMetodoPago(v)}
            sx={{
              flexShrink: 0,
              bgcolor: "background.paper",
              borderRadius: 999,
              p: 0.5,
              border: "1px solid",
              borderColor: "divider",
              "& .MuiToggleButton-root": {
                border: "none",
                borderRadius: 999,
                px: 2,
                py: 0.75,
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.8rem",
              },
              "& .Mui-selected": {
                bgcolor: "#b91c1c",
                color: "#fff",
                "&:hover": { bgcolor: "#991b1b" },
              },
            }}
          >
            <ToggleButton value="neto">Neto (arqueo)</ToggleButton>
            <ToggleButton value="bruto">Solo ingresos</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            {vistaMetodoPago === "neto"
              ? `Suma de netos por método: ${formatCurrency(totalReferenciaNeto)} · Ingresos brutos (referencia): ${formatCurrency(totalReferenciaBrutoIngresos)}`
              : `Total ingresos por método (sin descontar egresos): ${formatCurrency(totalReferenciaBrutoIngresos)}`}
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {loading ? (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                Cargando desglose…
              </Typography>
            </Grid>
          ) : resumenMetodos.length > 0 ? (
            resumenMetodos.map((item) => {
              const config = getMetodoPagoConfig(item.metodo_pago)
              const Icon = config.icon

              const montoPrincipal =
                vistaMetodoPago === "neto" ? item.neto : Number.parseFloat(item.total || 0)
              const refTotal = vistaMetodoPago === "neto" ? totalReferenciaNeto : totalReferenciaBrutoIngresos
              const porcentaje = refTotal !== 0 ? (Math.abs(montoPrincipal) / Math.abs(refTotal)) * 100 : 0

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={`${vistaMetodoPago}-${item.metodo_pago}`}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 2,
                      height: "100%",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                      transition: "box-shadow 0.2s",
                      "&:hover": { boxShadow: "0 6px 20px rgba(15,23,42,0.08)" },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.25 }}>
                      <Box sx={{ bgcolor: config.bg, borderRadius: 1.5, p: 0.85, display: "flex" }}>
                        <Icon sx={{ fontSize: 20, color: config.color }} />
                      </Box>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                        {config.label}
                      </Typography>
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 800,
                        color: vistaMetodoPago === "neto" && montoPrincipal < 0 ? "error.main" : config.color,
                        mb: 0.5,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {formatCurrency(montoPrincipal)}
                    </Typography>
                    {vistaMetodoPago === "neto" ? (
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                          Ingresos: {formatCurrency(item.totalIngresos)} · Egresos: {formatCurrency(item.totalEgresos)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.25 }}>
                          Ops.: {item.cantidadIngresos} ing. / {item.cantidadEgresos} egr.
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {item.cantidad} {item.cantidad === 1 ? "operación" : "operaciones"} · {porcentaje.toFixed(1)}% del total ingresos
                      </Typography>
                    )}
                    {vistaMetodoPago === "neto" && item.totalEgresos > 0 && (
                      <Tooltip title="Los egresos en este método (ej. devolución en efectivo) bajan el neto respecto al total de ingresos.">
                        <Chip size="small" label="Incluye egresos" sx={{ mt: 1, fontWeight: 600, fontSize: "0.65rem" }} variant="outlined" />
                      </Tooltip>
                    )}
                  </Card>
                </Grid>
              )
            })
          ) : (
            <Grid item xs={12}>
              <Box sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  No hay movimientos para mostrar en este desglose
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 2 }}>
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: "0.08em" }}>
            MOVIMIENTOS DE CAJA
          </Typography>
        </Divider>

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ maxHeight: 400, borderRadius: 2, border: "1px solid", borderColor: "divider" }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: "#f1f5f9", fontWeight: 700, fontSize: "0.72rem" }}>Tipo</TableCell>
                <TableCell sx={{ bgcolor: "#f1f5f9", fontWeight: 700, fontSize: "0.72rem" }}>Descripción</TableCell>
                <TableCell sx={{ bgcolor: "#f1f5f9", fontWeight: 700, fontSize: "0.72rem" }}>Método</TableCell>
                <TableCell sx={{ bgcolor: "#f1f5f9", fontWeight: 700, fontSize: "0.72rem" }} align="right">
                  Monto
                </TableCell>
                <TableCell sx={{ bgcolor: "#f1f5f9", fontWeight: 700, fontSize: "0.72rem" }}>Fecha</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {movimientos.length > 0 ? (
                movimientos.map((mov) => {
                  const config = getMetodoPagoConfig(mov.metodo_pago)
                  return (
                    <TableRow key={mov.id} hover>
                      <TableCell sx={{ py: 1 }}>
                        <Chip
                          label={mov.tipo}
                          size="small"
                          color={getTipoMovimientoColor(mov.tipo)}
                          sx={{ fontWeight: 600, fontSize: "0.65rem", height: 22 }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                          {mov.concepto}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Chip
                          label={config.label}
                          size="small"
                          sx={{
                            bgcolor: config.bg,
                            color: config.color,
                            fontWeight: 600,
                            fontSize: "0.65rem",
                            height: 22,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.8rem",
                            color: mov.tipo === "INGRESO" ? "success.main" : "error.main",
                          }}
                        >
                          {mov.tipo === "INGRESO" ? "+" : "-"}
                          {formatCurrency(mov.monto)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                          {formatDate(mov.created_at)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: "center", py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
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
