"use client"
import { Card, CardContent, Typography, Box, Chip, Grid, Button, Divider, Paper } from "@mui/material"
import {
  Person as PersonIcon,
  DirectionsCar as CarIcon,
  Build as BuildIcon,
  Phone as PhoneIcon,
  Launch as LaunchIcon,
  AttachMoney as MoneyIcon,
  Description as DescriptionIcon,
  Chat as ChatIcon,
} from "@mui/icons-material"

const ClienteCard = ({ cliente }) => {
  const handleViewAllServices = () => {
    window.location.href = `/reportes?cliente=${cliente.id}`
  }

  const handleViewServiceDetail = (servicioId) => {
    window.location.href = `/reportes?servicio=${servicioId}&autoOpen=true`
  }

  const vehiculos = cliente.vehiculos || []
  const servicios = cliente.servicios || []

  const latestService = servicios.length > 0 ? servicios[0] : null

  const getVehicleForService = (servicio) => {
    return vehiculos.find((v) => v.id === servicio.vehiculo_id) || null
  }

  const getServiceTypesCount = (servicio) => {
    return servicio.items_count || servicio.items?.length || 1
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"

    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "N/A"
      }
      return date.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return "N/A"
    }
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
      <Box
        sx={{
          p: 2.5,
          bgcolor: "#fef2f2",
          borderBottom: "1px solid",
          borderBottomColor: "#fecaca",
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                p: 1,
                bgcolor: "#dc2626",
                borderRadius: 1.5,
              }}
            >
              <PersonIcon sx={{ color: "white", fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: "600", color: "#171717", mb: 0.25, fontSize: "1.125rem" }}>
                {cliente.nombre} {cliente.apellido}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                {cliente.dni && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <PersonIcon sx={{ fontSize: 12, color: "#6b7280" }} />
                    <Typography variant="caption" sx={{ color: "#6b7280", fontSize: "0.75rem" }}>
                      DNI: {cliente.dni}
                    </Typography>
                  </Box>
                )}
                {cliente.telefono && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <PhoneIcon sx={{ fontSize: 12, color: "#6b7280" }} />
                    <Typography variant="caption" sx={{ color: "#6b7280", fontSize: "0.75rem" }}>
                      {cliente.telefono}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip
              label={`${vehiculos.length} ${vehiculos.length !== 1 ? "vehículos" : "vehículo"}`}
              size="small"
              sx={{
                bgcolor: "white",
                color: "#dc2626",
                border: "1px solid #fca5a5",
                fontWeight: "500",
                fontSize: "0.75rem",
                height: 24,
              }}
            />
            <Chip
              label={`${servicios.length} ${servicios.length !== 1 ? "servicios" : "servicio"}`}
              size="small"
              sx={{
                bgcolor: "#dc2626",
                color: "white",
                fontWeight: "500",
                fontSize: "0.75rem",
                height: 24,
              }}
            />
          </Box>
        </Box>
      </Box>

      <CardContent sx={{ p: 2.5 }}>
        {/* Vehículos Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <CarIcon sx={{ color: "#dc2626", fontSize: 18 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: "600", color: "#171717", fontSize: "0.9375rem" }}>
              Vehículos
            </Typography>
            <Chip
              label={vehiculos.length}
              size="small"
              sx={{
                bgcolor: "#fef2f2",
                color: "#dc2626",
                fontSize: "0.6875rem",
                fontWeight: "500",
                height: 20,
                minWidth: 20,
              }}
            />
          </Box>

          {vehiculos.length > 0 ? (
            <Grid container spacing={1.5}>
              {vehiculos.map((vehiculo, index) => (
                <Grid item xs={12} md={6} key={vehiculo.id || index}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      bgcolor: "#f8fafc",
                      border: "1px solid",
                      borderColor: "grey.200",
                      borderRadius: 1.5,
                      "&:hover": {
                        borderColor: "#fca5a5",
                        transition: "border-color 0.2s ease",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "600", color: "#171717", fontSize: "0.875rem" }}
                        >
                          {vehiculo.patente}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#6b7280", fontSize: "0.75rem" }}>
                          {vehiculo.marca} {vehiculo.modelo}
                        </Typography>
                      </Box>
                      {vehiculo.año && (
                        <Chip
                          label={vehiculo.año}
                          size="small"
                          variant="outlined"
                          sx={{
                            color: "#dc2626",
                            borderColor: "#fca5a5",
                            fontSize: "0.75rem",
                            height: 22,
                          }}
                        />
                      )}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: "center", py: 2.5 }}>
              <Typography variant="body2" sx={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                No hay vehículos registrados
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2.5 }} />

        {/* Último Servicio Section */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <BuildIcon sx={{ color: "#dc2626", fontSize: 18 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: "600", color: "#171717", fontSize: "0.9375rem" }}>
              Último Servicio
            </Typography>
          </Box>

          {servicios.length > 0 && latestService ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  bgcolor: "#fef2f2",
                  border: "1px solid #fca5a5",
                  borderRadius: 1.5,
                  "&:hover": {
                    borderColor: "#dc2626",
                    transition: "border-color 0.2s ease",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: "600", color: "#171717", fontSize: "1rem" }}>
                      {latestService.numero}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#6b7280", fontSize: "0.75rem" }}>
                      {formatDate(latestService.created_at)}
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                  <Grid item xs={12} md={4}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        bgcolor: "white",
                        border: "1px solid #fecaca",
                        borderRadius: 1.5,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <BuildIcon sx={{ color: "#dc2626", fontSize: 14 }} />
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#6b7280",
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                            fontSize: "0.6875rem",
                          }}
                        >
                          Servicios
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: "600", color: "#dc2626", fontSize: "0.875rem" }}>
                          {getServiceTypesCount(latestService)} tipo
                          {getServiceTypesCount(latestService) !== 1 ? "s" : ""}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>

                  {(() => {
                    const vehicle = getVehicleForService(latestService)
                    return vehicle ? (
                      <Grid item xs={12} md={4}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.5,
                            bgcolor: "white",
                            border: "1px solid #fecaca",
                            borderRadius: 1.5,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <CarIcon sx={{ color: "#dc2626", fontSize: 14 }} />
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#6b7280",
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                                fontSize: "0.6875rem",
                              }}
                            >
                              Vehículo
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "600", color: "#dc2626", fontSize: "0.875rem" }}
                            >
                              {vehicle.patente}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#6b7280", fontSize: "0.6875rem" }}>
                              {vehicle.marca} {vehicle.modelo}
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    ) : null
                  })()}

                  {latestService.precio_referencia && (
                    <Grid item xs={12} md={4}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          bgcolor: "white",
                          border: "1px solid #fecaca",
                          borderRadius: 1.5,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <MoneyIcon sx={{ color: "#dc2626", fontSize: 14 }} />
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#6b7280",
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                              fontSize: "0.6875rem",
                            }}
                          >
                            Precio
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "600", color: "#dc2626", fontSize: "0.875rem" }}
                          >
                            ${Number.parseFloat(latestService.precio_referencia).toLocaleString()}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  )}
                </Grid>

                {(latestService.observaciones || latestService.notas) && (
                  <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                    {latestService.observaciones && (
                      <Grid item xs={12} md={6}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.5,
                            bgcolor: "white",
                            border: "1px solid #fecaca",
                            borderRadius: 1.5,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}>
                            <DescriptionIcon sx={{ color: "#dc2626", fontSize: 14 }} />
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#6b7280",
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                                fontWeight: "500",
                                fontSize: "0.6875rem",
                              }}
                            >
                              Observaciones
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#171717",
                              fontSize: "0.8125rem",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {latestService.observaciones}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}

                    {latestService.notas && (
                      <Grid item xs={12} md={6}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.5,
                            bgcolor: "white",
                            border: "1px solid #fecaca",
                            borderRadius: 1.5,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}>
                            <ChatIcon sx={{ color: "#dc2626", fontSize: 14 }} />
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#6b7280",
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                                fontWeight: "500",
                                fontSize: "0.6875rem",
                              }}
                            >
                              Notas Internas
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#171717",
                              fontSize: "0.8125rem",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {latestService.notas}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                )}

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    onClick={() => handleViewServiceDetail(latestService.id)}
                    variant="contained"
                    size="small"
                    endIcon={<LaunchIcon />}
                    sx={{
                      bgcolor: "#dc2626",
                      "&:hover": { bgcolor: "#b91c1c" },
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

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: "#f8fafc",
                  border: "1px solid",
                  borderColor: "grey.200",
                  borderRadius: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: "600", color: "#171717", fontSize: "0.9375rem" }}>
                    Historial Completo
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6b7280", fontSize: "0.8125rem" }}>
                    {servicios.length} servicio{servicios.length !== 1 ? "s" : ""} registrado
                    {servicios.length !== 1 ? "s" : ""}
                  </Typography>
                </Box>
                <Button
                  onClick={handleViewAllServices}
                  variant="contained"
                  size="small"
                  endIcon={<LaunchIcon />}
                  sx={{
                    bgcolor: "#dc2626",
                    "&:hover": { bgcolor: "#b91c1c" },
                    borderRadius: 1.5,
                    textTransform: "none",
                    fontWeight: "500",
                    fontSize: "0.8125rem",
                    py: 0.5,
                    px: 2,
                  }}
                >
                  Ver Todos
                </Button>
              </Paper>
            </Box>
          ) : (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <BuildIcon sx={{ fontSize: 28, color: "#d1d5db", mb: 0.75 }} />
              <Typography variant="body2" sx={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                No hay servicios registrados
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default ClienteCard
