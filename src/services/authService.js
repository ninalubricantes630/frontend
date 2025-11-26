import api from "./api"
import secureStorage from "../utils/secureStorage"

export const authService = {
  async login(credentials) {
    try {
      const response = await api.post("/auth/login", credentials)

      if (response.success && response.data) {
        secureStorage.setToken(response.data.token)
        secureStorage.setUser(response.data.user)
        return response.data
      }

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
    try {
      const response = await api.post("/auth/change-password", data)

      if (response.success) {
        return response
      }

      const errorMessage = response.message || "Error al cambiar contraseña"
      throw new Error(errorMessage)
    } catch (error) {
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
