import api from "./api"

const serviciosService = {
  // Obtener todos los servicios con paginación y filtros
  getServicios: async (params = {}) => {
    const response = await api.get("/servicios", { params })
    return response
  },

  // Obtener servicio por ID
  getServicioById: async (id) => {
    try {
      const response = await api.get(`/servicios/${id}`)
      return response
    } catch (error) {
      console.error("Error al obtener servicio:", error)
      throw error
    }
  },

  // Crear nuevo servicio
  createServicio: async (servicioData) => {
    const response = await api.post("/servicios", servicioData)
    return response
  },

  // Actualizar servicio
  updateServicio: async (id, servicioData) => {
    const response = await api.put(`/servicios/${id}`, servicioData)
    return response
  },

  // Eliminar servicio
  deleteServicio: async (id) => {
    const response = await api.delete(`/servicios/${id}`)
    return response
  },

  // Cancelar servicio
  cancel: async (id, motivo) => {
    const response = await api.patch(`/servicios/${id}/cancelar`, { motivo })
    return response
  },

  // Obtener estadísticas
  getEstadisticas: async () => {
    const response = await api.get("/servicios/estadisticas")
    return response
  },

  // Obtener servicios por cliente
  getServiciosByCliente: async (clienteId) => {
    const response = await api.get(`/servicios/cliente/${clienteId}`)
    return response
  },

  // Obtener servicios por vehículo
  getServiciosByVehiculo: async (vehiculoId) => {
    const response = await api.get(`/servicios/vehiculo/${vehiculoId}`)
    return response
  },

  // Buscar servicios por término
  searchServicios: async (searchTerm, criteria = "numero") => {
    const response = await api.get(`/servicios/search`, {
      params: {
        term: searchTerm,
        criteria: criteria,
      },
    })
    return response
  },
}

export default serviciosService
