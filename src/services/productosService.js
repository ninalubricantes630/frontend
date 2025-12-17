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

  exportarExcel: async (params = {}) => {
    try {
      console.log("[v0] Iniciando exportación con params:", params)

      // El interceptor de axios ya devuelve response.data cuando es blob
      // Por lo tanto, blobData ES el blob directamente
      const blobData = await api.get("/productos/exportar/excel", {
        params,
        responseType: "blob",
      })

      console.log("[v0] Blob recibido:", blobData)

      // Crear URL del blob
      const url = window.URL.createObjectURL(blobData)
      const link = document.createElement("a")
      link.href = url

      // Generar nombre del archivo con la fecha actual
      const fecha = new Date().toISOString().split("T")[0]
      const fileName = `productos_${fecha}.xlsx`

      link.setAttribute("download", fileName)
      document.body.appendChild(link)
      link.click()

      // Limpiar
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)

      console.log("[v0] Archivo descargado exitosamente")
      return { success: true }
    } catch (error) {
      console.error("[v0] Error al exportar productos:", error)
      throw error
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
