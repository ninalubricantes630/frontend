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
} from "@mui/material"
import { Close as CloseIcon, Business as BusinessIcon, LocationOn as LocationOnIcon } from "@mui/icons-material"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

const schema = yup.object({
  nombre: yup
    .string()
    .required("El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede tener más de 100 caracteres"),
  ubicacion: yup.string().nullable(),
  activo: yup.boolean(),
})

const SucursalForm = ({ open, onClose, onSubmit, sucursal, loading = false }) => {
  const isEditing = Boolean(sucursal)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      nombre: "",
      ubicacion: "",
      activo: true,
    },
  })

  const activo = watch("activo")

  useEffect(() => {
    if (sucursal) {
      setValue("nombre", sucursal.nombre || "")
      setValue("ubicacion", sucursal.ubicacion || "")
      setValue("activo", Boolean(sucursal.activo))
    } else {
      reset({
        nombre: "",
        ubicacion: "",
        activo: true,
      })
    }
  }, [sucursal, setValue, reset])

  const handleFormSubmit = async (data) => {
    const cleanData = {
      ...data,
      ubicacion: data.ubicacion?.trim() || null,
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
            {isEditing ? "Editar Sucursal" : "Nueva Sucursal"}
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
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <BusinessIcon sx={{ fontSize: 18, color: "#dc2626" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                    Información General
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
                        label="Nombre de la Sucursal *"
                        fullWidth
                        size="small"
                        error={!!errors.nombre}
                        helperText={errors.nombre?.message}
                        placeholder="Ej: Sucursal Centro, Sucursal Norte..."
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
                              {activo ? "Activa" : "Inactiva"}
                            </Typography>
                          }
                        />
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </Box>
            </Grid>

            {/* Columna Derecha */}
            <Grid item xs={12} md={6}>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <LocationOnIcon sx={{ fontSize: 18, color: "#1976d2" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                    Ubicación
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
                    {...register("ubicacion")}
                    label="Ubicación"
                    fullWidth
                    size="small"
                    multiline
                    rows={4}
                    error={!!errors.ubicacion}
                    helperText={errors.ubicacion?.message}
                    placeholder="Ubicación completa de la sucursal..."
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
          {loading ? "Guardando..." : isEditing ? "Actualizar" : "Crear Sucursal"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SucursalForm
