import api from "./api"

export const cuentasCorrientesService = {
  // Obtener saldo de cuenta corriente de un cliente
  getSaldo: async (clienteId) => {
    const response = await api.get(`/cuentas-corrientes/cliente/${clienteId}`)
    return response.data
  },

  getHistorial: async (clienteId, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    const response = await api.get(`/cuentas-corrientes/cliente/${clienteId}/movimientos?${params}`)
    return response.data
  },

  // Registrar pago de cuenta corriente
  registrarPago: async (clienteId, pagoData) => {
    const response = await api.post(`/cuentas-corrientes/cliente/${clienteId}/pago`, pagoData)
    return response.data
  },

  cancelarPago: async (movimientoId, motivo) => {
    const response = await api.post(`/cuentas-corrientes/movimiento/${movimientoId}/cancelar`, { motivo })
    return response.data
  },

  // Obtener clientes con cuenta corriente
  getClientesConCuenta: async () => {
    const response = await api.get("/cuentas-corrientes/clientes")
    return response.data
  },

  createOrUpdate: async (clienteId, data) => {
    const response = await api.put(`/cuentas-corrientes/cliente/${clienteId}`, data)
    return response.data
  },
}

export default cuentasCorrientesService
