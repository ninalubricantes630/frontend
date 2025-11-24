import api from "./api"
import logger from "../utils/logger"

const cajaService = {
  // Obtener sesión activa de caja
  async getSesionActiva() {
    try {
      logger.info("[v0] Obteniendo sesión activa de caja")
      const response = await api.get("/caja/sesion-activa")
      return response.data
    } catch (error) {
      logger.error("Error al obtener sesión activa", error)
      throw error
    }
  },

  // Abrir caja
  async abrirCaja(data) {
    try {
      const payload = {
        sucursalId: data.sucursalId,
        montoInicial: data.montoInicial, // Cambio aquí: era data.monto_inicial
        observaciones: data.observaciones || null,
      }
      logger.info("[v0] Abriendo caja con payload:", payload)
      const response = await api.post("/caja/abrir", payload)
      return response.data
    } catch (error) {
      logger.error("Error al abrir caja", error)
      throw error
    }
  },

  // Cerrar caja
  async cerrarCaja(sesionId, data) {
    try {
      logger.info("[v0] Cerrando caja", { sesionId, data })
      const response = await api.patch(`/caja/${sesionId}/cerrar`, data)
      return response.data
    } catch (error) {
      logger.error("Error al cerrar caja", error)
      throw error
    }
  },

  // Obtener historial de sesiones
  async getHistorial(params = {}) {
    try {
      logger.info("[v0] Obteniendo historial de sesiones", params)
      const response = await api.get("/caja/historial", { params })
      console.log("[v0] Respuesta del API en cajaService.getHistorial:", response)
      console.log("[v0] response.data en cajaService:", response.data)
      return response.data
    } catch (error) {
      logger.error("Error al obtener historial", error)
      throw error
    }
  },

  // Obtener detalles de una sesión
  async getDetalleSesion(sesionId) {
    try {
      logger.info("[v0] Obteniendo detalle de sesión", sesionId)
      const response = await api.get(`/caja/sesiones/${sesionId}`)
      return response.data
    } catch (error) {
      logger.error("Error al obtener detalle de sesión", error)
      throw error
    }
  },

  // Obtener movimientos de una sesión
  async getMovimientos(sesionId, params = {}) {
    try {
      logger.info("[v0] Obteniendo movimientos de sesión", { sesionId, params })
      const response = await api.get(`/caja/sesiones/${sesionId}/movimientos`, { params })
      return response.data
    } catch (error) {
      logger.error("Error al obtener movimientos", error)
      throw error
    }
  },

  // Registrar movimiento manual
  async registrarMovimiento(data) {
    try {
      logger.info("[v0] Registrando movimiento manual", data)
      const response = await api.post("/caja/movimientos", data)
      return response.data
    } catch (error) {
      logger.error("Error al registrar movimiento", error)
      throw error
    }
  },

  // Obtener detalle de ingresos por método de pago
  async getDetalleIngresos(sesionId) {
    try {
      logger.info("[v0] Obteniendo detalle de ingresos", sesionId)
      const response = await api.get(`/caja/sesiones/${sesionId}/detalle-ingresos`)
      console.log("[v0] Frontend - API response getDetalleIngresos:", response)
      return response.data
    } catch (error) {
      logger.error("Error al obtener detalle de ingresos", error)
      throw error
    }
  },
}

export default cajaService
