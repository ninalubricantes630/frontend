import api from "./api"

const permisosService = {
  // Obtener todos los permisos disponibles
  getPermisos: async () => {
    const response = await api.get("/permisos")
    return response
  },

  // Obtener permisos asignados a un usuario
  getPermisosUsuario: async (usuarioId) => {
    const response = await api.get(`/permisos/${usuarioId}`)
    return response
  },

  // Actualizar permisos de un usuario
  actualizarPermisosUsuario: async (usuarioId, permisos) => {
    const response = await api.put(`/permisos/${usuarioId}`, { permisos })
    return response
  },
}

export default permisosService
