import api from "./api"

export const movimientosStockService = {
  registrar: async (movimientoData) => {
    const { producto_id, tipo, cantidad, motivo } = movimientoData

    if (!producto_id) {
      throw new Error("producto_id es requerido")
    }

    const response = await api.post("/movimientos-stock", {
      producto_id,
      tipo,
      cantidad,
      motivo,
    })

    return response
  },

  getByProducto: async (productoId, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    const response = await api.get(`/movimientos-stock/producto/${productoId}?${params}`)

    // response ya es { data: [...], pagination: {...}, success: true }
    return response
  },

  getAll: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    if (filters.tipo) params.append("tipo", filters.tipo)
    if (filters.productoId) params.append("productoId", filters.productoId)
    if (filters.fechaDesde) params.append("fechaDesde", filters.fechaDesde)
    if (filters.fechaHasta) params.append("fechaHasta", filters.fechaHasta)

    const response = await api.get(`/movimientos-stock?${params}`)
    return response
  },
}

export default movimientosStockService
