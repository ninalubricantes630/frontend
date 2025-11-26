"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  InputAdornment,
  Box,
  IconButton,
  Alert,
  FormHelperText,
} from "@mui/material"
import {
  Close as CloseIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  AttachMoney as MoneyIcon,
  QrCode2 as BarcodeIcon,
  Scale as ScaleIcon,
} from "@mui/icons-material"
import { NumericFormat } from "react-number-format"
import { useSucursales } from "../../hooks/useSucursales"
import { useCategorias } from "../../hooks/useCategorias"

const ProductoForm = ({ open, onClose, producto, onSubmit, loading }) => {
  const { sucursales, loadSucursales } = useSucursales()
  const { categorias, loadCategorias } = useCategorias()
  const isEditing = Boolean(producto)

  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    categoria_id: "",
    fabricante: "",
    precio: "",
    stock: "",
    stock_minimo: "",
    sucursal_id: "",
    unidad_medida: "unidad",
  })

  const [errors, setErrors] = useState({})
  const [unidadMedidaCambiada, setUnidadMedidaCambiada] = useState(false)

  useEffect(() => {
    if (open) {
      loadSucursales()
      loadCategorias()
      if (producto) {
        setFormData({
          codigo: producto.codigo || "",
          nombre: producto.nombre || "",
          descripcion: producto.descripcion || "",
          categoria_id: producto.categoria_id || "",
          fabricante: producto.fabricante || "",
          precio: producto.precio || "",
          stock: "", // No editable
          stock_minimo: producto.stock_minimo || "",
          sucursal_id: producto.sucursal_id || "",
          unidad_medida: producto.unidad_medida || "unidad",
        })
        setUnidadMedidaCambiada(false)
      } else {
        setFormData({
          codigo: "",
          nombre: "",
          descripcion: "",
          categoria_id: "",
          fabricante: "",
          precio: "",
          stock: "",
          stock_minimo: "",
          sucursal_id: "",
          unidad_medida: "unidad",
        })
        setUnidadMedidaCambiada(false)
      }
      setErrors({})
    }
  }, [open, producto])

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === "unidad_medida" && isEditing && value !== producto?.unidad_medida) {
      setUnidadMedidaCambiada(true)
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        stock: 0, // Poner stock en cero cuando se cambia unidad
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handlePrecioChange = (values) => {
    setFormData((prev) => ({
      ...prev,
      precio: values.floatValue || 0,
    }))
    if (errors.precio) {
      setErrors((prev) => ({
        ...prev,
        precio: "",
      }))
    }
  }

  const handleStockChange = (values) => {
    setFormData((prev) => ({
      ...prev,
      stock: values.floatValue || 0,
    }))
    if (errors.stock) {
      setErrors((prev) => ({
        ...prev,
        stock: "",
      }))
    }
  }

  const handleStockMinimoChange = (values) => {
    setFormData((prev) => ({
      ...prev,
      stock_minimo: values.floatValue || 0,
    }))
    if (errors.stock_minimo) {
      setErrors((prev) => ({
        ...prev,
        stock_minimo: "",
      }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido"
    }

    if (!formData.categoria_id) {
      newErrors.categoria_id = "La categoría es requerida"
    }

    if (!formData.precio || Number.parseFloat(formData.precio) <= 0) {
      newErrors.precio = "El precio debe ser mayor a 0"
    }

    if (!formData.sucursal_id) {
      newErrors.sucursal_id = "La sucursal es requerida"
    }

    if (!formData.unidad_medida) {
      newErrors.unidad_medida = "La unidad de medida es requerida"
    }

    if (!isEditing && formData.stock) {
      const stockNum = Number.parseFloat(formData.stock)
      if (isNaN(stockNum) || stockNum < 0) {
        newErrors.stock = "El stock no puede ser negativo"
      }
      if (formData.unidad_medida === "unidad" && !Number.isInteger(stockNum)) {
        newErrors.stock = "El stock para productos de unidad debe ser un número entero"
      }
    }

    if (formData.stock_minimo) {
      const stockMinimoNum = Number.parseFloat(formData.stock_minimo)
      if (isNaN(stockMinimoNum) || stockMinimoNum < 0) {
        newErrors.stock_minimo = "El stock mínimo no puede ser negativo"
      }
      if (formData.unidad_medida === "litro" && !Number.isInteger(stockMinimoNum)) {
        newErrors.stock_minimo = "El stock mínimo para productos de litro debe ser un número entero"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      const dataToSubmit = {
        ...formData,
        precio: Number.parseFloat(formData.precio),
        stock: !isEditing && formData.stock ? Number.parseFloat(formData.stock) : undefined,
        stock_minimo: formData.stock_minimo ? Number.parseFloat(formData.stock_minimo) : 0,
        unidad_medida: formData.unidad_medida,
      }
      if (isEditing) {
        delete dataToSubmit.stock
      }
      onSubmit(dataToSubmit)
    }
  }

  const handleClose = () => {
    setFormData({
      codigo: "",
      nombre: "",
      descripcion: "",
      categoria_id: "",
      fabricante: "",
      precio: "",
      stock: "",
      stock_minimo: "",
      sucursal_id: "",
      unidad_medida: "unidad",
    })
    setErrors({})
    setUnidadMedidaCambiada(false)
    onClose()
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const getUnidadLabel = () => {
    return formData.unidad_medida === "litro" ? "litros" : "unidades"
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
            {isEditing ? "Editar Producto" : "Nuevo Producto"}
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
        <Box component="form" mt={2} onSubmit={(e) => e.preventDefault()}>
          <Grid container spacing={3}>
            {/* Columna Izquierda */}
            <Grid item xs={12} md={6}>
              {/* Información Básica */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <InventoryIcon sx={{ fontSize: 18, color: "#dc2626" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                    Información Básica
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
                        fullWidth
                        label="Código de Barras"
                        name="codigo"
                        value={formData.codigo}
                        onChange={handleChange}
                        onKeyPress={handleKeyPress}
                        error={!!errors.codigo}
                        helperText={errors.codigo}
                        placeholder="Escanea o ingresa el código"
                        size="small"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <BarcodeIcon sx={{ fontSize: 20, color: "#6b7280" }} />
                            </InputAdornment>
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
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        required
                        label="Nombre del Producto"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        onKeyPress={handleKeyPress}
                        error={!!errors.nombre}
                        helperText={errors.nombre}
                        placeholder="Ej: Aceite 10W40"
                        size="small"
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
                        fullWidth
                        multiline
                        rows={3}
                        label="Descripción"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        placeholder="Descripción detallada del producto"
                        size="small"
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
                        fullWidth
                        label="Fabricante"
                        name="fabricante"
                        value={formData.fabricante}
                        onChange={handleChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Ej: TOTAL, ELF, YPF"
                        size="small"
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

              {/* Categoría y Ubicación */}
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <CategoryIcon sx={{ fontSize: 18, color: "#1976d2" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                    Categoría y Ubicación
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
                      <FormControl fullWidth required error={!!errors.categoria_id} size="small">
                        <InputLabel>Categoría</InputLabel>
                        <Select
                          name="categoria_id"
                          value={formData.categoria_id}
                          label="Categoría"
                          onChange={handleChange}
                          sx={{
                            borderRadius: 1.5,
                            backgroundColor: "#fafafa",
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#dc2626",
                            },
                          }}
                        >
                          {categorias
                            .filter((cat) => cat.activo)
                            .map((cat) => (
                              <MenuItem key={cat.id} value={cat.id}>
                                {cat.nombre}
                              </MenuItem>
                            ))}
                        </Select>
                        {errors.categoria_id && <FormHelperText>{errors.categoria_id}</FormHelperText>}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth required error={!!errors.sucursal_id} size="small">
                        <InputLabel>Sucursal</InputLabel>
                        <Select
                          name="sucursal_id"
                          value={formData.sucursal_id}
                          label="Sucursal"
                          onChange={handleChange}
                          sx={{
                            borderRadius: 1.5,
                            backgroundColor: "#fafafa",
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#dc2626",
                            },
                          }}
                        >
                          {sucursales.map((sucursal) => (
                            <MenuItem key={sucursal.id} value={sucursal.id}>
                              {sucursal.nombre}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.sucursal_id && <FormHelperText>{errors.sucursal_id}</FormHelperText>}
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Grid>

            {/* Columna Derecha */}
            <Grid item xs={12} md={6}>
              {/* Unidad de Medida */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <ScaleIcon sx={{ fontSize: 18, color: "#ff9800" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                    Unidad de Medida
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
                  <FormControl fullWidth required error={!!errors.unidad_medida} size="small">
                    <InputLabel>Tipo de Unidad</InputLabel>
                    <Select
                      name="unidad_medida"
                      value={formData.unidad_medida}
                      label="Tipo de Unidad"
                      onChange={handleChange}
                      sx={{
                        borderRadius: 1.5,
                        backgroundColor: "#fafafa",
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#dc2626",
                        },
                      }}
                    >
                      <MenuItem value="unidad">Unidad (productos contables)</MenuItem>
                      <MenuItem value="litro">Litro (productos líquidos)</MenuItem>
                    </Select>
                    {errors.unidad_medida && <FormHelperText>{errors.unidad_medida}</FormHelperText>}
                  </FormControl>
                  {isEditing && unidadMedidaCambiada && (
                    <Alert severity="error" sx={{ mt: 1.5, borderRadius: 1.5 }}>
                      <Typography variant="caption">
                        Unidad de medida modificada. El stock ha sido puesto en cero para que lo ingreses correctamente
                        con la nueva unidad.
                      </Typography>
                    </Alert>
                  )}
                  {!isEditing && (
                    <Box sx={{ mt: 1.5, p: 1.5, backgroundColor: "#f9fafb", borderRadius: 1 }}>
                      <Typography variant="caption" sx={{ color: "#6b7280" }}>
                        {formData.unidad_medida === "litro"
                          ? "Para productos líquidos, podrás usar decimales (ej: 2.5 litros)"
                          : "Para productos de unidad, solo se permiten números enteros"}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Precio y Stock */}
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <MoneyIcon sx={{ fontSize: 18, color: "#4caf50" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                    Precio y Stock
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
                      <NumericFormat
                        value={formData.precio}
                        onValueChange={handlePrecioChange}
                        customInput={TextField}
                        thousandSeparator="."
                        decimalSeparator=","
                        decimalScale={2}
                        fixedDecimalScale={false}
                        allowNegative={false}
                        prefix="$"
                        label="Precio *"
                        fullWidth
                        size="small"
                        error={!!errors.precio}
                        helperText={errors.precio || "Precio del producto en pesos argentinos"}
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

                    {!isEditing && (
                      <Grid item xs={12}>
                        <NumericFormat
                          value={formData.stock}
                          onValueChange={handleStockChange}
                          customInput={TextField}
                          thousandSeparator={formData.unidad_medida === "litro" ? "." : ""}
                          decimalSeparator=","
                          decimalScale={formData.unidad_medida === "litro" ? 3 : 0}
                          fixedDecimalScale={false}
                          allowNegative={false}
                          label="Stock Inicial"
                          fullWidth
                          size="small"
                          error={!!errors.stock}
                          helperText={
                            errors.stock ||
                            (formData.unidad_medida === "litro"
                              ? "Stock inicial en litros (puede usar decimales)"
                              : "Stock inicial en unidades (solo números enteros)")
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
                      </Grid>
                    )}

                    {isEditing && (
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          disabled
                          label="Stock Actual"
                          value={
                            formData.unidad_medida === "litro"
                              ? `${Number.parseFloat(producto?.stock || 0).toFixed(3)}`
                              : `${Number.parseFloat(producto?.stock || 0).toFixed(0)}`
                          }
                          size="small"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">{getUnidadLabel()}</InputAdornment>,
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 1.5,
                              backgroundColor: "#f3f4f6",
                            },
                          }}
                        />
                        <Alert severity="info" sx={{ mt: 1.5, borderRadius: 1.5 }}>
                          <Typography variant="caption">El stock se modifica desde "Registrar Movimiento"</Typography>
                        </Alert>
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <NumericFormat
                        value={formData.stock_minimo}
                        onValueChange={handleStockMinimoChange}
                        customInput={TextField}
                        thousandSeparator={formData.unidad_medida === "litro" ? "." : ""}
                        decimalSeparator=","
                        decimalScale={formData.unidad_medida === "litro" ? 3 : 0}
                        fixedDecimalScale={false}
                        allowNegative={false}
                        label="Stock Mínimo"
                        fullWidth
                        size="small"
                        error={!!errors.stock_minimo}
                        helperText={errors.stock_minimo || "Alerta cuando el stock sea menor"}
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
                    </Grid>
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
          disabled={loading}
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
          onClick={handleSubmit}
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
          {loading ? "Guardando..." : isEditing ? "Actualizar Producto" : "Crear Producto"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ProductoForm
