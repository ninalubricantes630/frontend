import axios from "axios"

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4485/api"

// Obtener todos los permisos disponibles
export const getPermisos = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/permisos`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    return response.data.data
  } catch (error) {
    console.error("Error al obtener permisos:", error)
    throw error
  }
}

// Obtener permisos asignados a un usuario
export const getPermisosUsuario = async (usuarioId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/permisos/${usuarioId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    return response.data.data
  } catch (error) {
    console.error("Error al obtener permisos del usuario:", error)
    throw error
  }
}

// Actualizar permisos de un usuario
export const actualizarPermisosUsuario = async (usuarioId, permisos) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/permisos/${usuarioId}`,
      { permisos },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    )
    return response.data
  } catch (error) {
    console.error("Error al actualizar permisos:", error)
    throw error
  }
}
