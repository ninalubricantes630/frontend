import axios from "axios"
import secureStorage from "../utils/secureStorage"

const API_BASE_URL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 25000, // 25s: suficiente para cold start / primera conexión en Railway
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use(
  (config) => {
    const token = secureStorage.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => {
    if (response.config.responseType === "blob") {
      return response.data
    }
    return response.data
  },
  (error) => {
    // Only redirect to login if:
    // 1. We got a 401
    // 2. We're NOT on the login page already
    // 3. We're NOT trying to login (the request is not to /auth/login)
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes("/auth/login")
      const isOnLoginPage = window.location.pathname === "/login"

      if (!isLoginRequest && !isOnLoginPage) {
        secureStorage.clearAll()
        // Use history navigation instead of window.location to avoid page reload
        if (window.history) {
          window.history.pushState({}, "", "/login")
          window.dispatchEvent(new PopStateEvent("popstate"))
        }
      }
    }

    const errorData = error.response?.data
    if (errorData && !errorData.success) {
      let errorMessage = "Error del servidor"

      // Si hay errores de validación específicos, usar el primer mensaje
      if (errorData.error?.validationErrors && Array.isArray(errorData.error.validationErrors)) {
        if (errorData.error.validationErrors.length > 0) {
          errorMessage = errorData.error.validationErrors[0].message
        }
      } else if (errorData.error?.message) {
        // Si no hay validationErrors, usar el mensaje de error general (formato { error: { message } })
        errorMessage = errorData.error.message
      } else if (typeof errorData.error === "string") {
        // Formato simple del backend: { error: "No hay una caja abierta...", etc. }
        errorMessage = errorData.error
      } else if (errorData.message) {
        errorMessage = errorData.message
      }

      return Promise.reject(new Error(errorMessage))
    }

    const message =
      error.code === "ECONNABORTED"
        ? "El servidor tardó demasiado en responder. Por favor, intenta de nuevo."
        : error.response?.data?.message || error.message || "Error desconocido"
    return Promise.reject(new Error(message))
  },
)

export default api
