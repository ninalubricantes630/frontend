"use client"

import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import {
  Dialog,
  DialogContent,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
} from "@mui/material"
import { Visibility, VisibilityOff, Lock, Close } from "@mui/icons-material"

const ChangePasswordModal = ({ open, onClose }) => {
  const { changePassword } = useAuth()
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    setError("")
    setSuccess(false) // Reset success state al inicio

    // Validar que las contraseñas coincidan
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    // Validar longitud mínima
    if (formData.newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres")
      return
    }

    // Validar que se haya ingresado la contraseña actual
    if (!formData.currentPassword) {
      setError("Debes ingresar tu contraseña actual")
      return
    }

    try {
      setLoading(true)

      const response = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      })

      setSuccess(true)
      setError("")

      // Cerrar el modal después de 2 segundos
      setTimeout(() => {
        handleClose()
      }, 2000)
    } catch (error) {
      setSuccess(false)

      let errorMessage = "Error al cambiar la contraseña"

      // Extraer mensaje de error del objeto de error
      if (error.message) {
        errorMessage = error.message

        // Casos específicos de error
        if (
          errorMessage.includes("actual incorrecta") ||
          errorMessage.includes("Contraseña actual incorrecta") ||
          errorMessage.includes("currentPassword")
        ) {
          errorMessage = "La contraseña actual es incorrecta"
        } else if (errorMessage.includes("6 caracteres")) {
          errorMessage = "La nueva contraseña debe tener al menos 6 caracteres"
        } else if (errorMessage.includes("conexión") || errorMessage.includes("Network")) {
          errorMessage = "Error de conexión. Por favor, intenta nuevamente"
        }
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handleClose = () => {
    if (!loading) {
      // Solo permitir cerrar si no está cargando
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setError("")
      setSuccess(false)
      setShowPasswords({ current: false, new: false, confirm: false })
      onClose()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: "hidden",
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
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 8,
              height: 32,
              backgroundColor: "#dc2626",
              borderRadius: 1,
            }}
          />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#171717" }}>
              Cambiar Contraseña
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.813rem" }}>
              Actualiza tu contraseña de acceso
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            color: "#6b7280",
            "&:hover": {
              backgroundColor: "#f3f4f6",
            },
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3, backgroundColor: "#fafafa" }}>
        {success ? (
          <Box
            sx={{
              textAlign: "center",
              py: 4,
              px: 2,
              bgcolor: "#fff",
              borderRadius: 2,
              border: "1px solid #e5e7eb",
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: "#dcfce7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <Lock sx={{ fontSize: 32, color: "#16a34a" }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: "#16a34a" }}>
              ¡Contraseña cambiada exitosamente!
            </Typography>
            <Typography variant="body2" color="textSecondary">
              La ventana se cerrará automáticamente...
            </Typography>
          </Box>
        ) : (
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              bgcolor: "#fff",
              p: 2.5,
              borderRadius: 2,
              border: "1px solid #e5e7eb",
            }}
          >
            {error && (
              <Alert
                severity="error"
                onClose={() => setError("")}
                sx={{
                  mb: 2.5,
                  borderRadius: 1.5,
                  border: "1px solid #fecaca",
                  bgcolor: "#fef2f2",
                }}
              >
                {error}
              </Alert>
            )}

            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
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
                  <Lock sx={{ fontSize: 16, color: "#1d4ed8" }} />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                  Contraseña Actual
                </Typography>
              </Box>
              <TextField
                fullWidth
                size="small"
                type={showPasswords.current ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) => setFormData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                required
                placeholder="Ingresa tu contraseña actual"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => togglePasswordVisibility("current")} edge="end" size="small">
                        {showPasswords.current ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                    backgroundColor: "#fafafa",
                    "&:hover fieldset": { borderColor: "#dc2626" },
                    "&.Mui-focused fieldset": { borderColor: "#dc2626" },
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    bgcolor: "#dcfce7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Lock sx={{ fontSize: 16, color: "#16a34a" }} />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                  Nueva Contraseña
                </Typography>
              </Box>
              <TextField
                fullWidth
                size="small"
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => setFormData((prev) => ({ ...prev, newPassword: e.target.value }))}
                required
                placeholder="Mínimo 6 caracteres"
                helperText="La contraseña debe tener al menos 6 caracteres"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => togglePasswordVisibility("new")} edge="end" size="small">
                        {showPasswords.new ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                    backgroundColor: "#fafafa",
                    "&:hover fieldset": { borderColor: "#dc2626" },
                    "&.Mui-focused fieldset": { borderColor: "#dc2626" },
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    bgcolor: "#fef3c7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Lock sx={{ fontSize: 16, color: "#d97706" }} />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#374151" }}>
                  Confirmar Nueva Contraseña
                </Typography>
              </Box>
              <TextField
                fullWidth
                size="small"
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                required
                placeholder="Confirma tu nueva contraseña"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => togglePasswordVisibility("confirm")} edge="end" size="small">
                        {showPasswords.confirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                    backgroundColor: "#fafafa",
                    "&:hover fieldset": { borderColor: "#dc2626" },
                    "&.Mui-focused fieldset": { borderColor: "#dc2626" },
                  },
                }}
              />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, pt: 2, borderTop: "1px solid #e5e7eb" }}>
              <Button
                variant="outlined"
                onClick={handleClose}
                disabled={loading}
                size="medium"
                sx={{
                  borderColor: "#d1d5db",
                  color: "#6b7280",
                  borderRadius: 1.5,
                  px: 3,
                  py: 1,
                  fontWeight: 500,
                  textTransform: "none",
                  fontSize: "0.875rem",
                  "&:hover": {
                    backgroundColor: "#f9fafb",
                    borderColor: "#9ca3af",
                  },
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Lock fontSize="small" />}
                size="medium"
                sx={{
                  backgroundColor: "#dc2626",
                  borderRadius: 1.5,
                  px: 3,
                  py: 1,
                  fontWeight: 500,
                  textTransform: "none",
                  fontSize: "0.875rem",
                  boxShadow: "0 1px 3px rgba(220, 38, 38, 0.3)",
                  "&:hover": {
                    backgroundColor: "#b91c1c",
                    boxShadow: "0 2px 6px rgba(220, 38, 38, 0.4)",
                  },
                  "&:disabled": {
                    opacity: 0.6,
                    backgroundColor: "#9ca3af",
                  },
                }}
              >
                {loading ? "Cambiando..." : "Cambiar Contraseña"}
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ChangePasswordModal
