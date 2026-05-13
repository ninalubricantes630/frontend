import api from "./api"

const parseBlobError = async (blob) => {
  if (blob instanceof Blob && blob.type && blob.type.includes("application/json")) {
    const text = await blob.text()
    try {
      const json = JSON.parse(text)
      return json.error?.message || json.message || "Error al generar el reporte"
    } catch {
      return text || "Error al generar el reporte"
    }
  }
  return null
}

const reportesService = {
  obtenerDatos: async (body) => {
    const res = await api.post("/reportes/datos", body)
    if (!res?.success) {
      throw new Error(res?.error?.message || "No se pudo cargar el reporte")
    }
    return res.data
  },
  exportarExcel: async (body) => {
    try {
      const blob = await api.post("/reportes/exportar-excel", body, { responseType: "blob" })
      const msg = await parseBlobError(blob)
      if (msg) {
        throw new Error(msg)
      }
      return blob
    } catch (err) {
      const data = err.response?.data
      if (data instanceof Blob) {
        const msg = await parseBlobError(data)
        if (msg) {
          throw new Error(msg)
        }
      }
      throw err
    }
  },
}

export default reportesService
