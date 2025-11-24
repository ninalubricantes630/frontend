"use client"
import { useForm, Controller } from "react-hook-form"
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormHelperText,
} from "@mui/material"
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Shield as ShieldIcon,
} from "@mui/icons-material"
import { useSucursales } from "../../hooks/useSucursales"

const usuarioSchema = yup.object({
  nombre: yup
    .string()
    .required("El nombre es obligatorio")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres"),
  email: yup.string().required("El email es obligatorio").email("Debe ser un email válido"),
  password: yup.string().when("$isEditing", {
    is: false,
    then: (schema) =>
      schema.required("La contraseña es obligatoria").min(6, "La contraseña debe tener al menos 6 caracteres"),
    otherwise: (schema) =>
      schema
        .nullable()
        .transform((value) => value || null)
        .typeError("La contraseña debe tener al menos 6 caracteres")
        .test("min-length", "La contraseña debe tener al menos 6 caracteres", (value) => {
          // Allow null/empty values when editing
          if (value === null || value === "") return true
          return value.length >= 6
        }),
  }),
  rol: yup.string().required("El rol es obligatorio").oneOf(["ADMIN", "EMPLEADO"], "Rol inválido"),
  sucursales: yup
    .array()
    .min(1, "Debe seleccionar al menos una sucursal")
    .required("Debe seleccionar al menos una sucursal"),
})

const UsuarioForm = ({ open, onClose, onSubmit, usuario = null, loading = false }) => {
  const isEditing = Boolean(usuario)
  const { sucursalesActivas, loadSucursalesActivas } = useSucursales()
  const [selectedSucursales, setSelectedSucursales] = useState([])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(usuarioSchema),
    context: { isEditing },
    defaultValues: {
      nombre: usuario?.nombre || "",
      email: usuario?.email || "",
      password: "",
      rol: usuario?.rol || "EMPLEADO",
      sucursales: usuario?.sucursales || [],
    },
  })

  useEffect(() => {
    loadSucursalesActivas()
  }, [])

  useEffect(() => {
    if (usuario) {
      if (usuario.sucursales) {
        const sucursalesIds = usuario.sucursales.map((s) => s.id)
        setSelectedSucursales(sucursalesIds)
        setValue(
          "sucursales",
          usuario.sucursales.map((s) => ({
            sucursal_id: s.id,
            es_principal: s.es_principal,
          })),
        )
      } else {
        setSelectedSucursales([])
        setValue("sucursales", [])
      }

      reset({
        nombre: usuario?.nombre || "",
        email: usuario?.email || "",
        password: "",
        rol: usuario?.rol || "EMPLEADO",
        sucursales:
          usuario?.sucursales?.map((s) => ({
            sucursal_id: s.id,
            es_principal: s.es_principal,
          })) || [],
      })
    } else {
      setSelectedSucursales([])
      reset({
        nombre: "",
        email: "",
        password: "",
        rol: "EMPLEADO",
        sucursales: [],
      })
    }
  }, [usuario, reset, setValue])

  const handleSucursalesChange = (event) => {
    const value = event.target.value
    setSelectedSucursales(value)

    const sucursalesData = value.map((id, index) => ({
      sucursal_id: id,
      es_principal: index === 0,
    }))

    setValue("sucursales", sucursalesData, { shouldValidate: true })
  }

  const handleFormSubmit = (data) => {
    if (isEditing && !data.password) {
      delete data.password
    }

    if (data.sucursales.length > 0 && !data.sucursales.some((s) => s.es_principal)) {
      data.sucursales[0].es_principal = true
    }

    onSubmit(data)
  }

  const handleClose = () => {
    reset()
    setSelectedSucursales([])
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
            {isEditing ? "Editar Usuario" : "Nuevo Usuario"}
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
                  <TextField
                    {...register("nombre")}
                    label="Nombre *"
                    fullWidth
                    size="small"
                    error={!!errors.nombre}
                    helperText={errors.nombre?.message}
                    placeholder="Ingresa el nombre completo"
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

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <EmailIcon sx={{ fontSize: 18, color: "#1976d2" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                    Credenciales de Acceso
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
                        {...register("email")}
                        label="Email *"
                        type="email"
                        fullWidth
                        size="small"
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        placeholder="usuario@ejemplo.com"
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
                        {...register("password")}
                        label={isEditing ? "Contraseña (dejar vacío para mantener)" : "Contraseña *"}
                        type="password"
                        fullWidth
                        size="small"
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        placeholder={isEditing ? "Nueva contraseña (opcional)" : "Contraseña"}
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
                  <ShieldIcon sx={{ fontSize: 18, color: "#9c27b0" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                    Permisos
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
                  <Controller
                    name="rol"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth size="small" error={!!errors.rol}>
                        <InputLabel>Rol *</InputLabel>
                        <Select
                          {...field}
                          label="Rol *"
                          sx={{
                            borderRadius: 1.5,
                            backgroundColor: "#fafafa",
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#dc2626",
                            },
                          }}
                        >
                          <MenuItem value="EMPLEADO">Empleado</MenuItem>
                          <MenuItem value="ADMIN">Administrador</MenuItem>
                        </Select>
                        {errors.rol && <FormHelperText>{errors.rol.message}</FormHelperText>}
                      </FormControl>
                    )}
                  />
                </Box>
              </Box>
            </Grid>

            {/* Columna Derecha */}
            <Grid item xs={12} md={6}>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <BusinessIcon sx={{ fontSize: 18, color: "#4caf50" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                    Sucursales Asignadas
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
                  <FormControl fullWidth size="small" error={!!errors.sucursales}>
                    <InputLabel>Sucursales *</InputLabel>
                    <Select
                      multiple
                      value={selectedSucursales}
                      onChange={handleSucursalesChange}
                      label="Sucursales *"
                      renderValue={(selected) => (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {selected.map((value) => {
                            const sucursal = sucursalesActivas.find((s) => s.id === value)
                            return (
                              <Chip
                                key={value}
                                label={sucursal?.nombre || value}
                                size="small"
                                sx={{
                                  backgroundColor: "#dc2626",
                                  color: "#fff",
                                  "& .MuiChip-deleteIcon": {
                                    color: "#fff",
                                  },
                                }}
                              />
                            )
                          })}
                        </Box>
                      )}
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
                          <Typography variant="body2">{sucursal.nombre}</Typography>
                          {sucursal.ubicacion && (
                            <Typography variant="caption" sx={{ color: "#6b7280", ml: 1 }}>
                              {sucursal.ubicacion}
                            </Typography>
                          )}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.sucursales && <FormHelperText>{errors.sucursales.message}</FormHelperText>}
                  </FormControl>

                  <Box
                    sx={{
                      mt: 2,
                      p: 1.5,
                      backgroundColor: "#f9fafb",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "#6b7280", fontSize: "0.8125rem" }}>
                      Selecciona las sucursales a las que el usuario tendrá acceso. La primera seleccionada será la
                      principal.
                    </Typography>
                  </Box>
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
          {loading ? "Guardando..." : isEditing ? "Actualizar Usuario" : "Crear Usuario"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UsuarioForm
