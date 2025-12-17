import api from "./api"

export const vehiculosService = {
  getAll: async (params = {}) => {
    const {
      page = 1,
      limit = 10,
      search = "",
      searchCriteria = "patente",
      sucursal_id = "",
      sucursales_ids = "",
    } = params

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    if (search) queryParams.append("search", search)
    if (searchCriteria) queryParams.append("searchCriteria", searchCriteria)
    if (sucursal_id) queryParams.append("sucursal_id", sucursal_id)
    if (sucursales_ids) queryParams.append("sucursales_ids", sucursales_ids)

    const response = await api.get(`/vehiculos?${queryParams}`)
    return response
  },

  getById: async (id) => {
    const response = await api.get(`/vehiculos/${id}`)
    return response.data
  },

  create: async (vehiculoData) => {
    const response = await api.post("/vehiculos", vehiculoData)
    return response.data
  },

  update: async (id, vehiculoData) => {
    const response = await api.put(`/vehiculos/${id}`, vehiculoData)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/vehiculos/${id}`)
    return response.data
  },

  getByCliente: async (clienteId) => {
    const response = await api.get(`/vehiculos/cliente/${clienteId}`)
    return response.data
  },

  updateKilometraje: async (id, kilometraje) => {
    const response = await api.patch(`/vehiculos/${id}/kilometraje`, { kilometraje })
    return response.data
  },
}

export default vehiculosService
