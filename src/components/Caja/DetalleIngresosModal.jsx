"use client"

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Divider,
  Card,
  CircularProgress,
} from "@mui/material"
import {
  Close as CloseIcon,
  AttachMoney as MoneyIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material"

export default function DetalleIngresosModal({ open, onClose, detalleIngresos, loading = false }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number.parseFloat(value || 0))
  }

  const getMetodoPagoConfig = (metodo) => {
    switch (metodo) {
      case "EFECTIVO":
        return { label: "Efectivo", icon: MoneyIcon, color: "#059669", bg: "#d1fae5" }
      case "CREDITO":
      case "TARJETA":
      case "TARJETA_CREDITO":
        return { label: "Tarjeta de Crédito", icon: CreditCardIcon, color: "#2563eb", bg: "#dbeafe" }
      case "TRANSFERENCIA":
        return { label: "Transferencia", icon: BankIcon, color: "#7c3aed", bg: "#ede9fe" }
      case "CUENTA_CORRIENTE":
        return { label: "Cuenta Corriente", icon: ReceiptIcon, color: "#dc2626", bg: "#fee2e2" }
      default:
        return { label: metodo, icon: MoneyIcon, color: "#64748b", bg: "#f1f5f9" }
    }
  }

  const totalGeneral = detalleIngresos?.total_general || 0
  const desglose = detalleIngresos?.desglose || []

  const hasData = !loading && desglose && desglose.length > 0

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              borderRadius: "50%",
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MoneyIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
              Detalle de Ingresos
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: "#fafafa", mt: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 4 }}>
            <CircularProgress sx={{ color: "#059669", mb: 2 }} />
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Cargando detalles de ingresos...
            </Typography>
          </Box>
        ) : (
          <>
            {/* Total General */}
            <Card
              sx={{
                p: 2.5,
                mb: 3,
                bgcolor: "white",
                border: "2px solid #dcfce7",
                borderRadius: 2,
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <Typography variant="body2" sx={{ color: "#64748b", mb: 0.5, fontWeight: 500 }}>
                Total de Ingresos
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#059669" }}>
                ${formatCurrency(totalGeneral)}
              </Typography>
            </Card>

            <Divider sx={{ my: 2.5, borderColor: "#e5e7eb" }} />

            {/* Desglose por Método */}
            <Typography
              variant="body2"
              sx={{
                textAlign: "center",
                fontWeight: 600,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontSize: "0.75rem",
                mb: 2,
              }}
            >
              Desglose por Método
            </Typography>

            {!hasData ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <MoneyIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }} />
                <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                  No hay ingresos registrados
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {desglose.map((item) => {
                  const config = getMetodoPagoConfig(item.metodo_pago)
                  const Icon = config.icon
                  const porcentaje = totalGeneral > 0 ? (item.total / totalGeneral) * 100 : 0

                  return (
                    <Card
                      key={item.metodo_pago}
                      sx={{
                        p: 2,
                        bgcolor: config.bg,
                        border: "none",
                        borderRadius: 2,
                        boxShadow: "none",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
                          <Box
                            sx={{
                              bgcolor: config.bg,
                              borderRadius: 1,
                              p: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Icon sx={{ fontSize: 20, color: config.color }} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a", mb: 0.25 }}>
                              {config.label}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#64748b" }}>
                              {item.cantidad} {item.cantidad === 1 ? "transacción" : "transacciones"}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: "right" }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: config.color, mb: 0.25 }}>
                            ${formatCurrency(item.total)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
                            {porcentaje.toFixed(1)}%
                          </Typography>
                        </Box>
                      </Box>

                      {/* Barra de progreso */}
                      <Box sx={{ mt: 1.5, bgcolor: "#f1f5f9", borderRadius: 1, height: 6, overflow: "hidden" }}>
                        <Box
                          sx={{
                            bgcolor: config.color,
                            height: "100%",
                            width: `${porcentaje}%`,
                            transition: "width 0.5s ease",
                          }}
                        />
                      </Box>
                    </Card>
                  )
                })}
              </Box>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
