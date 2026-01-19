"use client"

import {
  Dialog,
  DialogContent,
  DialogActions,
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
  Avatar,
} from "@mui/material"
import {
  Close as CloseIcon,
  Build as BuildIcon,
  Group as GroupIcon,
  CreditCard as CreditCardIcon,
  Percent as PercentIcon,
} from "@mui/icons-material"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { formatQuantity } from "../../utils/formatters"

const ServicioDetalleModal = ({ open, onClose, servicio }) => {
  if (!servicio) return null

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount || 0)
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
      TARJETA_CREDITO: "info",
      TRANSFERENCIA: "primary",
      CUENTA_CORRIENTE: "warning",
      PAGO_MULTIPLE: "secondary",
    }
    return colors[tipo] || "default"
  }

  const getTipoPagoLabel = (tipo) => {
    const labels = {
      EFECTIVO: "Efectivo",
      TARJETA_CREDITO: "Tarjeta de Crédito",
      TRANSFERENCIA: "Transferencia",
      CUENTA_CORRIENTE: "Cuenta Corriente",
      PAGO_MULTIPLE: "Pago Múltiple",
    }
    return labels[tipo] || tipo
  }

  const getEstadoColor = (estado) => {
    return estado === "COMPLETADA" ? "success" : "error"
  }

  const getUnidadLabel = (unidadMedida) => {
    return unidadMedida === "litro" ? "L" : "u"
  }

  const interesDelSistema = servicio.interes_sistema_monto || 0
  const descuentoAplicado = servicio.descuento || 0
  const interesDeTarjeta = servicio.interes_tarjeta_monto || 0
  const interesTarjetaPorcentaje = servicio.interes_tarjeta_porcentaje || 0

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
      {/* Header */}
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
              Servicio #{servicio.numero}
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
            {/* Información General */}
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
                      {formatDate(servicio.fecha_pago || servicio.created_at)}
                    </Typography>
                  </Box>
                  {servicio.usuario_nombre && (
                    <Box>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}
                      >
                        Registrado por
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: "#dc2626", fontSize: "0.75rem" }}>
                          {servicio.usuario_nombre.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" fontWeight={500} sx={{ color: "#171717", fontSize: "0.875rem" }}>
                          {servicio.usuario_nombre}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  <Box>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}
                    >
                      Cliente
                    </Typography>
                    <Typography variant="body2" fontWeight={500} sx={{ color: "#171717", fontSize: "0.875rem" }}>
                      {servicio.cliente_nombre && servicio.cliente_apellido
                        ? `${servicio.cliente_nombre} ${servicio.cliente_apellido}`
                        : "Cliente no encontrado"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}
                    >
                      Vehículo
                    </Typography>
                    <Typography variant="body2" fontWeight={500} sx={{ color: "#171717", fontSize: "0.875rem" }}>
                      {servicio.patente || "N/A"} - {servicio.marca} {servicio.modelo} ({servicio.año || "N/A"})
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
                      {servicio.sucursal_nombre || "N/A"}
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
                      <Chip
                        label={servicio.estado || "COMPLETADA"}
                        size="small"
                        color={getEstadoColor(servicio.estado || "COMPLETADA")}
                      />
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
                      <Chip
                        label={getTipoPagoLabel(servicio.tipo_pago) || "N/A"}
                        size="small"
                        color={getTipoPagoColor(servicio.tipo_pago)}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Información de Pago Múltiple */}
            {servicio.pago_dividido && servicio.pagos && servicio.pagos.length > 0 && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    backgroundColor: "#f0f9ff",
                    borderRadius: 1.5,
                    p: 2,
                    border: "1px solid #7dd3fc",
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#0369a1", mb: 1.5 }}>
                    Desglose de Pagos
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {servicio.pagos.map((pago, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          bgcolor: "#fff",
                          p: 1.5,
                          borderRadius: 1,
                          border: "1px solid #e0f2fe",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Chip
                            label={getTipoPagoLabel(pago.metodo_pago)}
                            size="small"
                            color={getTipoPagoColor(pago.metodo_pago)}
                            sx={{ fontWeight: 500 }}
                          />
                          <Typography variant="caption" sx={{ color: "#64748b" }}>
                            Pago {index + 1}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#0369a1" }}>
                          {formatCurrency(pago.monto)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Grid>
            )}

            {/* Información de Pago Múltiple (desde campos del servicio si no hay pagos) */}
            {servicio.pago_dividido && (!servicio.pagos || servicio.pagos.length === 0) && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    backgroundColor: "#f0f9ff",
                    borderRadius: 1.5,
                    p: 2,
                    border: "1px solid #7dd3fc",
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#0369a1", mb: 1.5 }}>
                    Desglose de Pagos
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {servicio.monto_pago_1 && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          bgcolor: "#fff",
                          p: 1.5,
                          borderRadius: 1,
                          border: "1px solid #e0f2fe",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Chip
                            label="Pago 1"
                            size="small"
                            color="success"
                            sx={{ fontWeight: 500 }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#0369a1" }}>
                          {formatCurrency(servicio.monto_pago_1)}
                        </Typography>
                      </Box>
                    )}
                    {servicio.tipo_pago_2 && servicio.monto_pago_2 && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          bgcolor: "#fff",
                          p: 1.5,
                          borderRadius: 1,
                          border: "1px solid #e0f2fe",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Chip
                            label={getTipoPagoLabel(servicio.tipo_pago_2)}
                            size="small"
                            color={getTipoPagoColor(servicio.tipo_pago_2)}
                            sx={{ fontWeight: 500 }}
                          />
                          <Typography variant="caption" sx={{ color: "#64748b" }}>
                            Pago 2
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#0369a1" }}>
                          {formatCurrency(servicio.monto_pago_2)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Grid>
            )}

            {/* Información de Tarjeta - Solo si NO es pago múltiple */}
            {!servicio.pago_dividido && servicio.tipo_pago === "TARJETA_CREDITO" &&
              (servicio.tarjeta_nombre || servicio.numero_cuotas || interesTarjetaPorcentaje > 0) && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      backgroundColor: "#eff6ff",
                      borderRadius: 1.5,
                      p: 2,
                      border: "1px solid #bfdbfe",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                      <CreditCardIcon sx={{ fontSize: 18, color: "#1976d2" }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#1976d2" }}>
                        Información de Pago con Tarjeta
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", alignItems: "flex-start" }}>
                      {servicio.tarjeta_nombre && (
                        <Box>
                          <Typography
                            variant="caption"
                            color="textSecondary"
                            sx={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}
                          >
                            Tarjeta
                          </Typography>
                          <Typography variant="body2" fontWeight={500} sx={{ color: "#1976d2" }}>
                            {servicio.tarjeta_nombre}
                          </Typography>
                        </Box>
                      )}
                      {servicio.numero_cuotas && (
                        <Box>
                          <Typography
                            variant="caption"
                            color="textSecondary"
                            sx={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}
                          >
                            Cuotas
                          </Typography>
                          <Typography variant="body2" fontWeight={500} sx={{ color: "#1976d2" }}>
                            {servicio.numero_cuotas}x
                          </Typography>
                        </Box>
                      )}
                      {interesTarjetaPorcentaje > 0 && (
                        <Box>
                          <Typography
                            variant="caption"
                            color="textSecondary"
                            sx={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}
                          >
                            Interés aplicado
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <PercentIcon sx={{ fontSize: 14, color: "#1976d2" }} />
                            <Typography variant="body2" fontWeight={500} sx={{ color: "#1976d2" }}>
                              {interesTarjetaPorcentaje}%
                            </Typography>
                          </Box>
                        </Box>
                      )}
                      {interesDeTarjeta > 0 && (
                        <Box>
                          <Typography
                            variant="caption"
                            color="textSecondary"
                            sx={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}
                          >
                            Monto del interés
                          </Typography>
                          <Typography variant="body2" fontWeight={500} sx={{ color: "#1976d2" }}>
                            {formatCurrency(interesDeTarjeta)}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Grid>
              )}

            {servicio.empleados && servicio.empleados.length > 0 && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    backgroundColor: "#f0fdf4",
                    borderRadius: 1.5,
                    p: 2,
                    border: "1px solid #bbf7d0",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                    <GroupIcon sx={{ fontSize: 18, color: "#16a34a" }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#16a34a" }}>
                      Empleados Asignados
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    {servicio.empleados.map((empleado) => (
                      <Box
                        key={empleado.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          bgcolor: "#fff",
                          px: 1.5,
                          py: 1,
                          borderRadius: 1,
                          border: "1px solid #dcfce7",
                        }}
                      >
                        <Avatar sx={{ width: 28, height: 28, bgcolor: "#16a34a", fontSize: "0.75rem" }}>
                          {empleado.nombre?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.813rem", color: "#166534" }}>
                            {empleado.nombre} {empleado.apellido}
                          </Typography>
                          {empleado.cargo && (
                            <Typography variant="caption" sx={{ fontSize: "0.7rem", color: "#4ade80" }}>
                              {empleado.cargo}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Grid>
            )}

            {servicio.estado === "CANCELADA" && (servicio.cancelado_por || servicio.fecha_cancelacion) && (
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
                    {servicio.cancelado_por && (
                      <Box>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}
                        >
                          Cancelado por
                        </Typography>
                        <Typography variant="body2" fontWeight={500} sx={{ color: "#dc2626" }}>
                          {servicio.cancelado_por}
                        </Typography>
                      </Box>
                    )}
                    {servicio.fecha_cancelacion && (
                      <Box>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}
                        >
                          Fecha
                        </Typography>
                        <Typography variant="body2" fontWeight={500} sx={{ color: "#dc2626" }}>
                          {formatDate(servicio.fecha_cancelacion)}
                        </Typography>
                      </Box>
                    )}
                    {servicio.motivo_cancelacion && (
                      <Box sx={{ flex: "1 1 100%" }}>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}
                        >
                          Motivo
                        </Typography>
                        <Typography variant="body2" fontWeight={500} sx={{ color: "#dc2626" }}>
                          {servicio.motivo_cancelacion}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>

          {servicio.items && servicio.items.length > 0 && (
            <Box sx={{ mt: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151", mb: 1 }}>
                Tipos de Servicios Realizados
              </Typography>

              <Box
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: 1.5,
                  border: "1px solid #e5e7eb",
                  overflow: "hidden",
                }}
              >
                {servicio.items.map((item, index) => (
                  <Box key={index}>
                    <Box
                      sx={{
                        p: 2.5,
                        borderBottom: index < servicio.items.length - 1 ? "1px solid #e5e7eb" : "none",
                        bgcolor: index % 2 === 0 ? "#fff" : "#fafafa",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <BuildIcon sx={{ fontSize: 18, color: "#dc2626" }} />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a" }}>
                              {item.tipo_servicio_nombre || `Servicio ${index + 1}`}
                            </Typography>
                            {item.tipo_servicio_descripcion && (
                              <Typography variant="caption" sx={{ color: "#64748b" }}>
                                {item.tipo_servicio_descripcion}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#dc2626" }}>
                          {formatCurrency(item.subtotal)}
                        </Typography>
                      </Box>

                      {item.descripcion && item.descripcion !== "Sin descripción" && (
                        <Box sx={{ mb: 1.5, pl: 3.5 }}>
                          <Typography
                            variant="caption"
                            sx={{ color: "#6b7280", fontWeight: 600, display: "block", mb: 0.5 }}
                          >
                            Descripción:
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#374151", fontSize: "0.813rem" }}>
                            {item.descripcion}
                          </Typography>
                        </Box>
                      )}

                      {item.observaciones && (
                        <Box
                          sx={{
                            mb: 1.5,
                            pl: 3.5,
                            bgcolor: "#fef3c7",
                            p: 1.5,
                            borderRadius: 1,
                            border: "1px solid #fde68a",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: "#92400e", fontWeight: 600, display: "block", mb: 0.5 }}
                          >
                            Observaciones:
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#78350f", fontSize: "0.813rem", whiteSpace: "pre-wrap" }}
                          >
                            {item.observaciones}
                          </Typography>
                        </Box>
                      )}

                      {item.notas && (
                        <Box
                          sx={{
                            mb: 1.5,
                            pl: 3.5,
                            bgcolor: "#dbeafe",
                            p: 1.5,
                            borderRadius: 1,
                            border: "1px solid #bfdbfe",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: "#1e40af", fontWeight: 600, display: "block", mb: 0.5 }}
                          >
                            Notas:
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#1e3a8a", fontSize: "0.813rem", whiteSpace: "pre-wrap" }}
                          >
                            {item.notas}
                          </Typography>
                        </Box>
                      )}

                      {/* Productos del Servicio */}
                      {item.productos && item.productos.length > 0 && (
                        <Box sx={{ pl: 3.5 }}>
                          <Typography
                            variant="caption"
                            sx={{ color: "#6b7280", fontWeight: 600, display: "block", mb: 1 }}
                          >
                            Productos utilizados:
                          </Typography>
                          <TableContainer sx={{ border: "1px solid #e5e7eb", borderRadius: 1 }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow sx={{ bgcolor: "#f9fafb" }}>
                                  <TableCell
                                    sx={{
                                      fontWeight: 600,
                                      color: "#374151",
                                      fontSize: "0.75rem",
                                      py: 1,
                                    }}
                                  >
                                    Producto
                                  </TableCell>
                                  <TableCell
                                    align="center"
                                    sx={{
                                      fontWeight: 600,
                                      color: "#374151",
                                      fontSize: "0.75rem",
                                      py: 1,
                                    }}
                                  >
                                    Cantidad
                                  </TableCell>
                                  <TableCell
                                    align="right"
                                    sx={{
                                      fontWeight: 600,
                                      color: "#374151",
                                      fontSize: "0.75rem",
                                      py: 1,
                                    }}
                                  >
                                    Precio Unit.
                                  </TableCell>
                                  <TableCell
                                    align="right"
                                    sx={{
                                      fontWeight: 600,
                                      color: "#374151",
                                      fontSize: "0.75rem",
                                      py: 1,
                                    }}
                                  >
                                    Subtotal
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {item.productos.map((prod, prodIndex) => (
                                  <TableRow key={prodIndex} sx={{ "&:hover": { bgcolor: "#f9fafb" } }}>
                                    <TableCell sx={{ py: 1 }}>
                                      <Typography variant="body2" sx={{ fontSize: "0.813rem" }}>
                                        {prod.producto_nombre || prod.nombre || "-"}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="center" sx={{ py: 1 }}>
                                      <Typography variant="body2" sx={{ fontSize: "0.813rem" }}>
                                        {formatQuantity(prod.cantidad, prod.unidad_medida)}{" "}
                                        {getUnidadLabel(prod.unidad_medida)}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ py: 1 }}>
                                      <Typography variant="body2" sx={{ fontSize: "0.813rem" }}>
                                        {formatCurrency(prod.precio_unitario)}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ py: 1 }}>
                                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.813rem" }}>
                                        {formatCurrency(prod.subtotal)}
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Resumen de Costos */}
          <Box
            sx={{
              mt: 2.5,
              backgroundColor: "#fff",
              borderRadius: 1.5,
              p: 2,
              border: "1px solid #e5e7eb",
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151", mb: 1.5 }}>
              Resumen de Costos
            </Typography>
            <Box sx={{ minWidth: "100%", maxWidth: 320, ml: "auto" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1, gap: 1 }}>
                <Typography variant="body2" sx={{ fontSize: "0.875rem", color: "#6b7280" }}>
                  Subtotal:
                </Typography>
                <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.875rem" }}>
                  {formatCurrency(servicio.subtotal)}
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
                  {formatCurrency(servicio.total)}
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
                      {formatCurrency(servicio.total_con_interes_tarjeta || servicio.total)}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </Box>

          {/* Observaciones Generales */}
          {servicio.observaciones && (
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
                Observaciones Generales
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "0.875rem", color: "#374151", whiteSpace: "pre-wrap" }}>
                {servicio.observaciones}
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

export default ServicioDetalleModal
