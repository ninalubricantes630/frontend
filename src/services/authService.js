import api from "./api"
import secureStorage from "../utils/secureStorage"

export const authService = {
  async login(credentials) {
    console.log("[v0] authService.login - iniciando con credenciales:", { email: credentials.email })
    try {
      const response = await api.post("/auth/login", credentials)
      console.log("[v0] authService.login - respuesta recibida:", { success: response.success })

      if (response.success && response.data) {
        console.log("[v0] authService.login - guardando token y usuario")
        secureStorage.setToken(response.data.token)
        secureStorage.setUser(response.data.user)
        return response.data
      }

      console.log("[v0] authService.login - login falló:", response.message)
      throw new Error(response.message || "Error en el login")
    } catch (error) {
      console.log("[v0] authService.login - error capturado:", error.message)
      throw error
    }
  },

  async logout() {
    try {
      await api.post("/auth/logout")
    } catch (error) {
      console.error("Error en logout:", error)
    } finally {
      secureStorage.clearAll()
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get("/auth/me")

      if (response.success && response.data) {
        secureStorage.setUser(response.data)
        return response.data
      }

      throw new Error(response.message || "Error al obtener usuario")
    } catch (error) {
      throw new Error(error.message || "Error de conexión")
    }
  },

  async changePassword(data) {
    console.log("[v0] authService.changePassword - iniciando")
    try {
      const response = await api.post("/auth/change-password", data)
      console.log("[v0] authService.changePassword - respuesta:", response)

      if (response.success) {
        console.log("[v0] authService.changePassword - éxito")
        return response
      }

      const errorMessage = response.message || "Error al cambiar contraseña"
      console.log("[v0] authService.changePassword - error del servidor:", errorMessage)
      throw new Error(errorMessage)
    } catch (error) {
      console.log("[v0] authService.changePassword - error capturado:", error.message)
      // Si el error ya tiene un mensaje personalizado, usarlo
      if (error.message && !error.message.includes("Network Error")) {
        throw error
      }
      // De lo contrario, lanzar un error genérico
      throw new Error("Error de conexión al cambiar la contraseña")
    }
  },

  getCurrentUserFromStorage() {
    try {
      return secureStorage.getUser()
    } catch (error) {
      console.error("Error getting user from storage:", error)
      secureStorage.removeUser()
      return null
    }
  },

  isAuthenticated() {
    const token = secureStorage.getToken()
    const user = this.getCurrentUserFromStorage()
    return !!(token && user)
  },

  hasRole(role) {
    const user = this.getCurrentUserFromStorage()
    return user?.role === role
  },

  isAdmin() {
    return this.hasRole("admin")
  },
}

export default authService
