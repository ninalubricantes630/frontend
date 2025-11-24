"use client"

import { useState, useCallback } from "react"
import { cuentasCorrientesService } from "../services/cuentasCorrientesService"
import { useStandardizedErrorHandler } from "../utils/StandardizedErrorHandler"
import { useToast } from "./useToast"

export const useCuentasCorrientes = () => {
  const [saldo, setSaldo] = useState(0)
  const [movimientos, setMovimientos] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { showToast } = useToast()
  const errorHandler = useStandardizedErrorHandler(showToast)

  const loadSaldo = useCallback(
    async (clienteId) => {
      setLoading(true)
      setError(null)
      try {
        const response = await cuentasCorrientesService.getSaldo(clienteId)
        setSaldo(response.data?.saldo || 0)
        return { success: true, saldo: response.data?.saldo || 0 }
      } catch (err) {
        const { userMessage } = errorHandler.handleApiError(err, "cargar saldo")
        setError(userMessage)
        return { success: false, error: userMessage }
      } finally {
        setLoading(false)
      }
    },
    [errorHandler],
  )

  const loadMovimientos = useCallback(
    async (clienteId, page = 1, limit = 10) => {
      setLoading(true)
      setError(null)
      try {
        const response = await cuentasCorrientesService.getHistorial(clienteId, page, limit)
        setMovimientos(response.data || [])
        return { success: true, data: response.data }
      } catch (err) {
        const { userMessage } = errorHandler.handleApiError(err, "cargar movimientos")
        setError(userMessage)
        return { success: false, error: userMessage }
      } finally {
        setLoading(false)
      }
    },
    [errorHandler],
  )

  const registrarPago = useCallback(
    async (clienteId, pagoData) => {
      setLoading(true)
      setError(null)
      try {
        await cuentasCorrientesService.registrarPago(clienteId, pagoData)

        errorHandler.handleSuccess("Pago registrado exitosamente", "registrar pago")

        return { success: true }
      } catch (err) {
        const { userMessage } = errorHandler.handleApiError(err, "registrar pago")
        setError(userMessage)
        return { success: false, error: userMessage }
      } finally {
        setLoading(false)
      }
    },
    [errorHandler],
  )

  const loadClientesConCuenta = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await cuentasCorrientesService.getClientesConCuenta()
      setClientes(response.data || [])
      return { success: true, data: response.data }
    } catch (err) {
      const { userMessage } = errorHandler.handleApiError(err, "cargar clientes")
      setError(userMessage)
      return { success: false, error: userMessage }
    } finally {
      setLoading(false)
    }
  }, [errorHandler])

  return {
    saldo,
    movimientos,
    clientes,
    loading,
    error,
    loadSaldo,
    loadMovimientos,
    registrarPago,
    loadClientesConCuenta,
  }
}

export default useCuentasCorrientes
