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
  Switch,
  FormControlLabel,
  Divider,
} from "@mui/material"
import {
  CreditCard as CreditCardIcon,
  AccountBalance as AccountBalanceIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  CallSplit as SplitIcon,
} from "@mui/icons-material"
import ClienteSelector from "./ClienteSelector"
import { formatCurrency, formatPriceInput, parsePriceInput } from "../../utils/formatters"
import tarjetasService from "../../services/tarjetasService"
import { useAuth } from "../../contexts/AuthContext"

const METODOS_PAGO = [
  { value: "efectivo", label: "Efectivo", icon: <PaymentIcon /> },
  { value: "tarjeta_credito", label: "Crédito", icon: <CreditCardIcon /> },
  { value: "transferencia", label: "Transferencia", icon: <AccountBalanceIcon /> },
  { value: "cuenta_corriente", label: "Cuenta Corriente", icon: <PersonIcon /> },
]

// Métodos de pago disponibles para pago dividido (excluye cuenta corriente)
const METODOS_PAGO_DIVIDIDO = [
  { value: "efectivo", label: "Efectivo", icon: <PaymentIcon /> },
  { value: "tarjeta_credito", label: "Crédito", icon: <CreditCardIcon /> },
  { value: "transferencia", label: "Transferencia", icon: <AccountBalanceIcon /> },
]

export default function PagoModal({ open, onClose, subtotal, descuento, interes, total, onConfirm, sucursalVenta }) {
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

  // Estados para pago dividido
  const [pagoDividido, setPagoDividido] = useState(false)
  const [metodoPago2, setMetodoPago2] = useState("transferencia")
  const [montoPago1, setMontoPago1] = useState("")
  const [montoPago2, setMontoPago2] = useState("")
  const [tarjetaSeleccionada2, setTarjetaSeleccionada2] = useState(null)
  const [cuotas2, setCuotas2] = useState([])
  const [cuotasSeleccionadas2, setCuotasSeleccionadas2] = useState(null)

  const { user } = useAuth()

  const sucursalId = sucursalVenta?.id

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
      // Reset pago dividido
      setPagoDividido(false)
      setMetodoPago2("transferencia")
      setMontoPago1("")
      setMontoPago2("")
      setTarjetaSeleccionada2(null)
      setCuotas2([])
      setCuotasSeleccionadas2(null)
      if (sucursalId) {
        cargarTarjetas()
      }
    }
  }, [open, total, sucursalId])

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

  // Cargar cuotas para tarjeta 2 en pago dividido
  useEffect(() => {
    if (tarjetaSeleccionada2 && metodoPago2 === "tarjeta_credito" && pagoDividido) {
      cargarCuotas2(tarjetaSeleccionada2)
    }
  }, [tarjetaSeleccionada2, pagoDividido])

  useEffect(() => {
    if (metodoPago === "tarjeta_credito" && cuotasSeleccionadas && !pagoDividido) {
      const tasaInteres = cuotasSeleccionadas.tasa_interes
      const interesCalculado = total * (tasaInteres / 100)
      const totalConInteresCalculado = total + interesCalculado

      setInteresTarjeta(interesCalculado)
      setTotalConInteresTarjeta(totalConInteresCalculado)
    } else if (pagoDividido) {
      setInteresTarjeta(0)
      setTotalConInteresTarjeta(total)
    } else {
      setInteresTarjeta(0)
      setTotalConInteresTarjeta(total)
    }
  }, [cuotasSeleccionadas, metodoPago, total, pagoDividido])

  // Montos con interés para pago dividido (cuando uno de los pagos es tarjeta)
  const monto1Base = parsePriceInput(montoPago1) || 0
  const monto2Base = parsePriceInput(montoPago2) || 0
  const tasa1 = metodoPago === "tarjeta_credito" && cuotasSeleccionadas?.tasa_interes ? cuotasSeleccionadas.tasa_interes : 0
  const tasa2 = metodoPago2 === "tarjeta_credito" && cuotasSeleccionadas2?.tasa_interes ? cuotasSeleccionadas2.tasa_interes : 0
  const monto1ConInteres = tasa1 > 0 ? monto1Base * (1 + tasa1 / 100) : monto1Base
  const monto2ConInteres = tasa2 > 0 ? monto2Base * (1 + tasa2 / 100) : monto2Base
  const monto1ACobrar = pagoDividido && metodoPago === "tarjeta_credito" ? monto1ConInteres : monto1Base
  const monto2ACobrar = pagoDividido && metodoPago2 === "tarjeta_credito" ? monto2ConInteres : monto2Base
  const totalPagoDivididoConInteres = monto1ACobrar + monto2ACobrar

  useEffect(() => {
    if (metodoPago === "cuenta_corriente" && !clienteSeleccionado) {
      setShowClienteSelector(true)
    }
  }, [metodoPago])

  // Auto-calcular monto del segundo pago cuando cambia el primero
  useEffect(() => {
    if (pagoDividido && montoPago1) {
      const monto1 = parsePriceInput(montoPago1) || 0
      const restante = total - monto1
      if (restante >= 0) {
        setMontoPago2(formatCurrency(restante).replace("$", "").trim())
      }
    }
  }, [montoPago1, pagoDividido, total])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault()
        const metodosActuales = pagoDividido ? METODOS_PAGO_DIVIDIDO : METODOS_PAGO
        const currentIndex = metodosActuales.findIndex((m) => m.value === metodoPago)
        let newIndex

        if (e.key === "ArrowRight") {
          newIndex = (currentIndex + 1) % metodosActuales.length
        } else {
          newIndex = (currentIndex - 1 + metodosActuales.length) % metodosActuales.length
        }

        setMetodoPago(metodosActuales[newIndex].value)
      }

      if (e.key === "F1") {
        e.preventDefault()
        handleConfirm()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, metodoPago, pagoDividido])

  const cargarTarjetas = async () => {
    try {
      setLoadingTarjetas(true)
      if (!sucursalId) {
        setError("No se pudo determinar la sucursal del usuario")
        return
      }
      const data = await tarjetasService.getTarjetasParaVenta(sucursalId)
      setTarjetas(data || [])
    } catch (err) {
      console.error("[v0] Error loading credit cards:", err)
      setError("No se pudieron cargar las tarjetas disponibles")
    } finally {
      setLoadingTarjetas(false)
    }
  }

  const cargarCuotas = async (tarjeta_id) => {
    try {
      if (!sucursalId) {
        setError("No se pudo determinar la sucursal del usuario")
        return
      }
      const data = await tarjetasService.getCuotasPorTarjeta(tarjeta_id, sucursalId)
      setCuotas(data || [])
      setCuotasSeleccionadas(null)
    } catch (err) {
      console.error("[v0] Error loading installments:", err)
      setError("No se pudieron cargar las cuotas disponibles")
    }
  }

  const cargarCuotas2 = async (tarjeta_id) => {
    try {
      if (!sucursalId) {
        setError("No se pudo determinar la sucursal del usuario")
        return
      }
      const data = await tarjetasService.getCuotasPorTarjeta(tarjeta_id, sucursalId)
      setCuotas2(data || [])
      setCuotasSeleccionadas2(null)
    } catch (err) {
      console.error("[v0] Error loading installments for second payment:", err)
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

  const handlePagoDivididoChange = (event) => {
    const enabled = event.target.checked
    setPagoDividido(enabled)
    
    if (enabled) {
      // Al activar pago dividido, resetear a efectivo si está en cuenta corriente
      if (metodoPago === "cuenta_corriente") {
        setMetodoPago("efectivo")
      }
      // Inicializar montos
      const mitad = total / 2
      setMontoPago1(formatCurrency(mitad).replace("$", "").trim())
      setMontoPago2(formatCurrency(total - mitad).replace("$", "").trim())
      // Asegurar que el segundo método sea diferente al primero
      if (metodoPago2 === metodoPago) {
        setMetodoPago2(metodoPago === "efectivo" ? "transferencia" : "efectivo")
      }
    } else {
      setMontoPago1("")
      setMontoPago2("")
    }
  }

  const handleConfirm = () => {
    setError("")

    if (pagoDividido) {
      // Validaciones para pago dividido
      const monto1 = parsePriceInput(montoPago1) || 0
      const monto2 = parsePriceInput(montoPago2) || 0
      const sumaPagos = monto1 + monto2

      if (monto1 <= 0) {
        setError("El monto del primer pago debe ser mayor a 0")
        return
      }

      if (monto2 <= 0) {
        setError("El monto del segundo pago debe ser mayor a 0")
        return
      }

      if (Math.abs(sumaPagos - total) > 0.01) {
        setError(`La suma de los montos base (${formatCurrency(sumaPagos)}) debe ser igual al total (${formatCurrency(total)})`)
        return
      }

      if (metodoPago === metodoPago2) {
        setError("Los métodos de pago deben ser diferentes")
        return
      }

      // Validar tarjeta de crédito para el primer pago
      if (metodoPago === "tarjeta_credito") {
        if (!tarjetaSeleccionada) {
          setError("Debe seleccionar una tarjeta de crédito para el primer pago")
          return
        }
        if (!cuotasSeleccionadas) {
          setError("Debe seleccionar la cantidad de cuotas para el primer pago")
          return
        }
      }

      // Validar tarjeta de crédito para el segundo pago
      if (metodoPago2 === "tarjeta_credito") {
        if (!tarjetaSeleccionada2) {
          setError("Debe seleccionar una tarjeta de crédito para el segundo pago")
          return
        }
        if (!cuotasSeleccionadas2) {
          setError("Debe seleccionar la cantidad de cuotas para el segundo pago")
          return
        }
      }

      // Montos a cobrar (con interés aplicado en la parte de tarjeta)
      const monto1Cobrar = metodoPago === "tarjeta_credito" && cuotasSeleccionadas?.tasa_interes
        ? monto1 * (1 + cuotasSeleccionadas.tasa_interes / 100)
        : monto1
      const monto2Cobrar = metodoPago2 === "tarjeta_credito" && cuotasSeleccionadas2?.tasa_interes
        ? monto2 * (1 + cuotasSeleccionadas2.tasa_interes / 100)
        : monto2

      const datosPago = {
        pago_dividido: true,
        tipo_pago: metodoPago.toUpperCase(),
        monto_pago_1: monto1Cobrar,
        tarjeta_id: metodoPago === "tarjeta_credito" ? tarjetaSeleccionada : null,
        numero_cuotas: metodoPago === "tarjeta_credito" ? cuotasSeleccionadas?.numero_cuotas || null : null,
        tasa_interes_tarjeta: metodoPago === "tarjeta_credito" && cuotasSeleccionadas?.tasa_interes ? cuotasSeleccionadas.tasa_interes : null,
        tipo_pago_2: metodoPago2.toUpperCase(),
        monto_pago_2: monto2Cobrar,
        tarjeta_id_2: metodoPago2 === "tarjeta_credito" ? tarjetaSeleccionada2 : null,
        numero_cuotas_2: metodoPago2 === "tarjeta_credito" ? cuotasSeleccionadas2?.numero_cuotas || null : null,
        tasa_interes_tarjeta_2: metodoPago2 === "tarjeta_credito" && cuotasSeleccionadas2?.tasa_interes ? cuotasSeleccionadas2.tasa_interes : null,
        monto_pagado: monto1Cobrar + monto2Cobrar,
        vuelto: 0,
        cliente_id: clienteSeleccionado?.id || null,
        observaciones: observaciones.trim() || null,
        descuento: descuento?.montoDescuento || 0,
        interes_sistema: interes?.montoInteres || 0,
        tipo_interes_sistema: interes?.tipoInteres || null,
        valor_interes_sistema: interes?.valorInteres || 0,
        total_con_interes: total,
        interes_tarjeta: 0,
        total_con_interes_tarjeta: monto1Cobrar + monto2Cobrar,
      }

      onConfirm(datosPago)
      return
    }

    // Validaciones para pago simple (código original)
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
      tipo_pago: metodoPago.toUpperCase(),
      monto_pagado: parsePriceInput(montoPagado) || total,
      vuelto: metodoPago === "efectivo" ? calcularVuelto() : 0,
      cliente_id: clienteSeleccionado?.id || null,
      observaciones: observaciones.trim() || null,
      tarjeta_id: metodoPago === "tarjeta_credito" ? tarjetaSeleccionada : null,
      numero_cuotas: metodoPago === "tarjeta_credito" ? cuotasSeleccionadas?.numero_cuotas || null : null,
      descuento: descuento?.montoDescuento || 0,
      interes_sistema: interes?.montoInteres || 0,
      tipo_interes_sistema: interes?.tipoInteres || null,
      valor_interes_sistema: interes?.valorInteres || 0,
      total_con_interes: total,
      total_con_interes_tarjeta:
        metodoPago === "tarjeta_credito" && totalConInteresTarjeta ? totalConInteresTarjeta : null,
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

  const metodosActuales = pagoDividido ? METODOS_PAGO_DIVIDIDO : METODOS_PAGO

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

              {metodoPago === "tarjeta_credito" && cuotasSeleccionadas && !pagoDividido && (
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

            {/* Switch para pago dividido */}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                mb: 2.5,
                bgcolor: pagoDividido ? "#eff6ff" : "#f9fafb",
                border: pagoDividido ? "1px solid #bfdbfe" : "1px solid #e5e7eb",
                borderRadius: 1.5,
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={pagoDividido}
                    onChange={handlePagoDivididoChange}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#2563eb",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                        backgroundColor: "#2563eb",
                      },
                    }}
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <SplitIcon sx={{ fontSize: 20, color: pagoDividido ? "#2563eb" : "#6b7280" }} />
                    <Typography variant="body2" sx={{ fontWeight: 500, color: pagoDividido ? "#1d4ed8" : "#374151" }}>
                      Dividir pago en dos métodos
                    </Typography>
                  </Box>
                }
              />
            </Paper>

            {!pagoDividido ? (
              // PAGO SIMPLE (código original)
              <>
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
              </>
            ) : (
              // PAGO DIVIDIDO
              <>
                {/* Primer método de pago */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 2,
                    bgcolor: "#f0fdf4",
                    border: "1px solid #86efac",
                    borderRadius: 1.5,
                  }}
                >
                  <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600, color: "#166534", fontSize: "0.875rem" }}>
                    Primer pago
                  </Typography>
                  
                  <ToggleButtonGroup
                    value={metodoPago}
                    exclusive
                    onChange={(e, value) => {
                      if (value && value !== metodoPago2) {
                        setMetodoPago(value)
                        setTarjetaSeleccionada(null)
                        setCuotasSeleccionadas(null)
                      }
                    }}
                    fullWidth
                    size="small"
                    sx={{
                      mb: 2,
                      "& .MuiToggleButton-root": {
                        py: 0.8,
                        fontSize: "0.75rem",
                        "&.Mui-selected": {
                          bgcolor: "#dcfce7",
                          color: "#166534",
                          borderColor: "#16a34a !important",
                        },
                      },
                    }}
                  >
                    {METODOS_PAGO_DIVIDIDO.map((metodo) => (
                      <ToggleButton
                        key={metodo.value}
                        value={metodo.value}
                        disabled={metodo.value === metodoPago2}
                        sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}
                      >
                        {metodo.icon}
                        <Typography variant="caption" sx={{ fontSize: "0.65rem" }}>
                          {metodo.label}
                        </Typography>
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>

                  {metodoPago === "tarjeta_credito" && (
                    <Box sx={{ mb: 1.5 }}>
                      <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                        <InputLabel>Tarjeta</InputLabel>
                        <Select
                          value={tarjetaSeleccionada || ""}
                          onChange={(e) => setTarjetaSeleccionada(e.target.value)}
                          label="Tarjeta"
                        >
                          {tarjetas.map((tarjeta) => (
                            <MenuItem key={tarjeta.id} value={tarjeta.id}>
                              {tarjeta.nombre}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {tarjetaSeleccionada && cuotas.length > 0 && (
                        <FormControl fullWidth size="small">
                          <InputLabel>Cuotas</InputLabel>
                          <Select
                            value={cuotasSeleccionadas?.id || ""}
                            onChange={(e) => {
                              const selected = cuotas.find((c) => c.id === e.target.value)
                              setCuotasSeleccionadas(selected)
                            }}
                            label="Cuotas"
                          >
                            {cuotas.map((cuota) => (
                              <MenuItem key={cuota.id} value={cuota.id}>
                                {cuota.numero_cuotas}x {cuota.tasa_interes > 0 ? `(${cuota.tasa_interes}%)` : "(S/I)"}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </Box>
                  )}

                  <TextField
                    fullWidth
                    label="Monto"
                    value={montoPago1}
                    onChange={(e) => setMontoPago1(formatPriceInput(e.target.value))}
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1,
                        bgcolor: "white",
                      },
                    }}
                  />
                </Paper>

                {/* Segundo método de pago */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 2.5,
                    bgcolor: "#eff6ff",
                    border: "1px solid #93c5fd",
                    borderRadius: 1.5,
                  }}
                >
                  <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600, color: "#1e40af", fontSize: "0.875rem" }}>
                    Segundo pago
                  </Typography>
                  
                  <ToggleButtonGroup
                    value={metodoPago2}
                    exclusive
                    onChange={(e, value) => {
                      if (value && value !== metodoPago) {
                        setMetodoPago2(value)
                        setTarjetaSeleccionada2(null)
                        setCuotasSeleccionadas2(null)
                      }
                    }}
                    fullWidth
                    size="small"
                    sx={{
                      mb: 2,
                      "& .MuiToggleButton-root": {
                        py: 0.8,
                        fontSize: "0.75rem",
                        "&.Mui-selected": {
                          bgcolor: "#dbeafe",
                          color: "#1e40af",
                          borderColor: "#3b82f6 !important",
                        },
                      },
                    }}
                  >
                    {METODOS_PAGO_DIVIDIDO.map((metodo) => (
                      <ToggleButton
                        key={metodo.value}
                        value={metodo.value}
                        disabled={metodo.value === metodoPago}
                        sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}
                      >
                        {metodo.icon}
                        <Typography variant="caption" sx={{ fontSize: "0.65rem" }}>
                          {metodo.label}
                        </Typography>
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>

                  {metodoPago2 === "tarjeta_credito" && (
                    <Box sx={{ mb: 1.5 }}>
                      <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                        <InputLabel>Tarjeta</InputLabel>
                        <Select
                          value={tarjetaSeleccionada2 || ""}
                          onChange={(e) => setTarjetaSeleccionada2(e.target.value)}
                          label="Tarjeta"
                        >
                          {tarjetas.map((tarjeta) => (
                            <MenuItem key={tarjeta.id} value={tarjeta.id}>
                              {tarjeta.nombre}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {tarjetaSeleccionada2 && cuotas2.length > 0 && (
                        <FormControl fullWidth size="small">
                          <InputLabel>Cuotas</InputLabel>
                          <Select
                            value={cuotasSeleccionadas2?.id || ""}
                            onChange={(e) => {
                              const selected = cuotas2.find((c) => c.id === e.target.value)
                              setCuotasSeleccionadas2(selected)
                            }}
                            label="Cuotas"
                          >
                            {cuotas2.map((cuota) => (
                              <MenuItem key={cuota.id} value={cuota.id}>
                                {cuota.numero_cuotas}x {cuota.tasa_interes > 0 ? `(${cuota.tasa_interes}%)` : "(S/I)"}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </Box>
                  )}

                  <TextField
                    fullWidth
                    label="Monto"
                    value={montoPago2}
                    onChange={(e) => setMontoPago2(formatPriceInput(e.target.value))}
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1,
                        bgcolor: "white",
                      },
                    }}
                  />
                </Paper>

                {/* Resumen de pagos divididos (muestra montos con interés aplicado en crédito) */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    mb: 2,
                    bgcolor: "#fafafa",
                    border: "1px solid #e5e7eb",
                    borderRadius: 1,
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="caption" sx={{ color: "#6b7280" }}>
                      Pago 1 ({METODOS_PAGO_DIVIDIDO.find(m => m.value === metodoPago)?.label}):
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {formatCurrency(monto1ACobrar)}
                      {tasa1 > 0 && (
                        <Typography component="span" variant="caption" sx={{ color: "#6b7280", ml: 0.5 }}>
                          (base {formatCurrency(monto1Base)} + {tasa1}%)
                        </Typography>
                      )}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="caption" sx={{ color: "#6b7280" }}>
                      Pago 2 ({METODOS_PAGO_DIVIDIDO.find(m => m.value === metodoPago2)?.label}):
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {formatCurrency(monto2ACobrar)}
                      {tasa2 > 0 && (
                        <Typography component="span" variant="caption" sx={{ color: "#6b7280", ml: 0.5 }}>
                          (base {formatCurrency(monto2Base)} + {tasa2}%)
                        </Typography>
                      )}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 0.5 }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      Total:
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ fontWeight: 600, color: Math.abs(monto1Base + monto2Base - total) < 0.01 ? "#16a34a" : "#dc2626" }}
                    >
                      {formatCurrency(totalPagoDivididoConInteres)}
                    </Typography>
                  </Box>
                </Paper>
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
