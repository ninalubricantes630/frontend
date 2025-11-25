"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Snackbar,
  Alert,
  InputAdornment,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
} from "@mui/material"
import {
  User,
  Car,
  Wrench,
  FileText,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Search,
  Keyboard,
  X,
  Building2,
} from "lucide-react"
import AgregarServicioModal from "../../components/Servicios/AgregarServicioModal"
import PagoModalServicio from "../../components/Servicios/PagoModalServicio"
import ConfirmacionServicio from "../../components/Servicios/ConfirmacionServicio"
import DescuentoModalServicio from "../../components/Servicios/DescuentoModalServicio"
import InteresModalServicio from "../../components/Servicios/InteresModalServicio"
import { useClientes } from "../../hooks/useClientes"
import { useVehiculos } from "../../hooks/useVehiculos"
import { useTiposServicios } from "../../hooks/useTiposServicios"
import { useServicios } from "../../hooks/useServicios"
import useEmpleados from "../../hooks/useEmpleados"
import useSucursales from "../../hooks/useSucursales"
import { useAuth } from "../../contexts/AuthContext"

const steps = [
  { id: 0, title: "Cliente", icon: User },
  { id: 1, title: "Vehículo", icon: Car },
  { id: 2, title: "Sucursal y Empleados", icon: Building2 },
  { id: 3, title: "Servicios", icon: Wrench },
  { id: 4, title: "Confirmación", icon: FileText },
]

const ServiciosPage = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState({
    clienteId: null,
    vehiculoId: null,
    sucursalId: null,
    empleados: [],
    observaciones: "",
    precioReferencia: 0,
    items: [],
    metodoPago: "",
    descuento: null,
    interes: null,
    totalConInteres: 0,
    tarjetaId: null,
    cuotas: 1,
    interesTarjeta: 0,
    totalConInteresTarjeta: 0,
  })

  const { user } = useAuth()
  const { clientes, loadClientes } = useClientes()
  const { vehiculos, loadVehiculos, loadVehiculosByCliente } = useVehiculos()
  const { tiposServicios, loadTiposServicios } = useTiposServicios()
  const { createServicio, loading } = useServicios()
  const { empleadosActivos, loadEmpleadosActivos, loadEmpleadosBySucursal } = useEmpleados()
  const { sucursalesActivas, loadSucursalesActivas } = useSucursales()

  const [selectedCliente, setSelectedCliente] = useState(null)
  const [selectedVehiculo, setSelectedVehiculo] = useState(null)
  const [selectedSucursal, setSelectedSucursal] = useState(null)
  const [clienteSearch, setClienteSearch] = useState("")
  const [showItemDialog, setShowItemDialog] = useState(false)
  const [showPagoDialog, setShowPagoDialog] = useState(false)
  const [showDescuentoModal, setShowDescuentoModal] = useState(false)
  const [showInteresModal, setShowInteresModal] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })
  const [editingItemId, setEditingItemId] = useState(null)

  const [interes, setInteres] = useState(null)
  const [descuento, setDescuento] = useState(null)

  const [userSucursalesCount, setUserSucursalesCount] = useState(0)

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const calcularSubtotal = () => {
    let subtotal = 0
    if (Array.isArray(formData.items)) {
      for (const item of formData.items) {
        if (item.productos && Array.isArray(item.productos) && item.productos.length > 0) {
          for (const prod of item.productos) {
            const precioProducto =
              (Number.parseFloat(prod.precio_unitario) || 0) * (Number.parseFloat(prod.cantidad) || 0)
            subtotal += precioProducto
          }
        } else {
          const precioManual = Number.parseFloat(item.total) || 0
          subtotal += precioManual
        }
      }
    }
    return Math.max(0, subtotal)
  }

  const calcularTotal = () => {
    // Sum subtotals from all items
    let subtotal = 0
    if (Array.isArray(formData.items)) {
      for (const item of formData.items) {
        if (item.productos && Array.isArray(item.productos) && item.productos.length > 0) {
          for (const prod of item.productos) {
            subtotal += (Number.parseFloat(prod.precio_unitario) || 0) * (Number.parseFloat(prod.cantidad) || 0)
          }
        } else {
          const precioManual = Number.parseFloat(item.total) || 0
          subtotal += precioManual
        }
      }
    }

    let total = subtotal

    // Apply discount
    if (descuento && descuento.montoDescuento > 0) {
      total -= descuento.montoDescuento
    }

    // Apply interest
    if (interes && interes.montoInteres > 0) {
      total += interes.montoInteres
    }

    return Math.max(0, total)
  }

  useEffect(() => {
    if (user && user.sucursales) {
      setUserSucursalesCount(user.sucursales.length)
      // Find the main sucursal or use the first one
      const mainSucursal = user.sucursales.find((s) => s.es_principal) || user.sucursales[0]
      if (mainSucursal) {
        setFormData((prev) => ({
          ...prev,
          sucursalId: mainSucursal.id,
        }))
        setSelectedSucursal(mainSucursal)
      }
    }
  }, [user])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && !e.ctrlKey && !e.metaKey) {
        if (activeStep < 4 && canProceed()) {
          e.preventDefault()
          handleNext()
        }
        return
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "ArrowRight":
            e.preventDefault()
            if (activeStep < 4 && canProceed()) handleNext()
            break
          case "ArrowLeft":
            e.preventDefault()
            if (activeStep > 0) handleBack()
            break
          case "Enter":
            e.preventDefault()
            if (activeStep === 4 && canProceed()) handleSubmit()
            break
          case "/":
            e.preventDefault()
            setShowShortcuts(true)
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeStep, formData])

  useEffect(() => {
    loadClientes()
    loadTiposServicios()
    loadSucursalesActivas()
  }, [])

  useEffect(() => {
    if (formData.clienteId) {
      loadVehiculosByCliente(formData.clienteId)
    }
  }, [formData.clienteId])

  useEffect(() => {
    if (formData.sucursalId) {
      loadEmpleadosBySucursal(formData.sucursalId)
      setFormData((prev) => ({
        ...prev,
        empleados: [],
      }))
    }
  }, [formData.sucursalId, loadEmpleadosBySucursal])

  const handleNext = () => {
    if (activeStep < 4) {
      setActiveStep((prev) => Math.min(prev + 1, 4))
    } else if (activeStep === 4) {
      // When clicking next on confirmation step, open payment modal
      setShowPagoDialog(true)
    }
  }

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => Math.max(prev - 1, 0))
    }
  }

  const handleReset = () => {
    setActiveStep(0)
    setFormData({
      clienteId: null,
      vehiculoId: null,
      sucursalId:
        user && user.sucursales ? (user.sucursales.find((s) => s.es_principal) || user.sucursales[0])?.id : null,
      empleados: [],
      observaciones: "",
      items: [],
      metodoPago: "",
      descuento: null,
      interes: null,
      totalConInteres: 0,
      tarjetaId: null,
      cuotas: 1,
      interesTarjeta: 0,
      totalConInteresTarjeta: 0,
    })
    setSelectedCliente(null)
    setSelectedVehiculo(null)
    setClienteSearch("")
    setEditingItemId(null)
    // Reset interest and discount states as well
    setInteres(null)
    setDescuento(null)
  }

  const handleClienteSelect = (cliente) => {
    setSelectedCliente(cliente)
    setFormData((prev) => ({
      ...prev,
      clienteId: cliente?.id || null,
      vehiculoId: null,
    }))
    setSelectedVehiculo(null)
  }

  const handleVehiculoSelect = (vehiculo) => {
    setSelectedVehiculo(vehiculo)
    setFormData((prev) => ({
      ...prev,
      vehiculoId: vehiculo?.id || null,
    }))
  }

  const handleSucursalSelect = (sucursalId) => {
    const sucursal = sucursalesActivas.find((s) => s.id === sucursalId)
    setSelectedSucursal(sucursal)
    setFormData((prev) => ({
      ...prev,
      sucursalId: sucursalId,
      empleados: [],
    }))
  }

  const handleEmpleadosChange = (empleadosIds) => {
    setFormData((prev) => ({
      ...prev,
      empleados: empleadosIds,
    }))
  }

  const handleAddItem = (newItem) => {
    const itemConTotal = {
      ...newItem,
      total: newItem.total !== undefined && newItem.total !== null ? Number(newItem.total) : 0,
    }

    if (editingItemId) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.map((item) => (item.id === editingItemId ? itemConTotal : item)),
      }))
      showSnackbar("El servicio se actualizó correctamente.")
      setEditingItemId(null)
    } else {
      setFormData((prev) => ({
        ...prev,
        items: [...prev.items, itemConTotal],
      }))
      showSnackbar("El servicio se agregó correctamente a la lista.")
    }
  }

  const handleRemoveItem = (itemId) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }))
  }

  const handleEditItem = (item) => {
    setEditingItemId(item.id)
    setShowItemDialog(true)
  }

  const handlePagoConfirm = (pagoData) => {
    setFormData((prev) => ({
      ...prev,
      ...pagoData,
    }))
    setShowPagoDialog(false)
    handleSubmit(pagoData)
  }

  const handleConfirmarInteres = (interesData) => {
    if (interesData.montoInteres > 0 && descuento && descuento.montoDescuento > 0) {
      showSnackbar(
        "No se puede aplicar interés del sistema y descuento simultáneamente. Deselecciona el descuento primero.",
        "error",
      )
      return
    }

    if (interesData.montoInteres === 0) {
      setInteres(null)
    } else {
      setInteres(interesData)
    }
    setShowInteresModal(false)
    showSnackbar("Interés actualizado", "success")
  }

  const handleConfirmarDescuento = (descuentoData) => {
    if (descuentoData.montoDescuento > 0 && interes && interes.montoInteres > 0) {
      showSnackbar(
        "No se puede aplicar descuento e interés del sistema simultáneamente. Deselecciona el interés primero.",
        "error",
      )
      return
    }

    if (descuentoData.montoDescuento === 0) {
      setDescuento(null)
    } else {
      setDescuento(descuentoData)
    }
    setShowDescuentoModal(false)
    showSnackbar("Descuento actualizado", "success")
  }

  const handleSubmit = async (pagoData) => {
    try {
      const calculatedSubtotal = calcularSubtotal()

      const submitData = {
        cliente_id: formData.clienteId,
        vehiculo_id: formData.vehiculoId,
        sucursal_id: formData.sucursalId,
        empleados: formData.empleados,
        observaciones: formData.observaciones,
        tipo_pago: pagoData?.tipo_pago?.toUpperCase() || formData.metodoPago?.toUpperCase() || "EFECTIVO",
        subtotal: calculatedSubtotal,
        descuento: pagoData?.descuento || 0,
        tipo_interes_sistema: pagoData?.tipo_interes_sistema || null,
        valor_interes_sistema: pagoData?.valor_interes_sistema || 0,
        interes_sistema: pagoData?.interes_sistema || 0,
        tarjeta_id: pagoData?.tarjeta_id || null,
        numero_cuotas: pagoData?.numero_cuotas || null,
        tasa_interes_tarjeta: pagoData?.tasa_interes_tarjeta || null,
        total_con_interes: pagoData?.total_con_interes || calculatedSubtotal,
        total_con_interes_tarjeta: pagoData?.total_con_interes_tarjeta || null,
        items: Array.isArray(formData.items)
          ? formData.items.map((item) => {
              let itemTotal = 0
              if (item.productos && Array.isArray(item.productos) && item.productos.length > 0) {
                // Si tiene productos, sumar precios de productos
                itemTotal = item.productos.reduce(
                  (sum, prod) => sum + (Number(prod.precio_unitario) * Number(prod.cantidad) || 0),
                  0,
                )
              } else {
                // Si NO tiene productos, usar item.total (precio manual)
                itemTotal = Number(item.total) || 0
              }

              return {
                tipo_servicio_id: item.tipoServicioId,
                descripcion: item.descripcion || "Sin descripción",
                observaciones: item.observaciones || null,
                notas: item.notas || null,
                total: itemTotal,
                productos: Array.isArray(item.productos) ? item.productos : [],
              }
            })
          : [],
      }

  

      await createServicio(submitData)
      showSnackbar("¡Servicio creado exitosamente!")
      setShowPagoDialog(false)
      handleReset()
      setActiveStep(5)
    } catch (error) {
      console.error("[v0] Error al crear servicio:", error)
      showSnackbar(error.message || "Error al crear el servicio", "error")
    }
  }

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return formData.clienteId !== null
      case 1:
        return formData.vehiculoId !== null
      case 2:
        return formData.sucursalId !== null
      case 3:
        return formData.items.length > 0
      case 4:
        return true
      default:
        return false
    }
  }

  const filteredClientes = clientes.filter((cliente) =>
    `${cliente.nombre} ${cliente.apellido} ${cliente.dni}`.toLowerCase().includes(clienteSearch.toLowerCase()),
  )

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Card
            elevation={0}
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              border: "1px solid #e5e7eb",
              borderRadius: 2.5,
            }}
          >
            <CardContent sx={{ p: 3.5, pb: 2.5, borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 1.5 }}>
                <Box sx={{ p: 1.2, borderRadius: 1.5, bgcolor: "#dc2626", color: "white" }}>
                  <User size={18} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ color: "#171717", fontWeight: 700, letterSpacing: "-0.3px" }}>
                    Seleccionar Cliente
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#6b7280", fontSize: "0.8rem" }}>
                    Busca el cliente que recibirá el servicio
                  </Typography>
                </Box>
              </Box>
            </CardContent>
            <CardContent sx={{ p: 3.5, flex: 1, overflow: "auto" }}>
              <TextField
                fullWidth
                size="medium"
                placeholder="Buscar por nombre, apellido o DNI..."
                value={clienteSearch}
                onChange={(e) => setClienteSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={18} color="#6b7280" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                    fontSize: "0.95rem",
                    "&:hover fieldset": { borderColor: "#dc2626" },
                    "&.Mui-focused fieldset": { borderColor: "#dc2626" },
                  },
                }}
              />

              {clienteSearch.trim() && (
                <Grid container spacing={2}>
                  {filteredClientes.length > 0 ? (
                    filteredClientes.map((cliente) => (
                      <Grid item xs={12} sm={6} md={4} key={cliente.id}>
                        <Card
                          elevation={selectedCliente?.id === cliente.id ? 1 : 0}
                          sx={{
                            cursor: "pointer",
                            border: selectedCliente?.id === cliente.id ? "2px solid #dc2626" : "1px solid #e5e7eb",
                            bgcolor: selectedCliente?.id === cliente.id ? "#fef2f2" : "white",
                            p: 2.5,
                            borderRadius: 1.5,
                            transition: "all 0.2s ease",
                            height: "100%",
                            "&:hover": {
                              borderColor: "#dc2626",
                              bgcolor: "#fafafa",
                              transform: "translateY(-2px)",
                            },
                          }}
                          onClick={() => handleClienteSelect(cliente)}
                        >
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" sx={{ color: "#171717", fontWeight: 700, mb: 0.5 }}>
                                {cliente.nombre} {cliente.apellido}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "#6b7280", display: "block", mb: 0.25 }}>
                                DNI: {cliente.dni || "No especificado"}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "#6b7280" }}>
                                Tel: {cliente.telefono || "No especificado"}
                              </Typography>
                            </Box>
                            {selectedCliente?.id === cliente.id && (
                              <CheckCircle size={20} color="#dc2626" strokeWidth={2.5} />
                            )}
                          </Box>
                        </Card>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Box sx={{ textAlign: "center", py: 4 }}>
                        <Search size={32} color="#d1d5db" sx={{ mb: 1 }} />
                        <Typography variant="body2" sx={{ color: "#6b7280" }}>
                          No se encontraron clientes
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              )}

              {!clienteSearch.trim() && selectedCliente && (
                <Card elevation={0} sx={{ border: "2px solid #dc2626", bgcolor: "#fef2f2", p: 2.5, borderRadius: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ p: 1, bgcolor: "#dc2626", color: "white", borderRadius: 1 }}>
                      <CheckCircle size={18} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ color: "#171717", fontWeight: 700 }}>
                        {selectedCliente.nombre} {selectedCliente.apellido}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#6b7280" }}>
                        DNI: {selectedCliente.dni}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              )}

              {!clienteSearch.trim() && !selectedCliente && (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 6,
                    border: "2px dashed #e5e7eb",
                    borderRadius: 2,
                    bgcolor: "#f9fafb",
                  }}
                >
                  <User size={40} color="#d1d5db" sx={{ mb: 1.5 }} />
                  <Typography variant="body2" sx={{ color: "#6b7280", fontWeight: 500 }}>
                    Comienza a buscar un cliente
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        )

      case 1:
        return (
          <Card
            elevation={0}
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              border: "1px solid #e5e7eb",
              borderRadius: 2.5,
            }}
          >
            <CardContent sx={{ p: 3.5, pb: 2.5, borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 1.5 }}>
                <Box sx={{ p: 1.2, borderRadius: 1.5, bgcolor: "#dc2626", color: "white" }}>
                  <Car size={18} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ color: "#171717", fontWeight: 700, letterSpacing: "-0.3px" }}>
                    Seleccionar Vehículo
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#6b7280", fontSize: "0.8rem" }}>
                    Elige el vehículo que recibirá el servicio
                  </Typography>
                </Box>
              </Box>
            </CardContent>
            <CardContent sx={{ p: 3.5, flex: 1, overflow: "auto" }}>
              {vehiculos.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <Car size={40} color="#d1d5db" sx={{ mb: 1.5 }} />
                  <Typography variant="body2" sx={{ color: "#6b7280" }}>
                    El cliente no tiene vehículos registrados
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {vehiculos.map((vehiculo) => (
                    <Grid item xs={12} sm={6} md={4} key={vehiculo.id}>
                      <Card
                        elevation={selectedVehiculo?.id === vehiculo.id ? 1 : 0}
                        sx={{
                          cursor: "pointer",
                          border: selectedVehiculo?.id === vehiculo.id ? "2px solid #dc2626" : "1px solid #e5e7eb",
                          bgcolor: selectedVehiculo?.id === vehiculo.id ? "#fef2f2" : "white",
                          p: 2.5,
                          borderRadius: 1.5,
                          transition: "all 0.2s ease",
                          height: "100%",
                          "&:hover": {
                            borderColor: "#dc2626",
                            bgcolor: "#fafafa",
                            transform: "translateY(-2px)",
                          },
                        }}
                        onClick={() => handleVehiculoSelect(vehiculo)}
                      >
                        <Box
                          sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}
                        >
                          <Box>
                            <Typography
                              sx={{ color: "#dc2626", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "0.5px" }}
                            >
                              {vehiculo.patente}
                            </Typography>
                            <Typography variant="subtitle2" sx={{ color: "#171717", fontWeight: 700, mt: 0.5 }}>
                              {vehiculo.marca} {vehiculo.modelo}
                            </Typography>
                          </Box>
                          {selectedVehiculo?.id === vehiculo.id && (
                            <CheckCircle size={20} color="#dc2626" strokeWidth={2.5} />
                          )}
                        </Box>
                        <Divider sx={{ my: 1, opacity: 0.5 }} />
                        <Typography variant="caption" sx={{ color: "#6b7280", display: "block", fontSize: "0.8rem" }}>
                          Año: {vehiculo.año} | Km: {vehiculo.kilometraje?.toLocaleString("es-AR")}
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <Card
            elevation={0}
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              border: "1px solid #e5e7eb",
              borderRadius: 2.5,
            }}
          >
            <CardContent sx={{ p: 3.5, pb: 2.5, borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 1.5 }}>
                <Box sx={{ p: 1.2, borderRadius: 1.5, bgcolor: "#dc2626", color: "white" }}>
                  <Building2 size={18} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ color: "#171717", fontWeight: 700, letterSpacing: "-0.3px" }}>
                    Sucursal y Empleados
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#6b7280", fontSize: "0.8rem" }}>
                    Selecciona dónde y quién realizará el servicio
                  </Typography>
                </Box>
              </Box>
            </CardContent>
            <CardContent sx={{ p: 3.5, flex: 1, overflow: "auto" }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth disabled={userSucursalesCount === 1}>
                    <InputLabel sx={{ color: "#6b7280" }}>Sucursal</InputLabel>
                    <Select
                      value={formData.sucursalId || ""}
                      label="Sucursal"
                      onChange={(e) => handleSucursalSelect(e.target.value)}
                      sx={{
                        borderRadius: 1.5,
                        "& .MuiOutlinedInput-root": {
                          "&:hover fieldset": { borderColor: "#dc2626" },
                          "&.Mui-focused fieldset": { borderColor: "#dc2626" },
                        },
                      }}
                    >
                      {sucursalesActivas
                        .filter((sucursal) => user?.sucursales?.some((us) => us.id === sucursal.id))
                        .map((sucursal) => (
                          <MenuItem key={sucursal.id} value={sucursal.id}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {sucursal.nombre}
                            </Typography>
                          </MenuItem>
                        ))}
                    </Select>
                    {userSucursalesCount === 1 && (
                      <Typography variant="caption" sx={{ color: "#6b7280", mt: 0.5, display: "block" }}>
                        Tu sucursal asignada está pre-seleccionada
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: "#6b7280" }}>Empleados</InputLabel>
                    <Select
                      multiple
                      value={formData.empleados}
                      label="Empleados"
                      onChange={(e) => handleEmpleadosChange(e.target.value)}
                      disabled={!formData.sucursalId}
                      renderValue={(selected) => (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                          {selected.map((empleadoId) => {
                            const empleado = empleadosActivos.find((e) => e.id === empleadoId)
                            return (
                              <Chip
                                key={empleadoId}
                                label={`${empleado?.nombre} ${empleado?.apellido}`}
                                size="small"
                                sx={{ bgcolor: "#dc2626", color: "white", fontWeight: 600 }}
                              />
                            )
                          })}
                        </Box>
                      )}
                      sx={{
                        borderRadius: 1.5,
                        "& .MuiOutlinedInput-root": {
                          "&:hover fieldset": { borderColor: "#dc2626" },
                          "&.Mui-focused fieldset": { borderColor: "#dc2626" },
                        },
                      }}
                    >
                      {empleadosActivos.map((empleado) => (
                        <MenuItem key={empleado.id} value={empleado.id}>
                          <Checkbox
                            checked={formData.empleados.includes(empleado.id)}
                            sx={{
                              color: "#dc2626",
                              "&.Mui-checked": { color: "#dc2626" },
                            }}
                          />
                          <ListItemText primary={`${empleado.nombre} ${empleado.apellido}`} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {selectedSucursal && (
                <Card
                  elevation={0}
                  sx={{ border: "2px solid #dc2626", bgcolor: "#fef2f2", mt: 3, p: 2.5, borderRadius: 1.5 }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.5 }}>
                    <Box sx={{ p: 1, bgcolor: "#dc2626", color: "white", borderRadius: 1 }}>
                      <Building2 size={18} />
                    </Box>
                    <Typography variant="subtitle2" sx={{ color: "#171717", fontWeight: 700 }}>
                      {selectedSucursal.nombre}
                    </Typography>
                  </Box>
                  {selectedSucursal.direccion && (
                    <Typography variant="caption" sx={{ color: "#6b7280", display: "block" }}>
                      {selectedSucursal.direccion}
                    </Typography>
                  )}
                </Card>
              )}
            </CardContent>
          </Card>
        )

      case 3:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Card
              elevation={0}
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                border: "1px solid #e5e7eb",
                borderRadius: 2.5,
                mb: 2.5,
              }}
            >
              <CardContent sx={{ p: 3.5, pb: 2.5, borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
                  <Box sx={{ p: 1.2, borderRadius: 1.5, bgcolor: "#dc2626", color: "white" }}>
                    <Wrench size={18} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ color: "#171717", fontWeight: 700, letterSpacing: "-0.3px" }}>
                      Elegir Servicios
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#6b7280", fontSize: "0.8rem" }}>
                      Agrega los servicios que realizarás en el vehículo
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<Plus size={16} />}
                    onClick={() => {
                      setEditingItemId(null)
                      setShowItemDialog(true)
                    }}
                    sx={{
                      bgcolor: "#dc2626",
                      "&:hover": { bgcolor: "#b91c1c" },
                      borderRadius: 1.5,
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      px: 2.5,
                      py: 1.2,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    Agregar
                  </Button>
                </Box>
              </CardContent>
              <CardContent sx={{ p: 3.5, flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
                {formData.items.length > 0 ? (
                  <Grid container spacing={2.5}>
                    {formData.items.map((item) => (
                      <Grid item xs={12} sm={6} md={4} key={item.id}>
                        <Card
                          elevation={0}
                          onClick={() => handleEditItem(item)}
                          sx={{
                            border: "1px solid #e5e7eb",
                            borderRadius: 1.5,
                            p: 2.5,
                            cursor: "pointer",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              borderColor: "#dc2626",
                              boxShadow: "0 4px 12px rgba(220, 38, 38, 0.15)",
                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          <Box sx={{ flex: 1, mb: 2 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{ color: "#171717", fontWeight: 700, mb: 1.5, fontSize: "1rem" }}
                            >
                              {item.tipoServicioNombre}
                            </Typography>
                            {item.productos && item.productos.length > 0 && (
                              <Box sx={{ mb: 1.5 }}>
                                <Typography
                                  variant="caption"
                                  sx={{ fontWeight: 700, color: "#6b7280", mb: 0.75, display: "block" }}
                                >
                                  Productos: {item.productos.length}
                                </Typography>
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                  {item.productos.slice(0, 2).map((prod, idx) => (
                                    <Chip
                                      key={idx}
                                      label={`${prod.nombre.split(" ")[0]} ×${prod.cantidad}`}
                                      size="small"
                                      variant="outlined"
                                      sx={{ borderColor: "#fecaca", bgcolor: "#fef2f2", fontSize: "0.7rem" }}
                                    />
                                  ))}
                                  {item.productos.length > 2 && (
                                    <Chip
                                      label={`+${item.productos.length - 2}`}
                                      size="small"
                                      variant="outlined"
                                      sx={{ borderColor: "#fecaca", bgcolor: "#fef2f2", fontSize: "0.7rem" }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            )}
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              pt: 1.5,
                              borderTop: "1px solid #f3f4f6",
                            }}
                          >
                            <Typography variant="h6" sx={{ color: "#dc2626", fontWeight: 800, fontSize: "1.1rem" }}>
                              $
                              {(item.total || 0).toLocaleString("es-AR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveItem(item.id)
                              }}
                              sx={{ color: "#ef4444", "&:hover": { bgcolor: "#fee2e2" } }}
                            >
                              <Trash2 size={16} />
                            </IconButton>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: "center", py: 8 }}>
                    <Wrench size={40} color="#d1d5db" sx={{ mb: 1.5 }} />
                    <Typography variant="body2" sx={{ color: "#6b7280" }}>
                      No hay servicios agregados
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                      Haz clic en "Agregar" para comenzar
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {formData.items.length > 0 && (
              <Card
                elevation={0}
                sx={{
                  bgcolor: "#fef2f2",
                  border: "2px solid #dc2626",
                  borderRadius: 2,
                  p: 3,
                  flexShrink: 0,
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="subtitle1" sx={{ color: "#171717", fontWeight: 700 }}>
                    Total del Servicio
                  </Typography>
                  <Typography variant="h5" sx={{ color: "#dc2626", fontWeight: 800, fontSize: "1.75rem" }}>
                    ${calcularTotal().toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Card>
            )}
          </Box>
        )

      case 4:
        return (
          <ConfirmacionServicio
            formData={formData}
            selectedCliente={selectedCliente}
            selectedVehiculo={selectedVehiculo}
            selectedSucursal={selectedSucursal}
            calcularTotal={calcularTotal}
            empleadosActivos={empleadosActivos}
            descuento={
              descuento && descuento.montoDescuento > 0
                ? {
                    montoDescuento: descuento.montoDescuento,
                    tipoDescuento: "monto",
                    valorDescuento: descuento.valorDescuento,
                  }
                : null
            }
            interes={
              interes && interes.montoInteres > 0
                ? {
                    montoInteres: interes.montoInteres,
                    tipoInteres: "monto",
                    valorInteres: interes.valorInteres,
                  }
                : null
            }
            onEditDescuento={() => setShowDescuentoModal(true)}
            onEditInteres={() => setShowInteresModal(true)}
          />
        )

      case 5:
        return (
          <Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 2.5, textAlign: "center", p: 5 }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2.5 }}>
              <Box sx={{ p: 2, borderRadius: "50%", bgcolor: "#dcfce7" }}>
                <CheckCircle size={56} color="#16a34a" strokeWidth={2} />
              </Box>
              <Typography variant="h4" sx={{ color: "#171717", fontWeight: 900, letterSpacing: "-0.5px" }}>
                Servicio Creado
              </Typography>
              <Typography variant="body1" sx={{ color: "#6b7280", maxWidth: 400 }}>
                El servicio ha sido registrado correctamente en el sistema
              </Typography>
              <Button
                variant="contained"
                onClick={handleReset}
                sx={{
                  bgcolor: "#dc2626",
                  "&:hover": { bgcolor: "#b91c1c" },
                  borderRadius: 1.5,
                  textTransform: "none",
                  fontWeight: 700,
                  mt: 2,
                  px: 4,
                  py: 1.5,
                }}
              >
                Crear Otro Servicio
              </Button>
            </Box>
          </Card>
        )

      default:
        return null
    }
  }

  const handleEditDescuento = (remove = false) => {
    if (remove) {
      setDescuento(null)
    } else {
      setShowDescuentoModal(true)
    }
  }

  const handleEditInteres = (remove = false) => {
    if (remove) {
      setInteres(null)
    } else {
      setShowInteresModal(true)
    }
  }

  const handleDescuentoConfirm = (descuentoData) => {
    if (descuentoData.montoDescuento === 0) {
      setDescuento(null)
    } else {
      setDescuento(descuentoData)
    }
    setShowDescuentoModal(false)
  }

  const handleInteresConfirm = (interesData) => {
    if (interesData.montoInteres === 0) {
      setInteres(null)
    } else {
      setInteres(interesData)
    }
    setShowInteresModal(false)
  }

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", p: 2.5, bgcolor: "#f8f9fa" }}>
      {activeStep < 5 && (
        <Card elevation={0} sx={{ mb: 2.5, border: "1px solid #e5e7eb", bgcolor: "white", borderRadius: 2.5 }}>
          <CardContent sx={{ py: 2.5, px: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton
                onClick={handleBack}
                disabled={activeStep === 0}
                size="small"
                sx={{
                  color: activeStep === 0 ? "#d1d5db" : "#6b7280",
                  "&:hover": { bgcolor: "#f3f4f6" },
                  "&:disabled": { opacity: 0.4 },
                  transition: "all 0.2s ease",
                }}
              >
                <ArrowLeft size={18} />
              </IconButton>

              <Box sx={{ flex: 1 }}>
                <Stepper activeStep={activeStep} alternativeLabel sx={{ m: 0, p: 0 }}>
                  {steps.map((step, index) => {
                    const Icon = step.icon
                    return (
                      <Step key={step.id}>
                        <StepLabel
                          StepIconComponent={() => (
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "2px solid",
                                borderColor: index <= activeStep ? "#dc2626" : "#e5e7eb",
                                bgcolor: index < activeStep ? "#dc2626" : index === activeStep ? "#fef2f2" : "white",
                                color: index < activeStep ? "white" : index === activeStep ? "#dc2626" : "#9ca3af",
                                transition: "all 0.3s ease",
                              }}
                            >
                              {index < activeStep ? <CheckCircle size={20} /> : <Icon size={20} />}
                            </Box>
                          )}
                          sx={{
                            "& .MuiStepLabel-label": {
                              color: index <= activeStep ? "#0f172a" : "#9ca3af",
                              fontWeight: index === activeStep ? 700 : 500,
                              fontSize: "0.9rem",
                              mt: 0.75,
                            },
                          }}
                        >
                          {step.title}
                        </StepLabel>
                      </Step>
                    )
                  })}
                </Stepper>
              </Box>

              <IconButton
                onClick={handleNext}
                disabled={!canProceed()}
                size="small"
                sx={{
                  color: !canProceed() ? "#d1d5db" : "#dc2626",
                  "&:hover": { bgcolor: "#fef2f2" },
                  "&:disabled": { opacity: 0.4 },
                  transition: "all 0.2s ease",
                }}
              >
                <ArrowRight size={18} />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      )}

      <Box sx={{ flex: 1, mb: 2.5, maxHeight: "calc(100vh - 280px)", overflow: "auto", borderRadius: 2 }}>
        {renderStepContent()}
      </Box>

      <AgregarServicioModal
        isOpen={showItemDialog}
        onClose={() => {
          setShowItemDialog(false)
          setEditingItemId(null)
        }}
        onAddItem={handleAddItem}
        tiposServicios={tiposServicios}
        sucursalId={formData.sucursalId}
        editingItem={editingItemId ? formData.items.find((item) => item.id === editingItemId) : null}
      />

      <PagoModalServicio
        isOpen={showPagoDialog}
        onClose={() => setShowPagoDialog(false)}
        onConfirm={handlePagoConfirm}
        total={calcularTotal()}
        subtotal={calcularSubtotal()}
        clienteId={formData.clienteId}
        servicioData={{
          subtotal: calcularSubtotal(),
        }}
        descuento={descuento}
        interes={interes}
      />

      <DescuentoModalServicio
        open={showDescuentoModal}
        onClose={() => setShowDescuentoModal(false)}
        subtotal={formData.items.reduce((sum, item) => sum + (item.total || 0), 0)}
        onConfirm={handleConfirmarDescuento}
        hayInteres={interes && interes.montoInteres > 0}
      />

      <InteresModalServicio
        open={showInteresModal}
        onClose={() => setShowInteresModal(false)}
        subtotal={formData.items.reduce((sum, item) => sum + (item.total || 0), 0)}
        onConfirm={handleConfirmarInteres}
        hayDescuento={descuento && descuento.montoDescuento > 0}
      />

      <Dialog open={showShortcuts} onClose={() => setShowShortcuts(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
          <Keyboard size={20} />
          Atajos de Teclado
          <IconButton onClick={() => setShowShortcuts(false)} sx={{ position: "absolute", right: 8, top: 8 }}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2">Avanzar paso (si es válido)</Typography>
              <Chip label="Enter" variant="outlined" size="small" />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2">Siguiente paso</Typography>
              <Chip label="Ctrl + →" variant="outlined" size="small" />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2">Paso anterior</Typography>
              <Chip label="Ctrl + ←" variant="outlined" size="small" />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2">Registrar Servicio</Typography>
              <Chip label="Ctrl + Enter" variant="outlined" size="small" />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2">Ver atajos</Typography>
              <Chip label="Ctrl + /" variant="outlined" size="small" />
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ServiciosPage
