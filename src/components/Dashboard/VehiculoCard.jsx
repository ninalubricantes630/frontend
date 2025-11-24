"use client"
import { Card, CardContent, Typography, Box, Chip, Button, Paper } from "@mui/material"
import {
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Description as DescriptionIcon,
  Visibility as VisibilityIcon,
  Phone as PhoneIcon,
  Speed as SpeedIcon,
  Info as InfoIcon,
} from "@mui/icons-material"

const VehiculoCard = ({ vehiculo }) => {
  const handleVerTodosServicios = () => {
    window.location.href = `/reportes?vehiculo=${vehiculo.patente}`
  }

  const handleVerDetalleServicio = (servicio) => {
    window.location.href = `/reportes?servicio=${servicio.id}&autoOpen=true`
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card
      elevation={0}
      sx={{
        width: "100%",
        border: "1px solid",
        borderColor: "grey.200",
        borderRadius: 2,
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          borderColor: "#dc2626",
          transition: "all 0.2s ease",
        },
        bgcolor: "white",
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        {/* Header del Vehículo */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                p: 1,
                bgcolor: "#dc2626",
                borderRadius: 1.5,
              }}
            >
              <CarIcon sx={{ color: "white", fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: "600", color: "#171717", mb: 0.25, fontSize: "1.25rem" }}>
                {vehiculo.patente}
              </Typography>
              <Typography variant="body1" sx={{ color: "#6b7280", mb: 0.75, fontSize: "0.9375rem" }}>
                {vehiculo.marca} {vehiculo.modelo} {vehiculo.año}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {vehiculo.kilometraje && (
                  <Chip
                    icon={<SpeedIcon sx={{ fontSize: "0.875rem" }} />}
                    label={`${vehiculo.kilometraje.toLocaleString()} km`}
                    size="small"
                    sx={{
                      bgcolor: "#f8fafc",
                      color: "#475569",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      height: 24,
                      border: "1px solid",
                      borderColor: "grey.200",
                    }}
                  />
                )}
                {vehiculo.observaciones && (
                  <Chip
                    icon={<InfoIcon sx={{ fontSize: "0.875rem" }} />}
                    label="Con observaciones"
                    size="small"
                    sx={{
                      bgcolor: "#fffbeb",
                      color: "#92400e",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      height: 24,
                      border: "1px solid #fcd34d",
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              bgcolor: "#f8fafc",
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: "grey.200",
              minWidth: 180,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
              <PersonIcon sx={{ fontSize: 14, color: "#6b7280" }} />
              <Typography
                variant="caption"
                sx={{ color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.6875rem" }}
              >
                Propietario
              </Typography>
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: "600", color: "#171717", mb: 0.5, fontSize: "0.875rem" }}>
              {vehiculo.cliente_nombre}
            </Typography>
            {vehiculo.cliente_dni && (
              <Typography variant="caption" sx={{ display: "block", color: "#6b7280", mb: 0.25, fontSize: "0.75rem" }}>
                DNI: {vehiculo.cliente_dni}
              </Typography>
            )}
            {vehiculo.cliente_telefono && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <PhoneIcon sx={{ fontSize: 12, color: "#6b7280" }} />
                <Typography variant="caption" sx={{ color: "#6b7280", fontSize: "0.75rem" }}>
                  {vehiculo.cliente_telefono}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>

        {vehiculo.observaciones && (
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              mb: 2.5,
              border: "1px solid #fcd34d",
              borderRadius: 1.5,
              bgcolor: "#fffbeb",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
              <InfoIcon sx={{ fontSize: 14, color: "#92400e" }} />
              <Typography variant="subtitle2" sx={{ fontWeight: "600", color: "#92400e", fontSize: "0.8125rem" }}>
                Observaciones del Vehículo
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: "#92400e", fontSize: "0.8125rem" }}>
              {vehiculo.observaciones}
            </Typography>
          </Paper>
        )}

        <Paper
          elevation={0}
          sx={{
            bgcolor: "#fef2f2",
            border: "1px solid #fca5a5",
            borderRadius: 1.5,
          }}
        >
          <Box sx={{ p: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    p: 0.75,
                    bgcolor: "#dc2626",
                    borderRadius: 1.5,
                  }}
                >
                  <DescriptionIcon sx={{ color: "white", fontSize: 18 }} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: "600", color: "#dc2626", fontSize: "1rem" }}>
                  Historial de Servicios
                </Typography>
              </Box>
              <Chip
                label={`${vehiculo.servicios?.length || 0} servicio${(vehiculo.servicios?.length || 0) !== 1 ? "s" : ""}`}
                sx={{
                  bgcolor: "#dc2626",
                  color: "white",
                  fontSize: "0.8125rem",
                  fontWeight: "500",
                  height: 26,
                  px: 1.5,
                }}
              />
            </Box>

            {vehiculo.servicios && vehiculo.servicios.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {vehiculo.servicios.slice(0, 3).map((servicio, index) => {
                  return (
                    <Paper
                      key={index}
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: "white",
                        border: "1px solid #fecaca",
                        borderRadius: 1.5,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                        <Chip
                          label={servicio.numero}
                          sx={{
                            bgcolor: "#dc2626",
                            color: "white",
                            fontWeight: "500",
                            fontSize: "0.8125rem",
                            height: 26,
                          }}
                        />
                        {index === 0 && (
                          <Chip
                            label="Más Reciente"
                            size="small"
                            variant="outlined"
                            sx={{
                              color: "#dc2626",
                              borderColor: "#fca5a5",
                              fontSize: "0.6875rem",
                              fontWeight: "500",
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                              height: 22,
                            }}
                          />
                        )}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: "500", color: "#171717", mb: 1.5, fontSize: "0.875rem" }}
                      >
                        {servicio.descripcion}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          <EventIcon sx={{ fontSize: 14, color: "#6b7280" }} />
                          <Typography variant="body2" sx={{ color: "#6b7280", fontSize: "0.8125rem" }}>
                            {formatDate(servicio.fecha_creacion)}
                          </Typography>
                        </Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: "600", color: "#16a34a", fontSize: "1rem" }}>
                          {formatCurrency(
                            servicio.total_con_interes_tarjeta || servicio.total_con_interes || servicio.total || 0,
                          )}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button
                          onClick={() => handleVerDetalleServicio(servicio)}
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          sx={{
                            color: "#dc2626",
                            borderColor: "#fca5a5",
                            "&:hover": {
                              bgcolor: "#fef2f2",
                              borderColor: "#dc2626",
                            },
                            borderRadius: 1.5,
                            textTransform: "none",
                            fontWeight: "500",
                            fontSize: "0.8125rem",
                            py: 0.5,
                            px: 2,
                          }}
                        >
                          Ver Detalle
                        </Button>
                      </Box>
                    </Paper>
                  )
                })}

                {vehiculo.servicios.length > 3 && (
                  <Box sx={{ textAlign: "center", py: 0.75 }}>
                    <Typography variant="body2" sx={{ color: "#dc2626", fontWeight: "500", fontSize: "0.8125rem" }}>
                      + {vehiculo.servicios.length - 3} servicio{vehiculo.servicios.length - 3 !== 1 ? "s" : ""} más
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 3 }}>
                <DescriptionIcon sx={{ fontSize: 40, color: "#d1d5db", mb: 1 }} />
                <Typography variant="subtitle1" sx={{ color: "#9ca3af", fontSize: "0.9375rem" }}>
                  No hay servicios registrados para este vehículo
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 2.5 }}>
          <Button
            onClick={handleVerTodosServicios}
            variant="contained"
            size="medium"
            sx={{
              bgcolor: "#dc2626",
              "&:hover": { bgcolor: "#b91c1c" },
              borderRadius: 1.5,
              textTransform: "none",
              fontWeight: "600",
              px: 3,
              py: 1,
              fontSize: "0.9375rem",
            }}
          >
            Ver Historial Completo del Vehículo
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

export default VehiculoCard
