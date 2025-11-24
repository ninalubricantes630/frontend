"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  IconButton,
  Alert,
} from "@mui/material"
import { Close as CloseIcon } from "@mui/icons-material"
import { formatCurrency, formatPriceInput, parsePriceInput } from "../../utils/formatters"

export default function DescuentoModal({ open, onClose, subtotal, onConfirm, hayInteres = false }) {
  const [tipoDescuento, setTipoDescuento] = useState("porcentaje")
  const [valorDescuento, setValorDescuento] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      setValorDescuento("")
      setTipoDescuento("porcentaje")
      setError("")
    }
  }, [open])

  const calcularDescuento = () => {
    const valor =
      tipoDescuento === "porcentaje" ? parsePriceInput(valorDescuento) / 100 : parsePriceInput(valorDescuento)
    return Math.max(0, valor)
  }

  const calcularTotal = () => {
    const descuento = calcularDescuento()
    if (tipoDescuento === "porcentaje") {
      return subtotal * (1 - descuento)
    } else {
      return Math.max(0, subtotal - descuento)
    }
  }

  const handleConfirm = () => {
    setError("")

    if (hayInteres && valorDescuento && parsePriceInput(valorDescuento) > 0) {
      setError("No se puede aplicar descuento cuando hay un interés del sistema aplicado")
      return
    }

    if (!valorDescuento || parsePriceInput(valorDescuento) <= 0) {
      onConfirm({
        tipoDescuento: null,
        valorDescuento: 0,
        montoDescuento: 0,
        total: subtotal,
      })
      return
    }

    const descuento = calcularDescuento()
    const montoDescuento = tipoDescuento === "porcentaje" ? subtotal * descuento : descuento

    // Validar que el descuento no sea mayor que el subtotal
    if (montoDescuento > subtotal) {
      setError("El descuento no puede ser mayor que el subtotal")
      return
    }

    onConfirm({
      tipoDescuento: tipoDescuento,
      valorDescuento: parsePriceInput(valorDescuento),
      montoDescuento: montoDescuento,
      total: subtotal - montoDescuento,
    })
  }

  const montoDescuento = valorDescuento ? calcularDescuento() : 0
  const totalCalculado = calcularTotal()

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
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
            bgcolor: "#16a34a",
            borderRadius: 1,
          }}
        />
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#171717", fontSize: "1.1rem", flex: 1 }}>
          Agregar Descuento
        </Typography>
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

      <DialogContent sx={{ p: 2.5, mt: 1 }}>
        {hayInteres && (
          <Alert severity="warning" sx={{ borderRadius: 1.5, mb: 2.5 }}>
            <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
              No puedes aplicar descuento cuando hay un interés del sistema. Elimina el interés primero.
            </Typography>
          </Alert>
        )}

        <Box sx={{ mb: 2.5 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2.5,
              bgcolor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: 1.5,
            }}
          >
            <Typography variant="caption" sx={{ color: "#6b7280", fontSize: "0.875rem", display: "block", mb: 0.5 }}>
              Subtotal
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#171717" }}>
              {formatCurrency(subtotal)}
            </Typography>
          </Paper>

          <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500, color: "#374151", fontSize: "0.875rem" }}>
            Tipo de descuento
          </Typography>
          <ToggleButtonGroup
            value={tipoDescuento}
            exclusive
            onChange={(e, value) => value && setTipoDescuento(value)}
            fullWidth
            disabled={hayInteres}
            sx={{
              mb: 2,
              "& .MuiToggleButton-root": {
                py: 1,
                fontSize: "0.875rem",
                "&.Mui-selected": {
                  bgcolor: "#f0fdf4",
                  color: "#16a34a",
                  borderColor: "#16a34a !important",
                  "&:hover": {
                    bgcolor: "#dcfce7",
                  },
                },
              },
            }}
          >
            <ToggleButton value="porcentaje">
              <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                Porcentaje (%)
              </Typography>
            </ToggleButton>
            <ToggleButton value="monto">
              <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                Monto ($)
              </Typography>
            </ToggleButton>
          </ToggleButtonGroup>

          <TextField
            fullWidth
            label={tipoDescuento === "porcentaje" ? "Porcentaje %" : "Monto"}
            placeholder={tipoDescuento === "porcentaje" ? "Ej: 10%" : "Ej: 5000"}
            value={valorDescuento}
            onChange={(e) => setValorDescuento(formatPriceInput(e.target.value))}
            size="small"
            type="number"
            disabled={hayInteres}
            inputProps={{
              step: tipoDescuento === "porcentaje" ? "0.1" : "1",
              min: "0",
              max: tipoDescuento === "porcentaje" ? "100" : subtotal.toString(),
            }}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 1.5,
                "&:hover fieldset": { borderColor: "#16a34a" },
                "&.Mui-focused fieldset": { borderColor: "#16a34a" },
              },
            }}
          />

          {valorDescuento && parsePriceInput(valorDescuento) > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 2,
                bgcolor: "#fef3c7",
                border: "1px solid #fde68a",
                borderRadius: 1.5,
              }}
            >
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                  <Typography variant="body2" sx={{ color: "#92400e", fontSize: "0.875rem" }}>
                    {tipoDescuento === "porcentaje" ? `Descuento (${valorDescuento}%)` : "Descuento"}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#92400e" }}>
                    -{formatCurrency(tipoDescuento === "porcentaje" ? subtotal * montoDescuento : montoDescuento)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="h6" sx={{ color: "#92400e", fontSize: "0.9rem", fontWeight: 600 }}>
                    Total con descuento
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: "#16a34a" }}>
                    {formatCurrency(totalCalculado)}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}

          {error && (
            <Alert severity="error" sx={{ borderRadius: 1.5, mb: 2 }}>
              {error}
            </Alert>
          )}
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
          disabled={hayInteres}
          sx={{
            bgcolor: "#16a34a",
            "&:hover": { bgcolor: "#15803d" },
            "&:disabled": { bgcolor: "#d1d5db", color: "#9ca3af" },
          }}
        >
          Aplicar Descuento
        </Button>
      </DialogActions>
    </Dialog>
  )
}
