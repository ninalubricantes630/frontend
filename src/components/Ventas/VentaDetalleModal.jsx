"use client"

import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Grid,
  Divider,
  Button,
  DialogActions,
} from "@mui/material"
import { Close as CloseIcon } from "@mui/icons-material"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { formatQuantity } from "../../utils/formatters"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useCaja } from "../../hooks/useCaja"

const VentaDetalleModal = ({ open, onClose, venta }) => {
  const navigate = useNavigate()
  const { sesionActiva, loadSesionActiva } = useCaja()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open) {
      loadSesionActiva()
        .catch(() => {
          // Silently handle error - no active session
        })
        .finally(() => setLoading(false))
    }
  }, [open, loadSesionActiva])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount)
  }

  const formatDate = (date) => {
    if (!date) return "-"
    try {
      return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: es })
    } catch (error) {
      return "-"
    }
  }

  const getTipoPagoColor = (tipo) => {
    const colors = {
      EFECTIVO: "success",
      CREDITO: "info",
      TRANSFERENCIA: "primary",
      CUENTA_CORRIENTE: "warning",
      TARJETA_CREDITO: "info",
    }
    return colors[tipo] || "default"
  }

  const getEstadoColor = (estado) => {
    return estado === "COMPLETADA" ? "success" : "error"
  }

  const getUnidadLabel = (unidadMedida) => {
    return unidadMedida === "litro" ? "L" : "u"
  }

  const handleRecrearVenta = () => {
    const ventaParaRecrear = {
      ...venta,
      productos: venta.detalle || [], // Asegurar que use 'detalle' pero lo guarde como 'productos' para compatibilidad
    }
    localStorage.setItem("ventaParaRecrear", JSON.stringify(ventaParaRecrear))
    onClose()
    navigate("/ventas?recrear=true")
  }

  const puedeRecrearVenta = () => {
    if (!venta) return false
    if (venta.estado !== "CANCELADA") return false
    if (!sesionActiva) return false

    // Solo permitir recrear ventas de la sesión actual
    return venta.sesion_caja_id === sesionActiva.id
  }

  if (!venta) return null

  const interesDelSistema = venta.interes_sistema_monto || 0
  const descuentoAplicado = venta.descuento || 0
  const interesDeTarjeta = venta.interes_tarjeta_monto || 0

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Box
        sx={{
          backgroundColor: "#fff",
          borderBottom: "1px solid #e5e7eb",
          p: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 8,
              height: 40,
              backgroundColor: "#dc2626",
              borderRadius: 1,
            }}
          />
          <Box>
            <Typography variant="h6" fontWeight={600} sx={{ color: "#171717" }}>
              Venta #{venta.numero}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
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
      </Box>

      <DialogContent
        sx={{
          p: 0,
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            p: 3,
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            backgroundColor: "#fafafa",
          }}
        >
          <Grid container spacing={2}>
            {/* Información General y Estado */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: 1.5,
                  p: 2,
                  border: "1px solid #e5e7eb",
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}
                    >
                      Fecha
                    </Typography>
                    <Typography variant="body2" fontWeight={500} sx={{ color: "#171717", fontSize: "0.875rem" }}>
                      {formatDate(venta.fecha || venta.created_at)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}
                    >
                      Cliente
                    </Typography>
                    <Typography variant="body2" fontWeight={500} sx={{ color: "#171717", fontSize: "0.875rem" }}>
                      {venta.cliente_nombre || "Consumidor Final"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}
                    >
                      Sucursal
                    </Typography>
                    <Typography variant="body2" fontWeight={500} sx={{ color: "#171717", fontSize: "0.875rem" }}>
                      {venta.sucursal_nombre || "-"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Estado y Pago */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: 1.5,
                  p: 2,
                  border: "1px solid #e5e7eb",
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}
                    >
                      Estado
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip label={venta.estado} size="small" color={getEstadoColor(venta.estado)} />
                    </Box>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}
                    >
                      Tipo de Pago
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip label={venta.tipo_pago} size="small" color={getTipoPagoColor(venta.tipo_pago)} />
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Información de Tarjeta (Simplificada) */}
            {(venta.tipo_pago === "CREDITO" || venta.tipo_pago === "TARJETA_CREDITO") &&
              (venta.tarjeta_nombre || venta.numero_cuotas) && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      backgroundColor: "#eff6ff",
                      borderRadius: 1.5,
                      p: 2,
                      border: "1px solid #bfdbfe",
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "flex-start" }}>
                      {venta.tarjeta_nombre && (
                        <Box>
                          <Typography
                            variant="caption"
                            color="textSecondary"
                            sx={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}
                          >
                            Tarjeta
                          </Typography>
                          <Typography variant="body2" fontWeight={500} sx={{ color: "#1976d2" }}>
                            {venta.tarjeta_nombre}
                          </Typography>
                        </Box>
                      )}
                      {venta.numero_cuotas && (
                        <Box>
                          <Typography
                            variant="caption"
                            color="textSecondary"
                            sx={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}
                          >
                            Cuotas
                          </Typography>
                          <Typography variant="body2" fontWeight={500} sx={{ color: "#1976d2" }}>
                            {venta.numero_cuotas}x
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Grid>
              )}

            {/* Información de Cancelación */}
            {venta.estado === "CANCELADA" && (venta.usuario_cancelacion_nombre || venta.fecha_cancelacion) && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    backgroundColor: "#fef2f2",
                    borderRadius: 1.5,
                    p: 2,
                    border: "1px solid #fca5a5",
                  }}
                >
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "flex-start" }}>
                    {venta.usuario_cancelacion_nombre && (
                      <Box>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}
                        >
                          Cancelado por
                        </Typography>
                        <Typography variant="body2" fontWeight={500} sx={{ color: "#dc2626" }}>
                          {venta.usuario_cancelacion_nombre}
                        </Typography>
                      </Box>
                    )}
                    {venta.fecha_cancelacion && (
                      <Box>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}
                        >
                          Fecha
                        </Typography>
                        <Typography variant="body2" fontWeight={500} sx={{ color: "#dc2626" }}>
                          {formatDate(venta.fecha_cancelacion)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>

          {/* Productos */}
          <Box sx={{ mt: 2.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151", mb: 1 }}>
              Productos
            </Typography>

            <Box
              sx={{
                backgroundColor: "#fff",
                borderRadius: 1.5,
                border: "1px solid #e5e7eb",
                overflow: "hidden",
              }}
            >
              <TableContainer sx={{ maxHeight: "300px" }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          color: "#374151",
                          backgroundColor: "#f9fafb",
                          fontSize: "0.75rem",
                          py: 1.5,
                        }}
                      >
                        Producto
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 600,
                          color: "#374151",
                          backgroundColor: "#f9fafb",
                          fontSize: "0.75rem",
                          py: 1.5,
                        }}
                      >
                        Cantidad
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 600,
                          color: "#374151",
                          backgroundColor: "#f9fafb",
                          fontSize: "0.75rem",
                          py: 1.5,
                        }}
                      >
                        Precio Unit.
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 600,
                          color: "#374151",
                          backgroundColor: "#f9fafb",
                          fontSize: "0.75rem",
                          py: 1.5,
                        }}
                      >
                        Subtotal
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {venta.detalle && venta.detalle.length > 0 ? (
                      venta.detalle.map((item, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            "&:hover": {
                              bgcolor: "#fafafa",
                            },
                          }}
                        >
                          <TableCell sx={{ py: 1.5 }}>
                            <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.875rem" }}>
                              {item.producto_nombre || item.nombre || "-"}
                            </Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ py: 1.5 }}>
                            <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                              {formatQuantity(item.cantidad, item.unidad_medida)} {getUnidadLabel(item.unidad_medida)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ py: 1.5 }}>
                            <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                              {formatCurrency(item.precio_unitario)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ py: 1.5 }}>
                            <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.875rem" }}>
                              {formatCurrency(item.subtotal)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="textSecondary" sx={{ fontSize: "0.875rem" }}>
                            No hay productos
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>

          {/* Resumen de Totales (SIMPLIFICADO) */}
          <Box
            sx={{
              mt: 2.5,
              backgroundColor: "#fff",
              borderRadius: 1.5,
              p: 2,
              border: "1px solid #e5e7eb",
            }}
          >
            <Box sx={{ minWidth: "100%", maxWidth: 320, ml: "auto" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1, gap: 1 }}>
                <Typography variant="body2" sx={{ fontSize: "0.875rem", color: "#6b7280" }}>
                  Subtotal:
                </Typography>
                <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.875rem" }}>
                  {formatCurrency(venta.subtotal)}
                </Typography>
              </Box>

              {descuentoAplicado > 0 && (
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1, gap: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: "0.875rem", color: "#16a34a" }}>
                    Descuento:
                  </Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.875rem", color: "#16a34a" }}>
                    -{formatCurrency(descuentoAplicado)}
                  </Typography>
                </Box>
              )}

              {interesDelSistema > 0 && (
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1, gap: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: "0.875rem", color: "#f59e0b" }}>
                    Interés:
                  </Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.875rem", color: "#f59e0b" }}>
                    +{formatCurrency(interesDelSistema)}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: interesDeTarjeta > 0 ? 1 : 0, gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.9375rem" }}>
                  Sistema:
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#dc2626", fontSize: "0.9375rem" }}>
                  {formatCurrency(venta.total)}
                </Typography>
              </Box>

              {interesDeTarjeta > 0 && (
                <>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1, gap: 1 }}>
                    <Typography variant="body2" sx={{ fontSize: "0.875rem", color: "#1976d2" }}>
                      Interés tarjeta:
                    </Typography>
                    <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.875rem", color: "#1976d2" }}>
                      +{formatCurrency(interesDeTarjeta)}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1rem" }}>
                      Caja:
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#1976d2", fontSize: "1rem" }}>
                      {formatCurrency(venta.total_con_interes_tarjeta || venta.total)}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </Box>

          {/* Observaciones */}
          {venta.observaciones && (
            <Box
              sx={{
                mt: 2.5,
                backgroundColor: "#fff",
                borderRadius: 1.5,
                p: 2,
                border: "1px solid #e5e7eb",
              }}
            >
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", mb: 1, display: "block" }}
              >
                Observaciones
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "0.875rem", color: "#374151", whiteSpace: "pre-wrap" }}>
                {venta.observaciones}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2.5,
          borderTop: "1px solid #e5e7eb",
          backgroundColor: "#fafafa",
          flexShrink: 0,
          gap: 1,
        }}
      >
        {puedeRecrearVenta() && (
          <Button
            onClick={handleRecrearVenta}
            variant="outlined"
            sx={{
              borderColor: "#dc2626",
              color: "#dc2626",
              borderRadius: 2,
              px: 3,
              "&:hover": {
                borderColor: "#b91c1c",
                bgcolor: "#fef2f2",
              },
            }}
          >
            Recrear Venta
          </Button>
        )}
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            bgcolor: "#dc2626",
            borderRadius: 2,
            px: 3,
            "&:hover": { bgcolor: "#b91c1c" },
          }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default VentaDetalleModal
