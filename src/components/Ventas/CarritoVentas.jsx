"use client"

import { Box, Paper, Typography, IconButton, Button, List, ListItem } from "@mui/material"
import {
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  Edit as EditIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material"

import { formatCurrency, formatQuantity } from "../../utils/formatters"

const CarritoVentas = ({
  items,
  onRemoveItem,
  onProcesarVenta,
  onEditItem,
  subtotal,
  descuento,
  onEditDescuento,
  interes,
  onEditInteres,
  total,
  loading,
}) => {
  const getUnidadLabel = (unidadMedida) => {
    return unidadMedida === "litro" ? "litros" : "unidad"
  }

  const formatearCantidad = (cantidad, unidadMedida) => {
    if (unidadMedida === "litro") {
      return formatQuantity(cantidad, unidadMedida)
    }
    return Math.round(cantidad).toString()
  }

  const hayDescuento = descuento && descuento.montoDescuento > 0
  const hayInteres = interes && interes.montoInteres > 0

  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid #e5e7eb",
      }}
    >
      <Box
        sx={{
          bgcolor: "#dc2626",
          color: "white",
          p: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <ShoppingCartIcon sx={{ fontSize: 20 }} />
        <Typography variant="h6" fontWeight={600} sx={{ fontSize: "1rem" }}>
          Carrito
        </Typography>
        {items.length > 0 && (
          <Typography sx={{ ml: "auto", fontWeight: 600, fontSize: "0.9rem" }}>
            {items.length} {items.length === 1 ? "producto" : "productos"}
          </Typography>
        )}
      </Box>

      {items.length === 0 ? (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 4,
          }}
        >
          <ShoppingCartIcon sx={{ fontSize: 56, color: "#d1d5db", mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom sx={{ fontSize: "1rem", fontWeight: 500 }}>
            Carrito Vacío
          </Typography>
          <Typography variant="body2" color="textSecondary" textAlign="center" sx={{ fontSize: "0.875rem" }}>
            Agrega productos para comenzar una venta
          </Typography>
        </Box>
      ) : (
        <>
          <List sx={{ flex: 1, overflow: "auto", p: 0 }}>
            {items.map((item) => (
              <ListItem
                key={item.producto_id}
                onClick={() => onEditItem(item)}
                sx={{
                  borderBottom: "1px solid #f3f4f6",
                  flexDirection: "column",
                  alignItems: "stretch",
                  py: 1.5,
                  px: 2,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  position: "relative",
                  "&:hover": {
                    bgcolor: "#f9fafb",
                  },
                }}
              >
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveItem(item.producto_id)
                  }}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    color: "#dc2626",
                    width: 28,
                    height: 28,
                    "&:hover": { bgcolor: "#fef2f2" },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>

                {/* Nombre y descripción */}
                <Box sx={{ mb: 0.75, width: "100%", pr: 4 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ color: "#171717", fontSize: "0.9rem" }}>
                    {item.nombre}
                  </Typography>
                  {item.descripcion && (
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ fontSize: "0.75rem", display: "block", mt: 0.25 }}
                    >
                      {item.descripcion}
                    </Typography>
                  )}
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    mt: 0.75,
                  }}
                >
                  {/* Precio unitario y cantidad a la par */}
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: "0.85rem", fontWeight: 500 }}>
                      {formatCurrency(item.precio_unitario)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#dc2626",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                      }}
                    >
                      {formatearCantidad(item.cantidad, item.unidad_medida)} {getUnidadLabel(item.unidad_medida)}
                    </Typography>
                  </Box>

                  {/* Subtotal en el lado derecho */}
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    sx={{
                      color: "#dc2626",
                      fontSize: "0.9rem",
                    }}
                  >
                    {formatCurrency(item.subtotal)}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>

          <Box sx={{ p: 2, bgcolor: "#f9fafb", borderTop: "1px solid #e5e7eb" }}>
            {/* Subtotal */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="body2" sx={{ color: "#6b7280", fontSize: "0.875rem" }}>
                Subtotal:
              </Typography>
              <Typography variant="body2" sx={{ color: "#6b7280", fontSize: "0.875rem", fontWeight: 500 }}>
                {formatCurrency(subtotal)}
              </Typography>
            </Box>

            {/* Descuento */}
            {hayDescuento ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
                onClick={onEditDescuento}
                style={{ cursor: "pointer" }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography variant="body2" sx={{ color: "#16a34a", fontSize: "0.875rem" }}>
                    Descuento {descuento.tipoDescuento === "porcentaje" ? `(${descuento.valorDescuento}%)` : ""}:
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditDescuento()
                    }}
                    sx={{
                      width: 20,
                      height: 20,
                      color: "#16a34a",
                      "&:hover": { bgcolor: "#dcfce7" },
                    }}
                  >
                    <SettingsIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
                <Typography variant="body2" sx={{ color: "#16a34a", fontSize: "0.875rem", fontWeight: 500 }}>
                  -{formatCurrency(descuento.montoDescuento)}
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "#f3f4f6", borderRadius: 1 },
                }}
                onClick={onEditDescuento}
              >
                <Typography variant="body2" sx={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                  Agregar descuento
                </Typography>
                <EditIcon sx={{ fontSize: 16, color: "#9ca3af" }} />
              </Box>
            )}

            {/* Interés */}
            {hayInteres ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                  pb: 1,
                  borderBottom: "1px solid #e5e7eb",
                }}
                onClick={onEditInteres}
                style={{ cursor: "pointer" }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography variant="body2" sx={{ color: "#f59e0b", fontSize: "0.875rem" }}>
                    Interés {interes.tipoInteres === "porcentaje" ? `(${interes.valorInteres}%)` : ""}:
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditInteres()
                    }}
                    sx={{
                      width: 20,
                      height: 20,
                      color: "#f59e0b",
                      "&:hover": { bgcolor: "#fef3c7" },
                    }}
                  >
                    <SettingsIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
                <Typography variant="body2" sx={{ color: "#f59e0b", fontSize: "0.875rem", fontWeight: 500 }}>
                  +{formatCurrency(interes.montoInteres)}
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1.5,
                  pb: 1,
                  borderBottom: "1px solid #e5e7eb",
                  cursor: "pointer",
                  "&:hover": { bgcolor: "#f3f4f6", borderRadius: 1 },
                }}
                onClick={onEditInteres}
              >
                <Typography variant="body2" sx={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                  Agregar interés
                </Typography>
                <EditIcon sx={{ fontSize: 16, color: "#9ca3af" }} />
              </Box>
            )}

            {/* Total */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="body1" fontWeight={600} sx={{ color: "#171717" }}>
                Total:
              </Typography>
              <Typography variant="h4" fontWeight={600} sx={{ color: "#dc2626" }}>
                {formatCurrency(total)}
              </Typography>
            </Box>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={onProcesarVenta}
              disabled={loading}
              sx={{
                bgcolor: "#16a34a",
                py: 1.2,
                fontSize: "1rem",
                fontWeight: 600,
                borderRadius: 1.5,
                "&:hover": { bgcolor: "#15803d" },
                "&:disabled": { bgcolor: "#d1d5db" },
              }}
            >
              {loading ? "Procesando..." : "Procesar Venta (F1)"}
            </Button>
          </Box>
        </>
      )}
    </Paper>
  )
}

export default CarritoVentas
