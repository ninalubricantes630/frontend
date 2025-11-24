"use client"

import { useState, useEffect, useRef } from "react"
import {
  Box,
  TextField,
  Button,
  Grid,
  Alert,
  Card,
  CardContent,
  Typography,
  InputAdornment,
  Checkbox,
} from "@mui/material"
import { CreditCard as CreditCardIcon } from "@mui/icons-material"

export default function TarjetaForm({ initialData = null, onSubmit, loading = false }) {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    cuotas: Array(12)
      .fill(null)
      .map((_, i) => ({
        numero_cuotas: i + 1,
        tasa_interes: "",
        activo: false,
      })),
  })

  const [errors, setErrors] = useState({})
  const interestRefs = useRef({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || "",
        descripcion: initialData.descripcion || "",
        cuotas: Array(12)
          .fill(null)
          .map((_, i) => {
            const cuotaExistente = initialData.cuotas?.find((c) => c.numero_cuotas === i + 1)
            return {
              numero_cuotas: i + 1,
              tasa_interes: cuotaExistente?.tasa_interes || "",
              activo: cuotaExistente ? true : false,
            }
          }),
      })
    }
  }, [initialData])

  const handleNombreChange = (e) => {
    setFormData({ ...formData, nombre: e.target.value })
    if (errors.nombre) setErrors({ ...errors, nombre: null })
  }

  const handleDescripcionChange = (e) => {
    setFormData({ ...formData, descripcion: e.target.value })
  }

  const handleCuotaChange = (index, field, value) => {
    const newCuotas = [...formData.cuotas]
    newCuotas[index] = { ...newCuotas[index], [field]: value }
    setFormData({ ...formData, cuotas: newCuotas })

    if (field === "activo" && value) {
      setTimeout(() => {
        const refKey = `cuota-${index}`
        if (interestRefs.current[refKey]) {
          interestRefs.current[refKey].focus()
          interestRefs.current[refKey].select()
        }
      }, 0)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre de la tarjeta es requerido"
    }

    const cuotasActivas = formData.cuotas.filter((c) => c.activo)
    if (cuotasActivas.length === 0) {
      newErrors.cuotas = "Debe activar al menos una opción de cuotas"
    }

    for (const cuota of cuotasActivas) {
      if (cuota.tasa_interes === undefined || cuota.tasa_interes === "") {
        newErrors.cuotas = "Todas las cuotas activas deben tener una tasa de interés"
        break
      }

      const tasa = Number.parseFloat(cuota.tasa_interes)
      if (tasa < 0 || tasa > 100) {
        newErrors.cuotas = "La tasa de interés debe estar entre 0 y 100%"
        break
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      const datosEnvio = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null,
        cuotas: formData.cuotas
          .filter((c) => c.activo)
          .map((c) => ({
            numero_cuotas: c.numero_cuotas,
            tasa_interes: Number.parseFloat(c.tasa_interes),
          })),
      }
      onSubmit(datosEnvio)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={2.5} mt={2}>
        {/* Nombre y Descripción en la misma fila */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nombre de la Tarjeta"
            placeholder="Ej: Visa"
            value={formData.nombre}
            onChange={handleNombreChange}
            error={!!errors.nombre}
            helperText={errors.nombre}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CreditCardIcon sx={{ color: "#64748b" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: "0.875rem",
                height: 48,
                "&.Mui-focused fieldset": { borderColor: "#dc2626" },
              },
              "& .MuiOutlinedInput-input": {
                py: 1.25,
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Descripción (opcional)"
            placeholder="Información adicional"
            value={formData.descripcion}
            onChange={handleDescripcionChange}
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: "0.875rem",
                height: 48,
                "&.Mui-focused fieldset": { borderColor: "#dc2626" },
              },
              "& .MuiOutlinedInput-input": {
                py: 1.25,
              },
            }}
          />
        </Grid>

        {/* Configuración de cuotas */}
        <Grid item xs={12}>
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#1e293b", mb: 1 }}>
              Configuración de Cuotas (hasta 12 cuotas)
            </Typography>
            {errors.cuotas && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 1, fontSize: "0.875rem" }}>
                {errors.cuotas}
              </Alert>
            )}
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)" },
              gap: 1.5,
            }}
          >
            {formData.cuotas.map((cuota, index) => (
              <Card
                key={index}
                sx={{
                  border: "1px solid #e2e8f0",
                  bgcolor: cuota.activo ? "#fef2f2" : "white",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: "#cbd5e1",
                  },
                }}
              >
                <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
                    <Checkbox
                      size="small"
                      checked={cuota.activo}
                      onChange={(e) => handleCuotaChange(index, "activo", e.target.checked)}
                      sx={{
                        color: "#dc2626",
                        "&.Mui-checked": { color: "#dc2626" },
                        p: 0.25,
                      }}
                    />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1, fontSize: "0.875rem" }}>
                      {cuota.numero_cuotas}x
                    </Typography>
                  </Box>

                  <TextField
                    ref={(el) => {
                      if (el) interestRefs.current[`cuota-${index}`] = el.querySelector("input")
                    }}
                    fullWidth
                    size="small"
                    label="Interés %"
                    type="number"
                    inputProps={{ min: 0, max: 100, step: 0.01 }}
                    value={cuota.tasa_interes}
                    onChange={(e) => handleCuotaChange(index, "tasa_interes", e.target.value)}
                    disabled={!cuota.activo}
                    placeholder="0"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 42,
                        "&.Mui-focused fieldset": { borderColor: "#dc2626" },
                      },
                      "& .MuiOutlinedInput-input": {
                        fontSize: "0.875rem",
                        py: 1,
                        "&::placeholder": {
                          opacity: 0.5,
                          color: "#b0b0b0",
                          fontSize: "0.875rem",
                        },
                      },
                      "& .MuiInputBase-input": {
                        "&::placeholder": {
                          opacity: 0.5,
                          color: "#b0b0b0",
                          fontSize: "0.875rem",
                        },
                      },
                    }}
                  />
                </CardContent>
              </Card>
            ))}
          </Box>
        </Grid>

        {/* Botones */}
        <Grid item xs={12} sx={{ display: "flex", gap: 1, justifyContent: "flex-end", pt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: "#dc2626",
              "&:hover": { bgcolor: "#b91c1c" },
              px: 3,
              fontWeight: 500,
            }}
          >
            {loading ? "Guardando..." : initialData ? "Actualizar" : "Crear"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  )
}
