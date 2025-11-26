import api from "./api"

const permisosService = {
  // Obtener todos los permisos disponibles
  getPermisos: async () => {
    const response = await api.get("/permisos")
    return response.data // Extraer el campo data de la respuesta
  },

  // Obtener permisos asignados a un usuario
  getPermisosUsuario: async (usuarioId) => {
    const response = await api.get(`/permisos/${usuarioId}`)
    return response.data // Extraer el campo data de la respuesta
  },

  // Actualizar permisos de un usuario
  actualizarPermisosUsuario: async (usuarioId, permisos) => {
    const response = await api.put(`/permisos/${usuarioId}`, { permisos })
    return response.data // Extraer el campo data de la respuesta
  },
}

export default permisosService
