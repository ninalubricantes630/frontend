import api from "./api"
import secureStorage from "../utils/secureStorage"

export const authService = {
  async login(credentials) {
    try {
      console.log("[v0] authService.login - enviando credenciales:", credentials.email)
      const response = await api.post("/auth/login", credentials)

      console.log("[v0] authService.login - response recibido:", response)

      if (response && response.user) {
        console.log("[v0] authService.login - usuario recibido:", response.user)
        console.log("[v0] authService.login - token recibido:", response.token)
        console.log("[v0] authService.login - permisos:", response.user?.permisos?.length)

        // Guardar token
        secureStorage.setToken(response.token)

        // Guardar usuario completo
        secureStorage.setUser(response.user)
        console.log("[v0] authService.login - datos guardados en storage")

        return response.user
      } else {
        console.error("[v0] authService.login - respuesta inválida, no contiene user:", JSON.stringify(response))
        throw new Error("Estructura de respuesta inválida: no se recibió usuario")
      }
    } catch (error) {
      console.error("[v0] authService.login - error:", error.message)
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
      console.log("[v0] authService.getCurrentUser - iniciando")
      const response = await api.get("/auth/me")

      console.log("[v0] authService.getCurrentUser - response:", response)

      if (response && response.userId) {
        console.log("[v0] authService.getCurrentUser - usuario cargado con userId:", response.userId)
        console.log("[v0] authService.getCurrentUser - permisos:", response.permisos?.length)
        secureStorage.setUser(response)
        return response
      } else {
        console.error("[v0] authService.getCurrentUser - respuesta inválida:", JSON.stringify(response))
        throw new Error("Estructura de respuesta inválida en getCurrentUser")
      }
    } catch (error) {
      console.error("[v0] authService.getCurrentUser - error:", error.message)
      throw error
    }
  },

  async changePassword(data) {
    try {
      const response = await api.post("/auth/change-password", data)

      if (response && response.success !== false) {
        return response
      }

      const errorMessage = response?.message || "Error al cambiar contraseña"
      throw new Error(errorMessage)
    } catch (error) {
      if (error.message && !error.message.includes("Network Error")) {
        throw error
      }
      throw new Error("Error de conexión al cambiar la contraseña")
    }
  },

  getCurrentUserFromStorage() {
    try {
      console.log("[v0] authService.getCurrentUserFromStorage - obteniendo usuario del storage")
      const user = secureStorage.getUser()
      console.log("[v0] authService.getCurrentUserFromStorage - usuario obtenido:", user)
      console.log("[v0] authService.getCurrentUserFromStorage - permisos obtenidos:", user?.permisos)
      return user
    } catch (error) {
      console.error("[v0] authService.getCurrentUserFromStorage - error:", error)
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
