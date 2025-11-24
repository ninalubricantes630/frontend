"use client"

import { Box, Typography, Card, CardContent, Divider, IconButton } from "@mui/material"
import { MapPin, Users, Wrench, X, Plus, Minus } from "lucide-react"
import { formatQuantity } from "../../utils/formatters"
import { formatCurrency } from "../../utils/formatters"

const ConfirmacionServicio = ({
  formData,
  selectedCliente,
  selectedVehiculo,
  selectedSucursal,
  empleadosActivos,
  descuento,
  interes,
  onEditDescuento,
  onEditInteres,
}) => {
  const getEmpleadosInfo = () => {
    return empleadosActivos.filter((e) => formData.empleados.includes(e.id))
  }

  const getUnidadLabel = (unidadMedida) => {
    return unidadMedida === "litro" ? "l" : "u"
  }

  const hayDescuento = descuento && descuento.montoDescuento > 0
  const hayInteres = interes && interes.montoInteres > 0

  const subtotal = formData.items.reduce((sum, item) => {
    if (item.productos && Array.isArray(item.productos) && item.productos.length > 0) {
      return sum + item.productos.reduce((pSum, prod) => pSum + (prod.precio_unitario * prod.cantidad || 0), 0)
    }
    return sum + (Number.parseFloat(item.total) || 0)
  }, 0)

  const totalConDescuentoInteres =
    subtotal - (hayDescuento ? descuento.montoDescuento : 0) + (hayInteres ? interes.montoInteres : 0)

  const handleAbrirDescuento = () => {
    onEditDescuento(false)
  }

  const handleAbrirInteres = () => {
    onEditInteres(false)
  }

  const handleEliminarDescuento = () => {
    onEditDescuento(true)
  }

  const handleEliminarInteres = () => {
    onEditInteres(true)
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, height: "100%" }}>
      <Card
        elevation={0}
        sx={{ border: "1px solid #e5e7eb", borderRadius: 2, flex: 1, display: "flex", overflow: "hidden" }}
      >
        {/* Left Section - Cliente, Vehículo, Ubicación, Empleados */}
        <Box sx={{ flex: 0.35, borderRight: "1px solid #e5e7eb", overflow: "auto", bgcolor: "#f9fafb" }}>
          <CardContent sx={{ p: 3 }}>
            {/* Cliente */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "#6b7280",
                  mb: 1,
                  display: "block",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Cliente
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#171717", mb: 0.5 }}>
                {selectedCliente?.nombre} {selectedCliente?.apellido}
              </Typography>
              <Typography variant="caption" sx={{ color: "#6b7280", fontSize: "0.85rem" }}>
                DNI: {selectedCliente?.dni}
              </Typography>
            </Box>

            <Divider sx={{ my: 2, opacity: 0.5 }} />

            {/* Vehículo */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "#6b7280",
                  mb: 1,
                  display: "block",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Vehículo
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#dc2626", mb: 0.5 }}>
                {selectedVehiculo?.patente}
              </Typography>
              <Typography variant="caption" sx={{ color: "#6b7280", fontSize: "0.85rem", display: "block", mb: 0.25 }}>
                {selectedVehiculo?.marca} {selectedVehiculo?.modelo}
              </Typography>
              <Typography variant="caption" sx={{ color: "#6b7280", fontSize: "0.85rem" }}>
                Año: {selectedVehiculo?.año}
              </Typography>
            </Box>

            <Divider sx={{ my: 2, opacity: 0.5 }} />

            {/* Ubicación */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <MapPin size={16} color="#dc2626" />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: "#6b7280",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Sucursal
                </Typography>
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#171717" }}>
                {selectedSucursal?.nombre}
              </Typography>
            </Box>

            <Divider sx={{ my: 2, opacity: 0.5 }} />

            {/* Empleados */}
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Users size={16} color="#dc2626" />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: "#6b7280",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Empleados
                </Typography>
              </Box>
              {getEmpleadosInfo().length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                  {getEmpleadosInfo().map((empleado) => (
                    <Typography
                      key={empleado.id}
                      variant="caption"
                      sx={{ color: "#171717", fontWeight: 600, fontSize: "0.85rem" }}
                    >
                      • {empleado.nombre} {empleado.apellido}
                    </Typography>
                  ))}
                </Box>
              ) : (
                <Typography variant="caption" sx={{ color: "#94a3b8", fontStyle: "italic", fontSize: "0.85rem" }}>
                  Sin empleados asignados
                </Typography>
              )}
            </Box>
          </CardContent>
        </Box>

        {/* Right Section - Servicios */}
        <Box sx={{ flex: 0.65, overflow: "auto", bgcolor: "white" }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
              <Wrench size={18} color="#dc2626" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#171717" }}>
                Servicios ({formData.items.length})
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {formData.items.map((item, idx) => {
                let itemTotal = 0
                if (item.productos && Array.isArray(item.productos) && item.productos.length > 0) {
                  itemTotal = item.productos.reduce((sum, prod) => sum + (prod.precio_unitario * prod.cantidad || 0), 0)
                } else {
                  itemTotal = Number.parseFloat(item.total) || 0
                }

                return (
                  <Box key={item.id}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#171717", mb: 0.5 }}>
                          {idx + 1}. {item.tipoServicioNombre}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: "#dc2626", textAlign: "right", ml: 2 }}>
                        {formatCurrency(itemTotal)}
                      </Typography>
                    </Box>

                    {item.productos && item.productos.length > 0 && (
                      <Box sx={{ pl: 1, mb: 1.5 }}>
                        <Typography
                          variant="caption"
                          sx={{ color: "#6b7280", fontWeight: 600, display: "block", mb: 0.75, fontSize: "0.8rem" }}
                        >
                          Productos:
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                          {item.productos.map((prod, pIdx) => (
                            <Typography key={pIdx} variant="caption" sx={{ color: "#6b7280", fontSize: "0.8rem" }}>
                              • {prod.nombre} × {formatQuantity(prod.cantidad, prod.unidad_medida)}{" "}
                              {getUnidadLabel(prod.unidad_medida)} ={" "}
                              {formatCurrency(prod.precio_unitario * prod.cantidad)}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {idx < formData.items.length - 1 && <Divider sx={{ my: 1.5, opacity: 0.3 }} />}
                  </Box>
                )
              })}
            </Box>
          </CardContent>
        </Box>
      </Card>

      <Card elevation={0} sx={{ border: "2px solid #dc2626", bgcolor: "#fef2f2", borderRadius: 2 }}>
        <CardContent sx={{ p: 2 }}>
          {/* Descuento e Interés info */}
          {(hayDescuento || hayInteres) && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2, pb: 2, borderBottom: "1px solid #fee2e2" }}
            >
              {hayDescuento && (
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: "#16a34a", fontWeight: 600, fontSize: "0.75rem", display: "block" }}
                    >
                      Descuento {descuento.tipoDescuento === "porcentaje" ? `(${descuento.valorDescuento}%)` : ""}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#16a34a", fontWeight: 700 }}>
                      -{formatCurrency(descuento.montoDescuento)}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={handleEliminarDescuento}
                    sx={{
                      color: "#dc2626",
                      width: 28,
                      height: 28,
                      "&:hover": { bgcolor: "#fee2e2" },
                    }}
                    title="Eliminar descuento"
                  >
                    <X size={16} />
                  </IconButton>
                </Box>
              )}

              {hayInteres && (
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: "#f59e0b", fontWeight: 600, fontSize: "0.75rem", display: "block" }}
                    >
                      Interés {interes.tipoInteres === "porcentaje" ? `(${interes.valorInteres}%)` : ""}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#f59e0b", fontWeight: 700 }}>
                      +{formatCurrency(interes.montoInteres)}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={handleEliminarInteres}
                    sx={{
                      color: "#dc2626",
                      width: 28,
                      height: 28,
                      "&:hover": { bgcolor: "#fee2e2" },
                    }}
                    title="Eliminar interés"
                  >
                    <X size={16} />
                  </IconButton>
                </Box>
              )}
            </Box>
          )}

          {/* Total a Pagar con botones de descuento e interés */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#171717" }}>
              Total a Pagar:
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {!hayDescuento && (
                <IconButton
                  size="small"
                  onClick={handleAbrirDescuento}
                  sx={{
                    color: "#16a34a",
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "transparent",
                    border: "1.5px solid #16a34a",
                    borderRadius: "6px",
                    "&:hover": { bgcolor: "#dcfce7" },
                    p: 0,
                  }}
                  title="Agregar descuento"
                >
                  <Minus size={18} strokeWidth={3} />
                </IconButton>
              )}

              {!hayInteres && (
                <IconButton
                  size="small"
                  onClick={handleAbrirInteres}
                  sx={{
                    color: "#eab308",
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "transparent",
                    border: "1.5px solid #eab308",
                    borderRadius: "6px",
                    "&:hover": { bgcolor: "#fef08a" },
                    p: 0,
                  }}
                  title="Agregar interés"
                >
                  <Plus size={18} strokeWidth={3} />
                </IconButton>
              )}

              <Typography variant="h5" sx={{ fontWeight: 800, color: "#dc2626", ml: 1 }}>
                {formatCurrency(totalConDescuentoInteres)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default ConfirmacionServicio
