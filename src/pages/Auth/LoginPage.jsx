"use client"

import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  Container,
  Paper,
  CircularProgress,
} from "@mui/material"
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  Email as EmailIcon,
  Lock as LockIcon,
} from "@mui/icons-material"

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({})
  const { login, error, loading, clearError } = useAuth()

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = "El email es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Ingrese un email válido"
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!validateForm()) {
      return
    }

    try {
      clearError()
      await login(formData)
    } catch (error) {
      // Error is handled by AuthContext
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const getErrorSeverity = () => {
    if (error?.includes("desactivada")) return "warning"
    if (error?.includes("no existe")) return "info"
    return "error"
  }

  return (
    <Box
      sx={{
        height: "100vh",
        background: "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, sm: 3 },
        overflow: "hidden",
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          maxWidth: { xs: "100%", sm: "400px" },
          height: "auto",
          maxHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Box sx={{ textAlign: "center", mb: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              color: "#dc2626",
              mb: 0.5,
              textShadow: "0 2px 4px rgba(0,0,0,0.1)",
              fontSize: { xs: "2rem", sm: "3rem" },
            }}
          >
            Nina
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: "#666",
              mb: 0.5,
              fontWeight: 500,
              fontSize: { xs: "1.2rem", sm: "1.5rem" },
            }}
          >
            Lubricantes
          </Typography>
        </Box>

        <Paper
          elevation={8}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            background: "linear-gradient(135deg, #ffffff 0%, #fafafa 100%)",
            width: "100%",
            maxHeight: { xs: "70vh", sm: "auto" },
          }}
        >
          <Card sx={{ boxShadow: "none" }}>
            <Box
              sx={{
                background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                color: "white",
                py: { xs: 2, sm: 2 },
                textAlign: "center",
              }}
            >
              <Typography variant="h5" fontWeight="bold" sx={{ fontSize: { xs: "1.3rem", sm: "1.5rem" } }}>
                Iniciar Sesión
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.9,
                  mt: 1,
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                }}
              >
                Ingrese sus credenciales para acceder
              </Typography>
            </Box>

            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <form onSubmit={handleSubmit} noValidate>
                {error && (
                  <Alert severity={getErrorSeverity()} onClose={clearError} sx={{ mb: 2, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={loading}
                  error={!!errors.email}
                  helperText={errors.email}
                  sx={{ mb: 2 }}
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Contraseña"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  disabled={loading}
                  error={!!errors.password}
                  helperText={errors.password}
                  sx={{ mb: 3 }}
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: { xs: 1.2, sm: 1.5 },
                    borderRadius: 2,
                    textTransform: "none",
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                    fontWeight: "bold",
                    background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                    boxShadow: "0 4px 15px rgba(220, 38, 38, 0.3)",
                    "&:hover": {
                      boxShadow: "0 6px 20px rgba(220, 38, 38, 0.4)",
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                >
                  {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Paper>

        <Box sx={{ textAlign: "center", mt: { xs: 2, sm: 3 } }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
            Sistema de Gestión v1.0
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
            © 2025 Nina Lubricantes
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

export default LoginPage
