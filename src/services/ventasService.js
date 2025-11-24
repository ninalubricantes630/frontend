import api from "./api"

export const ventasService = {
  // Crear nueva venta
  create: async (ventaData) => {
    const response = await api.post("/ventas", ventaData)
    return response.data
  },

  // Obtener todas las ventas con paginación y filtros
  getAll: async (params = {}) => {
    const response = await api.get("/ventas", { params })
    return response
  },

  // Obtener venta por ID
  getById: async (id) => {
    const response = await api.get(`/ventas/${id}`)
    return response
  },

  // Cancelar venta
  cancel: async (id, motivo) => {
    const response = await api.patch(`/ventas/${id}/cancelar`, { motivo })
    return response
  },

  // Obtener estadísticas de ventas
  getEstadisticas: async (params = {}) => {
    const response = await api.get("/ventas/estadisticas", { params })
    return response
  },
}

export default ventasService
