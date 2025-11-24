import api from "./api"

const tiposServiciosService = {
  // Obtener todos los tipos de servicios
  getTiposServicios: async (params = {}) => {
    const response = await api.get("/tipos-servicios", { params })
    return response
  },

  // Obtener tipo de servicio por ID
  getTipoServicioById: async (id) => {
    const response = await api.get(`/tipos-servicios/${id}`)
    return response.data
  },

  // Crear nuevo tipo de servicio
  createTipoServicio: async (tipoServicioData) => {
    const response = await api.post("/tipos-servicios", tipoServicioData)
    return response.data
  },

  // Actualizar tipo de servicio
  updateTipoServicio: async (id, tipoServicioData) => {
    const response = await api.put(`/tipos-servicios/${id}`, tipoServicioData)
    return response.data
  },

  // Eliminar tipo de servicio
  deleteTipoServicio: async (id) => {
    const response = await api.delete(`/tipos-servicios/${id}`)
    return response.data
  },
}

export default tiposServiciosService
