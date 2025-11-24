import api from "./api"

export const vehiculosService = {
  // Actualizar getAll para usar params objeto como en otros servicios
  getAll: async (params = {}) => {
    const { page = 1, limit = 10, search = "", searchCriteria = "patente" } = params

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    if (search) queryParams.append("search", search)
    if (searchCriteria) queryParams.append("searchCriteria", searchCriteria)

    const response = await api.get(`/vehiculos?${queryParams}`)
    return response
  },

  // Obtener vehículo por ID
  getById: async (id) => {
    const response = await api.get(`/vehiculos/${id}`)
    return response.data
  },

  // Crear nuevo vehículo
  create: async (vehiculoData) => {
    const response = await api.post("/vehiculos", vehiculoData)
    return response.data
  },

  // Actualizar vehículo
  update: async (id, vehiculoData) => {
    const response = await api.put(`/vehiculos/${id}`, vehiculoData)
    return response.data
  },

  // Eliminar vehículo
  delete: async (id) => {
    const response = await api.delete(`/vehiculos/${id}`)
    return response.data
  },

  // Obtener vehículos por cliente
  getByCliente: async (clienteId) => {
    const response = await api.get(`/vehiculos/cliente/${clienteId}`)
    return response.data
  },

  // Actualizar kilometraje
  updateKilometraje: async (id, kilometraje) => {
    const response = await api.patch(`/vehiculos/${id}/kilometraje`, { kilometraje })
    return response.data
  },
}

export default vehiculosService
