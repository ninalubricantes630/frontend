import api from "./api"

export const tarjetasService = {
  // Obtener todas las tarjetas con paginación y filtros
  getAll: async (params = {}) => {
    const response = await api.get("/tarjetas", { params })
    return response
  },

  // Obtener tarjeta por ID
  getById: async (id) => {
    const response = await api.get(`/tarjetas/${id}`)
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

  // Obtener tarjetas disponibles para ventas
  getTarjetasParaVenta: async () => {
    const response = await api.get("/tarjetas/venta/todas")
    return response.data
  },

  // Obtener cuotas disponibles de una tarjeta
  getCuotasPorTarjeta: async (tarjetaId) => {
    const response = await api.get(`/tarjetas/venta/${tarjetaId}/cuotas`)
    return response.data
  },
}

export default tarjetasService
