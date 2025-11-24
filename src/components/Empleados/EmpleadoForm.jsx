"use client"

import { useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  IconButton,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material"
import { Close, Person, Phone, Work } from "@mui/icons-material"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useSucursales } from "../../hooks/useSucursales"

const schema = yup.object({
  nombre: yup
    .string()
    .required("El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede tener más de 100 caracteres"),
  apellido: yup
    .string()
    .required("El apellido es requerido")
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(100, "El apellido no puede tener más de 100 caracteres"),
  telefono: yup.string().nullable(),
  cargo: yup.string().nullable(),
  sucursal_id: yup.number().required("La sucursal es requerida").min(1, "Debe seleccionar una sucursal"),
  activo: yup.boolean(),
})

const EmpleadoForm = ({ open, onClose, onSubmit, empleado, loading = false }) => {
  const { sucursalesActivas, loadSucursalesActivas } = useSucursales()
  const isEditing = Boolean(empleado)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      nombre: "",
      apellido: "",
      telefono: "",
      cargo: "",
      sucursal_id: "",
      activo: true,
    },
  })

  const activo = watch("activo")

  useEffect(() => {
    if (open) {
      loadSucursalesActivas()
    }
  }, [open, loadSucursalesActivas])

  useEffect(() => {
    if (open) {
      if (empleado) {
        // Edit mode: populate form with empleado data
        setValue("nombre", empleado.nombre || "")
        setValue("apellido", empleado.apellido || "")
        setValue("telefono", empleado.telefono || "")
        setValue("cargo", empleado.cargo || "")
        setValue("sucursal_id", empleado.sucursal_id || "")
        setValue("activo", empleado.activo ?? true)
      } else {
        // Create mode: reset form to empty values
        reset({
          nombre: "",
          apellido: "",
          telefono: "",
          cargo: "",
          sucursal_id: "",
          activo: true,
        })
      }
    }
  }, [open, empleado, setValue, reset])

  const handleFormSubmit = async (data) => {
    const cleanData = {
      ...data,
      telefono: data.telefono?.trim() || null,
      cargo: data.cargo?.trim() || null,
    }
    await onSubmit(cleanData)
  }

  const handleClose = () => {
    reset()
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
            {isEditing ? "Editar Empleado" : "Nuevo Empleado"}
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
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 4, px: 3, pb: 3, backgroundColor: "#fafafa" }}>
        <Box component="form" mt={2} onSubmit={handleSubmit(handleFormSubmit)}>
          <Grid container spacing={3}>
            {/* Columna Izquierda */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <Person sx={{ fontSize: 18, color: "#dc2626" }} />
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
                        label="Nombre *"
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
                        label="Apellido *"
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
                  </Grid>
                </Box>
              </Box>

              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <Phone sx={{ fontSize: 18, color: "#1976d2" }} />
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
                    placeholder="+54 11 1234-5678"
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

            {/* Columna Derecha */}
            <Grid item xs={12} md={6}>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <Work sx={{ fontSize: 18, color: "#4caf50" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                    Información Laboral
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
                      <Controller
                        name="sucursal_id"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth size="small" error={!!errors.sucursal_id}>
                            <InputLabel>Sucursal *</InputLabel>
                            <Select
                              {...field}
                              label="Sucursal *"
                              sx={{
                                borderRadius: 1.5,
                                backgroundColor: "#fafafa",
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#dc2626",
                                },
                              }}
                            >
                              {sucursalesActivas.map((sucursal) => (
                                <MenuItem key={sucursal.id} value={sucursal.id}>
                                  {sucursal.nombre}
                                </MenuItem>
                              ))}
                            </Select>
                            {errors.sucursal_id && <FormHelperText>{errors.sucursal_id.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        {...register("cargo")}
                        label="Cargo"
                        fullWidth
                        size="small"
                        error={!!errors.cargo}
                        helperText={errors.cargo?.message}
                        placeholder="Ej: Mecánico, Técnico, Supervisor..."
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

                    {isEditing && (
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={activo}
                              onChange={(e) => setValue("activo", e.target.checked)}
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
                              {activo ? "Activo" : "Inactivo"}
                            </Typography>
                          }
                        />
                      </Grid>
                    )}
                  </Grid>
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
          {loading ? "Guardando..." : isEditing ? "Actualizar" : "Crear Empleado"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EmpleadoForm
