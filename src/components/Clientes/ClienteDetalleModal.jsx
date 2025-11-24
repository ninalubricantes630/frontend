"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from "@mui/material"
import {
  Close as CloseIcon,
  Person as PersonIcon,
  DirectionsCar as CarIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CreditCard as CreditCardIcon,
  CalendarToday as CalendarIcon,
  Speed as SpeedIcon,
  AccountBalance as AccountBalanceIcon,
  Payment as PaymentIcon,
  ExpandMore as ExpandMoreIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material"
import vehiculosService from "../../services/vehiculosService"
import cuentasCorrientesService from "../../services/cuentasCorrientesService"
import cajaService from "../../services/cajaService"
import { NumericFormat } from "react-number-format"

const CancelacionDetalleModal = ({ open, onClose, movimiento }) => {
  if (!movimiento) return null

  const formatDateTime = (dateString) => {
    if (!dateString) return "No disponible"
    return new Date(dateString).toLocaleString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Detalles de Cancelación
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography variant="caption" color="textSecondary" sx={{ display: "block", mb: 0.5 }}>
              Fecha y Hora de Cancelación
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {formatDateTime(movimiento.fecha_cancelacion)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="textSecondary" sx={{ display: "block", mb: 0.5 }}>
              Cancelado por
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {movimiento.cancelado_por_nombre || "Usuario no disponible"}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="textSecondary" sx={{ display: "block", mb: 0.5 }}>
              Motivo
            </Typography>
            <Typography variant="body1">{movimiento.motivo_cancelacion || "No se especificó un motivo"}</Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 1.5 }}>
            Cerrar
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}

const ClienteDetalleModal = ({ open, onClose, cliente }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [vehiculos, setVehiculos] = useState([])
  const [loadingVehiculos, setLoadingVehiculos] = useState(false)
  const [errorVehiculos, setErrorVehiculos] = useState(null)
  const [cuentaCorriente, setCuentaCorriente] = useState(null)
  const [loadingCuentaCorriente, setLoadingCuentaCorriente] = useState(false)
  const [errorCuentaCorriente, setErrorCuentaCorriente] = useState(null)

  const [movimientos, setMovimientos] = useState([])
  const [paginaMovimientos, setPaginaMovimientos] = useState(1)
  const [totalPaginasMovimientos, setTotalPaginasMovimientos] = useState(0)
  const [loadingMovimientos, setLoadingMovimientos] = useState(false)

  const [mostrarFormPago, setMostrarFormPago] = useState(false)
  const [montoPago, setMontoPago] = useState("")
  const [metodoPago, setMetodoPago] = useState("EFECTIVO")
  const [observacionesPago, setObservacionesPago] = useState("")
  const [loadingPago, setLoadingPago] = useState(false)
  const [errorPago, setErrorPago] = useState(null)
  const [sesionCaja, setSesionCaja] = useState(null)

  const [cancelacionModal, setCancelacionModal] = useState({ open: false, movimiento: null })
  const [motivoCancelacion, setMotivoCancelacion] = useState("")
  const [cancelandoPago, setCancelandoPago] = useState(null)
  const [detallesCancelacionModal, setDetallesCancelacionModal] = useState({ open: false, movimiento: null })

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)

    if (newValue === 1 && vehiculos.length === 0) {
      loadVehiculos()
    }
    if (newValue === 2 && !cuentaCorriente) {
      loadCuentaCorriente()
    }
  }

  const loadVehiculos = async () => {
    try {
      setLoadingVehiculos(true)
      setErrorVehiculos(null)
      const response = await vehiculosService.getByCliente(cliente.id)
      const vehiculosData = response.data || response || []
      setVehiculos(vehiculosData)
    } catch (error) {
      console.error("Error al cargar vehículos:", error)
      setErrorVehiculos("Error al cargar los vehículos del cliente")
    } finally {
      setLoadingVehiculos(false)
    }
  }

  const loadCuentaCorriente = async () => {
    try {
      setLoadingCuentaCorriente(true)
      setErrorCuentaCorriente(null)

      // Obtener saldo
      const response = await cuentasCorrientesService.getSaldo(cliente.id)
      setCuentaCorriente(response)

      // Cargar movimientos
      await loadMovimientos(1)

      // Obtener sesión de caja activa
      try {
        const sesionResponse = await cajaService.getSesionActiva()
        setSesionCaja(sesionResponse)
      } catch (error) {
        console.log("No hay sesión de caja activa:", error)
        setSesionCaja(null)
      }
    } catch (error) {
      console.error("Error al cargar cuenta corriente:", error)
      setErrorCuentaCorriente("Error al cargar la cuenta corriente del cliente")
    } finally {
      setLoadingCuentaCorriente(false)
    }
  }

  const loadMovimientos = async (pagina) => {
    try {
      setLoadingMovimientos(true)
      const response = await cuentasCorrientesService.getHistorial(cliente.id, pagina, 5)

      if (pagina === 1) {
        setMovimientos(response.movimientos || [])
      } else {
        setMovimientos((prev) => [...prev, ...(response.movimientos || [])])
      }

      setPaginaMovimientos(pagina)
      setTotalPaginasMovimientos(response.pagination?.totalPages || 0)

      const hasMore = response.pagination?.hasMore || false
      if (hasMore) {
        setTotalPaginasMovimientos(pagina + 1)
      }
    } catch (error) {
      console.error("Error al cargar movimientos:", error)
    } finally {
      setLoadingMovimientos(false)
    }
  }

  const handleVerMasMovimientos = () => {
    if (movimientos.length > 0 && movimientos.length >= paginaMovimientos * 5) {
      loadMovimientos(paginaMovimientos + 1)
    }
  }

  const handleMontoPagoChange = (values) => {
    setMontoPago(values.floatValue || 0)
    if (errorPago) {
      setErrorPago(null)
    }
  }

  const handleSubmitPago = async (e) => {
    e.preventDefault()

    if (!sesionCaja) {
      setErrorPago("No hay una sesión de caja abierta. Por favor, abra la caja antes de registrar pagos.")
      return
    }

    if (!montoPago || Number.parseFloat(montoPago) <= 0) {
      setErrorPago("Ingrese un monto válido mayor a cero")
      return
    }

    if (Number.parseFloat(montoPago) > Number.parseFloat(cuentaCorriente.saldo)) {
      setErrorPago("El monto del pago no puede ser mayor al saldo")
      return
    }

    try {
      setLoadingPago(true)
      setErrorPago(null)

      await cuentasCorrientesService.registrarPago(cliente.id, {
        monto: Number.parseFloat(montoPago),
        metodo_pago: metodoPago,
        observaciones: observacionesPago,
        sesion_caja_id: sesionCaja.id,
      })

      // Limpiar formulario
      setMontoPago("")
      setMetodoPago("EFECTIVO")
      setObservacionesPago("")
      setMostrarFormPago(false)

      // Recargar cuenta corriente y movimientos
      await loadCuentaCorriente()
    } catch (error) {
      console.error("Error al registrar pago:", error)
      setErrorPago(error.message || "Error al registrar el pago")
    } finally {
      setLoadingPago(false)
    }
  }

  const handleAbrirCancelacion = (movimiento) => {
    setCancelacionModal({ open: true, movimiento })
    setMotivoCancelacion("")
  }

  const handleConfirmarCancelacion = async () => {
    if (!cancelacionModal.movimiento) return

    try {
      setCancelandoPago(cancelacionModal.movimiento.id)

      await cuentasCorrientesService.cancelarPago(cancelacionModal.movimiento.id, motivoCancelacion)

      // Cerrar modal
      setCancelacionModal({ open: false, movimiento: null })
      setMotivoCancelacion("")

      // Recargar cuenta corriente y movimientos
      await loadCuentaCorriente()
    } catch (error) {
      console.error("Error al cancelar pago:", error)
      setErrorCuentaCorriente(error.message || "Error al cancelar el pago")
    } finally {
      setCancelandoPago(null)
    }
  }

  const handleVerDetallesCancelacion = (movimiento) => {
    setDetallesCancelacionModal({ open: true, movimiento })
  }

  useEffect(() => {
    if (!open) {
      setVehiculos([])
      setActiveTab(0)
      setErrorVehiculos(null)
      setCuentaCorriente(null)
      setErrorCuentaCorriente(null)
      setMovimientos([])
      setPaginaMovimientos(1)
      setTotalPaginasMovimientos(0)
      setMostrarFormPago(false)
      setMontoPago("")
      setMetodoPago("EFECTIVO")
      setObservacionesPago("")
      setErrorPago(null)
      setSesionCaja(null)
      setCancelacionModal({ open: false, movimiento: null })
      setMotivoCancelacion("")
      setDetallesCancelacionModal({ open: false, movimiento: null })
    }
  }, [open])

  const formatDate = (dateString) => {
    if (!dateString) return "No disponible"
    return new Date(dateString).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return "No disponible"
    return new Date(dateString).toLocaleString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatNumber = (number) => {
    if (!number) return "0"
    return new Intl.NumberFormat("es-AR").format(number)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount)
  }

  if (!cliente) return null

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <Box
          sx={{
            backgroundColor: "#fff",
            borderBottom: "1px solid #e5e7eb",
            p: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 8,
                height: 40,
                backgroundColor: "#dc2626",
                borderRadius: 1,
              }}
            />
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ color: "#171717" }}>
                {cliente.nombre} {cliente.apellido}
              </Typography>
              <Typography variant="body2" sx={{ color: "#6b7280", fontSize: "0.875rem" }}>
                Información completa del cliente
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "#6b7280",
              "&:hover": {
                backgroundColor: "#f3f4f6",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box
          sx={{
            borderBottom: "1px solid #e5e7eb",
            px: 3,
            backgroundColor: "#fafafa",
            flexShrink: 0,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              minHeight: 56,
              "& .MuiTab-root": {
                color: "#6b7280",
                fontSize: "0.875rem",
                fontWeight: 500,
                textTransform: "none",
                minHeight: 56,
                px: 2,
                "&.Mui-selected": {
                  color: "#dc2626",
                },
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#dc2626",
                height: 3,
              },
            }}
          >
            <Tab icon={<PersonIcon sx={{ fontSize: 18 }} />} label="General" iconPosition="start" />
            <Tab
              icon={<CarIcon sx={{ fontSize: 18 }} />}
              label={`Vehículos ${vehiculos.length > 0 ? `(${vehiculos.length})` : ""}`}
              iconPosition="start"
            />
            <Tab icon={<AccountBalanceIcon sx={{ fontSize: 18 }} />} label="Cuenta Corriente" iconPosition="start" />
          </Tabs>
        </Box>

        <DialogContent
          sx={{
            p: 0,
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              p: 3,
            }}
          >
            {activeTab === 0 && (
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                  <Chip
                    label={cliente.activo ? "Cliente Activo" : "Cliente Inactivo"}
                    color={cliente.activo ? "success" : "error"}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </Box>

                <Grid container spacing={2.5}>
                  <Grid item xs={12} md={6}>
                    <Box
                      sx={{
                        backgroundColor: "#fff",
                        borderRadius: 1.5,
                        p: 2.5,
                        border: "1px solid #e5e7eb",
                        height: "100%",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                        <PersonIcon sx={{ fontSize: 18, color: "#dc2626" }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                          Información Personal
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <Box>
                          <Typography variant="caption" color="textSecondary" sx={{ fontSize: "0.75rem", mb: 0.5 }}>
                            Nombre Completo
                          </Typography>
                          <Typography variant="body2" fontWeight={500} sx={{ color: "#171717" }}>
                            {cliente.nombre} {cliente.apellido}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "start", gap: 1 }}>
                          <CreditCardIcon sx={{ color: "#6b7280", fontSize: 16, mt: 0.5 }} />
                          <Box>
                            <Typography variant="caption" color="textSecondary" sx={{ fontSize: "0.75rem", mb: 0.5 }}>
                              DNI
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={500}
                              sx={{ fontFamily: "monospace", color: "#171717" }}
                            >
                              {cliente.dni || "No especificado"}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box
                      sx={{
                        backgroundColor: "#fff",
                        borderRadius: 1.5,
                        p: 2.5,
                        border: "1px solid #e5e7eb",
                        height: "100%",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                        <PhoneIcon sx={{ fontSize: 18, color: "#1976d2" }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                          Información de Contacto
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "start", gap: 1 }}>
                          <PhoneIcon sx={{ color: "#6b7280", fontSize: 16, mt: 0.5 }} />
                          <Box>
                            <Typography variant="caption" color="textSecondary" sx={{ fontSize: "0.75rem", mb: 0.5 }}>
                              Teléfono
                            </Typography>
                            <Typography variant="body2" fontWeight={500} sx={{ color: "#171717" }}>
                              {cliente.telefono || "No especificado"}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "start", gap: 1 }}>
                          <LocationIcon sx={{ color: "#6b7280", fontSize: 16, mt: 0.5 }} />
                          <Box>
                            <Typography variant="caption" color="textSecondary" sx={{ fontSize: "0.75rem", mb: 0.5 }}>
                              Dirección
                            </Typography>
                            <Typography variant="body2" fontWeight={500} sx={{ color: "#171717" }}>
                              {cliente.direccion || "No especificada"}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box
                      sx={{
                        backgroundColor: "#fff",
                        borderRadius: 1.5,
                        p: 2.5,
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                        <CalendarIcon sx={{ fontSize: 18, color: "#4caf50" }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                          Información del Sistema
                        </Typography>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="caption" color="textSecondary" sx={{ fontSize: "0.75rem", mb: 0.5 }}>
                            Fecha de Registro
                          </Typography>
                          <Typography variant="body2" fontWeight={500} sx={{ color: "#171717" }}>
                            {formatDate(cliente.created_at)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="caption" color="textSecondary" sx={{ fontSize: "0.75rem", mb: 0.5 }}>
                            Última Actualización
                          </Typography>
                          <Typography variant="body2" fontWeight={500} sx={{ color: "#171717" }}>
                            {formatDate(cliente.updated_at)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                {loadingVehiculos && (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress sx={{ color: "#dc2626" }} size={32} />
                  </Box>
                )}

                {errorVehiculos && (
                  <Alert severity="error" sx={{ mb: 2, fontSize: "0.875rem" }}>
                    {errorVehiculos}
                  </Alert>
                )}

                {!loadingVehiculos && !errorVehiculos && vehiculos.length === 0 && (
                  <Box
                    sx={{
                      backgroundColor: "#fff",
                      borderRadius: 1.5,
                      p: 4,
                      border: "1px solid #e5e7eb",
                      textAlign: "center",
                    }}
                  >
                    <CarIcon sx={{ fontSize: 40, color: "#dc2626", mb: 1.5 }} />
                    <Typography variant="subtitle1" sx={{ color: "#171717", fontWeight: 600, mb: 0.5 }}>
                      Sin Vehículos Registrados
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: "0.875rem" }}>
                      Este cliente no tiene vehículos asociados
                    </Typography>
                  </Box>
                )}

                {!loadingVehiculos && vehiculos.length > 0 && (
                  <Box
                    sx={{
                      backgroundColor: "#fff",
                      borderRadius: 1.5,
                      border: "1px solid #e5e7eb",
                      overflow: "hidden",
                    }}
                  >
                    <TableContainer sx={{ maxHeight: "calc(100vh - 340px)" }}>
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell
                              sx={{
                                fontWeight: 600,
                                color: "#374151",
                                backgroundColor: "#f9fafb",
                                fontSize: "0.75rem",
                                py: 1.5,
                              }}
                            >
                              Vehículo
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: 600,
                                color: "#374151",
                                backgroundColor: "#f9fafb",
                                fontSize: "0.75rem",
                                py: 1.5,
                              }}
                            >
                              Patente
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: 600,
                                color: "#374151",
                                backgroundColor: "#f9fafb",
                                fontSize: "0.75rem",
                                py: 1.5,
                              }}
                            >
                              Año
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: 600,
                                color: "#374151",
                                backgroundColor: "#f9fafb",
                                fontSize: "0.75rem",
                                py: 1.5,
                              }}
                            >
                              Kilometraje
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: 600,
                                color: "#374151",
                                backgroundColor: "#f9fafb",
                                fontSize: "0.75rem",
                                py: 1.5,
                              }}
                            >
                              Estado
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {vehiculos.map((vehiculo) => (
                            <TableRow
                              key={vehiculo.id}
                              sx={{
                                "&:hover": {
                                  bgcolor: "#fafafa",
                                },
                              }}
                            >
                              <TableCell sx={{ py: 1.5 }}>
                                <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.875rem" }}>
                                  {vehiculo.marca} {vehiculo.modelo}
                                </Typography>
                                {vehiculo.numero_motor && (
                                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: "0.75rem" }}>
                                    Motor: {vehiculo.numero_motor}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell sx={{ py: 1.5 }}>
                                <Typography
                                  variant="body2"
                                  fontWeight={500}
                                  sx={{ fontFamily: "monospace", fontSize: "0.875rem" }}
                                >
                                  {vehiculo.patente}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ py: 1.5 }}>
                                <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                                  {vehiculo.año || "N/A"}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ py: 1.5 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                  <SpeedIcon sx={{ fontSize: 14, color: "#6b7280" }} />
                                  <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                                    {formatNumber(vehiculo.kilometraje)} km
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ py: 1.5 }}>
                                <Chip
                                  label={vehiculo.activo ? "Activo" : "Inactivo"}
                                  color={vehiculo.activo ? "success" : "error"}
                                  size="small"
                                  sx={{ height: 22, fontSize: "0.75rem", fontWeight: 500 }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                {loadingCuentaCorriente ? (
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
                    <CircularProgress sx={{ color: "#dc2626" }} />
                  </Box>
                ) : errorCuentaCorriente ? (
                  <Alert severity="error" sx={{ borderRadius: 1.5 }}>
                    {errorCuentaCorriente}
                  </Alert>
                ) : (
                  <Box>
                    <Box
                      sx={{
                        backgroundColor: "#fff",
                        borderRadius: 1.5,
                        p: 2.5,
                        border: "1px solid #e5e7eb",
                        mb: 2.5,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 2,
                              backgroundColor: cuentaCorriente.saldo > 0 ? "#fef2f2" : "#f0fdf4",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <AccountBalanceIcon
                              sx={{ fontSize: 24, color: cuentaCorriente.saldo > 0 ? "#dc2626" : "#16a34a" }}
                            />
                          </Box>
                          <Box>
                            <Typography variant="caption" color="textSecondary" sx={{ fontSize: "0.75rem", mb: 0.5 }}>
                              Saldo Actual
                            </Typography>
                            <Typography
                              variant="h5"
                              fontWeight={700}
                              color={cuentaCorriente.saldo > 0 ? "#dc2626" : "#16a34a"}
                            >
                              {formatCurrency(cuentaCorriente.saldo)}
                            </Typography>
                          </Box>
                        </Box>

                        {cuentaCorriente.saldo > 0 && (
                          <Button
                            variant="contained"
                            startIcon={<PaymentIcon sx={{ fontSize: 18 }} />}
                            onClick={() => setMostrarFormPago(!mostrarFormPago)}
                            size="small"
                            sx={{
                              backgroundColor: "#16a34a",
                              borderRadius: 1.5,
                              px: 2,
                              py: 1,
                              fontWeight: 500,
                              textTransform: "none",
                              fontSize: "0.875rem",
                              "&:hover": {
                                backgroundColor: "#15803d",
                              },
                            }}
                          >
                            Registrar Pago
                          </Button>
                        )}
                      </Box>

                      {cuentaCorriente.saldo > 0 && (
                        <Alert severity="warning" sx={{ fontSize: "0.875rem" }}>
                          Este cliente tiene saldo pendiente de pago
                        </Alert>
                      )}
                      {cuentaCorriente.saldo === 0 && (
                        <Alert severity="success" sx={{ fontSize: "0.875rem" }}>
                          La cuenta corriente está al día
                        </Alert>
                      )}
                    </Box>

                    {mostrarFormPago && (
                      <Box
                        sx={{
                          backgroundColor: "#fff",
                          borderRadius: 1.5,
                          p: 2.5,
                          border: "1px solid #e5e7eb",
                          mb: 2.5,
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151", mb: 2 }}>
                          Registrar Pago
                        </Typography>

                        {!sesionCaja && (
                          <Alert severity="error" sx={{ mb: 2, fontSize: "0.875rem" }}>
                            No hay una sesión de caja abierta. Abra la caja para registrar pagos.
                          </Alert>
                        )}

                        {errorPago && (
                          <Alert severity="error" sx={{ mb: 2, fontSize: "0.875rem" }}>
                            {errorPago}
                          </Alert>
                        )}

                        <form onSubmit={handleSubmitPago}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <NumericFormat
                                value={montoPago}
                                onValueChange={handleMontoPagoChange}
                                customInput={TextField}
                                thousandSeparator="."
                                decimalSeparator=","
                                decimalScale={2}
                                fixedDecimalScale={false}
                                allowNegative={false}
                                prefix="$"
                                label="Monto a Pagar"
                                fullWidth
                                size="small"
                                required
                                disabled={!sesionCaja || loadingPago}
                                helperText={`Saldo disponible: ${formatCurrency(cuentaCorriente.saldo)}`}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 1.5,
                                    backgroundColor: "#fafafa",
                                    "&.Mui-focused fieldset": {
                                      borderColor: "#dc2626",
                                    },
                                  },
                                  "& .MuiInputLabel-root.Mui-focused": {
                                    color: "#dc2626",
                                  },
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <FormControl fullWidth size="small">
                                <InputLabel>Método de Pago</InputLabel>
                                <Select
                                  value={metodoPago}
                                  onChange={(e) => setMetodoPago(e.target.value)}
                                  label="Método de Pago"
                                  disabled={!sesionCaja || loadingPago}
                                  sx={{
                                    borderRadius: 1.5,
                                    backgroundColor: "#fafafa",
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                      borderColor: "#dc2626",
                                    },
                                  }}
                                >
                                  <MenuItem value="EFECTIVO">Efectivo</MenuItem>
                                  <MenuItem value="TRANSFERENCIA">Transferencia</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Observaciones (opcional)"
                                multiline
                                rows={2}
                                value={observacionesPago}
                                onChange={(e) => setObservacionesPago(e.target.value)}
                                disabled={!sesionCaja || loadingPago}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 1.5,
                                    backgroundColor: "#fafafa",
                                    "&.Mui-focused fieldset": {
                                      borderColor: "#dc2626",
                                    },
                                  },
                                  "& .MuiInputLabel-root.Mui-focused": {
                                    color: "#dc2626",
                                  },
                                }}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => {
                                    setMostrarFormPago(false)
                                    setMontoPago("")
                                    setMetodoPago("EFECTIVO")
                                    setObservacionesPago("")
                                    setErrorPago(null)
                                  }}
                                  disabled={loadingPago}
                                  sx={{
                                    borderColor: "#d1d5db",
                                    color: "#6b7280",
                                    borderRadius: 1.5,
                                    px: 2,
                                    textTransform: "none",
                                    fontSize: "0.875rem",
                                    "&:hover": {
                                      borderColor: "#9ca3af",
                                      backgroundColor: "#f9fafb",
                                    },
                                  }}
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  type="submit"
                                  variant="contained"
                                  size="small"
                                  disabled={!sesionCaja || loadingPago}
                                  sx={{
                                    backgroundColor: "#16a34a",
                                    borderRadius: 1.5,
                                    px: 2,
                                    textTransform: "none",
                                    fontSize: "0.875rem",
                                    "&:hover": {
                                      backgroundColor: "#15803d",
                                    },
                                  }}
                                >
                                  {loadingPago ? "Registrando..." : "Confirmar Pago"}
                                </Button>
                              </Box>
                            </Grid>
                          </Grid>
                        </form>
                      </Box>
                    )}

                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151", mb: 2 }}>
                      Historial de Movimientos
                    </Typography>

                    {movimientos.length > 0 ? (
                      <Box>
                        <Box
                          sx={{
                            backgroundColor: "#fff",
                            borderRadius: 1.5,
                            border: "1px solid #e5e7eb",
                            overflow: "hidden",
                          }}
                        >
                          <TableContainer sx={{ maxHeight: "calc(100vh - 420px)" }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ bgcolor: "#dc2626", color: "white", fontWeight: 600, py: 1.5 }}>
                                    Fecha y Hora
                                  </TableCell>
                                  <TableCell sx={{ bgcolor: "#dc2626", color: "white", fontWeight: 600, py: 1.5 }}>
                                    Descripción
                                  </TableCell>
                                  <TableCell sx={{ bgcolor: "#dc2626", color: "white", fontWeight: 600, py: 1.5 }}>
                                    Usuario
                                  </TableCell>
                                  <TableCell sx={{ bgcolor: "#dc2626", color: "white", fontWeight: 600, py: 1.5 }}>
                                    Estado
                                  </TableCell>
                                  <TableCell
                                    align="right"
                                    sx={{ bgcolor: "#dc2626", color: "white", fontWeight: 600, py: 1.5 }}
                                  >
                                    Monto
                                  </TableCell>
                                  <TableCell
                                    align="center"
                                    sx={{ bgcolor: "#dc2626", color: "white", fontWeight: 600, py: 1.5 }}
                                  >
                                    Acciones
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {movimientos.map((movimiento) => (
                                  <TableRow key={movimiento.id} sx={{ "&:hover": { bgcolor: "#f9fafb" } }}>
                                    <TableCell sx={{ py: 1.5 }}>
                                      <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                                        {formatDateTime(movimiento.created_at || movimiento.fecha)}
                                      </Typography>
                                    </TableCell>
                                    <TableCell sx={{ py: 1.5 }}>
                                      <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                                        {movimiento.descripcion}
                                      </Typography>
                                    </TableCell>
                                    <TableCell sx={{ py: 1.5 }}>
                                      <Typography variant="body2" sx={{ fontSize: "0.875rem", color: "#64748b" }}>
                                        {movimiento.usuario_nombre || "-"}
                                      </Typography>
                                    </TableCell>
                                    <TableCell sx={{ py: 1.5 }}>
                                      {movimiento.estado === "CANCELADO" ? (
                                        <Chip
                                          label="Cancelado"
                                          size="small"
                                          color="error"
                                          onClick={() => handleVerDetallesCancelacion(movimiento)}
                                          sx={{
                                            fontWeight: 500,
                                            fontSize: "0.75rem",
                                            cursor: "pointer",
                                            "&:hover": { opacity: 0.8 },
                                          }}
                                        />
                                      ) : (
                                        <Chip
                                          label="Activo"
                                          size="small"
                                          color="success"
                                          sx={{ fontWeight: 500, fontSize: "0.75rem" }}
                                        />
                                      )}
                                    </TableCell>
                                    <TableCell align="right" sx={{ py: 1.5 }}>
                                      <Typography
                                        variant="body2"
                                        fontWeight={500}
                                        color={movimiento.tipo === "CARGO" ? "#dc2626" : "#16a34a"}
                                        sx={{ fontSize: "0.875rem" }}
                                      >
                                        {movimiento.tipo === "CARGO" ? "+" : "-"}
                                        {formatCurrency(Math.abs(movimiento.monto))}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="center" sx={{ py: 1.5 }}>
                                      {movimiento.tipo === "PAGO" &&
                                        movimiento.estado === "ACTIVO" &&
                                        sesionCaja &&
                                        movimiento.sesion_caja_id === sesionCaja.id && (
                                          <Tooltip title="Cancelar pago">
                                            <IconButton
                                              size="small"
                                              onClick={() => handleAbrirCancelacion(movimiento)}
                                              disabled={cancelandoPago === movimiento.id}
                                              sx={{
                                                color: "#dc2626",
                                                "&:hover": {
                                                  backgroundColor: "#fee2e2",
                                                },
                                              }}
                                            >
                                              {cancelandoPago === movimiento.id ? (
                                                <CircularProgress size={16} sx={{ color: "#dc2626" }} />
                                              ) : (
                                                <CancelIcon fontSize="small" />
                                              )}
                                            </IconButton>
                                          </Tooltip>
                                        )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>

                        {paginaMovimientos < totalPaginasMovimientos && (
                          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                            <Button
                              variant="outlined"
                              startIcon={<ExpandMoreIcon />}
                              onClick={handleVerMasMovimientos}
                              disabled={loadingMovimientos}
                              size="small"
                              sx={{
                                color: "#dc2626",
                                borderColor: "#dc2626",
                                borderRadius: 1.5,
                                px: 2,
                                textTransform: "none",
                                fontSize: "0.875rem",
                                "&:hover": {
                                  borderColor: "#b91c1c",
                                  backgroundColor: "#fef2f2",
                                },
                              }}
                            >
                              {loadingMovimientos ? "Cargando..." : "Ver más movimientos"}
                            </Button>
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          backgroundColor: "#fff",
                          borderRadius: 1.5,
                          p: 4,
                          border: "1px solid #e5e7eb",
                          textAlign: "center",
                        }}
                      >
                        <AccountBalanceIcon sx={{ fontSize: 40, color: "#dc2626", mb: 1.5 }} />
                        <Typography variant="subtitle1" sx={{ color: "#171717", fontWeight: 600, mb: 0.5 }}>
                          Sin Movimientos
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: "0.875rem" }}>
                          No hay movimientos registrados en la cuenta corriente
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={cancelacionModal.open}
        onClose={() => setCancelacionModal({ open: false, movimiento: null })}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Cancelar Pago
          </Typography>

          <Alert severity="warning" sx={{ mb: 2, borderRadius: 1.5 }}>
            ¿Está seguro que desea cancelar este pago? Esta acción revertirá el monto a la cuenta corriente del cliente.
          </Alert>

          {cancelacionModal.movimiento && (
            <Box sx={{ mb: 2, p: 2, backgroundColor: "#f9fafb", borderRadius: 1.5 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Monto:</strong> {formatCurrency(cancelacionModal.movimiento.monto)}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Fecha:</strong>{" "}
                {formatDateTime(cancelacionModal.movimiento.created_at || cancelacionModal.movimiento.fecha)}
              </Typography>
              <Typography variant="body2">
                <strong>Descripción:</strong> {cancelacionModal.movimiento.descripcion}
              </Typography>
            </Box>
          )}

          <TextField
            fullWidth
            label="Motivo de cancelación (opcional)"
            multiline
            rows={3}
            value={motivoCancelacion}
            onChange={(e) => setMotivoCancelacion(e.target.value)}
            placeholder="Ingrese el motivo por el cual se cancela este pago..."
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 1.5,
                "&.Mui-focused fieldset": {
                  borderColor: "#dc2626",
                },
              },
            }}
          />

          <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              onClick={() => {
                setCancelacionModal({ open: false, movimiento: null })
                setMotivoCancelacion("")
              }}
              sx={{
                borderColor: "#d1d5db",
                color: "#6b7280",
                borderRadius: 1.5,
                textTransform: "none",
                "&:hover": {
                  borderColor: "#9ca3af",
                  backgroundColor: "#f9fafb",
                },
              }}
            >
              No, mantener pago
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmarCancelacion}
              disabled={cancelandoPago !== null}
              sx={{
                backgroundColor: "#dc2626",
                borderRadius: 1.5,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#b91c1c",
                },
              }}
            >
              {cancelandoPago ? "Cancelando..." : "Sí, cancelar pago"}
            </Button>
          </Box>
        </Box>
      </Dialog>

      <Dialog
        open={detallesCancelacionModal.open}
        onClose={() => setDetallesCancelacionModal({ open: false, movimiento: null })}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Detalles de Cancelación
          </Typography>

          {detallesCancelacionModal.movimiento && (
            <Box>
              <Box sx={{ mb: 2, p: 2, backgroundColor: "#f9fafb", borderRadius: 1.5 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Cancelado por:</strong>{" "}
                  {detallesCancelacionModal.movimiento.cancelado_por_nombre || "No disponible"}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Fecha de cancelación:</strong>{" "}
                  {formatDateTime(detallesCancelacionModal.movimiento.fecha_cancelacion)}
                </Typography>
                <Typography variant="body2">
                  <strong>Motivo:</strong> {detallesCancelacionModal.movimiento.motivo_cancelacion || "No especificado"}
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => setDetallesCancelacionModal({ open: false, movimiento: null })}
                sx={{
                  color: "#dc2626",
                  borderColor: "#dc2626",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    borderColor: "#b91c1c",
                    backgroundColor: "#fef2f2",
                  },
                }}
              >
                Cerrar
              </Button>
            </Box>
          )}
        </Box>
      </Dialog>
    </>
  )
}

export default ClienteDetalleModal
