"use client"

import { useState, useCallback } from "react"
import { ventasService } from "../services/ventasService"
import { useStandardizedErrorHandler } from "../utils/StandardizedErrorHandler"
import { useToast } from "./useToast"

export const useVentas = () => {
  const [ventas, setVentas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  })

  const { showToast } = useToast()
  const errorHandler = useStandardizedErrorHandler(showToast)

  const loadVentas = useCallback(
    async (page = 1, limit = 10, filters = {}) => {
      setLoading(true)
      setError(null)
      try {
        const response = await ventasService.getAll(page, limit, filters)

        if (!response) {
          setVentas([])
          return
        }

        const ventasData = response.data || response || []

        setVentas(ventasData)
        setPagination({
          total: response.total || 0,
          totalPages: response.totalPages || 1,
          currentPage: response.currentPage || page,
          limit: Number(limit),
        })
      } catch (err) {
        const { userMessage } = errorHandler.handleApiError(err, "cargar ventas")
        setError(userMessage)
        setVentas([])
      } finally {
        setLoading(false)
      }
    },
    [errorHandler],
  )

  const createVenta = useCallback(
    async (ventaData) => {
      setLoading(true)
      setError(null)
      try {
        const newVenta = await ventasService.create(ventaData)

        errorHandler.handleSuccess("Venta procesada exitosamente", "procesar venta")

        return { success: true, data: newVenta }
      } catch (err) {
        const { userMessage } = errorHandler.handleApiError(err, "procesar venta")
        setError(userMessage)
        return { success: false, error: userMessage }
      } finally {
        setLoading(false)
      }
    },
    [errorHandler],
  )

  const cancelVenta = useCallback(
    async (id, motivo) => {
      setLoading(true)
      setError(null)
      try {
        await ventasService.cancel(id, motivo)

        errorHandler.handleSuccess("Venta cancelada exitosamente", "cancelar venta")

        return { success: true }
      } catch (err) {
        const { userMessage } = errorHandler.handleApiError(err, "cancelar venta")
        setError(userMessage)
        return { success: false, error: userMessage }
      } finally {
        setLoading(false)
      }
    },
    [errorHandler],
  )

  return {
    ventas,
    loading,
    error,
    pagination,
    loadVentas,
    createVenta,
    cancelVenta,
  }
}

export default useVentas
