"use client"

import { useState, useRef, useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  Alert,
  IconButton,
  TextField,
  Typography,
} from "@mui/material"
import { Close as CloseIcon, AccountBalance as AccountBalanceIcon } from "@mui/icons-material"
import { NumericFormat } from "react-number-format"

export default function AbrirCajaModal({ open, onClose, onAbrirCaja }) {
  const [montoInicial, setMontoInicial] = useState("")
  const [observaciones, setObservaciones] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const montoInputRef = useRef(null)

  useEffect(() => {
    if (open && montoInputRef.current) {
      setTimeout(() => {
        montoInputRef.current?.focus()
        montoInputRef.current?.select()
      }, 100)
    }
  }, [open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!montoInicial || Number.parseFloat(montoInicial) < 0) {
      setError("El monto inicial debe ser mayor o igual a 0")
      return
    }

    setLoading(true)
    try {
      await onAbrirCaja({
        montoInicial: Number.parseFloat(montoInicial),
        observaciones: observaciones.trim(),
      })
      setMontoInicial("")
      setObservaciones("")
      onClose()
    } catch (err) {
      setError(err.message || "Error al abrir caja")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setMontoInicial("")
      setObservaciones("")
      setError("")
      onClose()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading && montoInicial) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm" // Changed from "md" to "sm" for a narrower modal
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2.5,
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 0,
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            width: 4,
            height: 64,
            bgcolor: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            borderRadius: "0 4px 4px 0",
          }}
        />
        <Box
          sx={{
            flex: 1,
            px: 3,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: "#d1fae5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AccountBalanceIcon sx={{ color: "#059669", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "1.125rem", color: "#0f172a" }}>Abrir Caja</Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} disabled={loading} sx={{ mr: 1.5 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 4, pb: 4, px: 4 }}>
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt:4}}>
            {error && (
              <Alert severity="error" sx={{ borderRadius: 1.5, fontSize: "0.875rem" }}>
                {error}
              </Alert>
            )}

            <NumericFormat
              value={montoInicial}
              onValueChange={(values) => setMontoInicial(values.floatValue || "")}
              customInput={TextField}
              thousandSeparator="."
              decimalSeparator=","
              decimalScale={2}
              fixedDecimalScale={false}
              allowNegative={false}
              prefix="$"
              label="Monto Inicial"
              fullWidth
              required
              inputRef={montoInputRef}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: "1.125rem",
                  "& input": {
                    py: 1.75,
                    fontWeight: 500,
                  },
                  "&.Mui-focused": {
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#059669",
                      borderWidth: 2,
                    },
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#059669",
                },
              }}
            />

            <TextField
              label="Observaciones (opcional)"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              multiline
              rows={3}
              fullWidth
              placeholder="Agrega notas o comentarios sobre la apertura..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused": {
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#059669",
                      borderWidth: 2,
                    },
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#059669",
                },
              }}
            />

            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 1 }}>
              <Button
                onClick={handleClose}
                disabled={loading}
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  px: 3,
                  py: 1.25,
                  fontSize: "0.9375rem",
                  fontWeight: 500,
                  borderColor: "#e2e8f0",
                  color: "#64748b",
                  "&:hover": {
                    borderColor: "#cbd5e1",
                    bgcolor: "#f8fafc",
                  },
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  px: 4,
                  py: 1.25,
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  boxShadow: "0 4px 12px rgba(5, 150, 105, 0.25)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                    boxShadow: "0 6px 16px rgba(5, 150, 105, 0.35)",
                  },
                  "&:disabled": {
                    background: "#e2e8f0",
                    color: "#94a3b8",
                  },
                }}
              >
                {loading ? "Abriendo..." : "Abrir Caja"}
              </Button>
            </Box>

            <Typography variant="caption" sx={{ color: "#94a3b8", textAlign: "center", mt: -1 }}>
              Presiona <strong>Enter</strong> para abrir la caja rápidamente
            </Typography>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  )
}
