import api from "./api"

const categoriasService = {
  // Obtener todas las categorías con paginación
  getCategorias: async (params = {}) => {
    try {
      const response = await api.get("/categorias", { params })
      return response
    } catch (error) {
      console.error("Error al obtener categorías:", error)
      throw error
    }
  },

  // Obtener categoría por ID
  getCategoriaById: async (id) => {
    try {
      const response = await api.get(`/categorias/${id}`)
      return response.data
    } catch (error) {
      console.error("Error al obtener categoría:", error)
      throw error
    }
  },

  // Crear nueva categoría
  createCategoria: async (categoriaData) => {
    try {
      const response = await api.post("/categorias", categoriaData)
      return response.data
    } catch (error) {
      console.error("Error al crear categoría:", error)
      throw error
    }
  },

  // Actualizar categoría
  updateCategoria: async (id, categoriaData) => {
    try {
      const response = await api.put(`/categorias/${id}`, categoriaData)
      return response.data
    } catch (error) {
      console.error("Error al actualizar categoría:", error)
      throw error
    }
  },

  // Eliminar categoría
  deleteCategoria: async (id) => {
    try {
      const response = await api.delete(`/categorias/${id}`)
      return response.data
    } catch (error) {
      console.error("Error al eliminar categoría:", error)
      throw error
    }
  },

  // Buscar categorías
  searchCategorias: async (query = "") => {
    try {
      const response = await api.get("/categorias/search", {
        params: { q: query },
      })
      return response.data
    } catch (error) {
      console.error("Error al buscar categorías:", error)
      throw error
    }
  },
}

export default categoriasService
