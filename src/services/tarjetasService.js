import api from "./api"

export const tarjetasService = {
  // Obtener todas las tarjetas con paginación y filtros
  getAll: async (params = {}) => {
    const response = await api.get("/tarjetas", { params })
    return response
  },

  // Obtener tarjeta por ID
  getById: async (id, sucursal_id = null) => {
    const params = sucursal_id ? { sucursal_id } : {}
    const response = await api.get(`/tarjetas/${id}`, { params })
    return response.data
  },

  // Crear nueva tarjeta
  create: async (tarjetaData) => {
    const response = await api.post("/tarjetas", tarjetaData)
    return response.data
  },

  // Actualizar tarjeta
  update: async (id, tarjetaData) => {
    const response = await api.put(`/tarjetas/${id}`, tarjetaData)
    return response.data
  },

  // Eliminar tarjeta
  delete: async (id) => {
    const response = await api.delete(`/tarjetas/${id}`)
    return response.data
  },

  getTarjetasParaVenta: async (sucursal_id) => {
    if (!sucursal_id) {
      throw new Error("sucursal_id es requerido para obtener tarjetas")
    }
    const response = await api.get("/tarjetas/venta/todas", {
      params: { sucursal_id },
    })
    return response.data
  },

  getCuotasPorTarjeta: async (tarjetaId, sucursal_id) => {
    if (!sucursal_id) {
      throw new Error("sucursal_id es requerido para obtener cuotas")
    }
    const response = await api.get(`/tarjetas/venta/${tarjetaId}/cuotas`, {
      params: { sucursal_id },
    })
    return response.data
  },
}

export default tarjetasService
