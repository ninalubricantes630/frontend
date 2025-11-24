"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, IconButton } from "@mui/material"
import { Close as CloseIcon, Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material"
import { formatCurrency, formatQuantity } from "../../utils/formatters"
import QuantityInput from "../Common/QuantityInput"

const CantidadModal = ({ open, onClose, producto, onConfirm, isEditing = false }) => {
  const unidadMedida = producto?.unidad_medida || "unidad"
  const isLitro = unidadMedida === "litro"
  const [cantidad, setCantidad] = useState(isLitro ? 1 : 1)
  const cantidadInputRef = useRef(null)

  const botonesRapidos = isLitro 
    ? [0.5, 1, 1.5, 2, 2.5, 3, 3.5]
    : [1, 3, 5, 7, 10]

  useEffect(() => {
    if (open) {
      setCantidad(isLitro ? 1 : 1)
      setTimeout(() => {
        if (cantidadInputRef.current) {
          const inputElement = cantidadInputRef.current.querySelector('input')
          if (inputElement) {
            inputElement.focus()
            inputElement.select()
          }
        }
      }, 100)
    }
  }, [open, isLitro])

  const handleCantidadChange = (newValue) => {
    if (newValue <= producto.stock) {
      setCantidad(newValue)
    }
  }

  const handleIncrement = () => {
    const increment = isLitro ? 0.5 : 1
    const newValue = cantidad + increment

    if (newValue <= producto.stock) {
      setCantidad(newValue)
    }
  }

  const handleDecrement = () => {
    const decrement = isLitro ? 0.5 : 1
    const newValue = Math.max(isLitro ? 0.001 : 1, cantidad - decrement)

    setCantidad(newValue)
  }

  const handleCantidadRapida = (valor) => {
    if (valor <= producto.stock) {
      setCantidad(valor)
      setTimeout(() => {
        if (cantidadInputRef.current) {
          const inputElement = cantidadInputRef.current.querySelector('input')
          if (inputElement) {
            inputElement.focus()
          }
        }
      }, 50)
    }
  }

  const handleConfirm = () => {
    if (cantidad > 0 && cantidad <= producto.stock) {
      onConfirm(cantidad)
      onClose()
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && cantidad > 0 && cantidad <= producto.stock) {
      e.preventDefault()
      e.stopPropagation()
      handleConfirm()
    }
  }

  if (!producto) return null

  const subtotal = producto.precio * cantidad

  const getUnidadLabel = () => {
    return isLitro ? "litros" : "unidades"
  }

  const formatStock = (stock) => {
    return formatQuantity(stock, unidadMedida)
  }

  const buttonText = isEditing ? "Actualizar" : "Agregar (Enter)"
  const titleText = isEditing ? "Actualizar Cantidad" : "Agregar al Carrito"

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 2,
          pb: 1.5,
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Box
          sx={{
            width: 4,
            height: 32,
            bgcolor: "#dc2626",
            borderRadius: 1,
          }}
        />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#171717", fontSize: "1.1rem" }}>
            {titleText}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "#6b7280",
            "&:hover": { bgcolor: "#f3f4f6" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, mt: 2 }}>
        <Box
          sx={{
            mb: 2.5,
            p: 2,
            bgcolor: "#f9fafb",
            borderRadius: 1.5,
            border: "1px solid #e5e7eb",
          }}
        >
          <Typography variant="subtitle1" sx={{ color: "#171717", mb: 0.5, fontWeight: 600 }}>
            {producto.nombre}
          </Typography>
          {producto.descripcion && (
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1, fontSize: "0.875rem" }}>
              {producto.descripcion}
            </Typography>
          )}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1.5 }}>
            <Typography variant="body2" color="textSecondary" sx={{ fontSize: "0.875rem" }}>
              Stock:{" "}
              <strong>
                {formatStock(producto.stock)} {getUnidadLabel()}
              </strong>
            </Typography>
            <Typography variant="h6" sx={{ color: "#dc2626", fontWeight: 600 }}>
              {formatCurrency(producto.precio)} c/u
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 2.5 }}>
          <Typography variant="body2" sx={{ mb: 1, color: "#374151", fontWeight: 500, fontSize: "0.875rem" }}>
            Cantidad {isLitro && "(puedes usar decimales)"}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              onClick={handleDecrement}
              disabled={cantidad <= (isLitro ? 0.001 : 1)}
              size="small"
              sx={{
                border: "1px solid #d1d5db",
                borderRadius: 1,
                "&:hover": { bgcolor: "#fef2f2", borderColor: "#dc2626" },
                "&:disabled": { opacity: 0.4 },
              }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
            <Box ref={cantidadInputRef} sx={{ flex: 1 }}>
              <QuantityInput
                value={cantidad}
                onChange={handleCantidadChange}
                onKeyPress={handleKeyPress}
                unidadMedida={unidadMedida}
                label=""
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: "#dc2626" },
                    "&.Mui-focused fieldset": { borderColor: "#dc2626" },
                  },
                  "& input": {
                    textAlign: "center",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                  },
                }}
              />
            </Box>
            <IconButton
              onClick={handleIncrement}
              disabled={cantidad >= producto.stock}
              size="small"
              sx={{
                border: "1px solid #d1d5db",
                borderRadius: 1,
                "&:hover": { bgcolor: "#fef2f2", borderColor: "#dc2626" },
                "&:disabled": { opacity: 0.4 },
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
          {isLitro && (
            <Typography variant="caption" sx={{ mt: 0.5, display: "block", color: "#6b7280", fontSize: "0.75rem" }}>
              Incrementos de 0.5L con los botones + y -
            </Typography>
          )}
        </Box>

        <Box sx={{ mb: 2.5 }}>
          <Typography variant="body2" sx={{ mb: 1, color: "#374151", fontWeight: 500, fontSize: "0.875rem" }}>
            Cantidades rápidas
          </Typography>
          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
            {botonesRapidos.map((valor) => (
              <Button
                key={valor}
                onClick={() => handleCantidadRapida(valor)}
                disabled={valor > producto.stock}
                variant={cantidad === valor ? "contained" : "outlined"}
                size="small"
                sx={{
                  minWidth: 48,
                  height: 36,
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  borderRadius: 1,
                  borderColor: "#d1d5db",
                  color: cantidad === valor ? "white" : "#374151",
                  bgcolor: cantidad === valor ? "#dc2626" : "transparent",
                  "&:hover": {
                    bgcolor: cantidad === valor ? "#b91c1c" : "#fef2f2",
                    borderColor: "#dc2626",
                  },
                  "&:disabled": {
                    opacity: 0.4,
                    borderColor: "#d1d5db",
                  },
                }}
              >
                {valor}{isLitro ? "L" : ""}
              </Button>
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            p: 2,
            borderRadius: 1.5,
            bgcolor: "#fef2f2",
            border: "1px solid #fee2e2",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body1" fontWeight={600} sx={{ color: "#374151" }}>
            Subtotal:
          </Typography>
          <Typography variant="h5" fontWeight={600} sx={{ color: "#dc2626" }}>
            {formatCurrency(subtotal)}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{
            color: "#6b7280",
            "&:hover": { bgcolor: "#f3f4f6" },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={cantidad === 0 || cantidad > producto.stock}
          sx={{
            bgcolor: "#dc2626",
            "&:hover": { bgcolor: "#b91c1c" },
            "&:disabled": { bgcolor: "#d1d5db" },
          }}
        >
          {buttonText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CantidadModal
