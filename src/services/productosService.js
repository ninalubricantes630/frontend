import api from "./api"

export const productosService = {
  // Obtener todos los productos con paginación y filtros
  getAll: async (params = {}) => {
    const response = await api.get("/productos", { params })
    return response
  },

  // Obtener producto por ID
  getById: async (id) => {
    const response = await api.get(`/productos/${id}`)
    return response.data
  },

  // Crear nuevo producto
  create: async (productoData) => {
    const response = await api.post("/productos", productoData)
    return response.data
  },

  // Actualizar producto
  update: async (id, productoData) => {
    const response = await api.put(`/productos/${id}`, productoData)
    return response.data
  },

  // Cambiar estado del producto (activar/desactivar)
  toggleEstado: async (id) => {
    const response = await api.patch(`/productos/${id}/toggle-estado`)
    return response.data
  },

  // Obtener productos por sucursal
  getBySucursal: async (sucursalId) => {
    const response = await api.get(`/productos/sucursal/${sucursalId}`)
    return response.data
  },

  // Obtener categorías disponibles
  getCategorias: async () => {
    const response = await api.get("/productos/categorias")
    return response.data
  },

  importarExcel: async (data) => {
    try {
      const response = await api.post("/productos/importar-excel", data)
      return response.data.data || response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  registrarMovimiento: async (data) => {
    const response = await api.post("/movimientos-stock", {
      producto_id: data.producto_id,
      tipo: data.tipo,
      cantidad: data.cantidad,
      motivo: data.motivo,
    })
    return response.data
  },
}

export default productosService
