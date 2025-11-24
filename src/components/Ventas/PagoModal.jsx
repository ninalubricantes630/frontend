"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  Paper,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material"
import {
  CreditCard as CreditCardIcon,
  AccountBalance as AccountBalanceIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  Close as CloseIcon,
} from "@mui/icons-material"
import ClienteSelector from "./ClienteSelector"
import { formatCurrency, formatPriceInput, parsePriceInput } from "../../utils/formatters"
import tarjetasService from "../../services/tarjetasService"

const METODOS_PAGO = [
  { value: "efectivo", label: "Efectivo", icon: <PaymentIcon /> },
  { value: "tarjeta_credito", label: "Crédito", icon: <CreditCardIcon /> },
  { value: "transferencia", label: "Transferencia", icon: <AccountBalanceIcon /> },
  { value: "cuenta_corriente", label: "Cuenta Corriente", icon: <PersonIcon /> },
]

export default function PagoModal({ open, onClose, subtotal, descuento, interes, total, onConfirm }) {
  const [metodoPago, setMetodoPago] = useState("efectivo")
  const [montoPagado, setMontoPagado] = useState("")
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [showClienteSelector, setShowClienteSelector] = useState(false)
  const [observaciones, setObservaciones] = useState("")
  const [error, setError] = useState("")

  const [tarjetas, setTarjetas] = useState([])
  const [tarjetaSeleccionada, setTarjetaSeleccionada] = useState(null)
  const [cuotas, setCuotas] = useState([])
  const [cuotasSeleccionadas, setCuotasSeleccionadas] = useState(null)
  const [loadingTarjetas, setLoadingTarjetas] = useState(false)
  const [interesTarjeta, setInteresTarjeta] = useState(0)
  const [totalConInteresTarjeta, setTotalConInteresTarjeta] = useState(total)

  useEffect(() => {
    if (open) {
      setMontoPagado(formatCurrency(total).replace("$", "").trim())
      setMetodoPago("efectivo")
      setClienteSeleccionado(null)
      setObservaciones("")
      setError("")
      setTarjetaSeleccionada(null)
      setCuotasSeleccionadas(null)
      setInteresTarjeta(0)
      setTotalConInteresTarjeta(total)
      cargarTarjetas()
    }
  }, [open, total])

  useEffect(() => {
    if (metodoPago === "tarjeta_credito" && !tarjetas.length && !loadingTarjetas) {
      cargarTarjetas()
    }
  }, [metodoPago])

  useEffect(() => {
    if (tarjetaSeleccionada && metodoPago === "tarjeta_credito") {
      cargarCuotas(tarjetaSeleccionada)
    }
  }, [tarjetaSeleccionada])

  useEffect(() => {
    if (metodoPago === "tarjeta_credito" && cuotasSeleccionadas) {
      const tasaInteres = cuotasSeleccionadas.tasa_interes
      const interesCalculado = total * (tasaInteres / 100)
      const totalConInteresCalculado = total + interesCalculado

      setInteresTarjeta(interesCalculado)
      setTotalConInteresTarjeta(totalConInteresCalculado)
    } else {
      setInteresTarjeta(0)
      setTotalConInteresTarjeta(total)
    }
  }, [cuotasSeleccionadas, metodoPago, total])

  useEffect(() => {
    if (metodoPago === "cuenta_corriente" && !clienteSeleccionado) {
      setShowClienteSelector(true)
    }
  }, [metodoPago])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault()
        const currentIndex = METODOS_PAGO.findIndex((m) => m.value === metodoPago)
        let newIndex

        if (e.key === "ArrowRight") {
          newIndex = (currentIndex + 1) % METODOS_PAGO.length
        } else {
          newIndex = (currentIndex - 1 + METODOS_PAGO.length) % METODOS_PAGO.length
        }

        setMetodoPago(METODOS_PAGO[newIndex].value)
      }

      if (e.key === "F1") {
        e.preventDefault()
        handleConfirm()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, metodoPago])

  const cargarTarjetas = async () => {
    try {
      setLoadingTarjetas(true)
      const data = await tarjetasService.getTarjetasParaVenta()
      setTarjetas(data || [])
    } catch (err) {
      console.error("Error loading credit cards:", err)
      setError("No se pudieron cargar las tarjetas disponibles")
    } finally {
      setLoadingTarjetas(false)
    }
  }

  const cargarCuotas = async (tarjeta_id) => {
    try {
      const data = await tarjetasService.getCuotasPorTarjeta(tarjeta_id)
      setCuotas(data || [])
      setCuotasSeleccionadas(null)
    } catch (err) {
      console.error("Error loading installments:", err)
      setError("No se pudieron cargar las cuotas disponibles")
    }
  }

  const calcularVuelto = () => {
    const pagado = parsePriceInput(montoPagado) || 0
    return pagado - total
  }

  const isConsumidorFinal = (cliente) => {
    return cliente?.id === 1 || cliente?.nombre?.toLowerCase().includes("consumidor final")
  }

  const handleConfirm = () => {
    setError("")

    if (metodoPago === "cuenta_corriente" && !clienteSeleccionado) {
      setError("Debe seleccionar un cliente para cuenta corriente")
      return
    }

    if (metodoPago === "cuenta_corriente" && isConsumidorFinal(clienteSeleccionado)) {
      setError("No se puede registrar en cuenta corriente al Consumidor Final")
      return
    }

    if (metodoPago === "tarjeta_credito") {
      if (!tarjetaSeleccionada) {
        setError("Debe seleccionar una tarjeta de crédito")
        return
      }
      if (!cuotasSeleccionadas) {
        setError("Debe seleccionar la cantidad de cuotas")
        return
      }
    }

    if (metodoPago === "efectivo") {
      const pagado = parsePriceInput(montoPagado) || 0
      if (pagado < total) {
        setError("El monto pagado debe ser mayor o igual al total")
        return
      }
    }

    const datosPago = {
      tipo_pago: metodoPago.toUpperCase(), // EFECTIVO, TARJETA_CREDITO, TRANSFERENCIA, CUENTA_CORRIENTE
      monto_pagado: parsePriceInput(montoPagado) || total,
      vuelto: metodoPago === "efectivo" ? calcularVuelto() : 0,
      cliente_id: clienteSeleccionado?.id || null,
      observaciones: observaciones.trim() || null,
      // Información de tarjeta de crédito
      tarjeta_id: metodoPago === "tarjeta_credito" ? tarjetaSeleccionada : null,
      numero_cuotas: metodoPago === "tarjeta_credito" ? cuotasSeleccionadas?.numero_cuotas || null : null,
      // Información de descuento
      descuento: descuento?.montoDescuento || 0,
      // Información de interés del sistema
      interes_sistema: interes?.montoInteres || 0,
      tipo_interes_sistema: interes?.tipoInteres || null,
      valor_interes_sistema: interes?.valorInteres || 0,
      // Total que se registra en el sistema (con descuento e interés del sistema, sin interés de tarjeta)
      total_con_interes: total,
      // Total que paga el cliente (incluye interés de tarjeta si aplica)
      total_con_interes_tarjeta:
        metodoPago === "tarjeta_credito" && totalConInteresTarjeta ? totalConInteresTarjeta : null,
      // Información del interés de tarjeta
      interes_tarjeta: metodoPago === "tarjeta_credito" ? interesTarjeta || 0 : 0,
      tasa_interes_tarjeta:
        metodoPago === "tarjeta_credito" && cuotasSeleccionadas?.tasa_interes ? cuotasSeleccionadas.tasa_interes : null,
    }

    onConfirm(datosPago)
  }

  const handleClienteSelect = (cliente) => {
    if (metodoPago === "cuenta_corriente" && isConsumidorFinal(cliente)) {
      setError("No se puede registrar en cuenta corriente al Consumidor Final")
      return
    }
    setClienteSeleccionado(cliente)
    setShowClienteSelector(false)
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            pb: 1.5,
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <Box
            sx={{
              width: 4,
              height: 32,
              bgcolor: "#dc2626",
              borderRadius: 1,
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#171717", fontSize: "1.1rem" }}>
              Procesar Pago
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "#6b7280",
              "&:hover": { bgcolor: "#f3f4f6" },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 2.5, mt: 2 }}>
          <Box>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 2.5,
                bgcolor: "#fef2f2",
                border: "1px solid #fee2e2",
                borderRadius: 1.5,
                textAlign: "center",
              }}
            >
              <Typography variant="body2" sx={{ color: "#6b7280", fontSize: "0.875rem", mb: 0.5 }}>
                Subtotal
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600, color: "#171717", mb: 1 }}>
                {formatCurrency(subtotal)}
              </Typography>

              {/* Mostrar descuento si existe */}
              {descuento && descuento.montoDescuento > 0 && (
                <>
                  <Box sx={{ borderTop: "1px solid #fee2e2", pt: 1, mt: 1 }}>
                    <Typography variant="body2" sx={{ color: "#16a34a", fontSize: "0.875rem", mb: 0.5 }}>
                      - Descuento {descuento.tipoDescuento === "porcentaje" ? `(${descuento.valorDescuento}%)` : ""}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#16a34a", fontWeight: 600, mb: 0.75 }}>
                      -{formatCurrency(descuento.montoDescuento)}
                    </Typography>
                  </Box>
                </>
              )}

              {/* Mostrar interés del sistema si existe */}
              {interes && interes.montoInteres > 0 && (
                <>
                  <Box sx={{ borderTop: "1px solid #fee2e2", pt: 1, mt: 1 }}>
                    <Typography variant="body2" sx={{ color: "#f59e0b", fontSize: "0.875rem", mb: 0.5 }}>
                      + Interés del sistema {interes.tipoInteres === "porcentaje" ? `(${interes.valorInteres}%)` : ""}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#f59e0b", fontWeight: 600, mb: 0.75 }}>
                      +{formatCurrency(interes.montoInteres)}
                    </Typography>
                  </Box>
                </>
              )}

              <Box sx={{ borderTop: "1px solid #fee2e2", pt: 1, mt: 1 }}>
                <Typography variant="body2" sx={{ color: "#6b7280", fontSize: "0.875rem", mb: 0.5 }}>
                  Total a cobrar (Entra en caja)
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, color: "#dc2626" }}>
                  {formatCurrency(total)}
                </Typography>
              </Box>

              {metodoPago === "tarjeta_credito" && cuotasSeleccionadas && (
                <>
                  <Box
                    sx={{
                      borderTop: "1px solid #fee2e2",
                      pt: 1.5,
                      mt: 1.5,
                      bgcolor: "#fef3c7",
                      borderRadius: 1,
                      p: 1.5,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "#92400e", fontSize: "0.75rem", mb: 0.5 }}>
                      {cuotasSeleccionadas.numero_cuotas} cuota{cuotasSeleccionadas.numero_cuotas > 1 ? "s" : ""}
                      {cuotasSeleccionadas.tasa_interes > 0 && ` + ${cuotasSeleccionadas.tasa_interes}% interes`}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#78350f" }}>
                      {formatCurrency(totalConInteresTarjeta)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#92400e", display: "block", mt: 0.5, fontSize: "0.7rem" }}
                    >
                      Monto que se guarda en el sistema
                    </Typography>
                  </Box>
                </>
              )}
            </Paper>

            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: "#374151", fontSize: "0.875rem" }}>
              Método de pago
            </Typography>
            <ToggleButtonGroup
              value={metodoPago}
              exclusive
              onChange={(e, value) => value && setMetodoPago(value)}
              fullWidth
              sx={{
                mb: 2.5,
                "& .MuiToggleButton-root": {
                  py: 1.2,
                  fontSize: "0.875rem",
                  "&.Mui-selected": {
                    bgcolor: "#fef2f2",
                    color: "#dc2626",
                    borderColor: "#dc2626 !important",
                    "&:hover": {
                      bgcolor: "#fee2e2",
                    },
                  },
                },
              }}
            >
              {METODOS_PAGO.map((metodo) => (
                <ToggleButton
                  key={metodo.value}
                  value={metodo.value}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  {metodo.icon}
                  <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                    {metodo.label}
                  </Typography>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            {metodoPago === "tarjeta_credito" && (
              <Box sx={{ mb: 2.5 }}>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Seleccionar Tarjeta</InputLabel>
                  <Select
                    value={tarjetaSeleccionada || ""}
                    onChange={(e) => setTarjetaSeleccionada(e.target.value)}
                    label="Seleccionar Tarjeta"
                  >
                    {loadingTarjetas ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Cargando tarjetas...
                      </MenuItem>
                    ) : (
                      tarjetas.map((tarjeta) => (
                        <MenuItem key={tarjeta.id} value={tarjeta.id}>
                          {tarjeta.nombre}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>

                {tarjetaSeleccionada && cuotas.length > 0 && (
                  <FormControl fullWidth size="small">
                    <InputLabel>Cantidad de Cuotas</InputLabel>
                    <Select
                      value={cuotasSeleccionadas?.id || ""}
                      onChange={(e) => {
                        const selected = cuotas.find((c) => c.id === e.target.value)
                        setCuotasSeleccionadas(selected)
                      }}
                      label="Cantidad de Cuotas"
                    >
                      {cuotas.map((cuota) => (
                        <MenuItem key={cuota.id} value={cuota.id}>
                          {cuota.numero_cuotas}x{" "}
                          {cuota.tasa_interes > 0 ? `(${cuota.tasa_interes}% interés)` : "(Sin interés)"}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {tarjetaSeleccionada && cuotas.length === 0 && !loadingTarjetas && (
                  <Alert severity="warning" sx={{ borderRadius: 1 }}>
                    Esta tarjeta no tiene cuotas configuradas
                  </Alert>
                )}
              </Box>
            )}

            {metodoPago === "cuenta_corriente" && clienteSeleccionado && (
              <Alert
                severity="info"
                sx={{
                  mb: 2.5,
                  borderRadius: 1.5,
                  "& .MuiAlert-message": { width: "100%" },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Cliente: {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}
                </Typography>
                <Typography variant="caption" sx={{ display: "block", mb: 1 }}>
                  Se agregará {formatCurrency(total)} a su cuenta corriente
                </Typography>
                <Button
                  size="small"
                  onClick={() => setShowClienteSelector(true)}
                  sx={{
                    color: "#dc2626",
                    fontSize: "0.875rem",
                  }}
                >
                  Cambiar cliente
                </Button>
              </Alert>
            )}

            {metodoPago === "cuenta_corriente" && !clienteSeleccionado && (
              <Alert
                severity="info"
                sx={{
                  mb: 2.5,
                  borderRadius: 1.5,
                  "& .MuiAlert-message": { width: "100%" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PersonIcon sx={{ fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Seleccionar cliente
                    </Typography>
                    <Typography variant="caption" sx={{ display: "block" }}>
                      Es obligatorio seleccionar un cliente para cuenta corriente
                    </Typography>
                  </Box>
                </Box>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => setShowClienteSelector(true)}
                  sx={{
                    mt: 1,
                    bgcolor: "#dc2626",
                    color: "white",
                    "&:hover": { bgcolor: "#b91c1c" },
                  }}
                >
                  Seleccionar cliente
                </Button>
              </Alert>
            )}

            {metodoPago === "efectivo" && (
              <>
                <TextField
                  fullWidth
                  label="Monto pagado"
                  value={montoPagado}
                  onChange={(e) => setMontoPagado(formatPriceInput(e.target.value))}
                  size="small"
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                      "&:hover fieldset": { borderColor: "#dc2626" },
                      "&.Mui-focused fieldset": { borderColor: "#dc2626" },
                    },
                  }}
                  autoFocus
                />

                {montoPagado && parsePriceInput(montoPagado) >= total && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      mb: 2,
                      bgcolor: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: 1.5,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "#15803d", fontSize: "0.875rem", mb: 0.5 }}>
                      Vuelto
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: "#15803d" }}>
                      {formatCurrency(calcularVuelto())}
                    </Typography>
                  </Paper>
                )}
              </>
            )}

            <TextField
              fullWidth
              label="Observaciones (opcional)"
              multiline
              rows={2}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Notas adicionales sobre el pago..."
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                  "&:hover fieldset": { borderColor: "#dc2626" },
                  "&.Mui-focused fieldset": { borderColor: "#dc2626" },
                },
              }}
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5 }}>
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
          <Button
            onClick={onClose}
            sx={{
              color: "#6b7280",
              "&:hover": { bgcolor: "#f3f4f6" },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            sx={{
              bgcolor: "#dc2626",
              "&:hover": { bgcolor: "#b91c1c" },
            }}
          >
            Confirmar Venta (F1)
          </Button>
        </DialogActions>
      </Dialog>

      <ClienteSelector
        open={showClienteSelector}
        onClose={() => setShowClienteSelector(false)}
        onSelect={handleClienteSelect}
      />
    </>
  )
}
