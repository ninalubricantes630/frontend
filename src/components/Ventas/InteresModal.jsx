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

export default function InteresModal({ open, onClose, subtotal, onConfirm, hayDescuento = false }) {
  const [tipoInteres, setTipoInteres] = useState("porcentaje")
  const [valorInteres, setValorInteres] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      setValorInteres("")
      setTipoInteres("porcentaje")
      setError("")
    }
  }, [open])

  const calcularInteres = () => {
    const valor = tipoInteres === "porcentaje" ? parsePriceInput(valorInteres) / 100 : parsePriceInput(valorInteres)
    return Math.max(0, valor)
  }

  const calcularTotal = () => {
    const interes = calcularInteres()
    if (tipoInteres === "porcentaje") {
      return subtotal * (1 + interes)
    } else {
      return subtotal + interes
    }
  }

  const handleConfirm = () => {
    setError("")

    if (hayDescuento && valorInteres && parsePriceInput(valorInteres) > 0) {
      setError("No se puede aplicar interés del sistema cuando hay un descuento aplicado")
      return
    }

    if (!valorInteres || parsePriceInput(valorInteres) <= 0) {
      onConfirm({
        tipoInteres: null,
        valorInteres: 0,
        montoInteres: 0,
        total: subtotal,
      })
      return
    }

    const interes = calcularInteres()
    const montoInteres = tipoInteres === "porcentaje" ? subtotal * interes : interes

    onConfirm({
      tipoInteres: tipoInteres,
      valorInteres: parsePriceInput(valorInteres),
      montoInteres: montoInteres,
      total: subtotal + montoInteres,
    })
  }

  const montoInteres = valorInteres ? calcularInteres() : 0
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
            bgcolor: "#dc2626",
            borderRadius: 1,
          }}
        />
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#171717", fontSize: "1.1rem", flex: 1 }}>
          Agregar Interés
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
        {hayDescuento && (
          <Alert severity="warning" sx={{ borderRadius: 1.5, mb: 2.5 }}>
            <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
              No puedes aplicar interés del sistema cuando hay un descuento. Elimina el descuento primero.
            </Typography>
          </Alert>
        )}

        <Box sx={{ mb: 2.5 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2.5,
              bgcolor: "#fef2f2",
              border: "1px solid #fee2e2",
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
            Tipo de interés
          </Typography>
          <ToggleButtonGroup
            value={tipoInteres}
            exclusive
            onChange={(e, value) => value && setTipoInteres(value)}
            fullWidth
            disabled={hayDescuento}
            sx={{
              mb: 2,
              "& .MuiToggleButton-root": {
                py: 1,
                fontSize: "0.875rem",
                "&.Mui-selected": {
                  bgcolor: "#fef2f2",
                  color: "#dc2626",
                  borderColor: "#dc2626 !important",
                  "&:hover": {
                    bgcolor: "#fee2e2",
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
            label={tipoInteres === "porcentaje" ? "Porcentaje %" : "Monto"}
            placeholder={tipoInteres === "porcentaje" ? "Ej: 3%" : "Ej: 5000"}
            value={valorInteres}
            onChange={(e) => setValorInteres(formatPriceInput(e.target.value))}
            size="small"
            type="number"
            disabled={hayDescuento}
            inputProps={{
              step: tipoInteres === "porcentaje" ? "0.1" : "1",
              min: "0",
            }}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 1.5,
                "&:hover fieldset": { borderColor: "#dc2626" },
                "&.Mui-focused fieldset": { borderColor: "#dc2626" },
              },
            }}
          />

          {valorInteres && parsePriceInput(valorInteres) > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 2,
                bgcolor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 1.5,
              }}
            >
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                  <Typography variant="body2" sx={{ color: "#15803d", fontSize: "0.875rem" }}>
                    {tipoInteres === "porcentaje" ? `Interés (${valorInteres}%)` : "Interés"}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#15803d" }}>
                    +{formatCurrency(montoInteres)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="h6" sx={{ color: "#15803d", fontSize: "0.9rem", fontWeight: 600 }}>
                    Total con interés
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: "#15803d" }}>
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
          disabled={hayDescuento}
          sx={{
            bgcolor: "#dc2626",
            "&:hover": { bgcolor: "#b91c1c" },
            "&:disabled": { bgcolor: "#d1d5db", color: "#9ca3af" },
          }}
        >
          Aplicar Interés
        </Button>
      </DialogActions>
    </Dialog>
  )
}
