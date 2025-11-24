"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useSearchParams } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Typography,
  Button,
  TextField,
  Tabs,
  Tab,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  Backdrop,
  InputAdornment,
  Divider,
} from "@mui/material"
import {
  Settings,
  Business,
  Person,
  Save,
  Email,
  Phone,
  LocationOn,
  Description,
  Lock,
  Cancel,
  CreditCard,
} from "@mui/icons-material"
import { useAuth } from "../../contexts/AuthContext"
import configuracionService from "../../services/configuracionService"
import ChangePasswordModal from "../../components/Auth/ChangePasswordModal"

const businessSchema = yup.object({
  nombreNegocio: yup.string().required("El nombre del negocio es requerido"),
  direccion: yup.string().required("La dirección es requerida"),
  telefono: yup.string().required("El teléfono es requerido"),
  email: yup.string().email("Email inválido").required("El email es requerido"),
})

const ConfiguracionPage = () => {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false)
  const navigate = useNavigate()

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  })

  const [activeTab, setActiveTab] = useState(searchParams.get("tab") === "profile" ? 1 : 0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(businessSchema),
    defaultValues: {
      nombreNegocio: "Nina Lubricantes",
      direccion: "",
      telefono: "",
      email: "",
      cuit: "",
    },
  })

  useEffect(() => {
    cargarConfiguracion()
  }, [])

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab === "profile") {
      setActiveTab(1)
    } else {
      setActiveTab(0)
    }
  }, [searchParams])

  const cargarConfiguracion = async () => {
    try {
      setInitialLoading(true)
      console.log("[v0] Loading configuration...")

      const config = await configuracionService.getConfiguracion()
      console.log("[v0] Configuration loaded:", config)

      if (config) {
        Object.keys(config).forEach((key) => {
          console.log(`[v0] Setting field ${key} = ${config[key]}`)
          setValue(key, config[key])
        })
      }
    } catch (error) {
      console.error("[v0] Error loading configuration:", error)
      setSnackbar({
        open: true,
        message: "Error al cargar la configuración",
        severity: "error",
      })
    } finally {
      setInitialLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      await configuracionService.updateConfiguracion(data)
      setSnackbar({
        open: true,
        message: "Configuración guardada exitosamente",
        severity: "success",
      })
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error al guardar la configuración",
        severity: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  if (initialLoading) {
    return (
      <Backdrop open={true} sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <CircularProgress sx={{ color: "#dc2626" }} />
          <Typography sx={{ mt: 2 }}>Cargando configuración...</Typography>
        </Box>
      </Backdrop>
    )
  }

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", bgcolor: "#f8fafc" }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid #e5e7eb",
          px: { xs: 2, sm: 2, md: 2 },
          py: { xs: 2, sm: 2.5 },
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              variant="h5"
              component="h1"
              sx={{ fontWeight: 700, color: "#0f172a", mb: 0.5, letterSpacing: "-0.025em" }}
            >
              Configuración
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.875rem" }}>
              Gestiona la información del negocio, tu perfil y configuraciones generales
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, p: 2, overflow: "auto" }}>
        <Box
          sx={{
            bgcolor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 1,
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
            overflow: "hidden",
          }}
        >
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              borderBottom: "1px solid #e5e7eb",
              bgcolor: "#fafafa",
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.875rem",
                color: "#64748b",
                minHeight: 56,
                py: 1.5,
              },
              "& .Mui-selected": {
                color: "#dc2626 !important",
                fontWeight: 600,
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#dc2626",
                height: 3,
              },
            }}
          >
            <Tab icon={<Business sx={{ fontSize: 20 }} />} label="Información del Negocio" iconPosition="start" />
            <Tab icon={<Person sx={{ fontSize: 20 }} />} label="Mi Perfil" iconPosition="start" />
          </Tabs>

          {/* Tab Content */}
          <Box sx={{ p: 3 }}>
            {activeTab === 0 && (
              <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <Box sx={{ mb: 3, pb: 2, borderBottom: "1px solid #e5e7eb" }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: "#0f172a",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        bgcolor: "#fee2e2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Business sx={{ fontSize: 18, color: "#dc2626" }} />
                    </Box>
                    Datos del Negocio
                  </Typography>
                </Box>

                <Grid container spacing={2.5}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Nombre del Negocio"
                      {...register("nombreNegocio")}
                      error={!!errors.nombreNegocio}
                      helperText={errors.nombreNegocio?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Business sx={{ fontSize: 18, color: "#64748b" }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#fafafa",
                          fontSize: "0.875rem",
                          "& fieldset": {
                            borderColor: "#e5e7eb",
                          },
                          "&:hover fieldset": {
                            borderColor: "#cbd5e1",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#dc2626",
                            borderWidth: "1px",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: "0.875rem",
                          "&.Mui-focused": {
                            color: "#dc2626",
                          },
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="CUIT"
                      placeholder="XX-XXXXXXXX-X"
                      {...register("cuit")}
                      error={!!errors.cuit}
                      helperText={errors.cuit?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Description sx={{ fontSize: 18, color: "#64748b" }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#fafafa",
                          fontSize: "0.875rem",
                          "& fieldset": {
                            borderColor: "#e5e7eb",
                          },
                          "&:hover fieldset": {
                            borderColor: "#cbd5e1",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#dc2626",
                            borderWidth: "1px",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: "0.875rem",
                          "&.Mui-focused": {
                            color: "#dc2626",
                          },
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Dirección"
                      {...register("direccion")}
                      error={!!errors.direccion}
                      helperText={errors.direccion?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOn sx={{ fontSize: 18, color: "#64748b" }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#fafafa",
                          fontSize: "0.875rem",
                          "& fieldset": {
                            borderColor: "#e5e7eb",
                          },
                          "&:hover fieldset": {
                            borderColor: "#cbd5e1",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#dc2626",
                            borderWidth: "1px",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: "0.875rem",
                          "&.Mui-focused": {
                            color: "#dc2626",
                          },
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Teléfono"
                      {...register("telefono")}
                      error={!!errors.telefono}
                      helperText={errors.telefono?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone sx={{ fontSize: 18, color: "#64748b" }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#fafafa",
                          fontSize: "0.875rem",
                          "& fieldset": {
                            borderColor: "#e5e7eb",
                          },
                          "&:hover fieldset": {
                            borderColor: "#cbd5e1",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#dc2626",
                            borderWidth: "1px",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: "0.875rem",
                          "&.Mui-focused": {
                            color: "#dc2626",
                          },
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Email"
                      type="email"
                      {...register("email")}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ fontSize: 18, color: "#64748b" }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#fafafa",
                          fontSize: "0.875rem",
                          "& fieldset": {
                            borderColor: "#e5e7eb",
                          },
                          "&:hover fieldset": {
                            borderColor: "#cbd5e1",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#dc2626",
                            borderWidth: "1px",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: "0.875rem",
                          "&.Mui-focused": {
                            color: "#dc2626",
                          },
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 1.5,
                    mt: 4,
                    pt: 3,
                    borderTop: "1px solid #e5e7eb",
                  }}
                >          
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={
                      loading ? <CircularProgress size={16} color="inherit" /> : <Save sx={{ fontSize: 18 }} />
                    }
                    sx={{
                      bgcolor: "#dc2626",
                      color: "white",
                      px: 2.5,
                      py: 0.75,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      textTransform: "none",
                      boxShadow: "0 1px 2px 0 rgba(220, 38, 38, 0.15)",
                      "&:hover": {
                        bgcolor: "#b91c1c",
                        boxShadow: "0 4px 6px -1px rgba(220, 38, 38, 0.2)",
                      },
                    }}
                  >
                    {loading ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </Box>
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <Box sx={{ mb: 3, pb: 2, borderBottom: "1px solid #e5e7eb" }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: "#0f172a",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        bgcolor: "#dbeafe",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Person sx={{ fontSize: 18, color: "#1e40af" }} />
                    </Box>
                    Mi Perfil
                  </Typography>
                </Box>

                <Grid container spacing={2.5}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Nombre"
                      value={user?.nombre || ""}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ fontSize: 18, color: "#64748b" }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#f8fafc",
                          fontSize: "0.875rem",
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Email"
                      value={user?.email || ""}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ fontSize: 18, color: "#64748b" }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#f8fafc",
                          fontSize: "0.875rem",
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Rol"
                      value={user?.role === "admin" ? "Administrador" : "Empleado"}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Settings sx={{ fontSize: 18, color: "#64748b" }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#f8fafc",
                          fontSize: "0.875rem",
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ bgcolor: "#fef3c7", border: "1px solid #fde68a", borderRadius: 1, p: 2, mb: 3 }}>
                  <Typography variant="body2" sx={{ color: "#92400e", fontSize: "0.875rem" }}>
                    Para modificar tu información personal, contacta al administrador del sistema.
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  startIcon={<Lock sx={{ fontSize: 18 }} />}
                  onClick={() => setChangePasswordModalOpen(true)}
                  sx={{
                    px: 2.5,
                    py: 0.75,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    borderColor: "#dc2626",
                    color: "#dc2626",
                    textTransform: "none",
                    "&:hover": {
                      borderColor: "#b91c1c",
                      bgcolor: "#fef2f2",
                    },
                  }}
                >
                  Cambiar Contraseña
                </Button>
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                <Box sx={{ mb: 3, pb: 2, borderBottom: "1px solid #e5e7eb" }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: "#0f172a",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        bgcolor: "#fce7f3",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CreditCard sx={{ fontSize: 18, color: "#ec4899" }} />
                    </Box>
                    Gestión de Tarjetas de Crédito
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
                  Desde aquí puedes gestionar las tarjetas de crédito disponibles en el sistema y configurar los planes
                  de cuotas para cada una.
                </Typography>

                <Button
                  variant="contained"
                  onClick={() => navigate("/configuracion/tarjetas")}
                  sx={{
                    bgcolor: "#dc2626",
                    "&:hover": { bgcolor: "#b91c1c" },
                    textTransform: "none",
                    fontWeight: 500,
                  }}
                >
                  Ir a Gestión de Tarjetas
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ borderRadius: 1 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Change Password Modal */}
      {changePasswordModalOpen && (
        <ChangePasswordModal open={changePasswordModalOpen} onClose={() => setChangePasswordModalOpen(false)} />
      )}
    </Box>
  )
}

export default ConfiguracionPage
