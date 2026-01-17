"use client"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useEffect } from "react"
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
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
} from "@mui/material"
import {
  Close as CloseIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  SwapHoriz as SwapHorizIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material"
import { NumericFormat } from "react-number-format"

const createMovimientoSchema = (unidadMedida) => {
  const isLitro = unidadMedida === "litro"

  return yup.object({
    tipo: yup
      .string()
      .required("El tipo de movimiento es obligatorio")
      .oneOf(["entrada", "salida", "ajuste"], "Tipo de movimiento inválido"),
    cantidad: yup
      .number()
      .typeError("La cantidad debe ser un número")
      .required("La cantidad es obligatoria")
      .min(0, "La cantidad debe ser mayor o igual a 0")
      .test("is-valid-number", (value, context) => {
        if (value === undefined || value === null) return false
        // Para entrada y salida, la cantidad debe ser mayor a 0
        const tipo = context.parent.tipo
        if ((tipo === "entrada" || tipo === "salida") && value <= 0) {
          return context.createError({ message: "La cantidad debe ser mayor a 0 para entrada/salida" })
        }
        if (isLitro) {
          return value >= 0
        }
        return Number.isInteger(value) && value >= 0
      })
      .test("integer-for-units", "La cantidad debe ser un número entero", (value) => {
        if (isLitro || value === undefined || value === null) return true
        return Number.isInteger(value)
      }),
    motivo: yup.string().max(500, "El motivo no puede exceder 500 caracteres"),
  })
}

const MovimientoStockModal = ({ open, onClose, onSubmit, producto, loading = false }) => {
  const unidadMedida = producto?.unidad_medida || "unidad"
  const isLitro = unidadMedida === "litro"

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(createMovimientoSchema(unidadMedida)),
    defaultValues: {
      tipo: "entrada",
      cantidad: "",
      motivo: "",
    },
  })

  const tipoMovimiento = watch("tipo")
  const cantidad = watch("cantidad")

  useEffect(() => {
    if (open) {
      reset({
        tipo: "entrada",
        cantidad: "",
        motivo: "",
      })
    }
  }, [open, reset])

  const handleFormSubmit = (data) => {
    const tipoMovimiento = data.tipo.toUpperCase()

    onSubmit({
      ...data,
      tipo: tipoMovimiento,
      producto_id: producto.id,
    })
  }

  const handleClose = () => {
    reset({
      tipo: "entrada",
      cantidad: "",
      motivo: "",
    })
    onClose()
  }

  const getTipoIcon = () => {
    switch (tipoMovimiento) {
      case "entrada":
        return <TrendingUpIcon />
      case "salida":
        return <TrendingDownIcon />
      case "ajuste":
        return <SwapHorizIcon />
      default:
        return <InventoryIcon />
    }
  }

  const getTipoColor = () => {
    switch (tipoMovimiento) {
      case "entrada":
        return { bg: "#e8f5e9", color: "#4caf50" }
      case "salida":
        return { bg: "#ffebee", color: "#f44336" }
      case "ajuste":
        return { bg: "#e3f2fd", color: "#2196f3" }
      default:
        return { bg: "#f5f5f5", color: "#666" }
    }
  }

  const calcularNuevoStock = () => {
    if (cantidad === "" || cantidad === undefined || cantidad === null || !producto) return producto?.stock || 0

    const cantidadNum = Number.parseFloat(cantidad)
    const stockActual = Number.parseFloat(producto.stock) || 0

    switch (tipoMovimiento) {
      case "entrada":
        return stockActual + cantidadNum
      case "salida":
        return stockActual - cantidadNum
      case "ajuste":
        return cantidadNum
      default:
        return stockActual
    }
  }

  const formatStockValue = (value) => {
    const num = Number.parseFloat(value)
    if (isNaN(num)) return "0"
    return isLitro ? num.toFixed(3) : num.toFixed(0)
  }

  const getUnidadLabel = () => {
    return isLitro ? "litros" : "unidades"
  }

  if (!producto) return null

  const nuevoStockCalculado = calcularNuevoStock()
  const stockSeraNegativo = nuevoStockCalculado < 0

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
          <Box>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600, color: "#171717" }}>
              Registrar Movimiento de Stock
            </Typography>
            <Typography variant="body2" sx={{ color: "#6b7280", fontSize: "0.875rem" }}>
              {producto?.nombre || "Producto"} - {isLitro ? "Producto líquido" : "Producto de unidad"}
            </Typography>
          </Box>
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
            <Grid item xs={12}>
              <Box
                sx={{
                  backgroundColor: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: 1.5,
                  p: 2,
                }}
              >
                <Typography variant="body2" sx={{ color: "#1e40af", fontWeight: 500 }}>
                  Stock actual:{" "}
                  <strong>
                    {formatStockValue(producto?.stock || 0)} {getUnidadLabel()}
                  </strong>
                </Typography>
              </Box>
            </Grid>

            {/* Columna Izquierda */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <Avatar
                    sx={{
                      backgroundColor: getTipoColor().bg,
                      color: getTipoColor().color,
                      width: 24,
                      height: 24,
                    }}
                  >
                    {getTipoIcon()}
                  </Avatar>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                    Tipo de Movimiento
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
                    name="tipo"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.tipo} size="small">
                        <InputLabel>Tipo de Movimiento *</InputLabel>
                        <Select
                          {...field}
                          label="Tipo de Movimiento *"
                          sx={{
                            borderRadius: 1.5,
                            backgroundColor: "#fafafa",
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#dc2626",
                            },
                          }}
                        >
                          <MenuItem value="entrada">
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <TrendingUpIcon sx={{ color: "#4caf50", fontSize: 20 }} />
                              <Typography variant="body2">Entrada (Agregar stock)</Typography>
                            </Box>
                          </MenuItem>
                          <MenuItem value="salida">
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <TrendingDownIcon sx={{ color: "#f44336", fontSize: 20 }} />
                              <Typography variant="body2">Salida (Reducir stock)</Typography>
                            </Box>
                          </MenuItem>
                          <MenuItem value="ajuste">
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <SwapHorizIcon sx={{ color: "#2196f3", fontSize: 20 }} />
                              <Typography variant="body2">Ajuste (Establecer stock exacto)</Typography>
                            </Box>
                          </MenuItem>
                        </Select>
                        {errors.tipo && <FormHelperText>{errors.tipo.message}</FormHelperText>}
                      </FormControl>
                    )}
                  />

                  <Box sx={{ mt: 2, p: 1.5, backgroundColor: "#f9fafb", borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>
                      {tipoMovimiento === "entrada" &&
                        `Suma ${getUnidadLabel()} al stock actual (compras, devoluciones)`}
                      {tipoMovimiento === "salida" && `Resta ${getUnidadLabel()} del stock actual (ventas, pérdidas)`}
                      {tipoMovimiento === "ajuste" &&
                        "Establece el stock a un valor exacto (inventario, correcciones). Puede ser 0."}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Columna Derecha */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <InventoryIcon sx={{ fontSize: 18, color: "#1976d2" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                    {tipoMovimiento === "ajuste" ? "Nuevo Stock" : "Cantidad"}
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
                    name="cantidad"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <NumericFormat
                        value={value}
                        onValueChange={(values) => {
                          onChange(values.floatValue !== undefined ? values.floatValue : "")
                        }}
                        customInput={TextField}
                        thousandSeparator={isLitro ? "." : ""}
                        decimalSeparator=","
                        decimalScale={isLitro ? 3 : 0}
                        fixedDecimalScale={false}
                        allowNegative={false}
                        label={tipoMovimiento === "ajuste" ? "Nuevo Stock *" : "Cantidad *"}
                        fullWidth
                        size="small"
                        error={!!errors.cantidad}
                        helperText={
                          errors.cantidad?.message ||
                          (isLitro ? "Puedes usar decimales (ej: 2,5)" : "Solo números enteros") +
                            (tipoMovimiento === "ajuste" ? " - Puede ser 0" : "")
                        }
                        placeholder={
                          tipoMovimiento === "ajuste" ? "Ingresa el stock exacto (puede ser 0)" : "Ingresa la cantidad"
                        }
                        InputProps={{
                          endAdornment: <InputAdornment position="end">{getUnidadLabel()}</InputAdornment>,
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
                  />

                  {cantidad !== "" && cantidad !== undefined && cantidad !== null && (
                    <Box
                      sx={{
                        mt: 2,
                        p: 1.5,
                        backgroundColor: stockSeraNegativo ? "#fef3c7" : "#dcfce7",
                        border: `1px solid ${stockSeraNegativo ? "#fcd34d" : "#bbf7d0"}`,
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: stockSeraNegativo ? "#92400e" : "#166534",
                          fontSize: "0.8125rem",
                          fontWeight: 500,
                        }}
                      >
                        Nuevo stock:{" "}
                        <strong>
                          {formatStockValue(nuevoStockCalculado)} {getUnidadLabel()}
                        </strong>
                        {stockSeraNegativo && " (Stock negativo)"}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>

            {/* Motivo - Full Width */}
            <Grid item xs={12} mt={-4}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <DescriptionIcon sx={{ fontSize: 18, color: "#ff9800" }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                  Motivo
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
                  {...register("motivo")}
                  label="Motivo"
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  error={!!errors.motivo}
                  helperText={errors.motivo?.message}
                  placeholder="Ej: Compra a proveedor, venta al cliente, ajuste por inventario..."
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
          {loading ? "Registrando..." : "Registrar Movimiento"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MovimientoStockModal
