"use client"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useState, useEffect, useRef, useCallback } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  IconButton,
  Autocomplete,
  CircularProgress,
  MenuItem,
} from "@mui/material"
import {
  Close as CloseIcon,
  DirectionsCar,
  Person as PersonIcon,
  Build as BuildIcon,
  Business as BusinessIcon,
} from "@mui/icons-material"
import { NumericFormat } from "react-number-format"
import { clientesService } from "../../services/clientesService"
import { useSucursales } from "../../hooks/useSucursales"
import { useAuth } from "../../contexts/AuthContext"
import logger from "../../utils/logger"

const vehiculoSchema = yup.object({
  clienteId: yup.string().required("El cliente es obligatorio"),
  patente: yup
    .string()
    .required("La patente es obligatoria")
    .min(3, "La patente debe tener al menos 3 caracteres")
    .max(10, "La patente no puede exceder 10 caracteres"),
  marca: yup.string().required("La marca es obligatoria"),
  modelo: yup.string().required("El modelo es obligatorio"),
  año: yup
    .number()
    .required("El año es obligatorio")
    .min(1900, "Año mínimo: 1900")
    .max(new Date().getFullYear() + 1, "Año máximo: " + (new Date().getFullYear() + 1)),
  kilometraje: yup.number().required("El kilometraje es obligatorio").min(0, "El kilometraje no puede ser negativo"),
  observaciones: yup.string(),
  sucursal_id: yup.string().required("La sucursal es obligatoria"),
})

const VehiculoForm = ({ open, onClose, onSubmit, vehiculo = null, loading = false }) => {
  const { user } = useAuth()
  const { sucursales, loadSucursales } = useSucursales()
  const [clientes, setClientes] = useState([])
  const [loadingClientes, setLoadingClientes] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState(null)
  const [inputValueCliente, setInputValueCliente] = useState("")
  const debounceRef = useRef(null)
  const initialLoadDoneRef = useRef(false)
  const isEditing = Boolean(vehiculo)

  const parseClientesFromResponse = useCallback((result) => {
    if (!result) return []
    if (Array.isArray(result)) return result.filter((c) => c.activo)
    if (result.data && Array.isArray(result.data)) return result.data.filter((c) => c.activo)
    if (result.data?.data && Array.isArray(result.data.data)) return result.data.data.filter((c) => c.activo)
    return []
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    control,
  } = useForm({
    resolver: yupResolver(vehiculoSchema),
    defaultValues: {
      clienteId: vehiculo?.cliente_id || "",
      patente: vehiculo?.patente || "",
      marca: vehiculo?.marca || "",
      modelo: vehiculo?.modelo || "",
      año: vehiculo?.año || new Date().getFullYear(),
      kilometraje: vehiculo?.kilometraje || 0,
      observaciones: vehiculo?.observaciones || "",
      sucursal_id: vehiculo?.sucursal_id || "",
    },
  })

  const fetchClientes = useCallback(
    async (search = "") => {
      setLoadingClientes(true)
      try {
        const result = await clientesService.getClientes({ page: 1, limit: 100, search: search.trim() })
        const list = parseClientesFromResponse(result)
        setClientes(list)
      } catch (error) {
        logger.error("Error al cargar clientes", error)
        setClientes([])
      } finally {
        setLoadingClientes(false)
      }
    },
    [parseClientesFromResponse],
  )

  useEffect(() => {
    if (open) {
      initialLoadDoneRef.current = false
      if (!vehiculo) setInputValueCliente("")
      fetchClientes("")
      loadSucursales()
      if (vehiculo?.cliente_id) {
        clientesService
          .getClienteById(vehiculo.cliente_id)
          .then((cliente) => {
            if (cliente && cliente.activo !== false) {
              setSelectedCliente(cliente)
              setInputValueCliente(`${cliente.nombre || ""} ${cliente.apellido || ""}${cliente.dni ? ` - ${cliente.dni}` : ""}`.trim())
              setClientes((prev) => (prev.some((c) => c.id === cliente.id) ? prev : [cliente, ...prev]))
            }
          })
          .catch(() => {})
      }
    }
  }, [open, vehiculo?.cliente_id, fetchClientes])

  useEffect(() => {
    if (!open) return
    if (initialLoadDoneRef.current === false && inputValueCliente === "") {
      initialLoadDoneRef.current = true
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchClientes(inputValueCliente)
      debounceRef.current = null
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [inputValueCliente, open, fetchClientes])

  useEffect(() => {
    if (open && !vehiculo && user?.sucursales && user.sucursales.length === 1) {
      setValue("sucursal_id", user.sucursales[0].id)
    } else if (open && !vehiculo && user?.sucursal_principal_id) {
      setValue("sucursal_id", user.sucursal_principal_id)
    }
  }, [open, user, vehiculo, setValue])

  useEffect(() => {
    if (vehiculo) {
      reset({
        clienteId: vehiculo.cliente_id || "",
        patente: vehiculo.patente || "",
        marca: vehiculo.marca || "",
        modelo: vehiculo.modelo || "",
        año: vehiculo.año || new Date().getFullYear(),
        kilometraje: vehiculo.kilometraje || 0,
        observaciones: vehiculo.observaciones || "",
        sucursal_id: vehiculo.sucursal_id || "",
      })
      const cliente = clientes.find((c) => c.id === vehiculo.cliente_id)
      if (cliente) {
        setSelectedCliente(cliente)
      }
    } else {
      const defaultSucursalId =
        user?.sucursales?.length === 1 ? user.sucursales[0].id : user?.sucursal_principal_id || ""

      reset({
        clienteId: "",
        patente: "",
        marca: "",
        modelo: "",
        año: new Date().getFullYear(),
        kilometraje: 0,
        observaciones: "",
        sucursal_id: defaultSucursalId,
      })
      setSelectedCliente(null)
    }
  }, [vehiculo, reset, clientes, user])

  const handleFormSubmit = (data) => {
    logger.debug("Datos del formulario antes de enviar", data)

    const transformedData = {
      clienteId: data.clienteId,
      patente: data.patente.toUpperCase(),
      marca: data.marca,
      modelo: data.modelo,
      año: Number.parseInt(data.año),
      kilometraje: Number.parseInt(data.kilometraje),
      observaciones: data.observaciones || "",
      sucursal_id: data.sucursal_id,
    }

    logger.debug("Datos transformados para enviar", transformedData)
    onSubmit(transformedData)
  }

  const handleClose = () => {
    reset()
    setSelectedCliente(null)
    setInputValueCliente("")
    onClose()
  }

  const handleClienteChange = (event, newValue) => {
    setSelectedCliente(newValue)
    setValue("clienteId", newValue ? newValue.id : "")
    setInputValueCliente(newValue ? `${newValue.nombre || ""} ${newValue.apellido || ""}${newValue.dni ? ` - ${newValue.dni}` : ""}`.trim() : "")
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          height: "auto",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: "#fff",
          borderBottom: "1px solid #e5e7eb",
          p: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 8,
              height: 32,
              backgroundColor: "#dc2626",
              borderRadius: 1,
            }}
          />
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600, color: "#171717" }}>
            {isEditing ? "Editar Vehículo" : "Nuevo Vehículo"}
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
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
      </DialogTitle>

      <DialogContent sx={{ pt: 4, px: 3, pb: 3, backgroundColor: "#fafafa" }}>
        <Box component="form" mt={2} onSubmit={handleSubmit(handleFormSubmit)}>
          <Grid container spacing={3}>
            {/* Columna Izquierda */}
            <Grid item xs={12} md={6}>
              {/* Cliente */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <PersonIcon sx={{ fontSize: 18, color: "#dc2626" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                    Cliente
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "#fff",
                    borderRadius: 1.5,
                    p: 2.5,
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <Autocomplete
                    options={clientes}
                    getOptionLabel={(option) => (option ? `${option.nombre || ""} ${option.apellido || ""}${option.dni ? ` - ${option.dni}` : ""}` : "")}
                    value={selectedCliente}
                    onChange={handleClienteChange}
                    inputValue={inputValueCliente}
                    onInputChange={(_, value) => setInputValueCliente(value)}
                    loading={loadingClientes}
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Cliente *"
                        placeholder="Buscar cliente..."
                        error={!!errors.clienteId}
                        helperText={errors.clienteId?.message}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingClientes ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
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
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                            {option.nombre} {option.apellido}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            DNI: {option.dni} | Tel: {option.telefono}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    noOptionsText="No se encontraron clientes"
                  />
                </Box>
              </Box>

              {/* Sucursal */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <BusinessIcon sx={{ fontSize: 18, color: "#f59e0b" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                    Sucursal
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "#fff",
                    borderRadius: 1.5,
                    p: 2.5,
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <TextField
                    {...register("sucursal_id")}
                    select
                    label="Sucursal *"
                    fullWidth
                    size="small"
                    error={!!errors.sucursal_id}
                    helperText={errors.sucursal_id?.message}
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
                  >
                    {sucursales
                      .filter((s) => user?.sucursales?.some((us) => us.id === s.id))
                      .map((sucursal) => (
                        <MenuItem key={sucursal.id} value={sucursal.id}>
                          {sucursal.nombre}
                        </MenuItem>
                      ))}
                  </TextField>
                </Box>
              </Box>

              {/* Datos del Vehículo - Parte 1 */}
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <DirectionsCar sx={{ fontSize: 18, color: "#1976d2" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                    Identificación
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "#fff",
                    borderRadius: 1.5,
                    p: 2.5,
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        {...register("patente")}
                        label="Patente *"
                        placeholder="ABC123"
                        fullWidth
                        size="small"
                        error={!!errors.patente}
                        helperText={errors.patente?.message}
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
                      <TextField
                        {...register("marca")}
                        label="Marca *"
                        placeholder="Toyota"
                        fullWidth
                        size="small"
                        error={!!errors.marca}
                        helperText={errors.marca?.message}
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
                      <TextField
                        {...register("modelo")}
                        label="Modelo *"
                        placeholder="Corolla"
                        fullWidth
                        size="small"
                        error={!!errors.modelo}
                        helperText={errors.modelo?.message}
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
                  </Grid>
                </Box>
              </Box>
            </Grid>

            {/* Columna Derecha */}
            <Grid item xs={12} md={6}>
              {/* Datos Técnicos */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <BuildIcon sx={{ fontSize: 18, color: "#4caf50" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                    Datos Técnicos
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "#fff",
                    borderRadius: 1.5,
                    p: 2.5,
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        {...register("año")}
                        label="Año *"
                        type="number"
                        placeholder="2020"
                        fullWidth
                        size="small"
                        error={!!errors.año}
                        helperText={errors.año?.message}
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
                      <Controller
                        name="kilometraje"
                        control={control}
                        render={({ field: { onChange, value, ...field } }) => (
                          <NumericFormat
                            {...field}
                            value={value}
                            onValueChange={(values) => {
                              onChange(values.floatValue || 0)
                            }}
                            customInput={TextField}
                            thousandSeparator="."
                            decimalSeparator=","
                            suffix=" km"
                            allowNegative={false}
                            label="Kilometraje *"
                            placeholder="50.000 km"
                            fullWidth
                            size="small"
                            error={!!errors.kilometraje}
                            helperText={errors.kilometraje?.message}
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
                        )}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Box>

              {/* Observaciones */}
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                    Observaciones
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "#fff",
                    borderRadius: 1.5,
                    p: 2.5,
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <TextField
                    {...register("observaciones")}
                    label="Observaciones"
                    placeholder="Observaciones adicionales sobre el vehículo..."
                    multiline
                    rows={6}
                    fullWidth
                    size="small"
                    error={!!errors.observaciones}
                    helperText={errors.observaciones?.message}
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
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2.5,
          backgroundColor: "#fff",
          borderTop: "1px solid #e5e7eb",
          gap: 1.5,
        }}
      >
        <Button
          onClick={handleClose}
          variant="outlined"
          size="medium"
          sx={{
            borderColor: "#d1d5db",
            color: "#6b7280",
            borderRadius: 1.5,
            px: 3,
            py: 1,
            fontWeight: 500,
            textTransform: "none",
            fontSize: "0.875rem",
            "&:hover": {
              backgroundColor: "#f9fafb",
              borderColor: "#9ca3af",
            },
          }}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit(handleFormSubmit)}
          variant="contained"
          size="medium"
          disabled={loading}
          sx={{
            backgroundColor: "#dc2626",
            borderRadius: 1.5,
            px: 3,
            py: 1,
            fontWeight: 500,
            textTransform: "none",
            fontSize: "0.875rem",
            boxShadow: "0 1px 3px rgba(220, 38, 38, 0.3)",
            "&:hover": {
              backgroundColor: "#b91c1c",
              boxShadow: "0 2px 6px rgba(220, 38, 38, 0.4)",
            },
            "&:disabled": {
              opacity: 0.6,
              backgroundColor: "#dc2626",
            },
          }}
        >
          {loading ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default VehiculoForm
