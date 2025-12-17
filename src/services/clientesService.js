import api from "./api.js"

export const clientesService = {
  getClientes: async (params = {}) => {
    const { page = 1, limit = 10, search = "", searchBy = "", sucursal_id = "", sucursales_ids = "" } = params

    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(search && { search }),
      ...(searchBy && { searchBy }),
      ...(sucursal_id && { sucursal_id }),
      ...(sucursales_ids && { sucursales_ids }),
    })

    const response = await api.get(`/clientes?${queryParams}`)
    return response
  },

  getClienteById: async (id) => {
    const response = await api.get(`/clientes/${id}`)
    return response.data
  },

  createCliente: async (clienteData) => {
    const response = await api.post("/clientes", clienteData)
    return response.data
  },

  updateCliente: async (id, clienteData) => {
    const response = await api.put(`/clientes/${id}`, clienteData)
    return response.data
  },

  deleteCliente: async (id) => {
    const response = await api.delete(`/clientes/${id}`)
    return response.data
  },

  searchClientes: async (searchTerm, searchBy = "") => {
    const params = new URLSearchParams({
      search: searchTerm,
      ...(searchBy && { searchBy }),
    })

    const response = await api.get(`/clientes?${params}`)
    return response.data.data || []
  },

  getAll: async (page = 1, limit = 10, search = "") => {
    return clientesService.getClientes({ page, limit, search })
  },
}

export default clientesService
