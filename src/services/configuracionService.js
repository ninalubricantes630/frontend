import api from "./api"

export const configuracionService = {
  async getConfiguracion() {
    try {
      console.log("[v0] Fetching configuration from API...")
      const response = await api.get("/configuracion")
      console.log("[v0] Configuration API response:", response)

      if (response.success) {
        const { data } = response

        // Extract business info from 'negocio' category
        const transformed = {}

        if (data.negocio) {
          transformed.nombreNegocio = data.negocio.nombre?.valor || ""
          transformed.direccion = data.negocio.direccion?.valor || ""
          transformed.telefono = data.negocio.telefono?.valor || ""
          transformed.email = data.negocio.email?.valor || ""
          transformed.cuit = data.negocio.cuit?.valor || ""
          transformed.logoUrl = data.negocio.logo_url?.valor || ""
        }

        console.log("[v0] Transformed configuration data:", transformed)
        return transformed
      }
      throw new Error(response.message || "Error al obtener configuración")
    } catch (error) {
      console.error("[v0] Error fetching configuration:", error)
      throw new Error(error.message || "Error de conexión")
    }
  },

  async updateConfiguracion(data) {
    try {
      console.log("[v0] Updating configuration with data:", data)

      const configuraciones = [
        { categoria: "negocio", clave: "nombre", valor: data.nombreNegocio, tipo: "string" },
        { categoria: "negocio", clave: "direccion", valor: data.direccion, tipo: "string" },
        { categoria: "negocio", clave: "telefono", valor: data.telefono, tipo: "string" },
        { categoria: "negocio", clave: "email", valor: data.email, tipo: "string" },
        { categoria: "negocio", clave: "cuit", valor: data.cuit, tipo: "string" },
      ]

      if (data.logoUrl) {
        configuraciones.push({
          categoria: "negocio",
          clave: "logo_url",
          valor: data.logoUrl,
          tipo: "string",
        })
      }

      console.log("[v0] Sending configuraciones array to API:", configuraciones)

      const response = await api.put("/configuracion", { configuraciones })
      console.log("[v0] Update configuration response:", response)

      if (response.success) {
        return response.data
      }
      throw new Error(response.message || "Error al actualizar configuración")
    } catch (error) {
      console.error("[v0] Error updating configuration:", error)
      throw new Error(error.message || "Error de conexión")
    }
  },

  async resetConfiguracion() {
    try {
      const response = await api.post("/configuracion/reset")
      if (response.success) {
        return response.data
      }
      throw new Error(response.message || "Error al resetear configuración")
    } catch (error) {
      throw new Error(error.message || "Error de conexión")
    }
  },
}

export default configuracionService
