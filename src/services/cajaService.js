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
    
      return response.data
    } catch (error) {
      logger.error("Error al obtener historial", error)
      throw error
    }
  },

  // Obtener detalles de una sesión
  async getDetalleSesion(sesionId) {
    try {
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
      const response = await api.get(`/caja/sesiones/${sesionId}/detalle-ingresos`)
      return response.data
    } catch (error) {
      logger.error("Error al obtener detalle de ingresos", error)
      throw error
    }
  },

  // Detalle de ventas y servicios en cuenta corriente (por qué y a qué cliente)
  async getCuentaCorrienteDetalle(sesionId) {
    try {
      const response = await api.get(`/caja/sesiones/${sesionId}/cuenta-corriente-detalle`)
      const res = response?.data ?? response
      return res?.data ?? res
    } catch (error) {
      logger.error("Error al obtener detalle cuenta corriente", error)
      throw error
    }
  },
}

export default cajaService
