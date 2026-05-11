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
import { Close as CloseIcon, Receipt as ReceiptIcon } from "@mui/icons-material"

export default function DetalleCuentaCorrienteModal({ open, onClose, sesionActiva, detalleCC, loading = false }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number.parseFloat(value || 0))
  }

  if (!sesionActiva) return null

  const totalRef =
    (Number(sesionActiva.total_ventas_cuenta_corriente) || 0) +
    (Number(sesionActiva.total_servicios_cuenta_corriente) || 0)

  const ventas = detalleCC?.ventas || []
  const servicios = detalleCC?.servicios || []
  const tieneLineas = ventas.length > 0 || servicios.length > 0

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          m: { xs: 1, sm: 2 },
          maxHeight: { xs: "calc(100% - 16px)", sm: "calc(100vh - 32px)" },
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 2,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
          <Box
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              borderRadius: "50%",
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ReceiptIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: "1rem", sm: "1.1rem" } }}>
              Cuenta corriente (referencia)
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.85)", display: "block", mt: 0.25 }}>
              No afecta caja · Sesión actual
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "white", flexShrink: 0 }} aria-label="Cerrar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          p: { xs: 2, sm: 3 },
          bgcolor: "#fafafa",
          overflowY: "auto",
          flex: 1,
          minHeight: 0,
        }}
      >
        <Typography variant="body2" sx={{ color: "#92400e", mb: 2, lineHeight: 1.5 }}>
          Estimado de lo facturado en cuenta corriente en esta sesión. Es solo referencia y no modifica el efectivo
          contado en caja.
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: "#d97706", mb: 2 }} />
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Cargando detalle...
            </Typography>
          </Box>
        ) : (
          <>
            <Card
              sx={{
                p: 2.5,
                mb: 2,
                bgcolor: "white",
                border: "2px solid #fde68a",
                borderRadius: 2,
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <Typography variant="body2" sx={{ color: "#64748b", mb: 1, fontWeight: 500 }}>
                Total referencia CC
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#b45309" }}>
                ${formatCurrency(totalRef)}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: { xs: 1, sm: 3 }, flexWrap: "wrap", mt: 2 }}>
                {Number(sesionActiva.cantidad_ventas_cuenta_corriente) > 0 && (
                  <Typography variant="body2" sx={{ color: "#0f172a", fontWeight: 500 }}>
                    Ventas: {sesionActiva.cantidad_ventas_cuenta_corriente} — $
                    {formatCurrency(sesionActiva.total_ventas_cuenta_corriente)}
                  </Typography>
                )}
                {Number(sesionActiva.cantidad_servicios_cuenta_corriente) > 0 && (
                  <Typography variant="body2" sx={{ color: "#0f172a", fontWeight: 500 }}>
                    Servicios: {sesionActiva.cantidad_servicios_cuenta_corriente} — $
                    {formatCurrency(sesionActiva.total_servicios_cuenta_corriente)}
                  </Typography>
                )}
              </Box>
            </Card>

            <Divider sx={{ my: 2, borderColor: "#e5e7eb" }} />

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
              Detalle por comprobante
            </Typography>

            {!tieneLineas ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <ReceiptIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }} />
                <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                  No hay líneas de detalle para mostrar
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {ventas.length > 0 && (
                  <Card sx={{ p: 0, overflow: "hidden", borderRadius: 2, border: "1px solid #fde68a", boxShadow: "none" }}>
                    <Box sx={{ px: 2, py: 1.25, bgcolor: "#fffbeb", borderBottom: "1px solid #fde68a" }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#92400e" }}>
                        Ventas en CC ({ventas.length})
                      </Typography>
                    </Box>
                    <Box sx={{ maxHeight: { xs: "40vh", sm: "min(45vh, 360px)" }, overflowY: "auto" }}>
                      {ventas.map((v) => (
                        <Box
                          key={`v-${v.id}`}
                          sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            alignItems: { xs: "flex-start", sm: "center" },
                            justifyContent: "space-between",
                            gap: { xs: 0.5, sm: 2 },
                            px: 2,
                            py: 1.25,
                            borderBottom: "1px solid #f1f5f9",
                            "&:last-of-type": { borderBottom: "none" },
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#0f172a",
                              flex: 1,
                              minWidth: 0,
                              wordBreak: "break-word",
                              pr: { sm: 1 },
                            }}
                          >
                            <Box component="span" sx={{ fontWeight: 600 }}>
                              {v.numero}
                            </Box>{" "}
                            — {v.cliente || "Sin cliente"}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, color: "#b45309", flexShrink: 0, alignSelf: { xs: "flex-end", sm: "auto" } }}
                          >
                            ${formatCurrency(v.total)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Card>
                )}

                {servicios.length > 0 && (
                  <Card sx={{ p: 0, overflow: "hidden", borderRadius: 2, border: "1px solid #fde68a", boxShadow: "none" }}>
                    <Box sx={{ px: 2, py: 1.25, bgcolor: "#fffbeb", borderBottom: "1px solid #fde68a" }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#92400e" }}>
                        Servicios en CC ({servicios.length})
                      </Typography>
                    </Box>
                    <Box sx={{ maxHeight: { xs: "40vh", sm: "min(45vh, 360px)" }, overflowY: "auto" }}>
                      {servicios.map((s) => (
                        <Box
                          key={`s-${s.id}`}
                          sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            alignItems: { xs: "flex-start", sm: "center" },
                            justifyContent: "space-between",
                            gap: { xs: 0.5, sm: 2 },
                            px: 2,
                            py: 1.25,
                            borderBottom: "1px solid #f1f5f9",
                            "&:last-of-type": { borderBottom: "none" },
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#0f172a",
                              flex: 1,
                              minWidth: 0,
                              wordBreak: "break-word",
                              pr: { sm: 1 },
                            }}
                          >
                            <Box component="span" sx={{ fontWeight: 600 }}>
                              {s.numero}
                            </Box>{" "}
                            — {s.cliente || "Sin cliente"}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, color: "#b45309", flexShrink: 0, alignSelf: { xs: "flex-end", sm: "auto" } }}
                          >
                            ${formatCurrency(s.total)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Card>
                )}
              </Box>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
