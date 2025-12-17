"use client"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useEffect, useState } from "react"
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
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material"
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  AccountBalance as AccountBalanceIcon,
  Store as StoreIcon,
} from "@mui/icons-material"
import { useSucursales } from "../../hooks/useSucursales"

const clienteSchema = yup.object({
  nombre: yup
    .string()
    .required("El nombre es obligatorio")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres"),
  apellido: yup
    .string()
    .required("El apellido es obligatorio")
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "El apellido no puede exceder 50 caracteres"),
  telefono: yup.string().nullable(),
  tiene_cuenta_corriente: yup.boolean(),
  limite_credito: yup
    .number()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .min(0, "El límite de crédito no puede ser negativo"),
  sucursal_id: yup.string().nullable(),
})

const ClienteForm = ({ open, onClose, onSubmit, cliente = null, loading = false }) => {
  const isEditing = Boolean(cliente)
  const [tieneCuentaCorriente, setTieneCuentaCorriente] = useState(false)

  const { sucursales, loadSucursales } = useSucursales()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(clienteSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      dni: "",
      telefono: "",
      direccion: "",
      tiene_cuenta_corriente: false,
      limite_credito: 0,
      sucursal_id: "",
    },
  })

  const watchTieneCuenta = watch("tiene_cuenta_corriente")

  useEffect(() => {
    setTieneCuentaCorriente(watchTieneCuenta)
  }, [watchTieneCuenta])

  useEffect(() => {
    if (open) {
      loadSucursales()
      reset({
        nombre: cliente?.nombre || "",
        apellido: cliente?.apellido || "",
        dni: cliente?.dni || "",
        telefono: cliente?.telefono || "",
        direccion: cliente?.direccion || "",
        tiene_cuenta_corriente: cliente?.tiene_cuenta_corriente || false,
        limite_credito: cliente?.limite_credito || 0,
        sucursal_id: cliente?.sucursal_id || "",
      })
      setTieneCuentaCorriente(cliente?.tiene_cuenta_corriente || false)
    }
  }, [open, cliente, reset, loadSucursales])

  const handleFormSubmit = (data) => {
    onSubmit(data)
  }

  const handleClose = () => {
    reset({
      nombre: "",
      apellido: "",
      dni: "",
      telefono: "",
      direccion: "",
      tiene_cuenta_corriente: false,
      limite_credito: 0,
      sucursal_id: "",
    })
    setTieneCuentaCorriente(false)
    onClose()
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
            {isEditing ? "Editar Cliente" : "Nuevo Cliente"}
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
              {/* Información Personal */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <PersonIcon sx={{ fontSize: 18, color: "#dc2626" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                    Información Personal
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
                        {...register("nombre")}
                        label="Nombre"
                        fullWidth
                        size="small"
                        error={!!errors.nombre}
                        helperText={errors.nombre?.message}
                        placeholder="Ingresa el nombre"
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
                        {...register("apellido")}
                        label="Apellido"
                        fullWidth
                        size="small"
                        error={!!errors.apellido}
                        helperText={errors.apellido?.message}
                        placeholder="Ingresa el apellido"
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
                        {...register("dni")}
                        label="DNI"
                        fullWidth
                        size="small"
                        error={!!errors.dni}
                        helperText={errors.dni?.message}
                        placeholder="Ej: 12345678"
                        inputProps={{ maxLength: 8 }}
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

              {/* Información de Contacto */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <PhoneIcon sx={{ fontSize: 18, color: "#1976d2" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                    Contacto
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
                    {...register("telefono")}
                    label="Teléfono"
                    fullWidth
                    size="small"
                    error={!!errors.telefono}
                    helperText={errors.telefono?.message}
                    placeholder="Ej: 11-1234-5678"
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

              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <StoreIcon sx={{ fontSize: 18, color: "#ff9800" }} />
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
                  <FormControl fullWidth size="small" error={!!errors.sucursal_id}>
                    <InputLabel>Sucursal</InputLabel>
                    <Select
                      {...register("sucursal_id")}
                      label="Sucursal"
                      defaultValue=""
                      sx={{
                        borderRadius: 1.5,
                        backgroundColor: "#fafafa",
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#dc2626",
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>Sin sucursal</em>
                      </MenuItem>
                      {sucursales.map((sucursal) => (
                        <MenuItem key={sucursal.id} value={sucursal.id}>
                          {sucursal.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.sucursal_id && <FormHelperText>{errors.sucursal_id.message}</FormHelperText>}
                  </FormControl>
                </Box>
              </Box>
            </Grid>

            {/* Columna Derecha */}
            <Grid item xs={12} md={6}>
              {/* Dirección */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <LocationOnIcon sx={{ fontSize: 18, color: "#4caf50" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                    Dirección
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
                    {...register("direccion")}
                    label="Dirección"
                    fullWidth
                    size="small"
                    multiline
                    rows={4}
                    error={!!errors.direccion}
                    helperText={errors.direccion?.message}
                    placeholder="Calle, número, piso, departamento"
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

              {/* Cuenta Corriente */}
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <AccountBalanceIcon sx={{ fontSize: 18, color: "#9c27b0" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                    Cuenta Corriente
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
                  <FormControlLabel
                    control={
                      <Switch
                        {...register("tiene_cuenta_corriente")}
                        checked={tieneCuentaCorriente}
                        onChange={(e) => {
                          setValue("tiene_cuenta_corriente", e.target.checked)
                          setTieneCuentaCorriente(e.target.checked)
                        }}
                        size="small"
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: "#dc2626",
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                            backgroundColor: "#dc2626",
                          },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2" fontWeight="medium" sx={{ color: "#374151" }}>
                        Habilitar cuenta corriente
                      </Typography>
                    }
                    sx={{ mb: tieneCuentaCorriente ? 2 : 0 }}
                  />

                  {tieneCuentaCorriente && (
                    <Box>
                      <TextField
                        {...register("limite_credito")}
                        label="Límite de Crédito"
                        fullWidth
                        size="small"
                        type="number"
                        error={!!errors.limite_credito}
                        helperText={errors.limite_credito?.message || "Ingresa 0 para crédito ilimitado"}
                        placeholder="0"
                        inputProps={{ min: 0, step: "0.01" }}
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
                  )}
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
          {loading ? "Guardando..." : isEditing ? "Actualizar" : "Crear Cliente"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ClienteForm
