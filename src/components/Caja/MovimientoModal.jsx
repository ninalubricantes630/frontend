"use client"

import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Alert,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Typography,
} from "@mui/material"
import {
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  AttachMoney as AttachMoneyIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material"
import { NumericFormat } from "react-number-format"

export default function MovimientoModal({ open, onClose, onRegistrarMovimiento }) {
  const [tipo, setTipo] = useState("INGRESO")
  const [concepto, setConcepto] = useState("")
  const [monto, setMonto] = useState("")
  const [metodoPago, setMetodoPago] = useState("EFECTIVO")
  const [observaciones, setObservaciones] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const conceptoRef = useRef(null)

  useEffect(() => {
    if (open && conceptoRef.current) {
      setTimeout(() => {
        conceptoRef.current?.focus()
      }, 100)
    }
  }, [open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!concepto.trim()) {
      setError("El concepto es requerido")
      return
    }

    if (!monto || Number.parseFloat(monto) <= 0) {
      setError("El monto debe ser mayor a 0")
      return
    }

    setLoading(true)
    try {
      await onRegistrarMovimiento({
        tipo,
        concepto: concepto.trim(),
        monto: Number.parseFloat(monto),
        metodoPago,
        observaciones: observaciones.trim(),
      })
      setTipo("INGRESO")
      setConcepto("")
      setMonto("")
      setMetodoPago("EFECTIVO")
      setObservaciones("")
      onClose()
    } catch (err) {
      setError(err.message || "Error al registrar movimiento")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setTipo("INGRESO")
      setConcepto("")
      setMonto("")
      setMetodoPago("EFECTIVO")
      setObservaciones("")
      setError("")
      onClose()
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
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
          background:
            tipo === "INGRESO"
              ? "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)"
              : "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
        }}
      >
        <Box
          sx={{
            width: 5,
            height: 64,
            bgcolor: tipo === "INGRESO" ? "#16a34a" : "#dc2626",
            borderRadius: "0 8px 8px 0",
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
              width: 48,
              height: 48,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: tipo === "INGRESO" ? "#16a34a" : "#dc2626",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            {tipo === "INGRESO" ? (
              <TrendingUpIcon sx={{ color: "white", fontSize: 28 }} />
            ) : (
              <TrendingDownIcon sx={{ color: "white", fontSize: 28 }} />
            )}
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "1.25rem", color: "#0f172a" }}>
              {tipo === "INGRESO" ? "Registrar Ingreso" : "Registrar Egreso"}
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.875rem" }}>
              Movimiento de caja manual
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} disabled={loading} sx={{ mr: 1.5 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 3,
                mt: 4
              }}
            >
              {/* Left Column */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1.5, fontWeight: 600, color: "#0f172a", display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <DescriptionIcon sx={{ fontSize: 18 }} />
                    Tipo de Movimiento
                  </Typography>
                  <FormControl
                    fullWidth
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        bgcolor: "#f8fafc",
                      },
                    }}
                  >
                    <Select value={tipo} onChange={(e) => setTipo(e.target.value)} sx={{ fontWeight: 500 }}>
                      <MenuItem value="INGRESO">
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <TrendingUpIcon sx={{ fontSize: 20, color: "#16a34a" }} />
                          Ingreso
                        </Box>
                      </MenuItem>
                      <MenuItem value="EGRESO">
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <TrendingDownIcon sx={{ fontSize: 20, color: "#dc2626" }} />
                          Egreso
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600, color: "#0f172a" }}>
                    Concepto
                  </Typography>
                  <TextField
                    inputRef={conceptoRef}
                    placeholder="Ej: Pago de proveedor, Venta, etc."
                    value={concepto}
                    onChange={(e) => setConcepto(e.target.value)}
                    onKeyPress={handleKeyPress}
                    required
                    fullWidth
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        bgcolor: "#f8fafc",
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1.5, fontWeight: 600, color: "#0f172a", display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <AttachMoneyIcon sx={{ fontSize: 18 }} />
                    Monto
                  </Typography>
                  <NumericFormat
                    value={monto}
                    onValueChange={(values) => setMonto(values.floatValue || "")}
                    onKeyPress={handleKeyPress}
                    customInput={TextField}
                    thousandSeparator="."
                    decimalSeparator=","
                    decimalScale={2}
                    fixedDecimalScale={false}
                    allowNegative={false}
                    prefix="$"
                    placeholder="0,00"
                    fullWidth
                    size="small"
                    required
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        bgcolor: "#f8fafc",
                        fontWeight: 600,
                        fontSize: "1.1rem",
                      },
                    }}
                  />
                </Box>
              </Box>

              {/* Right Column */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1.5, fontWeight: 600, color: "#0f172a", display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <AccountBalanceIcon sx={{ fontSize: 18 }} />
                    Método de Pago
                  </Typography>
                  <FormControl
                    fullWidth
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        bgcolor: "#f8fafc",
                      },
                    }}
                  >
                    <Select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} sx={{ fontWeight: 500 }}>
                      <MenuItem value="EFECTIVO">
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <AttachMoneyIcon sx={{ fontSize: 20, color: "#16a34a" }} />
                          Efectivo
                        </Box>
                      </MenuItem>
                      <MenuItem value="TRANSFERENCIA">
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <AccountBalanceIcon sx={{ fontSize: 20, color: "#2563eb" }} />
                          Transferencia
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600, color: "#0f172a" }}>
                    Observaciones (opcional)
                  </Typography>
                  <TextField
                    placeholder="Agrega detalles adicionales..."
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    multiline
                    rows={6}
                    fullWidth
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        bgcolor: "#f8fafc",
                      },
                    }}
                  />
                </Box>
              </Box>
            </Box>

            <Typography variant="caption" sx={{ color: "#94a3b8", textAlign: "center", fontStyle: "italic" }}>
              Presiona Enter para registrar el movimiento
            </Typography>

            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 1 }}>
              <Button
                onClick={handleClose}
                disabled={loading}
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  px: 4,
                  py: 1,
                  fontWeight: 600,
                  borderColor: "#e5e7eb",
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
                  py: 1,
                  fontWeight: 600,
                  bgcolor: tipo === "INGRESO" ? "#16a34a" : "#dc2626",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  "&:hover": {
                    bgcolor: tipo === "INGRESO" ? "#15803d" : "#b91c1c",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                  },
                }}
              >
                {loading ? "Registrando..." : "Registrar"}
              </Button>
            </Box>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  )
}
